import type { Metadata } from 'next';
import { DeckView } from '@/components/site/DeckView';

// Investor pitch deck for «Quiz of Koko» — the deep 19-section companion
// to /investors-koko (owner address decision 2026-10-10, D-029). Fully
// static like the other marketing surfaces (build-time CSP meta).
export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: { absolute: 'Investor Pitch Deck — Quiz of Koko | Mehrdad' },
  description:
    'The 19-section investor pitch deck for Quiz of Koko: product, engagement loop, market, business-model scenarios, roadmap and the ask — evidence-gated and bilingual. Request a private briefing.',
  alternates: {
    canonical: '/investors-koko/deck',
    languages: { en: '/investors-koko/deck', 'x-default': '/investors-koko/deck' },
  },
};

export default function DeckPage() {
  return <DeckView />;
}
