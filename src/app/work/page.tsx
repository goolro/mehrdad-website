import type { Metadata } from 'next';
import { ProjectsView } from '@/components/site/ProjectsView';
import { getProjects } from '@/lib/queries';

// Fully static: rendered once per BUILD (the build-time CSP meta can
// only be injected then) and served from the edge until the next deploy.
// Content updates publish via the Vercel Deploy Hook fired by the admin
// panel (VERCEL_DEPLOY_HOOK_URL) — a ~2-3 min rebuild, same ballpark as
// the ISR window it replaces. Unknown slugs between deploys still render
// on demand (dynamicParams) and are cached until the next deploy.
export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Key Projects & Startups | Mehrdad — Product Builder',
  description: 'Real projects and startups — built in the open, with honest status at every step.',
  alternates: { canonical: '/work' },
};

export default async function WorkPage() {
  const projects = await getProjects().catch(() => []);
  return <ProjectsView initialProjects={projects} />;
}
