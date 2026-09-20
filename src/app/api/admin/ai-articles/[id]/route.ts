import { NextRequest, NextResponse } from 'next/server';
import { checkAdmin } from '@/lib/admin';
import { db } from '@/lib/db';
import { serializeArticle } from '@/lib/ai-articles';

export const dynamic = 'force-dynamic';

/** Single piece (detail view in the studio). */
export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const denied = checkAdmin(req);
  if (denied) return denied;
  const { id } = await ctx.params;
  const row = await db.aiArticle.findUnique({ where: { id } });
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ok: true, article: serializeArticle(row) });
}

/** Remove a piece from the pipeline (never touches an already-published Post). */
export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const denied = checkAdmin(req);
  if (denied) return denied;
  const { id } = await ctx.params;
  try {
    await db.aiArticle.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
