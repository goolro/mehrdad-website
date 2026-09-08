import type { Metadata } from 'next';
import { ServicesView } from '@/components/site/ServicesView';

// Fully static: rendered once per BUILD (the build-time CSP meta can
// only be injected then) and served from the edge until the next deploy.
// Content updates publish via the Vercel Deploy Hook fired by the admin
// panel (VERCEL_DEPLOY_HOOK_URL) — a ~2-3 min rebuild, same ballpark as
// the ISR window it replaces. Unknown slugs between deploys still render
// on demand (dynamicParams) and are cached until the next deploy.
export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'What I Do | Mehrdad — Product Builder',
  description:
    'One process, not eight services — design the real problem, build fast with AI, share what actually worked. Forward Deployed Engineering as the core engagement.',
  alternates: {
    canonical: '/services',
    languages: { en: '/services', fa: '/services?lang=fa', 'x-default': '/services' },
  },
};

// The DB-driven service grid is gone (2026-01): the page is the static
// "What I Do" block — no content query needed here anymore.
export default function ServicesPage() {
  return <ServicesView />;
}
