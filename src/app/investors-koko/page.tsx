import type { Metadata } from 'next';
import { InvestorsView } from '@/components/site/InvestorsView';

// Investor overview for «Quiz of Koko» — fully static like the other
// marketing surfaces (build-time CSP meta; served from the edge).
// Lives under the /investors-koko/* namespace since D-029 (2026-10-10):
// /investors redirects here for any address that was ever shared.
export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: { absolute: 'Investors — Quiz of Koko | Mehrdad' },
  description:
    'Investor overview for Quiz of Koko: a live web word-quiz game with an AI-validated question pool in 10 languages, a 12-month validation plan with decision gates, and evidence-gated Stage-1 funding. Request a private briefing.',
  alternates: {
    canonical: '/investors-koko',
    languages: { en: '/investors-koko', 'x-default': '/investors-koko' },
  },
};

export default function InvestorsPage() {
  return <InvestorsView />;
}
