import type { Metadata } from 'next';
import { FdeView } from '@/components/site/FdeView';
import { JsonLd } from '@/components/site/JsonLd';

// FdeView is fully static content — no DB reads needed
export const metadata: Metadata = {
  title: { absolute: 'Forward Deployed Engineering | Mehrdad — Product Builder' },
  description:
    'Solving real business and product problems by combining product thinking, software engineering and AI — from problem discovery to building, deploying and improving the solution.',
  alternates: {
    canonical: '/fde',
    types: { 'application/rss+xml': '/feed.xml' },
  },
};

// Service schema (phase-2 SEO gap): the FDE page describes the core
// engagement but had no structured data. provider references the Person
// @id declared in the home-page JSON-LD graph.
const base = (process.env.SITE_ORIGIN || 'https://mehrdad.ir').replace(/\/+$/, '');
const fdeSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  '@id': `${base}/fde#service`,
  name: 'Forward Deployed Engineering',
  serviceType: 'Forward Deployed Engineering',
  url: `${base}/fde`,
  description:
    'Solving real business and product problems by combining product thinking, software engineering and AI — from problem discovery to building, deploying and improving the solution.',
  provider: { '@id': `${base}/#person` },
  areaServed: 'Worldwide',
};

export default function FdePage() {
  return (
    <>
      <JsonLd data={fdeSchema} />
      <FdeView />
    </>
  );
}
