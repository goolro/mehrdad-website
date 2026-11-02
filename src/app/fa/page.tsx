import type { Metadata } from 'next';
import { HomeView } from '@/components/site/HomeView';
import { JsonLd } from '@/components/site/JsonLd';
import { listPosts, getProjects, NOT_IN_FEATURED_POST_SLUGS } from '@/lib/queries';

/**
 * /fa — the static Persian homepage (D-050, P1 translation-sync 2026-10-23).
 *
 * WHY: until today the only Persian surface was `/?lang=fa` — a client-side
 * flip on the SAME static English HTML (lang-context.tsx documents the full
 * story). The served HTML was byte-identical for both languages, so the
 * hreflang=fa variant had no server-rendered Persian content for crawlers
 * that don't execute JS (Bing, AI crawlers) and Persian was invisible in
 * the page source. This route is the same HomeView rendered AT BUILD TIME
 * with lang pinned to 'fa' (LangProvider via SiteChrome + usePathname):
 *  - the initial HTML is Persian — crawlers need no JS;
 *  - metadata (title/description/OG/twitter) is Persian;
 *  - hreflang now points fa → /fa (and this page points back to / for en);
 *  - EN pages and the ?lang=fa flip are untouched (scope freeze).
 *
 * Same DB contract as src/app/page.tsx: NO catch-to-empty — if the DB is
 * unreachable at build the build MUST fail so Vercel keeps the previous
 * good deployment (2026-09-07 outage policy).
 */
export const dynamic = 'force-static';

// Crawler-facing Persian metadata — copy comes from the site's own Persian
// dictionary (src/components/site/i18n.ts fa.hero) so the SERP entry matches
// what the visitor sees on the page.
export const metadata: Metadata = {
  title: { absolute: 'مهرداد — سازنده مستقل محصول | طراحی و ساخت سریع با هوش مصنوعی' },
  description:
    'کسب‌وکار و محصولت را با دقت طراحی می‌کنم و با هوش مصنوعی سریع می‌سازم. پروژه‌های واقعی با وضعیت صادقانه و درس‌های مستندشده از کار واقعی — پژوهش، طراحی، اجرا.',
  alternates: {
    types: { "application/rss+xml": "/feed.xml" },
    canonical: '/fa',
    languages: {
      en: '/',
      fa: '/fa',
      'x-default': '/',
    },
  },
  openGraph: {
    title: 'مهرداد — سازنده مستقل محصول',
    description:
      'کسب‌وکار و محصولت را با دقت طراحی می‌کنم و با هوش مصنوعی سریع می‌سازم — پروژه‌های واقعی، وضعیت صادقانه.',
    siteName: 'mehrdad.ir',
    type: 'website',
    locale: 'fa_IR',
    alternateLocale: ['en_US'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'مهرداد — سازنده مستقل محصول',
    description:
      'کسب‌وکار و محصولت را با دقت طراحی می‌کنم و با هوش مصنوعی سریع می‌سازم — پروژه‌های واقعی، وضعیت صادقانه.',
  },
};

export default async function FaHomePage() {
  // identical data contract to the EN homepage (src/app/page.tsx) — one
  // source of truth for what appears on the homepage in both languages
  const [projects, featured] = await Promise.all([
    getProjects({ section: 'work', featured: true }),
    listPosts({ page: 1, perPage: 6, excludeSlugs: NOT_IN_FEATURED_POST_SLUGS }),
  ]);
  const homeProjects = projects.slice(0, 2);

  const base = (process.env.SITE_ORIGIN || 'https://mehrdad.ir').replace(/\/+$/, '');
  // same entity graph as the EN home, with the WebSite node declared in
  // Persian and anchored to /fa — Google/LLMs tie the Persian surface to
  // the same Person entity (alternateName carries the EN name)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${base}/fa#website-fa`,
        url: `${base}/fa`,
        name: 'مهرداد — سازنده مستقل محصول',
        alternateName: 'Mehrdad — Product Builder',
        inLanguage: 'fa-IR',
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
        sameAs: [
          'https://github.com/goolro',
          'https://virgool.io/@mehrdad.ir',
          'https://www.instagram.com/startup_mt/',
          'https://www.linkedin.com/in/mehrdad-ir/',
        ],
      },
    ],
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <HomeView
      initial={{
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
