import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkAdmin } from '@/lib/admin';
import { ensureBriefTables, isBriefCategory } from '@/lib/brief';

export const dynamic = 'force-dynamic';

/** list every source + the heading count of its latest successful scan */
export async function GET(req: NextRequest) {
  const denied = checkAdmin(req);
  if (denied) return denied;
  await ensureBriefTables();
  const sources = await db.briefSource.findMany({ orderBy: [{ active: 'desc' }, { createdAt: 'asc' }] });
  const latest = await db.briefScan.findMany({
    where: { ok: true },
    orderBy: { createdAt: 'desc' },
    distinct: ['sourceId'],
    select: { sourceId: true, headingCount: true, createdAt: true },
  });
  const bySource = new Map(latest.map((l) => [l.sourceId, l]));
  return NextResponse.json({
    items: sources.map((s) => ({
      id: s.id,
      name: s.name,
      url: s.url,
      lang: s.lang,
      category: s.category,
      active: s.active,
      note: s.note,
      lastHeadingCount: bySource.get(s.id)?.headingCount ?? null,
      lastScanAt: bySource.get(s.id)?.createdAt ?? null,
    })),
  });
}

/** add a competitor/reference source */
export async function POST(req: NextRequest) {
  const denied = checkAdmin(req);
  if (denied) return denied;
  try {
    await ensureBriefTables();
    const b = await req.json();
    const name = String(b.name || '').trim().slice(0, 80);
    let url = String(b.url || '').trim().slice(0, 300);
    if (!name || !url) return NextResponse.json({ error: 'name and url are required' }, { status: 400 });
    if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
    try {
      const u = new URL(url);
      if (!u.hostname.includes('.')) throw new Error('bad host');
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }
    const exists = await db.briefSource.findUnique({ where: { url } });
    if (exists) return NextResponse.json({ error: 'This source already exists' }, { status: 409 });
    const item = await db.briefSource.create({
      data: {
        name,
        url,
        lang: b.lang === 'fa' ? 'fa' : 'en',
        category: isBriefCategory(b.category) ? b.category : 'product',
        active: b.active === undefined ? true : !!b.active,
        note: String(b.note || '').trim().slice(0, 200) || null,
      },
    });
    return NextResponse.json({ ok: true, item });
  } catch (e) {
    console.error('brief source create error:', e);
    return NextResponse.json({ error: 'Failed to create source' }, { status: 500 });
  }
}
