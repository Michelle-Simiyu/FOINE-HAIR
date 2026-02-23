import { SignJWT, jwtVerify, type JWTPayload } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET ?? "foine-hair-dev-secret-change-in-production"
);

const ALG       = "HS256";
const ISSUER    = "foine-hair";
const AUDIENCE  = "foine-admin";
const EXPIRES   = "8h";

// ─── Admin payload ────────────────────────────────────────────────────────────
export interface AdminPayload extends JWTPayload {
  email: string;
  role:  "admin" | "superadmin";
}

// ─── Sign ─────────────────────────────────────────────────────────────────────
export async function signAdminToken(payload: Omit<AdminPayload, keyof JWTPayload>): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setExpirationTime(EXPIRES)
    .sign(SECRET);
}

// ─── Verify ───────────────────────────────────────────────────────────────────
export async function verifyAdminToken(token: string): Promise<AdminPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET, {
      issuer:   ISSUER,
      audience: AUDIENCE,
    });
    return payload as AdminPayload;
  } catch {
    return null;
  }
}

// ─── Cookie name ──────────────────────────────────────────────────────────────
export const ADMIN_COOKIE = "foine_admin_token";
