import { NextRequest, NextResponse } from "next/server";

// ─── M-Pesa Daraja API — STK Push ─────────────────────────────────────────────
// Safaricom Daraja Docs: https://developer.safaricom.co.ke/Documentation

const DARAJA_BASE_URL  = process.env.MPESA_ENV === "production"
  ? "https://api.safaricom.co.ke"
  : "https://sandbox.safaricom.co.ke";

const CONSUMER_KEY     = process.env.MPESA_CONSUMER_KEY    ?? "";
const CONSUMER_SECRET  = process.env.MPESA_CONSUMER_SECRET  ?? "";
const BUSINESS_CODE    = process.env.MPESA_BUSINESS_CODE   ?? "174379";  // Sandbox default
const PASSKEY          = process.env.MPESA_PASSKEY          ?? "";
const CALLBACK_URL     = process.env.MPESA_CALLBACK_URL     ?? "https://example.com/api/mpesa/callback";

// ─── Get OAuth Token ───────────────────────────────────────────────────────────
async function getMpesaToken(): Promise<string> {
  const credentials  = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString("base64");
  const res          = await fetch(`${DARAJA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
    method:  "GET",
    headers: { Authorization: `Basic ${credentials}` },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`M-Pesa OAuth failed: ${text}`);
  }

  const data = await res.json() as { access_token: string };
  return data.access_token;
}

// ─── Generate Password ─────────────────────────────────────────────────────────
function getMpesaPassword(): { password: string; timestamp: string } {
  const timestamp = new Date()
    .toISOString()
    .replace(/[^0-9]/g, "")
    .slice(0, 14);

  const raw      = `${BUSINESS_CODE}${PASSKEY}${timestamp}`;
  const password = Buffer.from(raw).toString("base64");

  return { password, timestamp };
}

// ─── Format Phone ─────────────────────────────────────────────────────────────
function formatPhone(phone: string): string {
  // Normalize to 254XXXXXXXXX format
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("0"))   return "254" + cleaned.slice(1);
  if (cleaned.startsWith("254")) return cleaned;
  if (cleaned.startsWith("7") || cleaned.startsWith("1")) return "254" + cleaned;
  return cleaned;
}

// ─── POST /api/mpesa/stk-push ─────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      phone:   string;
      amount:  number;    // Amount in KES
      orderId: string;
    };

    const { phone, amount, orderId } = body;

    if (!phone || !amount || !orderId) {
      return NextResponse.json(
        { error: "phone, amount, and orderId are required." },
        { status: 400 }
      );
    }

    // Safaricom requires amount >= 1 KES
    const kesAmount = Math.max(1, Math.round(amount));

    // 1. Get OAuth token
    const token = await getMpesaToken();

    // 2. Generate password + timestamp
    const { password, timestamp } = getMpesaPassword();

    // 3. Initiate STK Push
    const stkPayload = {
      BusinessShortCode: BUSINESS_CODE,
      Password:          password,
      Timestamp:         timestamp,
      TransactionType:   "CustomerPayBillOnline",
      Amount:            kesAmount,
      PartyA:            formatPhone(phone),
      PartyB:            BUSINESS_CODE,
      PhoneNumber:       formatPhone(phone),
      CallBackURL:       `${CALLBACK_URL}?orderId=${orderId}`,
      AccountReference:  `FOINE-${orderId.slice(-6).toUpperCase()}`,
      TransactionDesc:   "Foine Hair Custom Wig Order",
    };

    const stkRes = await fetch(`${DARAJA_BASE_URL}/mpesa/stkpush/v1/processrequest`, {
      method:  "POST",
      headers: {
        Authorization:  `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(stkPayload),
    });

    const stkData = await stkRes.json();

    if (!stkRes.ok || stkData.ResponseCode !== "0") {
      return NextResponse.json(
        { error: stkData.errorMessage ?? stkData.ResponseDescription ?? "STK Push failed." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success:             true,
      checkoutRequestId:   stkData.CheckoutRequestID,
      merchantRequestId:   stkData.MerchantRequestID,
      responseDescription: stkData.ResponseDescription,
    });

  } catch (err: unknown) {
    console.error("[M-Pesa STK Push Error]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error." },
      { status: 500 }
    );
  }
}

// ─── GET /api/mpesa/callback — Safaricom webhook ──────────────────────────────
// Safaricom calls this URL after payment is complete.
// In a real app, verify the ResultCode and update the DB accordingly.
export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get("orderId");

  // Placeholder — in production, Safaricom sends a POST to the callback URL
  return NextResponse.json({
    success: true,
    message: "M-Pesa callback endpoint is live.",
    orderId,
  });
}
