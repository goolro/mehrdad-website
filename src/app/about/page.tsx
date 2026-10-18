import type { Metadata } from 'next';
import { AboutView } from '@/components/site/AboutView';

export const metadata: Metadata = {
  title: 'About Mehrdad | Mehrdad — Product Builder',
  description:
    'Independent product builder running the Forward Deployed Engineering loop — the same loop that took Quiz of Koko from a blank page to a live AI vocabulary game. I don\'t sell hours; I ship outcomes.',
  alternates: {
    canonical: '/about',
    languages: { en: '/about', fa: '/about?lang=fa', 'x-default': '/about' },
  },
};

export default function AboutPage() {
  return <AboutView />;
}
