'use client';

import Link from 'next/link';
import { ChevronRight, Rocket, Sparkles } from 'lucide-react';
import { useApp } from './store';
import { ui } from './i18n';

/**
 * End-of-article conversion CTA (P1 sales, agent 2026-10-24): blog
 * articles are the top of the funnel but used to end with no next step —
 * ShareBar jumped straight to comments. Per the owner rule (2026-09-26)
 * every placement must invite the next step; this card gives every
 * article two: the productized offer (/mvp-sprint) and a direct line
 * (/contact). Rendered once per article, between the body and ShareBar.
 * The /daily editorial section deliberately stays CTA-free (see
 * ArticleDetail header note).
 */
export function ArticleCta({ className }: { className?: string }) {
  const { lang } = useApp();
  const t = (ui[lang] as typeof ui.en).blog.cta;
  return (
    <aside
      aria-label={t.title}
      className={`rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-600/10 to-fuchsia-600/10 p-5 sm:p-6 ${className ?? ''}`}
    >
      <h2 className="flex items-center gap-2 text-lg font-bold leading-snug">
        <Rocket className="h-5 w-5 shrink-0 text-violet-500" aria-hidden />
        {t.title}
      </h2>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{t.sub}</p>
      <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <Link
          href="/mvp-sprint"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:from-violet-700 hover:to-fuchsia-700"
        >
          <Sparkles className="h-4 w-4" aria-hidden />
          {t.btn}
        </Link>
        <Link
          href="/contact"
          className="inline-flex items-center justify-center gap-1 rounded-xl border border-violet-500/40 px-5 py-2.5 text-sm font-medium text-violet-700 transition-colors hover:bg-violet-500/10 dark:text-violet-300"
        >
          {t.alt}
          <ChevronRight className="h-4 w-4 rtl:rotate-180" aria-hidden />
        </Link>
      </div>
    </aside>
  );
}
