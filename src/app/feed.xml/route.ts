import { NextResponse } from 'next/server';
import { listPosts } from '@/lib/queries';

export const dynamic = 'force-dynamic';

const BASE = (process.env.SITE_ORIGIN || 'https://mehrdad.ir').replace(/\/+$/, '');

function esc(s: string | null | undefined): string {
  return (s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** RSS 2.0 feed of the latest published articles (README-documented /feed.xml) */
export async function GET() {
  try {
    const { posts } = await listPosts({ page: 1, perPage: 20 });
    const items = posts
      .map((p) => {
        const title = p.titleEn || p.titleFa || 'Untitled';
        const description = p.excerptEn || p.excerptFa || '';
        const pubDate = new Date(p.date).toUTCString();
        return `    <item>
      <title>${esc(title)}</title>
      <link>${BASE}/blog/${encodeURIComponent(p.slug)}</link>
      <guid isPermaLink="true">${BASE}/blog/${encodeURIComponent(p.slug)}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${esc(description)}</description>
    </item>`;
      })
      .join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Mehrdad — Product Builder</title>
    <link>${BASE}/blog</link>
    <description>Articles on startups, smart cities, AI and inventions — from real work.</description>
    <language>en</language>
${items}
  </channel>
</rss>`;

    return new NextResponse(xml, {
      headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
    });
  } catch {
    return new NextResponse('Feed unavailable', { status: 500 });
  }
}
