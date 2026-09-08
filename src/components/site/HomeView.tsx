'use client';

import { useApp, pick } from './store';
import { ui } from './i18n';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight, FolderKanban, FileText, Hammer, HeartHandshake, Share2, Search, GraduationCap, Repeat, PenTool } from 'lucide-react';
import { StatusBadge, ProgressBar, STATUS_STYLE } from './ProjectsView';
import { normalizeStatus, showsProgress } from '@/lib/project-status';
import { WhatIDo } from './WhatIDo';

const CHAIN_ICONS = [Search, PenTool, Hammer, GraduationCap, Share2, Repeat];
interface ProjectItem {
  id: string; slug: string; titleEn: string; titleFa: string; summaryEn: string; summaryFa: string; cover: string | null;
  section: string; status: string; progress: number; featured: boolean;
  fundingAsk: string | null; statusEn: string; statusFa: string;
}
interface CategoryItem { id: string; slug: string; nameEn: string; nameFa: string }
interface PostItem {
  slug: string; titleEn: string | null; titleFa: string | null; excerptEn: string | null; excerptFa: string | null;
  cover: string | null; date: string | Date; categories: CategoryItem[];
}

export interface HomeInitialData {
  projects: ProjectItem[];
  posts: PostItem[];
}

/**
 * Server-fed home page: `initial` arrives from the server component
 * (src/app/page.tsx) so the hero, projects and featured articles are
 * present in the FIRST HTML response — no client fetch, no empty shell
 * for crawlers (real-routes SEO migration).
 */
export function HomeView({ initial }: { initial: HomeInitialData }) {
  const { lang, setView, openPost, openProject, setChatOpen } = useApp();
  const t = ui[lang];

  const projects = initial.projects;
  const posts = initial.posts;

  return (
    <div className="flex flex-col">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-24 start-1/4 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl" />
          <div className="absolute top-32 end-0 h-80 w-80 rounded-full bg-fuchsia-600/10 blur-3xl" />
        </div>
        <div className="mx-auto flex max-w-7xl flex-col items-center px-4 py-20 text-center sm:px-6 md:py-28">
          <Badge variant="outline" className="mb-5 border-violet-500/40 bg-violet-600/10 px-4 py-1.5 text-sm text-violet-600 dark:text-violet-400">
            ☼ {t.hero.badge}
          </Badge>
          <h1 className="max-w-4xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl">
            {t.hero.title1}{' '}
            <span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent">
              {t.hero.title2}
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">{t.hero.sub}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button
              size="lg"
              onClick={() => setView('services')}
              className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-700 hover:to-fuchsia-700"
            >
              {t.hero.cta1}
              <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => setChatOpen(true)}>
              <Sparkles className="me-2 h-4 w-4" />
              {t.hero.cta2}
            </Button>
          </div>
        </div>
      </section>

      {/* ── Brand trio: Build / Help / Share ── */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-4 sm:px-6">
        <SectionHeader title={t.brand.trioTitle} sub={t.brand.trioSub} />
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { icon: Hammer, item: t.brand.build, ring: 'bg-violet-600/10 text-violet-600 dark:text-violet-400' },
            { icon: HeartHandshake, item: t.brand.help, ring: 'bg-fuchsia-600/10 text-fuchsia-600 dark:text-fuchsia-400' },
            { icon: Share2, item: t.brand.share, ring: 'bg-violet-600/10 text-violet-600 dark:text-violet-400' },
          ].map(({ icon: Icon, item, ring }) => (
            <div key={item.title} className="rounded-2xl border border-border bg-card p-6">
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${ring}`}>
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-bold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Ecosystem chain: Research → Design → Build → Learn → Share → Build again */}
        <div className="mt-8 rounded-2xl border border-border bg-muted/30 p-5 sm:p-6">
          <div className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t.brand.chainLabel}
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-1 gap-y-3" dir={lang === 'fa' ? 'rtl' : 'ltr'}>
            {t.brand.chain.map((step, i) => {
              const Icon = CHAIN_ICONS[i % CHAIN_ICONS.length];
              return (
                <div key={step} className="flex items-center gap-1">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/25 bg-violet-600/5 px-3 py-1.5 text-sm font-medium text-violet-700 dark:text-violet-300">
                    <Icon className="h-3.5 w-3.5" />
                    {step}
                  </span>
                  {i < t.brand.chain.length - 1 && (
                    <ChevronRight className="h-4 w-4 text-violet-500/60 rtl:rotate-180" aria-hidden />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── What I Do — one process, not eight services (replaces the
          old DB-driven 8-card service grid; owner FINAL COPY 2026-01) ── */}
      <section id="services" className="mx-auto w-full max-w-7xl scroll-mt-24 px-4 py-14 sm:px-6">
        <WhatIDo />
      </section>

      {/* ── Projects (featured Work items only — max 2, set in admin; the
          full list lives at /work, Lab items at /lab) ── */}
      <section id="projects" className="scroll-mt-24 border-y border-border/40 bg-muted/30">
        <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6">
          <SectionHeader
            title={t.sections.projectsTitle}
            sub={t.sections.projectsSub}
            subClassName="text-foreground/70"
            action={{ label: t.projects.seeAllWork, onClick: () => setView('projects') }}
          />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {(projects || []).map((p) => {
              const st = normalizeStatus(p.status);
              return (
              <button
                key={p.id}
                onClick={() => openProject(p.slug)}
                className="group flex flex-col rounded-2xl border border-border bg-card p-5 text-start transition-all hover:-translate-y-1 hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-600/10"
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-violet-600 dark:text-violet-400">
                  <FolderKanban className="h-4 w-4" />
                  <StatusBadge status={p.status} statusEn={p.statusEn} statusFa={p.statusFa} lang={lang} />
                </div>
                <h3 className="mt-3 font-bold leading-snug">{pick(lang, p.titleEn, p.titleFa)}</h3>
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{pick(lang, p.summaryEn, p.summaryFa)}</p>

                {/* momentum signal: same honest build-progress row as /work cards */}
                {showsProgress(st) && (
                  <div className="mt-4">
                    <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-muted-foreground">
                      <span>{t.projects.progress}</span>
                      <span className="font-bold text-amber-600 dark:text-amber-400">{p.progress}%</span>
                    </div>
                    <ProgressBar value={p.progress} barCls={STATUS_STYLE[st].barCls} />
                  </div>
                )}

                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-violet-600 dark:text-violet-400">
                  {t.sections.readMore}
                  <ChevronRight className="h-4 w-4 rtl:rotate-180" />
                </span>
              </button>
              );
            })}
            <button
              onClick={() => setView('contact')}
              className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-violet-500/40 bg-violet-600/5 p-5 text-center transition-colors hover:bg-violet-600/10"
            >
              <div className="text-2xl">👋</div>
              <h3 className="mt-2 font-bold text-violet-700 dark:text-violet-300">{t.projects.ctaTitle}</h3>
              <p className="mt-1 text-sm text-foreground/80">{t.projects.ctaSub}</p>
            </button>
          </div>
        </div>
      </section>

      {/* ── Featured posts ── */}
      <section id="blog" className="mx-auto w-full max-w-7xl scroll-mt-24 px-4 py-14 sm:px-6">
        <SectionHeader title={t.sections.featuredTitle} sub={t.sections.featuredSub} action={{
          label: t.sections.viewAll,
          onClick: () => setView('blog'),
        }} />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <button
              key={p.slug}
              onClick={() => openPost(p.slug)}
              className="group overflow-hidden rounded-2xl border border-border bg-card text-start transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="aspect-video w-full overflow-hidden bg-muted">
                {p.cover ? (
                  <img src={p.cover} alt="" className="h-full w-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <FileText className="h-10 w-10 text-muted-foreground/40" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="text-xs text-muted-foreground">
                  {new Date(p.date).toLocaleDateString(lang === 'fa' ? 'fa-IR' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  {p.categories[0] && <> · {pick(lang, p.categories[0].nameEn, p.categories[0].nameFa)}</>}
                </div>
                <h3 className="mt-2 line-clamp-2 font-bold leading-snug">{pick(lang, p.titleEn, p.titleFa)}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{pick(lang, p.excerptEn, p.excerptFa)}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ── AI CTA ── */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-700 via-violet-600 to-fuchsia-600 px-6 py-14 text-center text-white sm:px-12">
          <div className="pointer-events-none absolute -end-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <Sparkles className="mx-auto h-10 w-10" />
          <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">{t.sections.aiCtaTitle}</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/85">{t.sections.aiCtaSub}</p>
          <Button
            size="lg"
            variant="secondary"
            className="mt-7 bg-white text-violet-700 hover:bg-white/90"
            onClick={() => setChatOpen(true)}
          >
            {t.sections.aiCtaBtn} ✦
          </Button>
        </div>
      </section>
    </div>
  );
}

function SectionHeader({ title, sub, subClassName, action }: { title: string; sub: string; subClassName?: string; action?: { label: string; onClick: () => void } }) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-2xl font-extrabold sm:text-3xl">{title}</h2>
        <p className={`mt-1 text-sm sm:text-base ${subClassName || 'text-muted-foreground'}`}>{sub}</p>
      </div>
      {action && (
        <Button variant="ghost" size="sm" onClick={action.onClick} className="whitespace-nowrap text-violet-600 dark:text-violet-400">
          {action.label}
          <ChevronRight className="ms-1 h-4 w-4 rtl:rotate-180" />
        </Button>
      )}
    </div>
  );
}

export { ChevronLeft };
