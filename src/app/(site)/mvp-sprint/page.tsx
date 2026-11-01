import type { Metadata } from 'next';
import { MvpSprintView } from '@/components/site/MvpSprintView';
import { JsonLd } from '@/components/site/JsonLd';
import { ui } from '@/components/site/i18n';

// Static like /services: rendered once per BUILD so the build-time CSP meta
// applies, served from the edge until the next deploy (Deploy Hook rebuilds).
export const dynamic = 'force-static';

// FAQPage schema (phase 2, 2026-10-18) — mirrors the EN FAQ visible on
// /mvp-sprint (Google rule: structured data must match visible content).
// JsonLd is an inline block hashed by the build-time CSP injector; this page
// is force-static, so no per-request rendering is introduced.
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: ui.en.mvpSprint.faq.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
};

export const metadata: Metadata = {
  // title/description trimmed to the SERP budget (audit section 2, fix #4):
  // the old pair rendered 68/206 chars — Google truncates ~60/~155, so the
  // differentiators were cut off exactly where the click decision happens.
  title: { absolute: 'AI MVP Sprint — fixed scope, fixed quote | Mehrdad' },
  description:
    'From a real problem to a working, testable product in one focused sprint. Fixed scope, fixed quote, free scope call — no hourly billing.',
  alternates: {
    types: { "application/rss+xml": "/feed.xml" },
    canonical: '/mvp-sprint',
    languages: { en: '/mvp-sprint', 'x-default': '/mvp-sprint' },
  },
  openGraph: {
    title: 'AI MVP Sprint — fixed scope, fixed quote',
    description:
      'From a real problem to a working product in one focused sprint — free scope call, three fixed-scope tiers, no hourly billing.',
    url: '/mvp-sprint',
    // og:locale (audit section 2, fix #5): every other page declares its
    // OG locale; this money page was the silent exception.
    locale: 'en_US',
    siteName: 'mehrdad.ir',
  },
};

export default function MvpSprintPage() {
  return (
    <>
      <JsonLd data={faqSchema} />
      <MvpSprintView />
    </>
  );
}
