import type { Metadata } from 'next';
import { LabView } from '@/components/site/LabView';
import { getProjects } from '@/lib/queries';

// Fully static like /work — content publishes via the admin panel deploy
// hook. (2026-09-07: /lab is no longer an alias of /fde — it is the real
// index of Lab experiments; see DECISIONS.md.)
export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'The Lab — Experiments & Side Quests | Mehrdad',
  description:
    'Experiments built for curiosity, in the open. Lab items carry no business model — some may grow into products, most just teach me something.',
  alternates: {
    canonical: '/lab',
    languages: { en: '/lab', fa: '/lab?lang=fa', 'x-default': '/lab' },
  },
};

export default async function LabPage() {
  const projects = await getProjects({ section: 'lab' });
  return <LabView initialProjects={projects} />;
}
