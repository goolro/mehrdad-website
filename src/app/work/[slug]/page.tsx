import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { StatusBadge, ProgressBar } from '@/components/site/ProjectsView';
import { ShareBar } from '@/components/site/ShareBar';
import { ui } from '@/components/site/i18n';
import { getProjectBySlug } from '@/lib/queries';
import { JsonLd } from '@/components/site/JsonLd';
import { ContactCta } from '@/components/site/ContactCta';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ slug: string }> };

// local mirror of STATUS_STYLE gradients (client-module values cannot be
// dereferenced inside server components)
const BAR_CLS: Record<string, string> = {
  'under-construction': 'bg-gradient-to-r from-amber-500 to-orange-500',
  seeking: 'bg-gradient-to-r from-violet-600 to-fuchsia-600',
  live: 'bg-gradient-to-r from-emerald-500 to-teal-500',
  'coming-soon': 'bg-gradient-to-r from-slate-400 to-slate-500',
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug).catch(() => null);
  if (!project) return { title: 'Project not found | Mehrdad' };
  return {
    title: `${project.titleEn} | Mehrdad — Product Builder`,
    description: project.summaryEn,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: {
      title: project.titleEn,
      description: project.summaryEn,
      url: `/work/${project.slug}`,
      images: project.cover ? [{ url: project.cover }] : undefined,
    },
  };
}

/**
 * Real, indexable project page (replaces the old hash-router modal).
 * Server-rendered: title, status badge, summary and progress bar are in
 * the initial HTML.
 */
export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  // AI-SEO: machine-readable project card for search engines and LLMs
  const base = (process.env.SITE_ORIGIN || 'https://mehrdad.ir').replace(/\/+$/, '');
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    '@id': `${base}/work/${project.slug}#project`,
    name: project.titleEn,
    alternateName: project.titleFa,
    description: project.summaryEn,
    url: `${base}/work/${project.slug}`,
    creator: { '@type': 'Person', '@id': `${base}/#person`, name: 'Mehrdad', url: `${base}/` },
    ...(project.cover ? { image: [project.cover] } : {}),
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <article className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge
          status={project.status}
          statusEn={project.statusEn}
          statusFa={project.statusFa}
          lang="en"
        />
        {project.status === 'under-construction' && (
          <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
            {project.progress}%
          </span>
        )}
      </div>

      <h1 className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl">{project.titleEn}</h1>
      <p className="mt-2 text-lg text-muted-foreground" dir="rtl">
        {project.titleFa}
      </p>

      {project.cover && (
        <img
          src={project.cover}
          alt={project.titleEn}
          className="mt-7 w-full rounded-2xl object-cover shadow-lg"
        />
      )}

      <div className="prose-blog mt-8" dir="ltr">
        <p>{project.summaryEn}</p>
      </div>
      <div className="prose-blog mt-4" dir="rtl">
        <p>{project.summaryFa}</p>
      </div>

      {project.status === 'under-construction' && (
        <div className="mt-8 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5">
          <div className="mb-2 flex items-center justify-between text-sm font-medium">
            <span>Build progress</span>
            <span className="font-extrabold text-amber-600 dark:text-amber-400">{project.progress}%</span>
          </div>
          <ProgressBar value={project.progress} barCls={BAR_CLS[project.status] || BAR_CLS.seeking} />
        </div>
      )}

      <div className="mt-8 border-y border-border py-4">
        <ShareBar
          url={`${base}/work/${project.slug}`}
          title={project.titleEn}
          label={ui.en.common.shareProject}
        />
      </div>

      <ContactCta label="I'm interested in this project" />
    </article>
    </>
  );
}
