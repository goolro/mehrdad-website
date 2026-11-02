import type { Metadata } from 'next';
import { DeckHealthReserved } from '@/components/site/DeckHealthReserved';

// Reserved standalone address for the Health & Wellness deck (owner order
// 2026-10-13, D-034): the owner's deck page will render EXACTLY here later —
// outside the site template, as a full-bare surface like /play. Until the
// owner delivers that page this route shows a restrained reserved-note
// placeholder (DeckHealthReserved.tsx). robots noindex is INTENTIONAL while
// the placeholder is live — remove it in the same commit that replaces the
// placeholder with the real deck.
export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Health Deck | Mehrdad',
  description: 'Reserved address for the Health & Wellness deck — content publishing soon.',
  alternates: { canonical: '/deck/health' },
  robots: { index: false, follow: false },
};

export default function DeckHealthPage() {
  return <DeckHealthReserved />;
}
