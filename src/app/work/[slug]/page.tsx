import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { StatusBadge, ProgressBar } from '@/components/site/ProjectsView';
import { ShareBar } from '@/components/site/ShareBar';
import { ui } from '@/components/site/i18n';
import { getProjectBySlug, getProjects } from '@/lib/queries';
import { JsonLd } from '@/components/site/JsonLd';
import { ContactCta } from '@/components/site/ContactCta';
import { normalizeStatus, showsProgress } from '@/lib/project-status';

// Fully static: rendered once per BUILD (the build-time CSP meta can
// only be injected then) and served from the edge until the next deploy.
// Content updates publish via the Vercel Deploy Hook fired by the admin
// panel (VERCEL_DEPLOY_HOOK_URL) — a ~2-3 min rebuild, same ballpark as
// the ISR window it replaces. Unknown slugs between deploys still render
// on demand (dynamicParams) and are cached until the next deploy.
export const dynamic = 'force-static';

// prerender all project pages at build; [] → render on demand at runtime
export async function generateStaticParams() {
  try {
    const projects = await getProjects();
    return projects.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

type Props = { params: Promise<{ slug: string }> };

// local mirror of STATUS_STYLE gradients (client-module values cannot be
// dereferenced inside server components)
const BAR_CLS: Record<string, string> = {
  building: 'bg-gradient-to-r from-amber-500 to-orange-500',
  testing: 'bg-gradient-to-r from-teal-500 to-emerald-500',
  idea: 'bg-gradient-to-r from-violet-600 to-fuchsia-600',
  concept: 'bg-gradient-to-r from-slate-400 to-slate-500',
  live: 'bg-gradient-to-r from-emerald-500 to-teal-500',
  paused: 'bg-gradient-to-r from-orange-500 to-amber-500',
  archived: 'bg-gradient-to-r from-zinc-400 to-zinc-500',
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug).catch(() => null);
  if (!project) return { title: 'Project not found | Mehrdad' };
  return {
    title: `${project.titleEn} | Mehrdad — Product Builder`,
    description: project.summaryEn,
    alternates: {
      canonical: `/work/${project.slug}`,
      languages: {
        en: `/work/${project.slug}`,
        fa: `/work/${project.slug}?lang=fa`,
        'x-default': `/work/${project.slug}`,
      },
    },
    openGraph: {
      title: project.titleEn,
      description: project.summaryEn,
      url: `/work/${project.slug}`,
      // no `images` override: the file-convention opengraph-image.tsx renders
      // the branded status+progress card (cover photos are embedded inside it),
      // so every LinkedIn/WhatsApp share shows the honest build state
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
  const st = normalizeStatus(project.status);

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
        {showsProgress(st) && (
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

      {showsProgress(st) && (
        <div className="mt-8 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5">
          <div className="mb-2 flex items-center justify-between text-sm font-medium">
            <span>Build progress · پیشرفت ساخت</span>
            <span className="font-extrabold text-amber-600 dark:text-amber-400">{project.progress}%</span>
          </div>
          <ProgressBar value={project.progress} barCls={BAR_CLS[st] || BAR_CLS.idea} />
        </div>
      )}

      {project.fundingAsk && (
        <div className="mt-8 rounded-2xl border border-violet-500/30 bg-violet-600/5 p-5">
          <div className="text-sm font-semibold text-violet-700 dark:text-violet-300">
            Funding ask · درخواست سرمایه
          </div>
          <p className="mt-1 text-sm">{project.fundingAsk}</p>
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
