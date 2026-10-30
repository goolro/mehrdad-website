import type { Metadata } from 'next';
import { ConsultView } from '@/components/site/ConsultView';
import { JsonLd } from '@/components/site/JsonLd';
import { ui } from '@/components/site/i18n';

// Static like /mvp-sprint: rendered once per BUILD so the build-time CSP meta
// applies, served from the edge until the next deploy.
export const dynamic = 'force-static';

// FAQPage schema — mirrors the EN FAQ visible on /consult (Google rule:
// structured data must match visible content). Same pattern as /mvp-sprint.
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: ui.en.consult.faq.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
};

export const metadata: Metadata = {
  title: { absolute: 'Strategy Session — 45 min, $99, one-page memo | Mehrdad — Product Builder' },
  description:
    'A paid 45-minute working session with Mehrdad: one real business problem in, a ranked plan and a one-page strategy memo out within 24 hours. $99 flat, no hourly billing.',
  alternates: {
    canonical: '/consult',
    types: { 'application/rss+xml': '/feed.xml' },
    languages: { en: '/consult', 'x-default': '/consult' },
  },
  openGraph: {
    title: 'Strategy Session — 45 minutes, one real problem',
    description:
      'Bring the single problem that matters most. Leave with a ranked plan — and a one-page strategy memo within 24 hours. $99 flat.',
    url: '/consult',
  },
};

export default function ConsultPage() {
  return (
    <>
      <JsonLd data={faqSchema} />
      <ConsultView />
    </>
  );
}
