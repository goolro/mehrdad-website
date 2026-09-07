import type { Metadata } from 'next';
import { HomeView } from '@/components/site/HomeView';
import { JsonLd } from '@/components/site/JsonLd';
import { listPosts, getProjects, getServices } from '@/lib/queries';

// Fully static: rendered once per BUILD (the build-time CSP meta can
// only be injected then) and served from the edge until the next deploy.
// Content updates publish via the Vercel Deploy Hook fired by the admin
// panel (VERCEL_DEPLOY_HOOK_URL) — a ~2-3 min rebuild, same ballpark as
// the ISR window it replaces. Unknown slugs between deploys still render
// on demand (dynamicParams) and are cached until the next deploy.
export const dynamic = 'force-static';

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
    // build-time safety: if the DB is unreachable during `next build`, the
    // page still prerenders (empty sections) and ISR fills it within 5 min
    getServices().catch(() => []),
    getProjects().catch(() => []),
    listPosts({ page: 1, perPage: 6 }).catch(() => ({ posts: [] })),
  ]);

  // AI-SEO: entity graph for search engines AND LLMs (ChatGPT/Claude/
  // Perplexity parse schema.org to understand and cite the site)
  const base = (process.env.SITE_ORIGIN || 'https://mehrdad.ir').replace(/\/+$/, '');
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${base}/#website`,
        url: `${base}/`,
        name: 'Mehrdad — Product Builder',
        alternateName: 'مهرداد — سازنده محصول',
        inLanguage: ['en', 'fa'],
        publisher: { '@id': `${base}/#person` },
      },
      {
        '@type': 'Person',
        '@id': `${base}/#person`,
        name: 'Mehrdad',
        alternateName: 'مهرداد',
        url: `${base}/`,
        jobTitle: 'Product Builder',
        description:
          'Designs businesses and products with care and builds them fast with AI — startups, smart city, AI products.',
        knowsAbout: [
          'product design',
          'AI products',
          'startups',
          'smart city',
          'investment',
          'طراحی محصول',
          'هوش مصنوعی',
          'استارتاپ',
          'شهر هوشمند',
        ],
      },
    ],
  };

  return (
    <>
      <JsonLd data={jsonLd} />
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
    </>
  );
}
