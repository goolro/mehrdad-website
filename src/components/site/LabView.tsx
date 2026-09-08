'use client';

import Link from 'next/link';
import { useApp, pick } from './store';
import { ui } from './i18n';
import { FlaskConical, ChevronRight, Wrench } from 'lucide-react';
import { StatusBadge, ProgressBar } from './ProjectsView';
import { normalizeStatus, showsProgress } from '@/lib/project-status';

interface ProjectItem {
  id: string; slug: string; titleEn: string; titleFa: string;
  summaryEn: string; summaryFa: string; cover: string | null;
  section: string; status: string; progress: number; featured: boolean;
  fundingAsk: string | null; statusEn: string; statusFa: string;
}

/**
 * /lab — experiments and side quests. Framing per BRAND_STRATEGY.md: Lab
 * items are built for curiosity, in the open, and carry no business-model
 * or revenue language. They are explicitly NOT products.
 */
export function LabView({ initialProjects }: { initialProjects: ProjectItem[] }) {
  const { lang } = useApp();
  const t = ui[lang];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-600/10 text-violet-600 dark:text-violet-400">
          <FlaskConical className="h-5 w-5" />
        </div>
        <h1 className="text-3xl font-extrabold sm:text-4xl">{t.lab.title}</h1>
      </div>
      <p className="mt-3 max-w-2xl text-muted-foreground">{t.lab.sub}</p>

      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {initialProjects.map((p) => {
          const st = normalizeStatus(p.status);
          return (
            <Link
              key={p.id}
              href={`/work/${p.slug}`}
              className="group flex flex-col rounded-2xl border border-border bg-card p-5 text-start transition-all hover:-translate-y-1 hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-600/10"
            >
              <div className="flex items-center gap-2">
                <StatusBadge status={p.status} statusEn={p.statusEn} statusFa={p.statusFa} lang={lang} />
              </div>
              <h3 className="mt-3 font-bold leading-snug">{pick(lang, p.titleEn, p.titleFa)}</h3>
              <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{pick(lang, p.summaryEn, p.summaryFa)}</p>

              {showsProgress(st) && (
                <div className="mt-4">
                  <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Wrench className="h-3.5 w-3.5 text-amber-500" />
                      {t.projects.progress}
                    </span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">{p.progress}%</span>
                  </div>
                  <ProgressBar value={p.progress} barCls="bg-gradient-to-r from-amber-500 to-orange-500" />
                </div>
              )}

              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-violet-600 dark:text-violet-400">
                {t.sections.readMore}
                <ChevronRight className="h-4 w-4 rtl:rotate-180" />
              </span>
            </Link>
          );
        })}
        {initialProjects.length === 0 && (
          <p className="text-sm text-muted-foreground">{t.lab.empty}</p>
        )}
      </div>
    </div>
  );
}
