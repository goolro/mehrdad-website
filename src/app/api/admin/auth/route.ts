import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_PASSWORD, adminAuthAvailable, safeEqual } from '@/lib/admin';
import { clientIp, rateLimit, tooManyRequests } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

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
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: 'Wrong password' }, { status: 401 });
}
