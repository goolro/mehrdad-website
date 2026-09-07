import { NextRequest, NextResponse } from 'next/server';
import { notifyIndexNow, indexNowKey } from '@/lib/indexnow';
import { listPosts } from '@/lib/queries';

/**
 * Manual IndexNow ping (2026-09-08, SEO-growth).
 *
 * GET /api/indexnow?key=<key>&url=<optional-url>
 *   - with `url`: submits that single URL
 *   - without:    submits the homepage + /blog + every published article
 *                 (Bing/Yandex batch refresh after big content changes)
 *
 * Auth = the IndexNow key itself (per spec it proves host control; it is
 * public by design but unknown to third parties). POST is not exposed —
 * the admin routes call notifyIndexNow() directly after mutations.
 */
export const dynamic = 'force-dynamic';

const BASE = (process.env.SITE_ORIGIN || 'https://mehrdad.ir').replace(/\/+$/, '');

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get('key') || '';
  if (key !== indexNowKey()) {
    return NextResponse.json({ error: 'invalid key' }, { status: 403 });
  }

  const single = req.nextUrl.searchParams.get('url');
  if (single) {
    if (!single.startsWith(BASE)) {
      return NextResponse.json({ error: 'url must be on this host' }, { status: 400 });
    }
    notifyIndexNow([single]);
    return NextResponse.json({ ok: true, submitted: [single] });
  }

  // batch: home + blog index + all published articles
  const urls = [`${BASE}/`, `${BASE}/blog`];
  try {
    const { posts, totalPages } = await listPosts({ page: 1, perPage: 48 });
    for (const p of posts) urls.push(`${BASE}/blog/${encodeURIComponent(p.slug)}`);
    // older article-list pages, if any
    for (let page = 2; page <= totalPages && page <= 5; page++) {
      urls.push(`${BASE}/blog?page=${page}`);
    }
  } catch {
    // DB hiccup → still ping the statics
  }

  notifyIndexNow(urls);
  return NextResponse.json({ ok: true, submitted: urls.length, endpoint: 'api.indexnow.org' });
}
