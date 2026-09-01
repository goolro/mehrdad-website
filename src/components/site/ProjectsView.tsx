'use client';

import { useEffect, useState } from 'react';
import { useApp, pick } from './store';
import { ui } from './i18n';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { FolderKanban, ChevronRight, HardHat, Users, Rocket, Clock } from 'lucide-react';

interface ProjectItem {
  id: string; slug: string; titleEn: string; titleFa: string;
  summaryEn: string; summaryFa: string; cover: string | null;
  status: string; progress: number; statusEn: string; statusFa: string;
}

export type ProjectStatus = 'under-construction' | 'seeking' | 'live' | 'coming-soon';

export const STATUS_STYLE: Record<
  string,
  { icon: typeof HardHat; badgeCls: string; barCls: string; labelKey: 'underConstruction' | 'seeking' | 'live' | 'comingSoon' }
> = {
  'under-construction': {
    icon: HardHat,
    badgeCls: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    barCls: 'bg-gradient-to-r from-amber-500 to-orange-500',
    labelKey: 'underConstruction',
  },
  seeking: {
    icon: Users,
    badgeCls: 'bg-violet-600/10 text-violet-600 dark:text-violet-400',
    barCls: 'bg-gradient-to-r from-violet-600 to-fuchsia-600',
    labelKey: 'seeking',
  },
  live: {
    icon: Rocket,
    badgeCls: 'bg-emerald-600/15 text-emerald-600 dark:text-emerald-400',
    barCls: 'bg-gradient-to-r from-emerald-500 to-teal-500',
    labelKey: 'live',
  },
  'coming-soon': {
    icon: Clock,
    badgeCls: 'bg-slate-500/15 text-slate-600 dark:text-slate-400',
    barCls: 'bg-gradient-to-r from-slate-400 to-slate-500',
    labelKey: 'comingSoon',
  },
};

export function StatusBadge({ status, statusEn, statusFa, lang }: { status: string; statusEn?: string; statusFa?: string; lang: 'en' | 'fa' }) {
  const t = ui[lang];
  const cfg = STATUS_STYLE[status] || STATUS_STYLE.seeking;
  const Icon = cfg.icon;
  return (
    <Badge className={cfg.badgeCls} variant="secondary">
      <Icon className="me-1 h-3 w-3" />
      {pick(lang, statusEn || '', statusFa || '') || t.projects[cfg.labelKey]}
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

export function ProjectsView() {
  const { lang, setView } = useApp();
  const t = ui[lang];
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [selected, setSelected] = useState<ProjectItem | null>(null);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    fetch('/api/site').then((r) => r.json()).then((d) => setProjects(d.projects || [])).catch(() => {});
    const tm = setTimeout(() => setAnimate(true), 150);
    return () => clearTimeout(tm);
  }, []);

  const underConstruction = projects.filter((p) => p.status === 'under-construction').length;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-extrabold sm:text-4xl">{t.sections.projectsTitle}</h1>
      <p className="mt-2 text-muted-foreground">
        {underConstruction > 0
          ? pick(lang,
              `${t.sections.projectsSub} · ${underConstruction} project${underConstruction > 1 ? 's' : ''} currently being built — join early!`,
              `${t.sections.projectsSub} · ${underConstruction} پروژه در حال ساخت است — از الان همراه شوید!`)
          : t.sections.projectsSub}
      </p>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {projects.map((p, i) => {
          const cfg = STATUS_STYLE[p.status] || STATUS_STYLE.seeking;
          return (
            <button
              key={p.id}
              onClick={() => setSelected(p)}
              className="group overflow-hidden rounded-2xl border border-border bg-card text-start transition-all hover:-translate-y-1 hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-600/10"
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

                  {p.status === 'under-construction' && (
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
            </button>
          );
        })}
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-lg" dir={lang === 'fa' ? 'rtl' : 'ltr'}>
          {selected && (
            <>
              <DialogHeader>
                <StatusBadge status={selected.status} statusEn={selected.statusEn} statusFa={selected.statusFa} lang={lang} />
                <DialogTitle className="flex items-center gap-2 text-xl leading-snug">
                  <FolderKanban className="h-5 w-5 shrink-0 text-violet-500" />
                  {pick(lang, selected.titleEn, selected.titleFa)}
                </DialogTitle>
                <DialogDescription className="text-base leading-relaxed">
                  {pick(lang, selected.summaryEn, selected.summaryFa)}
                </DialogDescription>
              </DialogHeader>

              {selected.status === 'under-construction' && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
                  <div className="mb-2 flex items-center justify-between text-sm font-medium">
                    <span className="inline-flex items-center gap-1.5">
                      <HardHat className="h-4 w-4 text-amber-500" />
                      {t.projects.progress}
                    </span>
                    <span className="font-extrabold text-amber-600 dark:text-amber-400">{selected.progress}%</span>
                  </div>
                  <ProgressBar value={animate ? selected.progress : 0} barCls={STATUS_STYLE['under-construction'].barCls} />
                  <p className="mt-2 text-xs text-muted-foreground">
                    {lang === 'fa'
                      ? 'این پروژه در حال ساخت است — برای همکاری یا سرمایه‌گذاری زودهنگام تماس بگیرید.'
                      : 'This project is being built — get in touch to join early as a partner or investor.'}
                  </p>
                </div>
              )}

              <Button
                onClick={() => {
                  setSelected(null);
                  setView('contact');
                }}
                className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-700 hover:to-fuchsia-700"
              >
                {t.projects.interested}
                <ChevronRight className="ms-2 h-4 w-4 rtl:rotate-180" />
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
