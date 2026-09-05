import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_PASSWORD, adminAuthAvailable, safeEqual } from '@/lib/admin';
import {
  ADMIN_COOKIE,
  ADMIN_SESSION_TTL_SECONDS,
  createAdminSessionToken,
  verifyAdminSessionToken,
} from '@/lib/admin-session';
import { clientIp, rateLimit, tooManyRequests } from '@/lib/rate-limit';

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
  // brute-force guard: 5 attempts per IP per 15 minutes
  const rl = rateLimit(`login:${clientIp(req)}`, 5, 15 * 60 * 1000);
  if (!rl.ok) return tooManyRequests(rl.retryAfter);

  // FAIL-CLOSED: never allow an empty/unset secret to authenticate.
  if (!adminAuthAvailable()) {
    return NextResponse.json({ error: 'Admin auth is unavailable' }, { status: 503 });
  }

  let password: unknown;
  try {
    const body = await req.json();
    password = body?.password;
  } catch {
    return NextResponse.json({ error: 'Wrong password' }, { status: 401 });
  }

  if (typeof password === 'string' && safeEqual(password, ADMIN_PASSWORD)) {
    const { token, maxAge } = createAdminSessionToken();
    const res = NextResponse.json({ ok: true });
    res.cookies.set(ADMIN_COOKIE, token, { ...cookieOptions, maxAge });
    return res;
  }
  return NextResponse.json({ error: 'Wrong password' }, { status: 401 });
}

/** GET = session restore: does the current browser still hold a valid session? */
export async function GET(req: NextRequest) {
  if (verifyAdminSessionToken(req.cookies.get(ADMIN_COOKIE)?.value)) {
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

/** DELETE = logout: expire the cookie (stateless sessions need no server cleanup). */
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, '', { ...cookieOptions, maxAge: 0 });
  return res;
}
