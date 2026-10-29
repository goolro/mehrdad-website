import type { Metadata } from 'next';
import { ServicesView } from '@/components/site/ServicesView';
import { JsonLd } from '@/components/site/JsonLd';

// Fully static: rendered once per BUILD (the build-time CSP meta can
// only be injected then) and served from the edge until the next deploy.
// Content updates publish via the Vercel Deploy Hook fired by the admin
// panel (VERCEL_DEPLOY_HOOK_URL) — a ~2-3 min rebuild, same ballpark as
// the ISR window it replaces. Unknown slugs between deploys still render
// on demand (dynamicParams) and are cached until the next deploy.
export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: { absolute: 'What I Do | Mehrdad — Product Builder' },
  description:
    'One process, not eight services — design the real problem, build fast with AI, share what actually worked. Forward Deployed Engineering as the core engagement.',
  alternates: {
    canonical: '/services',
    languages: { en: '/services', 'x-default': '/services' },
  },
};

// ProfessionalService schema (phase-2 SEO gap): /services is a money page
// but carried no structured data — search engines and LLMs had no entity to
// attach it to. OfferCatalog mirrors the real engagement entry points that
// exist as pages (AI MVP Sprint, FDE, Scope Builder); provider references
// the Person @id declared in the home-page JSON-LD graph.
const base = (process.env.SITE_ORIGIN || 'https://mehrdad.ir').replace(/\/+$/, '');
const servicesSchema = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  '@id': `${base}/services#service`,
  name: 'Mehrdad — Product Design & AI-Accelerated Build',
  url: `${base}/services`,
  description:
    'One process, not eight services — design the real problem, build fast with AI, share what actually worked. Forward Deployed Engineering as the core engagement.',
  provider: { '@id': `${base}/#person` },
  areaServed: 'Worldwide',
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Engagements',
    itemListElement: [
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'AI MVP Sprint — fixed scope, fixed quote', url: `${base}/mvp-sprint` } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Forward Deployed Engineering', url: `${base}/fde` } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Free MVP Scope Builder', url: `${base}/scope-builder` } },
    ],
  },
};

// The DB-driven service grid is gone (2026-01): the page is the static
// "What I Do" block — no content query needed here anymore.
export default function ServicesPage() {
  return (
    <>
      <JsonLd data={servicesSchema} />
      <ServicesView />
    </>
  );
}
