import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkAdmin } from '@/lib/admin';
import { notifyIndexNow } from '@/lib/indexnow';

export const dynamic = 'force-dynamic';

const BASE = (process.env.SITE_ORIGIN || 'https://mehrdad.ir').replace(/\/+$/, '');

const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

/** edit one digest item — every field except url is patchable */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = checkAdmin(req);
  if (denied) return denied;
  const { id } = await params;
  try {
    const b = await req.json();
    const data: Record<string, unknown> = {};
    if (b.name !== undefined) data.name = String(b.name).trim().slice(0, 120);
    if (b.taglineEn !== undefined) data.taglineEn = String(b.taglineEn).trim().slice(0, 240);
    if (b.taglineFa !== undefined) data.taglineFa = String(b.taglineFa).trim().slice(0, 240) || null;
    if (b.logo !== undefined) data.logo = String(b.logo).trim() || null;
    if (b.day !== undefined && DAY_RE.test(String(b.day))) data.day = b.day;
    if (b.votes !== undefined && Number.isFinite(b.votes)) data.votes = Math.max(0, Math.trunc(b.votes));
    if (b.order !== undefined && Number.isFinite(b.order)) data.order = Math.trunc(b.order);

    const item = await db.dailyProduct.update({ where: { id }, data });
    if (process.env.VERCEL_DEPLOY_HOOK_URL) {
      await fetch(process.env.VERCEL_DEPLOY_HOOK_URL, { method: 'POST' }).catch(() => {});
    }
    notifyIndexNow([`${BASE}/daily`]);
    return NextResponse.json({ ok: true, item });
  } catch (e) {
    console.error('admin daily patch error:', e);
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = checkAdmin(req);
  if (denied) return denied;
  const { id } = await params;
  try {
    await db.dailyProduct.delete({ where: { id } });
    if (process.env.VERCEL_DEPLOY_HOOK_URL) {
      await fetch(process.env.VERCEL_DEPLOY_HOOK_URL, { method: 'POST' }).catch(() => {});
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('admin daily delete error:', e);
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}
