import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_PASSWORD } from '@/lib/admin';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  if (password === ADMIN_PASSWORD) {
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: 'Wrong password' }, { status: 401 });
}
