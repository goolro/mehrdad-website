import type { Metadata } from 'next';
import { PricingView } from '@/components/site/PricingView';
import { JsonLd } from '@/components/site/JsonLd';

// Fully static (same pattern as /services): rendered once per BUILD and
// served from the edge until the next deploy. Survey fix #1 (2026-11):
// 8 of 14 tested personas named "no clear pricing" — this page publishes
// the owner-confirmed anchors (free scope call · $99 strategy session ·
// One-Feature MVP from $490 · Full Sprint from $1,490) in one place.
export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: { absolute: 'Pricing — Fixed Quotes, Published Anchors | Mehrdad — Product Builder' },
  description:
    'Every engagement is a fixed quote — no hourly billing, no surprise invoices. Free 15-min scope call · Strategy Session $99 · One-Feature MVP from $490 · Full Sprint from $1,490.',
  alternates: {
    types: { 'application/rss+xml': '/feed.xml' },
    canonical: '/pricing',
    // hreflang triple (same pattern as /services): Persian twin /fa/pricing
    languages: { en: '/pricing', fa: '/fa/pricing', 'x-default': '/pricing' },
  },
};

// OfferCatalog schema: the four owner-confirmed entry points with their
// published prices/anchors, anchored to the Person entity declared on the
// home-page JSON-LD graph.
const base = (process.env.SITE_ORIGIN || 'https://mehrdad.ir').replace(/\/+$/, '');
const pricingSchema = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  '@id': `${base}/pricing#pricing`,
  name: 'Mehrdad — Product Design & AI-Accelerated Build',
  url: `${base}/pricing`,
  provider: { '@id': `${base}/#person` },
  areaServed: 'Worldwide',
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Engagements & pricing',
    itemListElement: [
      { '@type': 'Offer', name: 'Scope Call (15 min)', price: '0', priceCurrency: 'USD', url: `${base}/mvp-sprint` },
      { '@type': 'Offer', name: 'Strategy Session — 45 min + 24 h memo', price: '99', priceCurrency: 'USD', url: `${base}/consult` },
      { '@type': 'Offer', name: 'One-Feature MVP (1–2 weeks)', priceSpecification: { '@type': 'PriceSpecification', minPrice: '490', priceCurrency: 'USD' }, url: `${base}/mvp-sprint` },
      { '@type': 'Offer', name: 'Full Sprint (~30 days)', priceSpecification: { '@type': 'PriceSpecification', minPrice: '1490', priceCurrency: 'USD' }, url: `${base}/mvp-sprint` },
    ],
  },
};

export default function PricingPage() {
  return (
    <>
      <JsonLd data={pricingSchema} />
      <PricingView />
    </>
  );
}
