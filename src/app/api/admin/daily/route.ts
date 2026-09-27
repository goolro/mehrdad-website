import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkAdmin } from '@/lib/admin';
import { notifyIndexNow } from '@/lib/indexnow';
import { tehranDay } from '@/lib/daily-digest';

export const dynamic = 'force-dynamic';

const BASE = (process.env.SITE_ORIGIN || 'https://mehrdad.ir').replace(/\/+$/, '');

/** list every digest item — the studio groups by day client-side */
export async function GET(req: NextRequest) {
  const denied = checkAdmin(req);
  if (denied) return denied;
  const items = await db.dailyProduct.findMany({
    orderBy: [{ day: 'desc' }, { order: 'asc' }, { createdAt: 'desc' }],
    take: 300,
  });
  return NextResponse.json({ items });
}

const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function POST(req: NextRequest) {
  const denied = checkAdmin(req);
  if (denied) return denied;
  try {
    const b = await req.json();
    const name = String(b.name || '').trim();
    const url = String(b.url || '').trim();
    const taglineEn = String(b.taglineEn || '').trim();
    if (!name || !url || !taglineEn) {
      return NextResponse.json({ error: 'name url taglineEn are required' }, { status: 400 });
    }
    if (!/^https:\/\/(www\.)?producthunt\.com\//i.test(url)) {
      return NextResponse.json({ error: 'URL must be a producthunt.com link' }, { status: 400 });
    }
    const day = DAY_RE.test(String(b.day || '')) ? b.day : tehranDay();
    const exists = await db.dailyProduct.findUnique({ where: { url } });
    if (exists) return NextResponse.json({ error: 'This product is already in the digest' }, { status: 409 });

    const order = Number.isFinite(b.order) ? Number(b.order) : await db.dailyProduct.count({ where: { day } });
    const item = await db.dailyProduct.create({
      data: {
        day,
        name: name.slice(0, 120),
        taglineEn: taglineEn.slice(0, 240),
        taglineFa: String(b.taglineFa || '').trim().slice(0, 240) || null,
        url,
        logo: String(b.logo || '').trim() || null,
        votes: Number.isFinite(b.votes) ? Math.max(0, Math.trunc(b.votes)) : 0,
        order,
      },
    });

    // publish path is identical to every other content mutation: rebuild
    // the static pages (deploy hook) + ping the digest URL for indexing
    if (process.env.VERCEL_DEPLOY_HOOK_URL) {
      await fetch(process.env.VERCEL_DEPLOY_HOOK_URL, { method: 'POST' }).catch(() => {});
    }
    notifyIndexNow([`${BASE}/daily`]);
    return NextResponse.json({ ok: true, item });
  } catch (e) {
    console.error('admin daily create error:', e);
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 });
  }
}
