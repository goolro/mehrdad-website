import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { TrafficTempoMobile } from '@/components/site/games/TrafficTempoMobile';
import { isProjectHidden } from '@/lib/project-visibility';

// Fully static like every public page — the game is a pure client island
// (canvas + engine live in effects/gestures) so the build-time CSP meta
// injected by scripts/inject-csp.mjs applies unchanged.
export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: { absolute: 'Traffic Tempo — Mobile Edition' },
  description:
    'Run the intersection in this 2D mobile traffic game — flip the lights, keep the tempo, never let crossing cars meet.',
  alternates: {
    types: { "application/rss+xml": "/feed.xml" },
    canonical: '/play/traffic-tempo',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // notch-friendly: the HUD respects safe-area insets
  viewportFit: 'cover',
  themeColor: '#15191c',
};

export default function PlayTrafficTempoPage() {
  // display kill-switch (project-visibility.ts): hidden → 404 while the
  // owner keeps the product unpublished; re-enabling is a one-line change
  if (isProjectHidden('traffic-tempo')) notFound();
  return <TrafficTempoMobile />;
}
