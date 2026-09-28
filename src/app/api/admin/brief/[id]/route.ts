import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkAdmin } from '@/lib/admin';

export const dynamic = 'force-dynamic';

/** archive a brief (soft) */
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const denied = checkAdmin(req);
  if (denied) return denied;
  const { id } = await ctx.params;
  try {
    const b = await req.json().catch(() => ({}));
    const status = b.status === 'used' ? 'used' : b.status === 'ready' ? 'ready' : 'archived';
    const item = await db.brief.update({ where: { id }, data: { status } });
    return NextResponse.json({ ok: true, status: item.status });
  } catch {
    return NextResponse.json({ error: 'Brief not found' }, { status: 404 });
  }
}

/** delete a brief permanently */
export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const denied = checkAdmin(req);
  if (denied) return denied;
  const { id } = await ctx.params;
  try {
    await db.brief.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Brief not found' }, { status: 404 });
  }
}
