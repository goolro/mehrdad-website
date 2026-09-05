import type { Metadata } from 'next';
import { ProjectsView } from '@/components/site/ProjectsView';
import { getProjects } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Key Projects & Startups | Mehrdad — Product Builder',
  description: 'Real projects and startups — built in the open, with honest status at every step.',
  alternates: { canonical: '/work' },
};

export default async function WorkPage() {
  const projects = await getProjects();
  return <ProjectsView initialProjects={projects} />;
}
