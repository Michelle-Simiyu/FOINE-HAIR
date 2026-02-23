import { NextRequest, NextResponse } from "next/server";

// ─── M-Pesa Result Body ────────────────────────────────────────────────────────
interface MpesaCallbackBody {
  Body: {
    stkCallback: {
      MerchantRequestID:  string;
      CheckoutRequestID:  string;
      ResultCode:         number;
      ResultDesc:         string;
      CallbackMetadata?: {
        Item: Array<{ Name: string; Value?: string | number }>;
      };
    };
  };
}

// ─── Structured Logger ────────────────────────────────────────────────────────
// All M-Pesa events emit JSON-serialisable log entries for easy ingestion by
// Vercel Log Drains, Datadog, Logtail, etc.
interface LogEntry {
  service:   "mpesa-callback";
  level:     "info" | "warn" | "error";
  event:     string;
  orderId:   string;
  timestamp: string;
  [key: string]: unknown;
}

function mpesaLog(entry: Omit<LogEntry, "service" | "timestamp">) {
  const line = {
    ...entry,
    service:   "mpesa-callback",
    timestamp: new Date().toISOString(),
  } as LogEntry;
  if (entry.level === "error") {
    console.error(JSON.stringify(line));
  } else if (entry.level === "warn") {
    console.warn(JSON.stringify(line));
  } else {
    console.log(JSON.stringify(line));
  }
}

// ─── Retry Helper ─────────────────────────────────────────────────────────────
// Retries an async operation with exponential back-off.
// Does NOT throw — returns { ok, attempts, error } so callers stay in control.
async function withRetry<T>(
  fn:         () => Promise<T>,
  maxAttempts = 3,
  baseMs      = 500,
): Promise<{ ok: true; value: T; attempts: number } | { ok: false; error: unknown; attempts: number }> {
  let attempt = 0;
  while (attempt < maxAttempts) {
    attempt++;
    try {
      const value = await fn();
      return { ok: true, value, attempts: attempt };
    } catch (err) {
      if (attempt === maxAttempts) {
        return { ok: false, error: err, attempts: attempt };
      }
      // Exponential back-off: 500ms, 1s, 2s …
      const delay = baseMs * Math.pow(2, attempt - 1);
      await new Promise(res => setTimeout(res, delay));
    }
  }
  // TypeScript safety — unreachable
  return { ok: false, error: new Error("Retry loop exhausted"), attempts: maxAttempts };
}

// ─── Patch Order in DB ────────────────────────────────────────────────────────
async function patchOrder(orderId: string, patch: Record<string, unknown>) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/save-config`, {
    method:  "PATCH",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ id: orderId, ...patch }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "(no body)");
    throw new Error(`DB patch failed: ${res.status} — ${text}`);
  }
  return res.json();
}

// ─── Fetch Order (for customer phone) ────────────────────────────────────────
async function fetchOrderPhone(orderId: string): Promise<string | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/save-config?id=${encodeURIComponent(orderId)}`);
    if (!res.ok) return null;
    const data = await res.json() as { order?: { customerDetails?: { phone?: string } } };
    return data.order?.customerDetails?.phone ?? null;
  } catch {
    return null;
  }
}

// ─── SMS (Africa's Talking) with retry ───────────────────────────────────────
async function sendSMSWithRetry(
  orderId:    string,
  phone:      string,
  message:    string,
): Promise<void> {
  const AT_API_KEY  = process.env.AFRICASTALKING_API_KEY;
  const AT_USERNAME = process.env.AFRICASTALKING_USERNAME ?? "sandbox";

  if (!AT_API_KEY) {
    // Development — log what would be sent
    mpesaLog({ level: "info", event: "sms.mock", orderId, phone, message });
    return;
  }

  const result = await withRetry(async () => {
    const res = await fetch("https://api.africastalking.com/version1/messaging", {
      method:  "POST",
      headers: {
        apiKey:         AT_API_KEY,
        Accept:         "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        username: AT_USERNAME,
        to:       phone,
        message,
        from:     "FOINEHAIR",
      }).toString(),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`AT SMS ${res.status}: ${text}`);
    }

    const data = await res.json();
    const recipients = (data as { SMSMessageData?: { Recipients?: Array<{ status: string }> } })
      .SMSMessageData?.Recipients ?? [];

    // AT returns 200 but marks failed deliveries in the body
    const failed = recipients.filter(r => r.status !== "Success");
    if (failed.length > 0) {
      throw new Error(`AT delivery failure: ${JSON.stringify(failed)}`);
    }
    return data;
  }, 3, 600);

  if (result.ok) {
    mpesaLog({ level: "info", event: "sms.sent", orderId, phone, attempts: result.attempts });
  } else {
    mpesaLog({
      level: "error",
      event: "sms.failed",
      orderId,
      phone,
      attempts: result.attempts,
      error: result.error instanceof Error ? result.error.message : String(result.error),
    });
  }
}

// ─── POST /api/mpesa/callback ─────────────────────────────────────────────────
// Safaricom calls this after STK Push completes.
// IMPORTANT: Always respond with HTTP 200 + { ResultCode: 0 } so Safaricom
// does not retry the callback, even if our internal processing fails.
export async function POST(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get("orderId") ?? "";

  let callback: MpesaCallbackBody["Body"]["stkCallback"] | undefined;

  try {
    const body = await req.json() as MpesaCallbackBody;
    callback   = body.Body?.stkCallback;
  } catch (err) {
    mpesaLog({ level: "error", event: "parse.error", orderId, error: String(err) });
    // Still return 200 — malformed body, nothing to retry
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Acknowledged" });
  }

  if (!callback) {
    mpesaLog({ level: "warn", event: "parse.missing_callback", orderId });
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Acknowledged" });
  }

  const { ResultCode, ResultDesc, CheckoutRequestID, MerchantRequestID, CallbackMetadata } = callback;

  // ── Payment SUCCESS ──────────────────────────────────────────────────────────
  if (ResultCode === 0) {
    const meta        = CallbackMetadata?.Item ?? [];
    const receiptNo   = String(meta.find(i => i.Name === "MpesaReceiptNumber")?.Value ?? "");
    const amountKES   = Number(meta.find(i => i.Name === "Amount")?.Value ?? 0);
    const phoneRaw    = String(meta.find(i => i.Name === "PhoneNumber")?.Value ?? "");

    mpesaLog({
      level: "info",
      event: "payment.success",
      orderId,
      receiptNo,
      amountKES,
      checkoutRequestId: CheckoutRequestID,
      merchantRequestId: MerchantRequestID,
    });

    // 1. Update DB — retry up to 3 times
    const dbResult = await withRetry(() =>
      patchOrder(orderId, {
        paymentStatus:  "paid",
        orderStatus:    "paid",
        mpesaReceiptNo: receiptNo,
        paidAt:         new Date().toISOString(),
      })
    );

    if (!dbResult.ok) {
      mpesaLog({
        level:    "error",
        event:    "db.patch.failed",
        orderId,
        attempts: dbResult.attempts,
        error:    dbResult.error instanceof Error ? dbResult.error.message : String(dbResult.error),
      });
    } else {
      mpesaLog({ level: "info", event: "db.patch.success", orderId, attempts: dbResult.attempts });
    }

    // 2. Resolve customer phone — prefer M-Pesa metadata, fall back to DB lookup
    const normalizedPhone = phoneRaw.startsWith("254")
      ? `+${phoneRaw}`
      : phoneRaw || (await fetchOrderPhone(orderId)) || "";

    if (!normalizedPhone) {
      mpesaLog({ level: "warn", event: "sms.no_phone", orderId });
    } else {
      const shortId = orderId.slice(-6).toUpperCase();
      await sendSMSWithRetry(
        orderId,
        normalizedPhone,
        `Order #${shortId} confirmed! Your Foine Hair wig is now being hand-crafted. ` +
        `M-Pesa receipt: ${receiptNo}. Expected delivery: 3–5 business days. Thank you! 💛`,
      );
    }

    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }

  // ── Payment FAILED / CANCELLED ────────────────────────────────────────────
  mpesaLog({
    level: "warn",
    event: "payment.failed",
    orderId,
    resultCode: ResultCode,
    resultDesc: ResultDesc,
    checkoutRequestId: CheckoutRequestID,
  });

  const failResult = await withRetry(() =>
    patchOrder(orderId, { paymentStatus: "failed" })
  );

  if (!failResult.ok) {
    mpesaLog({
      level:    "error",
      event:    "db.patch.failed",
      orderId,
      context:  "payment_failure_update",
      error:    failResult.error instanceof Error ? failResult.error.message : String(failResult.error),
    });
  }

  return NextResponse.json({ ResultCode: 0, ResultDesc: "Acknowledged" });
}
