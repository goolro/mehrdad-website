import type { MetadataRoute } from 'next';
import { db } from '@/lib/db';
import { isUnpublishedPostSlug } from '@/lib/queries';
import { isProjectHidden } from '@/lib/project-visibility';
import { dailyVisibleWhere } from '@/lib/daily';

// PRERENDERED AT BUILD (2026-09-08, SEO-growth): the sitemap is generated
// once per deploy, not per request.
//
// Why: on 2026-09-07 the Turso runtime outage turned this route's DB catch
// into a live 7-URL sitemap (all 80+ articles missing) while returning 200
// — Google kept a crippled map of the site and the article pages never got
// crawled. A build-time sitemap is immune to runtime DB outages: it is
// baked into the deployment and served statically from the edge.
//
// Freshness: every admin content mutation fires VERCEL_DEPLOY_HOOK_URL →
// full rebuild → the sitemap regenerates with the new posts (same ~2-3 min
// publish path as the HTML itself).
//
// NO catch-to-empty here: if the DB is unreachable at build time the build
// MUST fail (eb906e3 policy) so Vercel keeps the previous GOOD deployment —
// silently shipping a static-only sitemap is exactly the outage failure
// mode this change prevents at runtime.
export const dynamic = 'force-static';

const BASE = (process.env.SITE_ORIGIN || 'https://mehrdad.ir').replace(/\/+$/, '');

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // real, indexable routes (hash-routing retired — see DECISIONS.md)
  const statics: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/services`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/fde`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/work`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/lab`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/blog`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/daily`, changeFrequency: 'daily', priority: 0.8 },
    // the three daily lanes — real crawlable category hubs linked from the
    // blog daily-box and the /daily index tabs
    { url: `${BASE}/daily/cat/product`, changeFrequency: 'daily', priority: 0.7 },
    { url: `${BASE}/daily/cat/ai`, changeFrequency: 'daily', priority: 0.7 },
    { url: `${BASE}/daily/cat/startup`, changeFrequency: 'daily', priority: 0.7 },
    { url: `${BASE}/about`, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${BASE}/contact`, changeFrequency: 'yearly', priority: 0.6 },
  ];

  const [posts, projects] = await Promise.all([
    db.post.findMany({
      where: { published: true },
      orderBy: { date: 'desc' },
      select: { slug: true, date: true },
    }),
    db.project.findMany({ select: { slug: true } }),
  ]);

  const postUrls: MetadataRoute.Sitemap = posts
    // kill-switch posts (owner decision 2026-01) never appear in the map —
    // their article pages 404, so listing them would poison the crawl
    .filter((p) => !isUnpublishedPostSlug(p.slug))
    .map((p) => ({
    url: `${BASE}/blog/${p.slug}`,
    lastModified: p.date,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const projectUrls: MetadataRoute.Sitemap = projects
    // display kill-switch (project-visibility.ts): hidden project pages 404,
    // so listing them would poison the crawl — same rule as kill-switch posts
    .filter((p) => !isProjectHidden(p.slug))
    .map((p) => ({
    url: `${BASE}/work/${p.slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // daily articles (/daily/<slug>) — original bilingual editorials.
  // A missing table (first-deploy window) degrades to an empty list; a
  // real DB outage propagates and keeps the previous good deployment.
  let articleUrls: MetadataRoute.Sitemap = [];
  const articles = await db.dailyArticle.findMany({
    where: dailyVisibleWhere(), // scheduled-future items stay OUT of the sitemap until their slot (no crawl → 404)
    orderBy: { day: 'desc' },
    select: { slug: true, day: true },
    take: 200,
  });
  articleUrls = articles.map((a) => ({
    url: `${BASE}/daily/${a.slug}`,
    lastModified: new Date(`${a.day}T00:00:00Z`),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...statics, ...postUrls, ...projectUrls, ...articleUrls];
}
