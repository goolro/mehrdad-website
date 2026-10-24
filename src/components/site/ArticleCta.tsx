'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Loader2, Rocket, Sparkles } from 'lucide-react';
import { useApp } from './store';
import { ui } from './i18n';

/**
 * End-of-article conversion CTA + lead capture (D-051 + D-052, growth-agent
 * P1 sales, 2026-10-24): blog articles are the top of the funnel but used
 * to end with no next step — ShareBar jumped straight to comments. Per the
 * owner rule (2026-09-26) every placement must invite the next step; this
 * card gives every article three, in descending commitment:
 *   1. /mvp-sprint — the productized offer (primary)
 *   2. email capture → POST /api/leads (low-friction, for readers not
 *      ready to click anywhere yet)
 *   3. /contact — the full form (secondary)
 * Rendered once per article, between the body and ShareBar. The /daily
 * editorial section deliberately stays CTA-free (see ArticleDetail header
 * note).
 */
export function ArticleCta({ slug }: { slug?: string }) {
  const { lang } = useApp();
  const t = (ui[lang] as typeof ui.en).blog.cta;

  const formRef = useRef<HTMLFormElement>(null);
  const [state, setState] = useState<'idle' | 'sending' | 'ok' | 'err'>('idle');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (state === 'sending') return;
    const fd = new FormData(formRef.current ?? undefined);
    const email = String(fd.get('email') || '').trim();
    const website = String(fd.get('website') || ''); // honeypot — bots only
    if (!email) {
      setState('err');
      return;
    }
    setState('sending');
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, website, source: 'article_cta', lang, slug }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setState('ok');
      formRef.current?.reset();
    } catch {
      setState('err');
    }
  }

  return (
    <aside
      aria-label={t.title}
      className="mt-10 rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-600/10 to-fuchsia-600/10 p-5 sm:p-6"
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

      {/* lead capture (D-052) — collapses to a thank-you line on success */}
      {state === 'ok' ? (
        <p role="status" className="mt-4 border-t border-violet-500/20 pt-4 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
          ✓ {t.emailOk}
        </p>
      ) : (
        <form ref={formRef} onSubmit={submit} noValidate className="mt-4 border-t border-violet-500/20 pt-4">
          <label htmlFor="lead-email" className="block text-xs font-medium text-muted-foreground">
            {t.emailLabel}
          </label>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            {/* honeypot: hidden from humans and AT, filled only by bots */}
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="hidden"
            />
            <input
              id="lead-email"
              name="email"
              type="email"
              required
              inputMode="email"
              dir="ltr"
              placeholder={t.emailPlaceholder}
              className="h-10 w-full rounded-xl border border-violet-500/30 bg-background/60 px-3.5 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
            />
            <button
              type="submit"
              disabled={state === 'sending'}
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-violet-500/40 bg-violet-600/10 px-5 text-sm font-semibold text-violet-700 transition-colors hover:bg-violet-600/20 disabled:opacity-60 dark:text-violet-300"
            >
              {state === 'sending' && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
              {t.emailBtn}
            </button>
          </div>
          {state === 'err' && (
            <p role="alert" className="mt-2 text-xs font-medium text-red-600 dark:text-red-400">
              {t.emailErr}
            </p>
          )}
        </form>
      )}
    </aside>
  );
}
