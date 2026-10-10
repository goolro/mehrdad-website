import type { Metadata } from 'next';
import { InvestorsView } from '@/components/site/InvestorsView';

// Investor overview for «Quiz of Koko» — fully static like the other
// marketing surfaces (build-time CSP meta; served from the edge).
export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Investors — Quiz of Koko | Mehrdad',
  description:
    'Investor overview for Quiz of Koko: a live, AI-powered word-quiz game in 13 languages, a 12-month release & validation plan, and evidence-gated funding. Request a private briefing.',
  alternates: {
    canonical: '/investors',
    languages: { en: '/investors', fa: '/investors?lang=fa', 'x-default': '/investors' },
  },
};

export default function InvestorsPage() {
  return <InvestorsView />;
}
