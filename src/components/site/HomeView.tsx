'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp, pick } from './store';
import { isFaPath, useLang } from './lang-context';
import { pct, ui } from './i18n';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ArrowUpRight, Sparkles, ChevronRight, FolderKanban, FileText } from 'lucide-react';
import { StatusBadge, ProgressBar, STATUS_STYLE, KindBadge } from './ProjectsView';
import { normalizeStatus, showsProgress } from '@/lib/project-status';
import { WhatIDo } from './WhatIDo';

interface ProjectItem {
  id: string; slug: string; titleEn: string; titleFa: string; summaryEn: string; summaryFa: string; cover: string | null;
  section: string; status: string; progress: number; featured: boolean;
  fundingAsk: string | null; statusEn: string; statusFa: string;
  kind?: string | null;
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
  // route-aware language (lang-context.tsx): 'fa' is forced on /fa* routes,
  // so the SAME view renders the static Persian page at /fa (SSR) and the
  // store-driven EN home at '/' — one source of truth for the markup
  const lang = useLang();
  // Persian tree (audit section 2, fix #1): index-level CTAs keep /fa
  // visitors inside the Persian tree; detail pages (/work/<slug>,
  // /blog/<slug>) have no Persian twins and stay EN on purpose.
  const onFa = isFaPath(usePathname());
  const faAware = (en: string, fa: string) => (onFa ? fa : en);
  // navigation is real <Link>s now (structural audit 2026-09-08) — cards and
  // CTAs render as anchors: crawlable, middle-clickable, keyboard-link
  // semantics. Only genuine ACTIONS (AI chat) stay buttons.
  const { setChatOpen } = useApp();
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
        {/* mobile (v0 round-3 parity): smaller/more balanced hero — reduced
            base padding + type so headline and CTAs claim less of the phone
            viewport; sm:/md: keep the previous desktop scale untouched */}
        <div className="mx-auto flex max-w-7xl flex-col items-center px-4 py-12 text-center sm:px-6 sm:py-20 md:py-28">
          <Badge variant="outline" className="mb-3 border-violet-500/40 bg-violet-600/10 px-3 py-1 text-xs text-violet-600 sm:mb-5 sm:px-4 sm:py-1.5 sm:text-sm dark:text-violet-400">
            ☼ {t.hero.badge}
          </Badge>
          <h1 className="max-w-4xl text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl">
            {t.hero.title1}{' '}
            <span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent">
              {t.hero.title2}
            </span>
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:mt-6 sm:text-lg">{t.hero.sub}</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5 sm:mt-8 sm:gap-3">
            <Button
              size="lg"
              asChild
              className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-700 hover:to-fuchsia-700"
            >
              <Link href={faAware('/services', '/fa/services')}>
                {t.hero.cta1}
                <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" onClick={() => setChatOpen(true)}>
              <Sparkles className="me-2 h-4 w-4" />
              {t.hero.cta2}
            </Button>
          </div>
          {/* survey fix #2 (2026-11): one-line wayfinding for the personas who
              found the home page cluttered — incl. the Koko game shortcut
              (the “came for the game” persona) and the plain-language /start */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <Link
              href={faAware('/start', '/fa/start')}
              className="rounded-full border border-violet-500/40 bg-violet-600/5 px-3.5 py-1.5 text-xs font-semibold text-violet-700 transition-colors hover:bg-violet-600/10 dark:text-violet-300"
            >
              {t.hero.chips.smallBiz}
            </Link>
            <Link
              href={faAware('/pricing', '/fa/pricing')}
              className="rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-violet-500/40 hover:text-violet-700 dark:hover:text-violet-300"
            >
              {t.hero.chips.pricing}
            </Link>
            <a
              href="https://quizofkoko.com"
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-violet-500/40 hover:text-violet-700 dark:hover:text-violet-300"
            >
              {t.hero.chips.koko}
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
            </a>
            <Link
              href={faAware('/contact', '/fa/contact')}
              className="rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-violet-500/40 hover:text-violet-700 dark:hover:text-violet-300"
            >
              {t.hero.chips.contact}
            </Link>
          </div>
        </div>
      </section>

      {/* Brand trio (Build/Help/Share) moved to /services — survey fix #2
          (2026-11): it duplicated the What I Do block right below it and
          5 of 14 tested personas flagged the home page as cluttered. */}

      {/* ── What I Do — one process, not eight services (replaces the
          old DB-driven 8-card service grid; owner FINAL COPY 2026-01) ── */}
      <section id="services" className="mx-auto w-full max-w-7xl scroll-mt-24 px-4 py-14 sm:px-6">
        <WhatIDo />
      </section>

      {/* ── Pricing strip (survey fix #1, 2026-11): 8 of 14 tested personas
          named "no clear pricing" — one compact row of published anchors,
          full page at /pricing. Deliberately tight: the same personas also
          flagged cluttered pages, so no feature lists here. ── */}
      <section id="pricing" className="scroll-mt-24 border-y border-border/40 bg-muted/30">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
          <SectionHeader
            title={t.pricing.homeStripTitle}
            sub={t.pricing.homeStripSub}
            subClassName="text-foreground/70"
            action={{ label: t.pricing.homeStripCta, href: faAware('/pricing', '/fa/pricing') }}
          />
          <div className="grid gap-4 sm:grid-cols-3">
            {t.pricing.homeStripTiers.map((tier, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card p-5">
                <h3 className="text-sm font-bold text-muted-foreground" dir={lang === 'fa' ? 'rtl' : 'ltr'}>{tier.name}</h3>
                <p className="mt-1 text-xl font-extrabold text-violet-600 dark:text-violet-400" dir={lang === 'fa' ? 'rtl' : 'ltr'}>{tier.price}</p>
                <p className="mt-0.5 text-xs text-muted-foreground" dir={lang === 'fa' ? 'rtl' : 'ltr'}>{tier.time}</p>
              </div>
            ))}
          </div>
          <Link
            href={faAware('/mvp-sprint', '/fa/services')}
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-violet-600 hover:underline dark:text-violet-400"
          >
            {t.pricing.homeStripFree}
            <ChevronRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
          </Link>
        </div>
      </section>

      {/* ── Projects (featured Work items only — max 2, set in admin; the
          full list lives at /work, Lab items at /lab) ── */}
      <section id="projects" className="scroll-mt-24 border-y border-border/40 bg-muted/30">
        <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6">
          <SectionHeader
            title={t.sections.projectsTitle}
            sub={t.sections.projectsSub}
            subClassName="text-foreground/70"
            action={{ label: t.projects.seeAllWork, href: faAware('/work', '/fa/work') }}
          />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {(projects || []).map((p) => {
              const st = normalizeStatus(p.status);
              return (
              <Link
                key={p.id}
                href={`/work/${p.slug}`}
                className="group flex flex-col rounded-2xl border border-border bg-card p-5 text-start transition-all hover:-translate-y-1 hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-600/10"
              >
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-violet-600 dark:text-violet-400">
                  <FolderKanban className="h-4 w-4" />
                  <KindBadge kind={p.kind} slug={p.slug} lang={lang} />
                  <StatusBadge status={p.status} statusEn={p.statusEn} statusFa={p.statusFa} lang={lang} />
                </div>
                <h3 className="mt-3 font-bold leading-snug">{pick(lang, p.titleEn, p.titleFa)}</h3>
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{pick(lang, p.summaryEn, p.summaryFa)}</p>

                {/* momentum signal: same honest build-progress row as /work cards */}
                {showsProgress(st) && (
                  <div className="mt-4">
                    <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-muted-foreground">
                      <span>{t.projects.progress}</span>
                      <span className="font-bold text-amber-700 dark:text-amber-400">{pct(lang, p.progress)}</span>
                    </div>
                    <ProgressBar value={p.progress} barCls={STATUS_STYLE[st].barCls} />
                  </div>
                )}

                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-violet-600 dark:text-violet-400">
                  {t.sections.readMore}
                  <ChevronRight className="h-4 w-4 rtl:rotate-180" />
                </span>
              </Link>
              );
            })}
            <Link
              href={faAware('/contact', '/fa/contact')}
              className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-violet-500/40 bg-violet-600/5 p-5 text-center transition-colors hover:bg-violet-600/10"
            >
              <div className="text-2xl">👋</div>
              <h3 className="mt-2 font-bold text-violet-700 dark:text-violet-300">{t.projects.buildLikeTitle}</h3>
              <p className="mt-1 text-sm text-foreground/80">{t.projects.buildLikeSub}</p>
            </Link>
          </div>

          {/* Health & Wellness investor deck — direct PDF (owner request
              2026-11-01): standalone row inside the startups section so the
              deck stays reachable no matter which projects are currently
              featured in the grid above. Plain <a> on purpose — it is a
              static PDF, NOT an internal page (no prefetch, opens new tab). */}
          <a
            href="/s/deck-health-en.pdf"
            target="_blank"
            rel="noopener"
            className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-violet-500/50 hover:bg-violet-600/5 sm:p-5"
          >
            <span className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-600/10 text-violet-600 dark:text-violet-400">
                <FileText className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-bold leading-snug sm:text-base">{t.projects.deckTitle}</span>
                <span className="mt-0.5 block text-xs text-muted-foreground sm:text-sm">{t.projects.deckNote}</span>
              </span>
            </span>
            <Badge variant="outline" className="shrink-0 border-violet-500/40 bg-violet-600/10 text-xs font-semibold text-violet-600 dark:text-violet-400">
              {t.projects.deckBadge}
            </Badge>
          </a>
        </div>
      </section>

      {/* ── Featured posts ── */}
      <section id="blog" className="mx-auto w-full max-w-7xl scroll-mt-24 px-4 py-14 sm:px-6">
        <SectionHeader title={t.sections.featuredTitle} sub={t.sections.featuredSub} action={{
          label: t.sections.viewAll,
          href: faAware('/blog', '/fa/blog'),
        }} />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <Link
              key={p.slug}
              href={`/blog/${p.slug}`}
              className="group block overflow-hidden rounded-2xl border border-border bg-card text-start transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-muted">
                {p.cover ? (
                  <Image src={p.cover} alt={pick(lang, p.titleEn, p.titleFa)} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform group-hover:scale-105" />
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
            </Link>
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

function SectionHeader({ title, sub, subClassName, action }: { title: string; sub: string; subClassName?: string; action?: { label: string; href: string } }) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-2xl font-extrabold sm:text-3xl">{title}</h2>
        <p className={`mt-1 text-sm sm:text-base ${subClassName || 'text-muted-foreground'}`}>{sub}</p>
      </div>
      {action && (
        <Button variant="ghost" size="sm" asChild className="whitespace-nowrap text-violet-600 dark:text-violet-400">
          <Link href={action.href}>
            {action.label}
            <ChevronRight className="ms-1 h-4 w-4 rtl:rotate-180" />
          </Link>
        </Button>
      )}
    </div>
  );
}
