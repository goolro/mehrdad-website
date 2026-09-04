import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_PASSWORD, adminAuthAvailable, safeEqual } from '@/lib/admin';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
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
