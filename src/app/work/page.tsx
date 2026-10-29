import type { Metadata } from 'next';
import { ProjectsView } from '@/components/site/ProjectsView';
import { JsonLd } from '@/components/site/JsonLd';
import { getProjects } from '@/lib/queries';
import { importContentSeed } from '@/lib/seed-import';

// Fully static: rendered once per BUILD (the build-time CSP meta can
// only be injected then) and served from the edge until the next deploy.
// Content updates publish via the Vercel Deploy Hook fired by the admin
// panel (VERCEL_DEPLOY_HOOK_URL) — a ~2-3 min rebuild, same ballpark as
// the ISR window it replaces. Unknown slugs between deploys still render
// on demand (dynamicParams) and are cached until the next deploy.
export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: { absolute: 'Key Projects & Startups | Mehrdad — Product Builder' },
  description: 'Real projects and startups — built in the open, with honest status at every step.',
  alternates: {
    canonical: '/work',
    languages: { en: '/work', 'x-default': '/work' },
  },
};

export default async function WorkPage() {
  // build-time prerender must see git-shipped content rows — the importer
  // is insert-if-missing, idempotent and fail-safe (see seed-import.ts)
  await importContentSeed();
  const projects = await getProjects({ section: 'work' });

  // CollectionPage + ItemList (phase-2 SEO gap): gives crawlers and LLMs a
  // machine-readable inventory of every project page without parsing cards.
  const base = (process.env.SITE_ORIGIN || 'https://mehrdad.ir').replace(/\/+$/, '');
  const workSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${base}/work#collection`,
    url: `${base}/work`,
    name: 'Key Projects & Startups — Mehrdad',
    description: 'Real projects and startups — built in the open, with honest status at every step.',
    inLanguage: 'en',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: projects.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${base}/work/${p.slug}`,
        name: p.titleEn,
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
