import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_PASSWORD, adminAuthAvailable, safeEqual, originAllowed } from '@/lib/admin';
import {
  ADMIN_COOKIE,
  ADMIN_SESSION_TTL_SECONDS,
  createAdminSessionToken,
  revokeAdminSessionToken,
  verifyAdminSessionToken,
} from '@/lib/admin-session';
import { clientIp, readJsonBody, payloadTooLarge, rateLimit, tooManyRequests } from '@/lib/rate-limit';
import { totpEnabled, verifyTotp } from '@/lib/admin-totp';

export const dynamic = 'force-dynamic';

// Secure cookie in production (HTTPS enforced by HSTS anyway); dev/preview
// runs over plain HTTP, where Secure cookies would be dropped by the browser.
const secureCookie = process.env.NODE_ENV === 'production';

const cookieOptions = {
  httpOnly: true as const,
  sameSite: 'strict' as const,
  secure: secureCookie,
  path: '/',
};

/** POST = login: verify password once, then hand out an HMAC-signed session cookie. */
export async function POST(req: NextRequest) {
  // CSRF hardening: a cross-site page must never be able to POST credentials
  // here (login CSRF would let an attacker seed a session they know).
  if (!originAllowed(req)) {
    return NextResponse.json({ error: 'Cross-origin request rejected' }, { status: 403 });
  }

  // brute-force guard: 5 attempts per IP per 15 minutes, plus a global
  // ceiling so a botnet with N addresses cannot buy itself N×5 attempts
  // (round-3 finding M4). The global bucket is generous: a single admin
  // needs ≤5, and a restart/second device still fits comfortably.
  const rl = rateLimit(`login:${clientIp(req)}`, 5, 15 * 60 * 1000);
  if (!rl.ok) return tooManyRequests(rl.retryAfter);
  const rlGlobal = rateLimit('login:__global__', 60, 15 * 60 * 1000);
  if (!rlGlobal.ok) return tooManyRequests(rlGlobal.retryAfter);

  // tiny bodies only — the login payload is a single short password.
  // readJsonBody enforces the cap while streaming, so a chunked request
  // (no Content-Length) cannot slip an unbounded body past it.
  const parsed = await readJsonBody(req, 8);
  if (!parsed.ok) {
    // unchanged contract: an oversized body is 413, an unparsable one is a
    // plain failed login (no parse-error oracle)
    return parsed.error === 'payload-too-large'
      ? payloadTooLarge()
      : NextResponse.json({ error: 'Wrong password' }, { status: 401 });
  }

  // FAIL-CLOSED: never allow an empty/unset secret to authenticate.
  if (!adminAuthAvailable()) {
    return NextResponse.json({ error: 'Admin auth is unavailable' }, { status: 503 });
  }

  const password: unknown = parsed.data?.password;
  const totp: unknown = parsed.data?.totp;

  if (typeof password === 'string' && safeEqual(password, ADMIN_PASSWORD)) {
    // second factor (only when ADMIN_TOTP_SECRET is configured): a valid
    // password without a valid 6-digit code is rejected — 401 with the
    // 'totp_required' hint so the UI reveals the code field
    if (totpEnabled() && !verifyTotp(totp)) {
      return NextResponse.json({ error: 'totp_required' }, { status: 401 });
    }
    const { token, maxAge } = createAdminSessionToken();
    const res = NextResponse.json({ ok: true });
    res.cookies.set(ADMIN_COOKIE, token, { ...cookieOptions, maxAge });
    return res;
  }
  return NextResponse.json({ error: 'Wrong password' }, { status: 401 });
}

/** GET = session restore + advertise whether the 2FA factor is configured */
export async function GET(req: NextRequest) {
  if (verifyAdminSessionToken(req.cookies.get(ADMIN_COOKIE)?.value)) {
    return NextResponse.json({ ok: true, totpRequired: totpEnabled() });
  }
  // the flag is safe to expose: an attacker learns it from a login attempt anyway
  return NextResponse.json({ error: 'Unauthorized', totpRequired: totpEnabled() }, { status: 401 });
}

/** DELETE = logout: revoke the token server-side + expire the cookie. */
export async function DELETE(req: NextRequest) {
  // stateless logout needs the token value to revoke it
  revokeAdminSessionToken(req.cookies.get(ADMIN_COOKIE)?.value);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, '', { ...cookieOptions, maxAge: 0 });
  return res;
}
