'use client';

import { useApp } from './store';
import { ui } from './i18n';
import { PenTool, Hammer, Share2, ChevronRight } from 'lucide-react';

/**
 * "What I Do" — one process, not eight services.
 * Shared by the Home page (h2, below the hero) and /services (h1, opens
 * the page). The English copy is the owner's FINAL COPY, verbatim; the
 * Persian block is its faithful translation. Replaces the old DB-driven
 * 8-card service grid (2026-01).
 */
export function WhatIDo({ headingLevel = 'h2' }: { headingLevel?: 'h1' | 'h2' }) {
  const { lang, setView } = useApp();
  const t = ui[lang];
  const Heading = headingLevel;

  const cardCls =
    'rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-600/10';

  return (
    <div>
      <div className="mb-8">
        <Heading
          className={
            headingLevel === 'h1'
              ? 'text-3xl font-extrabold tracking-tight sm:text-4xl'
              : 'text-2xl font-extrabold sm:text-3xl'
          }
        >
          {t.whatIDo.title}
        </Heading>
        <p
          className={
            headingLevel === 'h1'
              ? 'mt-2 text-base text-muted-foreground sm:text-lg'
              : 'mt-1 text-sm text-muted-foreground sm:text-base'
          }
        >
          {t.whatIDo.sub}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Design */}
        <div className={cardCls}>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-600/10 text-violet-600 dark:text-violet-400">
            <PenTool className="h-5 w-5" />
          </div>
          <h3 className="mt-4 text-lg font-bold">{t.whatIDo.design.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.whatIDo.design.desc}</p>
        </div>

        {/* Build */}
        <div className={cardCls}>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-fuchsia-600/10 text-fuchsia-600 dark:text-fuchsia-400">
            <Hammer className="h-5 w-5" />
          </div>
          <h3 className="mt-4 text-lg font-bold">{t.whatIDo.build.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.whatIDo.build.desc}</p>
        </div>

        {/* Share — the Work / Writing words are real links to /work and /blog */}
        <div className={cardCls}>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-600/10 text-violet-600 dark:text-violet-400">
            <Share2 className="h-5 w-5" />
          </div>
          <h3 className="mt-4 text-lg font-bold">{t.whatIDo.share.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {t.whatIDo.share.before}
            <button
              onClick={() => setView('projects')}
              className="inline font-semibold text-violet-600 underline-offset-4 hover:underline dark:text-violet-400"
            >
              {t.whatIDo.share.linkWork}
            </button>
            {t.whatIDo.share.mid}
            <button
              onClick={() => setView('blog')}
              className="inline font-semibold text-violet-600 underline-offset-4 hover:underline dark:text-violet-400"
            >
              {t.whatIDo.share.linkWriting}
            </button>
            {t.whatIDo.share.after}
          </p>
        </div>
      </div>

      {/* FDE stays discoverable — a slim pointer to its dedicated page,
          NOT a service category card (the 8-card grid is gone for good) */}
      <button
        onClick={() => setView('fde')}
        className="group mt-6 flex w-full items-center justify-between gap-4 rounded-2xl border border-violet-500/30 bg-violet-600/5 px-5 py-4 text-start transition-colors hover:bg-violet-600/10"
      >
        <span className="text-sm sm:text-base">
          <span className="font-bold text-violet-700 dark:text-violet-300">{t.fde.hero.title}</span>
          <span className="text-muted-foreground"> — {t.fde.cardTagline}</span>
        </span>
        <ChevronRight className="h-4 w-4 shrink-0 text-violet-600 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 dark:text-violet-400" />
      </button>
    </div>
  );
}
