import type { Metadata } from 'next';
import { AboutView } from '@/components/site/AboutView';
import { JsonLd } from '@/components/site/JsonLd';

export const metadata: Metadata = {
  title: { absolute: 'About Mehrdad | Mehrdad — Product Builder' },
  description:
    'Independent product builder running the Forward Deployed Engineering loop — the same loop that took Quiz of Koko from a blank page to a live AI vocabulary game. I don\'t sell hours; I ship outcomes.',
  alternates: {
    types: { "application/rss+xml": "/feed.xml" },
    canonical: '/about',
    languages: { en: '/about', 'x-default': '/about' },
  },
};

// AboutPage schema (phase-2 SEO gap): mainEntity references the Person
// @id declared in the home-page JSON-LD graph, so search engines merge
// this page into the same entity instead of inventing a new one.
const base = (process.env.SITE_ORIGIN || 'https://mehrdad.ir').replace(/\/+$/, '');
const aboutSchema = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  '@id': `${base}/about#aboutpage`,
  url: `${base}/about`,
  name: 'About Mehrdad',
  description:
    "Independent product builder running the Forward Deployed Engineering loop — the same loop that took Quiz of Koko from a blank page to a live AI vocabulary game. I don't sell hours; I ship outcomes.",
  inLanguage: 'en',
  mainEntity: { '@id': `${base}/#person` },
};

export default function AboutPage() {
  return (
    <>
      <JsonLd data={aboutSchema} />
      <AboutView />
    </>
  );
}
