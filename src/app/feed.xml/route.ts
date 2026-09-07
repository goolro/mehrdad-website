import { NextResponse } from 'next/server';
import { listPosts } from '@/lib/queries';

// PRERENDERED AT BUILD (2026-09-08, SEO-growth): the RSS feed is generated
// once per deploy and served statically from the edge.
//
// Why: as a force-dynamic route with a DB dependency, a Turso runtime
// outage made /feed.xml return 500 in production (observed 2026-09-08) —
// feed readers and aggregators dropped the site. Static-at-build makes the
// feed immune to runtime DB outages; every content mutation fires the
// Vercel Deploy Hook → rebuild → fresh feed (same publish path as HTML).
//
// NO catch-to-500: if the DB is unreachable at build time the build fails
// (eb906e3 policy) and Vercel keeps the previous GOOD deployment.
export const dynamic = 'force-static';

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

  const lastBuild = posts.length
    ? new Date(
        Math.max(...posts.map((p) => new Date(p.date).getTime()))
      ).toUTCString()
    : new Date().toUTCString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Mehrdad — Product Builder</title>
    <link>${BASE}/blog</link>
    <description>Articles on startups, smart cities, AI and inventions — from real work.</description>
    <language>en</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <atom:link href="${BASE}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
}
