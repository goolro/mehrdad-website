'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useApp } from './store';
import { ui } from './i18n';
import { Button } from '@/components/ui/button';
import { CalendarCheck, Check, ChevronDown, Sparkles, Wrench } from 'lucide-react';
import { trackMvpSprintViewed, trackMvpSprintCta } from '@/lib/analytics';

/**
 * AI MVP Sprint — the productized service offer (phase 1, 2026-10-18).
 *
 * Fixed-scope tiers instead of open-ended consulting: the visitor sees the
 * process, the three entry points and the FAQ before ever typing a word.
 * Every CTA routes to /contact?intent=services where the qualification
 * fields (budget/timeline) are pre-wired by the intent param.
 */
export function MvpSprintView() {
  const { lang } = useApp();
  const t = ui[lang];
  const m = t.mvpSprint;
  const rtl = lang === 'fa' ? 'rtl' : 'ltr';

  // Page-view event fires once per mount (PostHog dedupes on its side).
  useEffect(() => {
    trackMvpSprintViewed({ lang });
  }, [lang]);

  const contactHref = '/contact?intent=services';

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
      {/* ── hero ── */}
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-10">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/40 bg-violet-600/10 px-3 py-1 text-xs font-semibold text-violet-700 dark:text-violet-300">
          <Sparkles className="h-3.5 w-3.5" />
          {m.badge}
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-5xl" dir={rtl}>
          {m.title}
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-muted-foreground" dir={rtl}>
          {m.sub}
        </p>
        <div className="mt-6 flex flex-col items-start gap-2 sm:flex-row sm:items-center">
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-700 hover:to-fuchsia-700"
          >
            <Link href={contactHref} onClick={() => trackMvpSprintCta({ placement: 'hero', lang })}>
              <CalendarCheck className="me-2 h-4 w-4" />
              {m.ctaHero}
            </Link>
          </Button>
          <span className="text-sm text-muted-foreground" dir={rtl}>
            {m.ctaHeroSub}
          </span>
        </div>
      </div>

      {/* ── how it works ── */}
      <section className="mt-10" aria-labelledby="how-title">
        <h2 id="how-title" className="text-2xl font-bold" dir={rtl}>
          {m.howTitle}
        </h2>
        <p className="mt-1 text-muted-foreground" dir={rtl}>
          {m.howSub}
        </p>
        <ol className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {m.steps.map((s, i) => (
            <li key={i} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 text-sm font-bold text-white">
                {i + 1}
              </div>
              <h3 className="mt-3 font-semibold" dir={rtl}>
                {s.title}
              </h3>
              <p className="mt-1.5 text-sm text-muted-foreground" dir={rtl}>
                {s.desc}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* ── tiers ── */}
      <section className="mt-10" aria-labelledby="tiers-title">
        <h2 id="tiers-title" className="text-2xl font-bold" dir={rtl}>
          {m.tiersTitle}
        </h2>
        <p className="mt-1 text-muted-foreground" dir={rtl}>
          {m.tiersSub}
        </p>
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {m.tiers.map((tier, i) => (
            <div
              key={i}
              className={`relative rounded-2xl border p-6 ${
                'featured' in tier && tier.featured
                  ? 'border-violet-500/50 bg-violet-600/5 shadow-lg shadow-violet-600/10'
                  : 'border-border bg-card'
              }`}
            >
              {'featured' in tier && tier.featured && (
                <span
                  className="absolute -top-2.5 end-4 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-2.5 py-0.5 text-[11px] font-bold text-white"
                  dir={rtl}
                >
                  ★
                </span>
              )}
              <h3 className="text-lg font-bold" dir={rtl}>
                {tier.name}
              </h3>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-violet-600 dark:text-violet-400" dir={rtl}>
                  {tier.price}
                </span>
                <span className="text-sm text-muted-foreground" dir={rtl}>
                  · {tier.time}
                </span>
              </div>
              <ul className="mt-4 space-y-2">
                {tier.points.map((p, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden />
                    <span dir={rtl}>{p}</span>
                  </li>
                ))}
              </ul>
              <Button
                asChild
                variant={'featured' in tier && tier.featured ? 'default' : 'outline'}
                className={`mt-5 w-full ${
                  'featured' in tier && tier.featured
                    ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-700 hover:to-fuchsia-700'
                    : ''
                }`}
              >
                <Link href={contactHref} onClick={() => trackMvpSprintCta({ placement: 'tier', lang })}>
                  {tier.cta}
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* ── free tool bridge (phase 3) ── */}
      <section className="mt-10 rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-600/5 to-fuchsia-600/5 p-6" aria-labelledby="tool-title">
        <h2 id="tool-title" className="text-xl font-bold" dir={rtl}>
          {m.toolTitle}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground" dir={rtl}>
          {m.toolSub}
        </p>
        <div className="mt-4">
          <Button
            asChild
            size="sm"
            className="bg-violet-600 text-white hover:bg-violet-700"
          >
            <Link href="/scope-builder">
              <Wrench className="me-1.5 h-4 w-4" />
              {m.toolCta}
            </Link>
          </Button>
        </div>
      </section>

      {/* ── what I need ── */}
      <section className="mt-10 rounded-2xl border border-dashed border-violet-500/40 bg-violet-600/5 p-6" aria-labelledby="need-title">
        <h2 id="need-title" className="text-xl font-bold" dir={rtl}>
          {m.needTitle}
        </h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {m.needPoints.map((p, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-violet-500" aria-hidden />
              <span dir={rtl}>{p}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ── faq ── */}
      <section className="mt-10" aria-labelledby="faq-title">
        <h2 id="faq-title" className="text-2xl font-bold" dir={rtl}>
          {m.faqTitle}
        </h2>
        <div className="mt-4 space-y-3">
          {m.faq.map((f, i) => (
            <details key={i} className="group rounded-2xl border border-border bg-card p-4 open:border-violet-500/40">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold [&::-webkit-details-marker]:hidden">
                <span dir={rtl}>{f.q}</span>
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden />
              </summary>
              <p className="mt-3 text-sm text-muted-foreground" dir={rtl}>
                {f.a}
              </p>
            </details>
          ))}
        </div>
        <div className="mt-6">
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-violet-500/50 text-violet-700 hover:bg-violet-600/10 dark:text-violet-300"
          >
            <Link href={contactHref} onClick={() => trackMvpSprintCta({ placement: 'faq', lang })}>
              <CalendarCheck className="me-2 h-4 w-4" />
              {m.ctaHero}
            </Link>
          </Button>
        </div>
      </section>

      {/* ── proof ── */}
      <section className="mt-10 rounded-3xl border border-border bg-card p-6 sm:p-8" aria-labelledby="proof-title">
        <h2 id="proof-title" className="text-xl font-bold" dir={rtl}>
          {m.proofTitle}
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground" dir={rtl}>
          {m.proofSub}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/work"
            className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-muted"
          >
            {t.nav.projects} →
          </Link>
          <Link
            href="/fde"
            className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-muted"
          >
            FDE →
          </Link>
        </div>
      </section>
    </div>
  );
}
