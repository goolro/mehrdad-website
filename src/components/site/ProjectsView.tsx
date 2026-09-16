'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useApp, pick } from './store';
import { ui } from './i18n';
import { Badge } from '@/components/ui/badge';
import {
  Archive,
  Brain,
  CheckCircle2,
  ChevronRight,
  CirclePause,
  Compass,
  Cpu,
  ExternalLink,
  FlaskConical,
  Gamepad2,
  Hammer,
  HardHat,
  Lightbulb,
  Repeat,
  Rocket,
  Route,
  ScanSearch,
  Sparkles,
  Store,
  Swords,
  Trophy,
} from 'lucide-react';
import { getProjectLink, getProjectLinkHost } from '@/lib/project-links';
import {
  getProjectProfile,
  type ProfileFeatureIcon,
  type RoadmapTone,
} from '@/lib/project-profiles';
import { ShareBar } from './ShareBar';
import { ContactCta } from './ContactCta';
import {
  isActiveStatus,
  normalizeStatus,
  showsProgress,
  type ProjectStatus,
} from '@/lib/project-status';

interface ProjectItem {
  id: string; slug: string; titleEn: string; titleFa: string;
  summaryEn: string; summaryFa: string; cover: string | null;
  section: string; status: string; progress: number; featured: boolean;
  fundingAsk: string | null; statusEn: string; statusFa: string;
}

/** structural subset of the Prisma Project row passed from the server page */
export interface ProjectDetailRow {
  slug: string;
  titleEn: string; titleFa: string;
  summaryEn: string; summaryFa: string;
  cover: string | null;
  status: string; progress: number;
  fundingAsk: string | null;
  statusEn: string | null; statusFa: string | null;
}

type StatusStyle = {
  icon: typeof HardHat;
  badgeCls: string;
  barCls: string;
  labelKey: 'idea' | 'concept' | 'building' | 'testing' | 'live' | 'paused' | 'archived';
};

/**
 * Honest lifecycle badges (Work/Lab restructure). The canonical label comes
 * from the status itself — legacy free-text rows (statusEn "Seeking
 * partners") can no longer surface venture language in the UI.
 */
export const STATUS_STYLE: Record<ProjectStatus, StatusStyle> = {
  idea: {
    icon: Lightbulb,
    badgeCls: 'bg-violet-600/10 text-violet-600 dark:text-violet-400',
    barCls: 'bg-gradient-to-r from-violet-600 to-fuchsia-600',
    labelKey: 'idea',
  },
  concept: {
    icon: Compass,
    badgeCls: 'bg-slate-500/15 text-slate-600 dark:text-slate-400',
    barCls: 'bg-gradient-to-r from-slate-400 to-slate-500',
    labelKey: 'concept',
  },
  building: {
    icon: HardHat,
    badgeCls: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    barCls: 'bg-gradient-to-r from-amber-500 to-orange-500',
    labelKey: 'building',
  },
  testing: {
    icon: FlaskConical,
    badgeCls: 'bg-teal-600/15 text-teal-600 dark:text-teal-400',
    barCls: 'bg-gradient-to-r from-teal-500 to-emerald-500',
    labelKey: 'testing',
  },
  live: {
    icon: Rocket,
    badgeCls: 'bg-emerald-600/15 text-emerald-600 dark:text-emerald-400',
    barCls: 'bg-gradient-to-r from-emerald-500 to-teal-500',
    labelKey: 'live',
  },
  paused: {
    icon: CirclePause,
    badgeCls: 'bg-orange-600/15 text-orange-600 dark:text-orange-400',
    barCls: 'bg-gradient-to-r from-orange-500 to-amber-500',
    labelKey: 'paused',
  },
  archived: {
    icon: Archive,
    badgeCls: 'bg-zinc-500/15 text-zinc-600 dark:text-zinc-400',
    barCls: 'bg-gradient-to-r from-zinc-400 to-zinc-500',
    labelKey: 'archived',
  },
};

export function StatusBadge({ status, statusEn, statusFa, lang }: { status: string; statusEn?: string; statusFa?: string; lang: 'en' | 'fa' }) {
  const t = ui[lang];
  const cfg = STATUS_STYLE[normalizeStatus(status)];
  const Icon = cfg.icon;
  return (
    <Badge className={cfg.badgeCls} variant="secondary">
      <Icon className="me-1 h-3 w-3" />
      {t.projects[cfg.labelKey]}
    </Badge>
  );
}

export function ProgressBar({ value, barCls }: { value: number; barCls: string }) {
  return (
    <div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
        <div
          className={`h-full rounded-full transition-[width] duration-1000 ease-out ${barCls}`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}

export function ProjectsView({ initialProjects }: { initialProjects: ProjectItem[] }) {
  const { lang } = useApp();
  const t = ui[lang];
  const projects = initialProjects;
  const [animate, setAnimate] = useState(false);
  // Default tab shows only real, active work. The five earlier venture-style
  // entries (now honestly labeled Ideas) live behind the second tab,
  // collapsed — they must never lead the Work view (DECISIONS.md, 2026-09-07).
  const [tab, setTab] = useState<'work' | 'ideas'>('work');

  // progress bars fill shortly after paint (keeps the SSR HTML static)
  useEffect(() => {
    const tm = setTimeout(() => setAnimate(true), 150);
    return () => clearTimeout(tm);
  }, []);

  const active = projects.filter((p) => isActiveStatus(normalizeStatus(p.status)));
  const ideas = projects.filter((p) => !isActiveStatus(normalizeStatus(p.status)));

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-extrabold sm:text-4xl">{t.sections.projectsTitle}</h1>
      <p className="mt-2 text-muted-foreground">{t.sections.projectsSub}</p>

      <div className="mt-8 flex flex-wrap items-center gap-2" role="tablist" aria-label={t.projects.tabsLabel}>
        <button
          role="tab"
          aria-selected={tab === 'work'}
          onClick={() => setTab('work')}
          className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
            tab === 'work'
              ? 'border-violet-500/50 bg-violet-600/10 text-violet-700 dark:text-violet-300'
              : 'border-border text-muted-foreground hover:text-foreground'
          }`}
        >
          {t.projects.tabWork}
          <span className="ms-1.5 text-xs opacity-70">{active.length}</span>
        </button>
        <button
          role="tab"
          aria-selected={tab === 'ideas'}
          onClick={() => setTab('ideas')}
          className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
            tab === 'ideas'
              ? 'border-violet-500/50 bg-violet-600/10 text-violet-700 dark:text-violet-300'
              : 'border-border text-muted-foreground hover:text-foreground'
          }`}
        >
          {t.projects.tabIdeas}
          <span className="ms-1.5 text-xs opacity-70">{ideas.length}</span>
        </button>
      </div>

      {tab === 'work' && (
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {active.map((p, i) => {
            const st = normalizeStatus(p.status);
            const cfg = STATUS_STYLE[st];
            return (
              <Link
                key={p.id}
                href={`/work/${p.slug}`}
                className="group block overflow-hidden rounded-2xl border border-border bg-card text-start transition-all hover:-translate-y-1 hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-600/10"
              >
                <div className="flex items-start gap-4 p-6">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600/15 to-fuchsia-600/15 text-xl font-extrabold text-violet-600 dark:text-violet-400">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-2">
                      <StatusBadge status={p.status} statusEn={p.statusEn} statusFa={p.statusFa} lang={lang} />
                    </div>
                    <h3 className="font-bold leading-snug">{pick(lang, p.titleEn, p.titleFa)}</h3>
                    <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{pick(lang, p.summaryEn, p.summaryFa)}</p>

                    {showsProgress(st) && (
                      <div className="mt-4">
                        <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <HardHat className="h-3.5 w-3.5 text-amber-500" />
                            {t.projects.progress}
                          </span>
                          <span className="font-bold text-amber-600 dark:text-amber-400">{p.progress}%</span>
                        </div>
                        <ProgressBar value={animate ? p.progress : 0} barCls={cfg.barCls} />
                      </div>
                    )}

                    <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-violet-600 dark:text-violet-400">
                      {t.sections.readMore}
                      <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {tab === 'ideas' && (
        <div className="mt-8 space-y-3">
          <p className="text-sm text-muted-foreground">{t.projects.ideasNote}</p>
          {ideas.map((p) => (
            <details key={p.id} className="group rounded-2xl border border-border bg-card">
              {/* summary line is ALWAYS visible (owner feedback: collapsed
                  archive items looked «empty» / like missing data) — expanding
                  only reveals the Read-more link */}
              <summary className="flex cursor-pointer list-none items-start justify-between gap-3 p-4 [&::-webkit-details-marker]:hidden">
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5">
                    <StatusBadge status={p.status} statusEn={p.statusEn} statusFa={p.statusFa} lang={lang} />
                    <span className="truncate text-sm font-semibold">{pick(lang, p.titleEn, p.titleFa)}</span>
                  </div>
                  <span className="mt-1.5 block text-xs leading-relaxed text-muted-foreground">
                    {pick(lang, p.summaryEn, p.summaryFa)}
                  </span>
                </div>
                <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-90" aria-hidden />
              </summary>
              <Link
                href={`/work/${p.slug}`}
                className="block w-full px-4 pb-4 text-start text-xs font-medium text-violet-600 dark:text-violet-400"
              >
                {t.sections.readMore} →
              </Link>
            </details>
          ))}
        </div>
      )}

    </div>
  );
}

/**
 * Project detail body (client component — replaces the old server-rendered
 * page that hardcoded BOTH languages stacked, which produced the EN/FA
 * mixing the owner reported on /work/<slug>). Follows the PostDetail
 * pattern: the server page fetches the row, this component picks the
 * language-specific title/summary/labels from the live UI language.
 * SSR first paint renders EN (store default), FA swaps in after rehydrate —
 * identical to blog detail pages. SEO: JSON-LD keeps both languages.
 */
const FEATURE_ICONS: Record<ProfileFeatureIcon, typeof Brain> = {
  brain: Brain,
  swords: Swords,
  trophy: Trophy,
  repeat: Repeat,
  scan: ScanSearch,
};

const PHASE_ICONS: Record<string, typeof Route> = {
  check: CheckCircle2,
  store: Store,
  hammer: Hammer,
};

const PHASE_TONE: Record<RoadmapTone, { ring: string; icon: string; badge: string }> = {
  done: {
    ring: 'stroke-emerald-500',
    icon: 'text-emerald-500',
    badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  },
  ready: {
    ring: 'stroke-amber-500',
    icon: 'text-amber-500',
    badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  },
  active: {
    ring: 'stroke-violet-500',
    icon: 'text-violet-500',
    badge: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  },
};

/**
 * Compact SVG progress ring for a roadmap phase — draws in from 0 on mount
 * (stroke-dashoffset transition). Pure SVG + CSS, no chart dependency.
 */
function PhaseRing({ fill, tone }: { fill: number; tone: RoadmapTone }) {
  const C = 2 * Math.PI * 26;
  const clamped = Math.max(0, Math.min(100, fill));
  const target = C * (1 - clamped / 100);
  const [offset, setOffset] = useState(C);

  useEffect(() => {
    const t = setTimeout(() => setOffset(target), 150);
    return () => clearTimeout(t);
  }, [target]);

  return (
    <svg viewBox="0 0 64 64" className="h-16 w-16 -rotate-90" aria-hidden>
      <circle cx="32" cy="32" r="26" fill="none" strokeWidth="6" className="stroke-border" />
      <circle
        cx="32"
        cy="32"
        r="26"
        fill="none"
        strokeWidth="6"
        strokeLinecap="round"
        className={`${PHASE_TONE[tone].ring} transition-[stroke-dashoffset] duration-1000 ease-out`}
        strokeDasharray={C}
        strokeDashoffset={offset}
      />
    </svg>
  );
}

export function ProjectDetail({ project, shareUrl }: { project: ProjectDetailRow; shareUrl: string }) {
  const { lang } = useApp();
  const t = ui[lang];
  const st = normalizeStatus(project.status);
  const cfg = STATUS_STYLE[st];
  const rtl = lang === 'fa';
  const title = pick(lang, project.titleEn, project.titleFa);
  const summary = pick(lang, project.summaryEn, project.summaryFa);
  // live external build (e.g. playable game) — only when the slug is
  // registered in src/lib/project-links.ts; warm amber styling echoes the
  // «building» status so the honest in-progress badge and the CTA read as
  // one system
  const playLink = getProjectLink(project.slug);
  const playHost = getProjectLinkHost(project.slug);
  // fuller story (features + tech) — only when the slug has a profile in
  // src/lib/project-profiles.ts; amber accents echo the building-status
  // system so the whole detail page reads as one
  const profile = getProjectProfile(project.slug);

  return (
    <article className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge
          status={project.status}
          statusEn={project.statusEn ?? undefined}
          statusFa={project.statusFa ?? undefined}
          lang={lang}
        />
        {showsProgress(st) && (
          <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
            {project.progress}%
          </span>
        )}
      </div>

      <h1 className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl">{title}</h1>

      {project.cover && (
        <img
          src={project.cover}
          alt={title}
          className="mx-auto mt-7 w-full max-w-[240px] rounded-2xl object-cover shadow-md sm:max-w-[300px]"
        />
      )}

      <div className="prose-blog mt-8" dir={rtl ? 'rtl' : 'ltr'}>
        <p>{summary}</p>
      </div>

      {playLink && (
        <div className="mt-8 rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/10 p-5 sm:p-6">
          <a
            href={playLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 font-bold text-white shadow-lg shadow-amber-500/25 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-amber-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Gamepad2 className="h-5 w-5" aria-hidden />
            {t.projects.playCta}
            <ExternalLink className="h-4 w-4 opacity-80" aria-hidden />
          </a>
          {playHost && (
            <p className="mt-2.5 text-xs text-muted-foreground">
              {playHost} — {t.projects.playNote}
            </p>
          )}
        </div>
      )}

      {profile && profile.phases.length > 0 && (
        <section className="mt-8" aria-labelledby="project-roadmap-title">
          <h2 id="project-roadmap-title" className="flex items-center gap-2 text-lg font-bold">
            <Route className="h-5 w-5 text-amber-500" aria-hidden />
            {t.projects.roadmapTitle}
          </h2>
          <ol className="mt-4 grid gap-3 sm:grid-cols-3">
            {profile.phases.map((ph) => {
              const PhaseIcon = PHASE_ICONS[ph.icon] ?? Route;
              const tone = PHASE_TONE[ph.tone];
              return (
                <li
                  key={ph.key}
                  className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-5 text-center"
                >
                  <div className="relative">
                    <PhaseRing fill={ph.ring} tone={ph.tone} />
                    <PhaseIcon
                      className={`absolute inset-0 m-auto h-6 w-6 ${tone.icon}`}
                      aria-hidden
                    />
                  </div>
                  <div>
                    <p className="text-sm font-bold leading-snug">{pick(lang, ph.titleEn, ph.titleFa)}</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {pick(lang, ph.stateEn, ph.stateFa)}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${tone.badge}`}
                  >
                    {pick(lang, ph.badgeEn, ph.badgeFa)}
                  </span>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      {profile && profile.features.length > 0 && (
        <section className="mt-8" aria-labelledby="project-features-title">
          <h2 id="project-features-title" className="flex items-center gap-2 text-lg font-bold">
            <Sparkles className="h-5 w-5 text-amber-500" aria-hidden />
            {t.projects.featuresTitle}
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {profile.features.map((f) => {
              const FeatureIcon = FEATURE_ICONS[f.icon] ?? Sparkles;
              return (
                <li key={f.titleEn} className="rounded-2xl border border-border bg-card p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <FeatureIcon className="h-4 w-4 shrink-0 text-amber-500" aria-hidden />
                    {pick(lang, f.titleEn, f.titleFa)}
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {pick(lang, f.descEn, f.descFa)}
                  </p>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {profile && profile.tech.length > 0 && (
        <section className="mt-8" aria-labelledby="project-tech-title">
          <h2 id="project-tech-title" className="flex items-center gap-2 text-lg font-bold">
            <Cpu className="h-5 w-5 text-amber-500" aria-hidden />
            {t.projects.techTitle}
          </h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {profile.tech.map((item) => (
              <li
                key={item.labelEn}
                className="rounded-full border border-border bg-muted/40 px-3.5 py-1.5 text-sm font-medium"
              >
                {pick(lang, item.labelEn, item.labelFa)}
              </li>
            ))}
          </ul>
        </section>
      )}

      {showsProgress(st) && (
        <div className="mt-8 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5">
          <div className="mb-2 flex items-center justify-between text-sm font-medium">
            <span>{t.projects.progress}</span>
            <span className="font-extrabold text-amber-600 dark:text-amber-400">{project.progress}%</span>
          </div>
          <ProgressBar value={project.progress} barCls={cfg.barCls} />
        </div>
      )}

      {project.fundingAsk && (
        <div className="mt-8 rounded-2xl border border-violet-500/30 bg-violet-600/5 p-5">
          <div className="text-sm font-semibold text-violet-700 dark:text-violet-300">
            {t.projects.fundingAsk}
          </div>
          <p className="mt-1 text-sm" dir={rtl ? 'rtl' : 'ltr'}>
            {project.fundingAsk}
          </p>
        </div>
      )}

      <div className="mt-8 border-y border-border py-4">
        <ShareBar url={shareUrl} title={title} label={t.common.shareProject} />
      </div>

      <ContactCta label={t.projects.interestedCta} />
    </article>
  );
}
