import type { Metadata } from 'next';
import { CaseStudyKokoView } from '@/components/site/CaseStudyKokoView';

// Static like /mvp-sprint: rendered once per BUILD so the build-time CSP meta
// applies, served from the edge until the next deploy.
export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Case Study: Quiz of Koko — from idea to live product | Mehrdad',
  description:
    'How Quiz of Koko went from a real learning problem to a live, AI-powered vocabulary game (free in browser and on Android) — the Forward Deployed Engineering loop behind it, now productized as the AI MVP Sprint.',
  alternates: {
    canonical: '/case-studies/quiz-of-koko',
    languages: {
      en: '/case-studies/quiz-of-koko',
      fa: '/case-studies/quiz-of-koko?lang=fa',
      'x-default': '/case-studies/quiz-of-koko',
    },
  },
  openGraph: {
    title: 'Case Study: Quiz of Koko — from idea to live product',
    description:
      'Adaptive AI questions, live duels, weekly leagues — how the FDE loop took Quiz of Koko from scope to a live product in the browser and on Android.',
    url: '/case-studies/quiz-of-koko',
  },
};

export default function CaseStudyKokoPage() {
  return <CaseStudyKokoView />;
}
