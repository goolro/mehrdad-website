import type { Metadata } from 'next';
import { ServicesView } from '@/components/site/ServicesView';
import { getServices } from '@/lib/queries';

// Fully static: rendered once per BUILD (the build-time CSP meta can
// only be injected then) and served from the edge until the next deploy.
// Content updates publish via the Vercel Deploy Hook fired by the admin
// panel (VERCEL_DEPLOY_HOOK_URL) — a ~2-3 min rebuild, same ballpark as
// the ISR window it replaces. Unknown slugs between deploys still render
// on demand (dynamicParams) and are cached until the next deploy.
export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Services | Mehrdad — Product Builder',
  description: 'From product design to AI and market strategy — Forward Deployed Engineering as the core service.',
  alternates: { canonical: '/services' },
};

export default async function ServicesPage() {
  const services = await getServices();
  return <ServicesView initialServices={services} />;
}
