import { permanentRedirect } from 'next/navigation';

/**
 * /investors moved to /investors-koko (owner decision 2026-10-10, D-029):
 * the whole Koko investor funnel now lives under the /investors-koko/*
 * namespace so future investor surfaces and additional decks can sit
 * beside it (e.g. /investors-koko/deck). This tiny route keeps any link
 * that was ever shared as /investors alive with a permanent 308.
 */
export const dynamic = 'force-dynamic';

export default function InvestorsRedirectPage() {
  permanentRedirect('/investors-koko');
}
