import type { Metadata, Viewport } from 'next';
import { TrafficTempoMobile } from '@/components/site/games/TrafficTempoMobile';

// Fully static like every public page — the game is a pure client island
// (canvas + engine live in effects/gestures) so the build-time CSP meta
// injected by scripts/inject-csp.mjs applies unchanged.
export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Traffic Tempo — Mobile Edition',
  description:
    'Run the intersection in this 2D mobile traffic game — flip the lights, keep the tempo, never let crossing cars meet.',
  alternates: {
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
  return <TrafficTempoMobile />;
}
