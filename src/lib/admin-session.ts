import { createHash, createHmac, timingSafeEqual } from 'crypto';

/**
 * Stateless admin session tokens (HMAC-signed expiry).
 *
 * DESIGN:
 * - No database table is needed: the token is `<expiry-epoch>.<signature>`
 *   where signature = HMAC-SHA256(expiry, key). Verification = recompute the
 *   HMAC and compare in constant time. Nothing is stored server-side.
 * - The HMAC key is derived from ADMIN_PASSWORD itself, so changing the
 *   admin password instantly invalidates every session ever issued.
 * - The cookie is HttpOnly (JavaScript never sees the token), SameSite=Strict
 *   (no cross-site sends → strong CSRF resistance) and Secure in production.
 * - This replaces sending the raw admin password in an `x-admin-key` header
 *   on every request, which kept the real secret in browser memory for the
 *   whole admin session and re-sent it on every API call.
 */
export const ADMIN_COOKIE = 'mehrdad_admin';

/** 12 hours — the admin must re-login twice a day at most. */
export const ADMIN_SESSION_TTL_SECONDS = 12 * 60 * 60;

function hmacKey(): string {
  const secret = process.env.ADMIN_PASSWORD ?? '';
  return createHash('sha256').update(`mehrdad-admin-session:${secret}`).digest('hex');
}

function sign(payload: string): string {
  return createHmac('sha256', hmacKey()).update(payload).digest('base64url');
}

/** Issue a fresh signed session token. */
export function createAdminSessionToken(): { token: string; maxAge: number } {
  const exp = Math.floor(Date.now() / 1000) + ADMIN_SESSION_TTL_SECONDS;
  const payload = String(exp);
  return { token: `${payload}.${sign(payload)}`, maxAge: ADMIN_SESSION_TTL_SECONDS };
}

/** Verify a signed session token (expiry + constant-time HMAC compare). */
export function verifyAdminSessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const dot = token.lastIndexOf('.');
  if (dot <= 0) return false;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const exp = Number(payload);
  if (!Number.isInteger(exp) || exp * 1000 < Date.now()) return false;
  const expected = sign(payload);
  if (sig.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}
