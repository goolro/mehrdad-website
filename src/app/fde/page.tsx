import type { Metadata } from 'next';
import { FdeView } from '@/components/site/FdeView';

// FdeView is fully static content — no DB reads needed
export const metadata: Metadata = {
  title: 'Forward Deployed Engineering | Mehrdad — Product Builder',
  description:
    'Solving real business and product problems by combining product thinking, software engineering and AI — from problem discovery to building, deploying and improving the solution.',
  alternates: { canonical: '/fde' },
};

export default function FdePage() {
  return <FdeView />;
}
