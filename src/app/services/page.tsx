import type { Metadata } from 'next';
import { ServicesView } from '@/components/site/ServicesView';
import { getServices } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Services | Mehrdad — Product Builder',
  description: 'From product design to AI and market strategy — Forward Deployed Engineering as the core service.',
  alternates: { canonical: '/services' },
};

export default async function ServicesPage() {
  const services = await getServices();
  return <ServicesView initialServices={services} />;
}
