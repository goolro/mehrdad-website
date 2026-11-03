'use client';

import { Hammer, HeartHandshake, Share2, ChevronRight, Search, PenTool, GraduationCap, Repeat } from 'lucide-react';
import { useLang } from './lang-context';
import { ui } from './i18n';
import { ShareBar } from './ShareBar';
import { WhatIDo } from './WhatIDo';

const CHAIN_ICONS = [Search, PenTool, Hammer, GraduationCap, Share2, Repeat];

/**
 * /services — opens directly with the "What I Do" block (no duplicate
 * hero headline; the old DB-driven service card grid is gone — 2026-01).
 * FDE stays reachable via the slim pointer to its dedicated page below.
 *
 * Survey fix #2 (2026-11): the brand trio (Build/Help/Share + ecosystem
 * chain) moved here from the home page — there it duplicated the What I Do
 * block right below it and 5 of 14 tested personas flagged the home page
 * as cluttered; the thin /services page gains the brand context instead.
 */
export function ServicesView() {
  const lang = useLang();
  const t = ui[lang];

  return (
    <div className="flex w-full flex-col">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 md:py-14">
        <div className="mb-8 flex justify-end">
          <ShareBar title={t.whatIDo.title} label={t.common.shareService} />
        </div>

        <WhatIDo headingLevel="h1" />

        {/* ── Brand trio: Build / Help / Share (moved from the home page,
            survey fix #2 2026-11) ── */}
        <section className="mt-14 border-t border-border/40 pt-10">
          <h2 className="text-2xl font-extrabold sm:text-3xl">{t.brand.trioTitle}</h2>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">{t.brand.trioSub}</p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
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
      </div>
    </div>
  );
}
