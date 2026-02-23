import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET  = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET ?? "foine-hair-dev-secret-change-in-production"
);
const COOKIE  = "foine_admin_token";
const LOGIN   = "/admin/login";

// ─── Routes that require admin JWT auth ───────────────────────────────────────
const ADMIN_PATHS = ["/admin/orders"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only gate admin routes
  const needsAuth = ADMIN_PATHS.some(p => pathname.startsWith(p));
  if (!needsAuth) return NextResponse.next();

  const token = req.cookies.get(COOKIE)?.value;

  if (!token) {
    return NextResponse.redirect(new URL(LOGIN, req.url));
  }

  try {
    await jwtVerify(token, SECRET, {
      issuer:   "foine-hair",
      audience: "foine-admin",
    });
    return NextResponse.next();
  } catch {
    const res = NextResponse.redirect(new URL(LOGIN, req.url));
    res.cookies.delete(COOKIE);
    return res;
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
