import type { Metadata } from 'next';
import { MvpSprintView } from '@/components/site/MvpSprintView';

// Static like /services: rendered once per BUILD so the build-time CSP meta
// applies, served from the edge until the next deploy (Deploy Hook rebuilds).
export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'AI MVP Sprint — fixed scope, fixed quote | Mehrdad — Product Builder',
  description:
    'From a real problem to a working, testable product in one focused sprint. Free 30-minute scope call, three fixed-scope entry points, no hourly billing. Forward Deployed Engineering as a productized service.',
  alternates: {
    canonical: '/mvp-sprint',
    languages: { en: '/mvp-sprint', fa: '/mvp-sprint?lang=fa', 'x-default': '/mvp-sprint' },
  },
  openGraph: {
    title: 'AI MVP Sprint — fixed scope, fixed quote',
    description:
      'From a real problem to a working product in one focused sprint — free scope call, three fixed-scope tiers, no hourly billing.',
    url: '/mvp-sprint',
  },
};

export default function MvpSprintPage() {
  return <MvpSprintView />;
}
