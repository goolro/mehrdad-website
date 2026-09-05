import { createHash, createHmac, randomBytes, timingSafeEqual } from 'crypto';

/**
 * Stateless admin session tokens (HMAC-signed expiry + unique nonce).
 *
 * DESIGN:
 * - No database table is needed: the token is `<expiry>.<nonce>.<signature>`
 *   where signature = HMAC-SHA256("<expiry>.<nonce>", key). Verification =
 *   recompute the HMAC and compare in constant time. Nothing is stored
 *   server-side.
 * - The NONCE makes every issued token unique. Without it, two logins in the
 *   same second produced byte-identical tokens, so revoking ("logging out")
 *   one session also killed the other — a correctness bug found by the
 *   round-2 pentest (impact: session DoS, not a bypass).
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

/**
 * Logout revocation (defense-in-depth): the token is stateless, so a stolen
 * copy would technically stay valid until expiry even after the user logs
 * out. Every logout therefore revokes the token's payload here, and
 * verification rejects revoked tokens. The set clears on process restart —
 * an accepted residual risk for a single-instance personal site.
 */
const revokedPayloads = new Set<string>();

/** Extract the signed payload ("expiry.nonce") from a full token. */
function payloadOf(token: string | undefined | null): string | null {
  if (!token) return null;
  const lastDot = token.lastIndexOf('.');
  if (lastDot <= 0) return null;
  return token.slice(0, lastDot);
}

export function revokeAdminSessionToken(token: string | undefined | null): void {
  const payload = payloadOf(token);
  if (payload) revokedPayloads.add(payload);
}

function hmacKey(): string {
  const secret = process.env.ADMIN_PASSWORD ?? '';
  return createHash('sha256').update(`mehrdad-admin-session:${secret}`).digest('hex');
}

function sign(payload: string): string {
  return createHmac('sha256', hmacKey()).update(payload).digest('base64url');
}

/** Issue a fresh signed session token (unique per call thanks to the nonce). */
export function createAdminSessionToken(): { token: string; maxAge: number } {
  const exp = Math.floor(Date.now() / 1000) + ADMIN_SESSION_TTL_SECONDS;
  const nonce = randomBytes(12).toString('base64url');
  const payload = `${exp}.${nonce}`;
  return { token: `${payload}.${sign(payload)}`, maxAge: ADMIN_SESSION_TTL_SECONDS };
}

/** Verify a signed session token (expiry + nonce shape + constant-time HMAC). */
export function verifyAdminSessionToken(token: string | undefined | null): boolean {
  const payload = payloadOf(token);
  if (!payload) return false;
  const dot = token!.lastIndexOf('.');
  const sig = token!.slice(dot + 1);
  const firstDot = payload.indexOf('.');
  if (firstDot <= 0) return false;
  const expStr = payload.slice(0, firstDot);
  const nonce = payload.slice(firstDot + 1);
  if (!/^\d+$/.test(expStr) || nonce.length < 8) return false;
  const exp = Number(expStr);
  if (!Number.isInteger(exp) || exp * 1000 < Date.now()) return false;
  if (revokedPayloads.has(payload)) return false; // logged out
  const expected = sign(payload);
  if (sig.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}
