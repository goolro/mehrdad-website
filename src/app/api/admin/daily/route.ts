import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkAdmin } from '@/lib/admin';
import { notifyIndexNow } from '@/lib/indexnow';
import { sanitizePostHtml, sanitizePlainText } from '@/lib/sanitize';
import { isDailyCategory } from '@/lib/daily';

export const dynamic = 'force-dynamic';

const BASE = (process.env.SITE_ORIGIN || 'https://mehrdad.ir').replace(/\/+$/, '');

/** digest day for a moment — Tehran calendar, ISO 'YYYY-MM-DD' */
function tehranDay(d: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tehran' }).format(d);
}

const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function parseTags(v: unknown): string[] | null {
  if (v === undefined) return null;
  if (!Array.isArray(v)) return null;
  return v
    .map((t) => String(t || '').trim())
    .filter(Boolean)
    .slice(0, 10);
}

/** list every article — the studio groups by day client-side */
export async function GET(req: NextRequest) {
  const denied = checkAdmin(req);
  if (denied) return denied;
  const items = await db.dailyArticle.findMany({
    orderBy: [{ day: 'desc' }, { createdAt: 'desc' }],
    take: 300,
  });
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const denied = checkAdmin(req);
  if (denied) return denied;
  try {
    const b = await req.json();
    const titleEn = sanitizePlainText(b.titleEn, 200);
    const titleFa = sanitizePlainText(b.titleFa, 200);
    const summaryEn = sanitizePlainText(b.summaryEn, 400);
    const summaryFa = sanitizePlainText(b.summaryFa, 400);
    const bodyEn = sanitizePostHtml(b.bodyEn);
    const bodyFa = sanitizePostHtml(b.bodyFa);
    if (!titleEn || !titleFa || !summaryEn || !summaryFa || !bodyEn || !bodyFa) {
      return NextResponse.json(
        { error: 'titles and summaries and full bodies (EN + FA) are required' },
        { status: 400 }
      );
    }
    let slug = String(b.slug || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80);
    if (!SLUG_RE.test(slug)) {
      slug = slug.slice(0, 40) || 'article';
      if (!SLUG_RE.test(slug)) return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });
    }
    const day = DAY_RE.test(String(b.day || '')) ? b.day : tehranDay();
    const exists = await db.dailyArticle.findUnique({ where: { slug } });
    if (exists) return NextResponse.json({ error: 'An article with this slug already exists' }, { status: 409 });

    const tagsEn = parseTags(b.tagsEn);
    const tagsFa = parseTags(b.tagsFa);
    // one of the owner's three daily lanes — product | ai | startup
    const category = isDailyCategory(b.category) ? b.category : 'product';
    // staggered publishing: an optional go-live slot. Empty/null → live now.
    let publishAt: Date | null = null;
    if (b.publishAt !== undefined && b.publishAt !== null && String(b.publishAt).trim() !== '') {
      const d = new Date(String(b.publishAt));
      if (Number.isNaN(d.getTime())) {
        return NextResponse.json({ error: 'publishAt is not a valid date' }, { status: 400 });
      }
      publishAt = d;
    }
    const item = await db.dailyArticle.create({
      data: {
        slug,
        day,
        titleEn,
        titleFa,
        summaryEn,
        summaryFa,
        bodyEn,
        bodyFa,
        verdictEn: sanitizePostHtml(b.verdictEn),
        verdictFa: sanitizePostHtml(b.verdictFa),
        category,
        tagsEn: tagsEn ? JSON.stringify(tagsEn) : null,
        tagsFa: tagsFa ? JSON.stringify(tagsFa) : null,
        published: b.published === undefined ? true : !!b.published,
        publishAt,
      },
    });

    // publish path is identical to every other content mutation: rebuild
    // the static pages (deploy hook) + ping the new URLs for indexing
    if (process.env.VERCEL_DEPLOY_HOOK_URL) {
      await fetch(process.env.VERCEL_DEPLOY_HOOK_URL, { method: 'POST' }).catch(() => {});
    }
    notifyIndexNow([`${BASE}/daily`, `${BASE}/daily/${item.slug}`]);
    return NextResponse.json({ ok: true, item });
  } catch (e) {
    console.error('admin daily create error:', e);
    return NextResponse.json({ error: 'Failed to create article' }, { status: 500 });
  }
}
