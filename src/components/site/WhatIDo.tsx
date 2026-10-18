'use client';

import Link from 'next/link';
import { useApp } from './store';
import { ui } from './i18n';
import { PenTool, Hammer, Share2, ChevronRight, Workflow, ArrowRight } from 'lucide-react';

/**
 * "What I Do" — one process, not eight services.
 * Shared by the Home page (h2, below the hero) and /services (h1, opens
 * the page). The English copy is the owner's FINAL COPY, verbatim; the
 * Persian block is its faithful translation. Replaces the old DB-driven
 * 8-card service grid (2026-01).
 */
export function WhatIDo({ headingLevel = 'h2' }: { headingLevel?: 'h1' | 'h2' }) {
  const { lang } = useApp();
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
            <Link
              href="/work"
              className="inline font-semibold text-violet-600 underline-offset-4 hover:underline dark:text-violet-400"
            >
              {t.whatIDo.share.linkWork}
            </Link>
            {t.whatIDo.share.mid}
            <Link
              href="/blog"
              className="inline font-semibold text-violet-600 underline-offset-4 hover:underline dark:text-violet-400"
            >
              {t.whatIDo.share.linkWriting}
            </Link>
            {t.whatIDo.share.after}
          </p>
        </div>
      </div>

      {/* FDE stays discoverable — a slim pointer to its dedicated page,
          NOT a service category card (the 8-card grid is gone for good).
          Deliberately distinctive (owner request 2026-09-08): animated
          gradient border beam (.fde-beam in globals.css) + gradient icon
          + glow hover — it must read as "something else", not card #4. */}
      <Link
        href="/fde"
        className="fde-beam group mt-6 flex w-full items-center justify-between gap-4 rounded-2xl border border-violet-500/30 bg-gradient-to-r from-violet-600/10 via-fuchsia-600/[0.06] to-transparent px-5 py-4 text-start transition-all hover:-translate-y-0.5 hover:border-violet-500/60 hover:shadow-lg hover:shadow-violet-600/20"
      >
        <span className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-md shadow-fuchsia-600/25 transition-transform group-hover:scale-105">
            <Workflow className="h-5 w-5" aria-hidden />
          </span>
          <span className="text-sm sm:text-base">
            <span className="font-bold text-violet-700 dark:text-violet-300">{t.fde.hero.title}</span>
            <span className="text-muted-foreground"> — {t.fde.cardTagline}</span>
            <span className="text-muted-foreground"> · </span>
            {/* invitation word with a continuous light sweep (.fde-shimmer) */}
            <span className="fde-shimmer whitespace-nowrap font-bold">{t.fde.cardCta}</span>
            <ArrowRight
              className="ms-0.5 inline h-3.5 w-3.5 text-fuchsia-500 transition-transform group-hover:translate-x-0.5 rtl:rotate-180"
              aria-hidden
            />
          </span>
        </span>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-violet-500/40 bg-background/60 text-violet-600 transition-colors group-hover:border-violet-500/70 group-hover:bg-violet-600/10 dark:text-violet-400">
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180" aria-hidden />
        </span>
      </Link>
    </div>
  );
}
