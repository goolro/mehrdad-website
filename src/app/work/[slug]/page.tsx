import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProjectDetail } from '@/components/site/ProjectsView';
import { getProjectBySlug, getProjects } from '@/lib/queries';
import { JsonLd } from '@/components/site/JsonLd';

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
 * 2026-09-08 (lang-mixing fix): the page body moved into the client
 * `ProjectDetail` component — the old server-rendered version stacked
 * BOTH languages (EN title + FA title, EN summary + FA summary,
 * hardcoded EN labels), which produced the EN/FA mixing the owner
 * reported. Language is client state, so the body must render from it.
 * Server keeps: fetch, 404 guard, JSON-LD (both languages for SEO).
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
      <ProjectDetail
        project={{
          slug: project.slug,
          titleEn: project.titleEn,
          titleFa: project.titleFa,
          summaryEn: project.summaryEn,
          summaryFa: project.summaryFa,
          cover: project.cover,
          status: project.status,
          progress: project.progress,
          fundingAsk: project.fundingAsk,
          statusEn: project.statusEn,
          statusFa: project.statusFa,
        }}
        shareUrl={`${base}/work/${project.slug}`}
      />
    </>
  );
}
