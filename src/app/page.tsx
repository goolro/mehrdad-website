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
  alternates: {
    canonical: '/',
    // hreflang: EN is the static, server-rendered default; the Persian
    // variant is the same URL + ?lang=fa (pre-paint switch in layout boot
    // script — Google's renderer executes it, so the variant is indexable)
    languages: {
      en: '/',
      fa: '/?lang=fa',
      'x-default': '/',
    },
  },
};

export default async function HomePage() {
  // server-rendered first paint: hero, services, projects and featured
  // articles are all present in the initial HTML (crawlers need no JS)
  // NO catch-to-empty here: if the DB is unreachable at build time the
  // build MUST fail (Vercel keeps the previous deployment) — silently
  // publishing an empty homepage is exactly what a Turso outage caused
  // on 2026-09-07 (live empty page for ~1h until noticed).
  const [services, projects, featured] = await Promise.all([
    getServices(),
    // homepage Work section: featured Work items ONLY (max 2, set in the
    // admin panel). Idea-stage and archived projects never appear here and
    // Lab items live at /lab — see DECISIONS.md (2026-09-07).
    getProjects({ section: 'work', featured: true }),
    listPosts({ page: 1, perPage: 6 }),
  ]);
  const homeProjects = projects.slice(0, 2);

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
        // sameAs ties this entity to its other profiles — how Google/KG and
        // LLMs disambiguate "Mehrdad" and consolidate authority signals
        sameAs: [
          'https://github.com/goolro',
          'https://virgool.io/@mehrdad.ir',
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
        projects: homeProjects,
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
