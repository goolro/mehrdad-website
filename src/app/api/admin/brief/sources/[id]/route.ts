import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkAdmin } from '@/lib/admin';
import { ensureBriefTables, isBriefCategory } from '@/lib/brief';

export const dynamic = 'force-dynamic';

/** activate / edit / deactivate a source */
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const denied = checkAdmin(req);
  if (denied) return denied;
  const { id } = await ctx.params;
  try {
    const b = await req.json();
    const data: Record<string, unknown> = {};
    if (b.active !== undefined) data.active = !!b.active;
    if (b.name !== undefined) data.name = String(b.name).trim().slice(0, 80);
    if (b.category !== undefined && isBriefCategory(b.category)) data.category = b.category;
    if (b.lang !== undefined) data.lang = b.lang === 'fa' ? 'fa' : 'en';
    if (b.note !== undefined) data.note = String(b.note).trim().slice(0, 200) || null;
    if (!Object.keys(data).length) return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
    const item = await db.briefSource.update({ where: { id }, data });
    return NextResponse.json({ ok: true, item });
  } catch {
    return NextResponse.json({ error: 'Source not found' }, { status: 404 });
  }
}

/** remove a source and (cascade) its scans */
export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const denied = checkAdmin(req);
  if (denied) return denied;
  const { id } = await ctx.params;
  try {
    await db.briefSource.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Source not found' }, { status: 404 });
  }
}
