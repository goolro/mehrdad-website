import type { Metadata } from 'next';
import { HomeView } from '@/components/site/HomeView';
import { listPosts, getProjects, getServices } from '@/lib/queries';

// every request carries a fresh CSP nonce (middleware) → dynamic rendering
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Mehrdad — Product Builder | مهرداد — سازنده محصول',
  description:
    'I design businesses and products with care, and build them fast with AI. Real projects, honest status, lessons from real work.',
  alternates: { canonical: '/' },
};

export default async function HomePage() {
  // server-rendered first paint: hero, services, projects and featured
  // articles are all present in the initial HTML (crawlers need no JS)
  const [services, projects, featured] = await Promise.all([
    getServices(),
    getProjects(),
    listPosts({ page: 1, perPage: 6 }).catch(() => ({ posts: [] })),
  ]);

  return (
    <HomeView
      initial={{
        services,
        projects,
        posts: featured.posts.slice(0, 6).map((p) => ({
          slug: p.slug,
          titleEn: p.titleEn,
          titleFa: p.titleFa,
          excerptEn: p.excerptEn,
          excerptFa: p.excerptFa,
          cover: p.cover,
          date: p.date,
          categories: p.categories,
        })),
      }}
    />
  );
}
