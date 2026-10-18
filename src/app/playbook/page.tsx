import type { Metadata } from 'next';
import { PlaybookView } from '@/components/site/PlaybookView';

// Static like /mvp-sprint: rendered once per BUILD so the build-time CSP meta
// applies, served from the edge until the next deploy (Deploy Hook rebuilds).
export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'The FDE Playbook — from problem to product in 10 steps | Mehrdad — Product Builder',
  description:
    'A free practical checklist: from a real problem to a working product in 10 steps — the exact loop behind every project on this site. Get the full version with worksheets by email.',
  alternates: {
    canonical: '/playbook',
    languages: { en: '/playbook', fa: '/playbook?lang=fa', 'x-default': '/playbook' },
  },
  openGraph: {
    title: 'The FDE Playbook — from problem to product in 10 steps',
    description:
      'The exact Forward Deployed Engineering loop behind every project on this site — free, practical, no gatekeeping.',
    url: '/playbook',
  },
};

export default function PlaybookPage() {
  return <PlaybookView />;
}
