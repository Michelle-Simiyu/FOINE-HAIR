import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken, ADMIN_COOKIE } from "@/lib/jwt";

// ─── In-memory audit log (replace with Prisma in production) ──────────────────
interface AuditEntry {
  id:        string;
  createdAt: string;
  orderId:   string;
  action:    string;
  actorId:   string;
  before?:   unknown;
  after?:    unknown;
  meta?:     unknown;
}

const auditLog: AuditEntry[] = [];

// ─── Auth guard ───────────────────────────────────────────────────────────────
async function requireAdmin(req: NextRequest) {
  const token   = req.cookies.get(ADMIN_COOKIE)?.value;
  const payload = token ? await verifyAdminToken(token) : null;
  return payload;
}

// ─── POST /api/admin/audit — Record an action ─────────────────────────────────
export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = await req.json() as Omit<AuditEntry, "id" | "createdAt" | "actorId">;

    const entry: AuditEntry = {
      id:        `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
      actorId:   admin.email,
      ...body,
    };

    auditLog.push(entry);

    // ── In production: Prisma ─────────────────────────────────────────────
    // await prisma.auditLog.create({
    //   data: { orderId: body.orderId, action: body.action, actorId: admin.email, before: body.before, after: body.after, meta: body.meta }
    // });

    return NextResponse.json({ success: true, entry }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  }
}

// ─── GET /api/admin/audit — Retrieve logs (filtered by orderId) ───────────────
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const orderId = req.nextUrl.searchParams.get("orderId");
  const entries = orderId
    ? auditLog.filter(e => e.orderId === orderId)
    : auditLog;

  return NextResponse.json({
    entries: entries.slice().reverse(), // newest first
    total:   entries.length,
  });
}
