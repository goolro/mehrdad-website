import { NextRequest, NextResponse } from 'next/server';
import { checkAdmin } from '@/lib/admin';
import { rebuildKb } from '@/lib/kb';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const denied = checkAdmin(req);
  if (denied) return denied;
  try {
    const count = await rebuildKb();
    return NextResponse.json({ ok: true, chunks: count });
  } catch (e) {
    console.error('kb rebuild error:', e);
    return NextResponse.json({ error: 'Failed to rebuild KB' }, { status: 500 });
  }
}
