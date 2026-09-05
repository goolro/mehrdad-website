import { createHash, timingSafeEqual } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE, verifyAdminSessionToken } from './admin-session';

/**
 * Admin authentication.
 *
 * SECURITY:
 * - The password is read from the ADMIN_PASSWORD environment variable and
 *   MUST NOT have a hardcoded fallback — this repo is public.
 * - Set it in the local `.env` file (gitignored). See `.env.example`.
 * - FAIL-CLOSED: if the variable is unset/empty, every admin operation
 *   returns 503 "Admin auth is unavailable" — an empty password can never
 *   match. This is enforced in checkAdmin() and in the login route.
 * - Admin APIs are authenticated by an HMAC-signed session cookie
 *   (HttpOnly, SameSite=Strict) issued by POST /api/admin/auth — the raw
 *   password never travels on API calls after login.
 */
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? '';

/** True only when a real admin secret is configured at runtime. */
export function adminAuthAvailable(): boolean {
  return ADMIN_PASSWORD.length > 0;
}

/**
 * Constant-time string comparison.
 * Both inputs are hashed to a fixed length first, so the comparison
 * never leaks the secret's length and never throws on length mismatch.
 */
export function safeEqual(a: string, b: string): boolean {
  if (!a || !b) return false;
  const ha = createHash('sha256').update(a, 'utf8').digest();
  const hb = createHash('sha256').update(b, 'utf8').digest();
  return timingSafeEqual(ha, hb);
}

/**
 * CSRF defense-in-depth: for state-changing methods, reject requests whose
 * Origin header points at another site. Browser fetches always send Origin
 * on mutations; non-browser clients (curl/health checks) may omit it.
 * `x-forwarded-host` is honored too because reverse proxies (e.g. cPanel
 * Passenger) may rewrite the Host header.
 */
function originAllowed(req: NextRequest): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return true;
  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    return false;
  }
  const hosts = [req.headers.get('host'), req.headers.get('x-forwarded-host')];
  return hosts.some((h) => h === originHost);
}

export function checkAdmin(req: NextRequest): NextResponse | null {
  if (!adminAuthAvailable()) {
    return NextResponse.json({ error: 'Admin auth is unavailable' }, { status: 503 });
  }

  const mutating = req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'OPTIONS';
  if (mutating && !originAllowed(req)) {
    return NextResponse.json({ error: 'Cross-origin request rejected' }, { status: 403 });
  }

  if (!verifyAdminSessionToken(req.cookies.get(ADMIN_COOKIE)?.value)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}
