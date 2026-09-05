import type { MetadataRoute } from 'next';
import { db } from '@/lib/db';

// sitemap must reflect live DB content → dynamic (never prerendered)
export const dynamic = 'force-dynamic';

const BASE = (process.env.SITE_ORIGIN || 'https://mehrdad.ir').replace(/\/+$/, '');

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // real, indexable routes (hash-routing retired — see DECISIONS.md)
  const statics: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/services`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/fde`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/work`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/blog`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/about`, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${BASE}/contact`, changeFrequency: 'yearly', priority: 0.6 },
  ];

  try {
    const [posts, projects] = await Promise.all([
      db.post.findMany({
        where: { published: true },
        orderBy: { date: 'desc' },
        select: { slug: true, date: true },
      }),
      db.project.findMany({ select: { slug: true } }),
    ]);

    const postUrls: MetadataRoute.Sitemap = posts.map((p) => ({
      url: `${BASE}/blog/${p.slug}`,
      lastModified: p.date,
      changeFrequency: 'monthly',
      priority: 0.7,
    }));

    const projectUrls: MetadataRoute.Sitemap = projects.map((p) => ({
      url: `${BASE}/work/${p.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));

    return [...statics, ...postUrls, ...projectUrls];
  } catch {
    // DB unreachable (e.g. cold CI) — still emit the static routes
    return statics;
  }
}
