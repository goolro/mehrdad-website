import type { Metadata } from 'next';
import { AboutView } from '@/components/site/AboutView';

export const metadata: Metadata = {
  title: 'About Mehrdad | Mehrdad — Product Builder',
  description:
    'Independent product builder: I research, design and build real businesses and products — careful on the design side, fast on the build side with AI.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return <AboutView />;
}
