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
 *
 * TRUST MODEL:
 * - The primary anchor is the request's own Host header (set by the browser,
 *   rewritten by the proxy only to the app's real public host).
 * - `x-forwarded-host` is client-controllable in many proxy setups, so it is
 *   NEVER allowed to vouch for an Origin on its own. It is only consulted
 *   when no Host header exists at all (pure-proxy setups).
 * - Set SITE_ORIGIN (e.g. `https://mehrdad.ir`, or a comma-separated list of
 *   canonical origins) in production for a hard allow-list: then the Origin
 *   MUST match one of the configured origins — the request's own Host header
 *   can no longer vouch for it, so no header trickery can satisfy the check.
 */
export function originAllowed(req: NextRequest): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return true;
  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    return false;
  }
  const host = req.headers.get('host') || '';
  const xfh = req.headers.get('x-forwarded-host');

  // hard allow-list when configured (recommended in production)
  const siteOrigin = process.env.SITE_ORIGIN ?? '';
  if (siteOrigin) {
    // Hard allow-list. SITE_ORIGIN may be a comma-separated list of origins
    // (e.g. "https://mehrdad.ir,https://www.mehrdad.ir") so a deployment can
    // serve more than one canonical host.
    const allowedHosts = siteOrigin
      .split(',')
      .map((s) => {
        try {
          return new URL(s.trim()).host;
        } catch {
          return '';
        }
      })
      .filter(Boolean);
    // NOTE (round-3 finding M2): this used to be
    // `originHost === siteHost || originHost === host`. The second disjunct
    // made the allow-list cosmetic — a request carrying a *matching* pair of
    // spoofed Host and Origin headers satisfied it, which contradicted the
    // "no header trickery can satisfy the check" guarantee above. When a
    // SITE_ORIGIN is configured it is now the ONLY accepted anchor.
    if (allowedHosts.length > 0) return allowedHosts.includes(originHost);
  }

  if (host && originHost === host) return true;
  // only a missing Host header (pure proxy) may fall back to x-forwarded-host
  return !host && xfh === originHost;
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
