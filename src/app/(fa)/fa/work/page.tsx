import type { Metadata } from 'next';
import { ProjectsView } from '@/components/site/ProjectsView';
import { JsonLd } from '@/components/site/JsonLd';
import { getProjects } from '@/lib/queries';
import { importContentSeed } from '@/lib/seed-import';

// Persian twin of src/app/(site)/work/page.tsx (audit section 2, fix #1 —
// the fa tree): identical data contract, Persian metadata, CollectionPage
// schema anchored to /fa/work. The (fa) root layout + lang-context render
// ProjectsView with the Persian dictionary at build time.
export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: { absolute: 'طرح‌ها و استارتاپ‌های کلیدی | مهرداد — سازنده مستقل محصول' },
  description:
    'پروژه‌ها و استارتاپ‌های واقعی — ساخته‌شده در معرض دید، با وضعیت صادقانه در هر مرحله.',
  alternates: {
    types: { 'application/rss+xml': '/feed.xml' },
    canonical: '/fa/work',
    languages: { en: '/work', fa: '/fa/work', 'x-default': '/work' },
  },
  openGraph: {
    title: 'طرح‌ها و استارتاپ‌های کلیدی — مهرداد',
    description:
      'پروژه‌ها و استارتاپ‌های واقعی — ساخته‌شده در معرض دید، با وضعیت صادقانه در هر مرحله.',
    url: '/fa/work',
    siteName: 'mehrdad.ir',
    type: 'website',
    locale: 'fa_IR',
    alternateLocale: ['en_US'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'طرح‌ها و استارتاپ‌های کلیدی — مهرداد',
    description:
      'پروژه‌ها و استارتاپ‌های واقعی — ساخته‌شده در معرض دید، با وضعیت صادقانه در هر مرحله.',
  },
};

export default async function FaWorkPage() {
  // same build-time seed contract as the EN page — insert-if-missing,
  // idempotent, fail-safe (see seed-import.ts)
  await importContentSeed();
  const projects = await getProjects({ section: 'work' });

  // CollectionPage + ItemList mirroring the EN schema: the item URLs are the
  // real (EN) project pages — project detail pages have no Persian twins yet,
  // so the inventory stays truthful about where the pages actually live.
  const base = (process.env.SITE_ORIGIN || 'https://mehrdad.ir').replace(/\/+$/, '');
  const workSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${base}/fa/work#collection-fa`,
    url: `${base}/fa/work`,
    name: 'طرح‌ها و استارتاپ‌های کلیدی — مهرداد',
    description:
      'پروژه‌ها و استارتاپ‌های واقعی — ساخته‌شده در معرض دید، با وضعیت صادقانه در هر مرحله.',
    inLanguage: 'fa-IR',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: projects.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${base}/work/${p.slug}`,
        name: p.titleFa || p.titleEn,
      })),
    },
  };

  return (
    <>
      <JsonLd data={workSchema} />
      <ProjectsView initialProjects={projects} />
    </>
  );
}
