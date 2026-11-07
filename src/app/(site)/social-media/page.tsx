import type { Metadata } from 'next';
import { SocialMediaPlans } from '@/components/site/SocialMediaPlans';
import { JsonLd } from '@/components/site/JsonLd';

// English twin of /fa/social-media (owner request 2026-11-07: the site is
// bilingual — every page needs its pair). Same approved panel graphic,
// English copy, dir=ltr from the (site) root layout. hreflang-paired with
// the Persian side; plan details live on /social-media/[plan].
export const metadata: Metadata = {
  title: { absolute: 'Social Media Management Plans — from $59/mo | Mehrdad' },
  description:
    'A system runs your page: custom content, consistent posting, and DM replies — every day, without a break. Auto $59 · Companion $75 · Business $245 per month · Network for bulk account management. No contract lock-in.',
  alternates: {
    types: { 'application/rss+xml': '/feed.xml' },
    canonical: '/social-media',
    languages: {
      en: '/social-media',
      fa: '/fa/social-media',
      'x-default': '/social-media',
    },
  },
  openGraph: {
    title: 'AI-Powered Social Media Management Plans — Mehrdad',
    description:
      'Custom content, consistent posting, and DM replies — every day, without a break. Auto $59 · Companion $75 · Business $245 per month. No contract lock-in.',
    url: '/social-media',
    siteName: 'mehrdad.ir',
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['fa_IR'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI-Powered Social Media Management Plans — Mehrdad',
    description:
      'Custom content, consistent posting, and DM replies — every day, without a break. Auto $59 · Companion $75 · Business $245 per month. No contract lock-in.',
  },
};

const base = (process.env.SITE_ORIGIN || 'https://mehrdad.ir').replace(/\/+$/, '');
const plansSchema = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  '@id': `${base}/social-media#social-plans`,
  name: 'Mehrdad — AI-Powered Social Media Management',
  url: `${base}/social-media`,
  provider: { '@id': `${base}/#person` },
  areaServed: 'Worldwide',
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Social media management plans',
    itemListElement: [
      { '@type': 'Offer', name: 'Auto plan — 12 posts + 8 stories/mo, AI DM replies', price: '59', priceCurrency: 'USD', url: `${base}/social-media/auto` },
      { '@type': 'Offer', name: 'Companion plan — human review of every post and message', price: '75', priceCurrency: 'USD', url: `${base}/social-media/companion` },
      { '@type': 'Offer', name: 'Business plan — 4 reels, strategy session, weekly report', price: '245', priceCurrency: 'USD', url: `${base}/social-media/business` },
      { '@type': 'Offer', name: 'Account setup (mode 1 — your own email and number)', price: '17', priceCurrency: 'USD' },
      { '@type': 'Offer', name: 'Account setup (mode 2 — secure number + Gmail + 7-day warm-up)', price: '21', priceCurrency: 'USD' },
    ],
  },
};

export default function SocialMediaPage() {
  return (
    <>
      <JsonLd data={plansSchema} />
      <SocialMediaPlans lang="en" />
    </>
  );
}
