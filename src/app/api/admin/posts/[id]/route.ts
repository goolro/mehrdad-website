import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkAdmin } from '@/lib/admin';

export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const denied = checkAdmin(req);
  if (denied) return denied;
  try {
    const { id } = await ctx.params;
    const b = await req.json();
    const data: Record<string, unknown> = {};
    for (const k of ['titleEn', 'titleFa', 'excerptEn', 'excerptFa', 'contentEn', 'contentFa', 'cover']) {
      if (k in b) data[k] = b[k];
    }
    if ('published' in b) data.published = Boolean(b.published);
    if ('featured' in b) data.featured = Boolean(b.featured);
    const post = await db.post.update({ where: { id }, data });
    return NextResponse.json({ ok: true, post });
  } catch (e) {
    console.error('admin patch post error:', e);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const denied = checkAdmin(req);
  if (denied) return denied;
  try {
    const { id } = await ctx.params;
    await db.post.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('admin delete post error:', e);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
