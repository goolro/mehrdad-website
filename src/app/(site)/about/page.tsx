import type { Metadata } from 'next';
import { AboutView } from '@/components/site/AboutView';
import { JsonLd } from '@/components/site/JsonLd';

export const metadata: Metadata = {
  title: { absolute: 'About Mehrdad | Mehrdad — Product Builder' },
  // description trimmed to the SERP budget (audit section 2, fix #4): the
  // old text rendered 202 chars and the punchline was cut off in results.
  description:
    'Independent product builder running the Forward Deployed Engineering loop — the loop behind Quiz of Koko, a live AI game. I ship outcomes, not hours.',
  alternates: {
    types: { "application/rss+xml": "/feed.xml" },
    canonical: '/about',
    // hreflang triple (audit §2 #1): the Persian twin /fa/about exists
    languages: { en: '/about', fa: '/fa/about', 'x-default': '/about' },
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
    'Independent product builder running the Forward Deployed Engineering loop — the loop behind Quiz of Koko, a live AI game. I ship outcomes, not hours.',
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
