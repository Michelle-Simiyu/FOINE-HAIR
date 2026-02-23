import { NextRequest, NextResponse } from "next/server";
import { signAdminToken, verifyAdminToken, ADMIN_COOKIE } from "@/lib/jwt";

// ─── Admin credentials from env ───────────────────────────────────────────────
// In production, replace with a proper user table + bcrypt
const ADMIN_CREDENTIALS: Record<string, { password: string; role: "admin" | "superadmin" }> = {
  [process.env.ADMIN_EMAIL ?? "admin@foinehair.co.ke"]: {
    password: process.env.ADMIN_PASSWORD ?? "foine2026",
    role:     "superadmin",
  },
};

// ─── POST /api/admin/auth — Login ─────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json() as { email: string; password: string };

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const admin = ADMIN_CREDENTIALS[email.toLowerCase()];
    if (!admin || admin.password !== password) {
      // Constant-time-ish response to prevent timing attacks
      await new Promise(r => setTimeout(r, 300));
      return NextResponse.json(
        { error: "Invalid credentials." },
        { status: 401 }
      );
    }

    const token = await signAdminToken({ email, role: admin.role });

    const res = NextResponse.json({ success: true, role: admin.role });
    res.cookies.set({
      name:     ADMIN_COOKIE,
      value:    token,
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      sameSite: "lax",
      path:     "/",
      maxAge:   60 * 60 * 8, // 8 hours
    });
    return res;

  } catch (err: unknown) {
    console.error("[Admin Auth Error]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

// ─── DELETE /api/admin/auth — Logout ──────────────────────────────────────────
export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.delete(ADMIN_COOKIE);
  return res;
}

// ─── GET /api/admin/auth — Verify session ─────────────────────────────────────
export async function GET(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  const payload = await verifyAdminToken(token);
  if (!payload) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true, email: payload.email, role: payload.role });
}
