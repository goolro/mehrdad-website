'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { ui } from './i18n';
import { useLang } from './lang-context';
import { Button } from '@/components/ui/button';
import { CalendarCheck, Check, ChevronDown, FileText, Send, Sparkles, X } from 'lucide-react';
import { trackConsultCta, trackConsultSubmitted, trackConsultViewed } from '@/lib/analytics';

/**
 * Strategy Session — the paid 45-minute consulting offer (column D CTA,
 * owner-confirmed: $99 / 45 min / one-page memo within 24 h).
 *
 * Distinct product from the free 15-minute MVP scope call: the free call
 * scopes a sprint (column B funnel); this one IS the product — one real
 * business problem in, a ranked plan + a one-page strategy memo out.
 *
 * The request form reuses /api/contact (name/email/subject/message → DB
 * row + owner inbox + server-side PostHog) — no new backend, no new schema.
 * The three pre-questions ride along inside the composed message text.
 */
export function ConsultView() {
  const lang = useLang();
  const t = ui[lang];
  const m = t.consult;
  const rtl = lang === 'fa' ? 'rtl' : 'ltr';

  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');

  // Page-view event fires once per mount (PostHog dedupes on its side).
  useEffect(() => {
    trackConsultViewed({ lang });
  }, [lang]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: (fd.get('name') || '').toString(),
          email: (fd.get('email') || '').toString(),
          subject: 'Strategy session request — $99 (45 min)',
          message: [
            '[Strategy session request — $99 · 45 min]',
            `Language: ${lang}`,
            '',
            `1) ${m.q1}`,
            (fd.get('q1') || '').toString(),
            '',
            `2) ${m.q2}`,
            (fd.get('q2') || '').toString(),
            '',
            `3) ${m.q3}`,
            (fd.get('q3') || '').toString(),
          ].join('\n'),
        }),
      });
      if (!res.ok) throw new Error('strategy session request failed');
      form.reset();
      setStatus('done');
      trackConsultSubmitted({ lang });
    } catch {
      setStatus('error');
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
      {/* ── hero ── */}
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-10">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-600/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
          <Sparkles className="h-3.5 w-3.5" />
          {m.badge}
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-5xl" dir={rtl}>
          {m.title}
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-muted-foreground" dir={rtl}>
          {m.sub}
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {m.stats.map((s, i) => (
            <div key={i} className="rounded-2xl border border-border bg-background p-4">
              <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400" dir={rtl}>
                {s.value}
              </div>
              <div className="mt-0.5 text-sm text-muted-foreground" dir={rtl}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700"
          >
            <a href="#request" onClick={() => trackConsultCta({ placement: 'hero', lang })}>
              <CalendarCheck className="me-2 h-4 w-4" />
              {m.sendCta}
            </a>
          </Button>
        </div>
      </div>

      {/* ── fit / no-fit ── */}
      <section className="mt-10 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-600/5 p-6">
          <h2 className="font-bold" dir={rtl}>
            {m.forTitle}
          </h2>
          <ul className="mt-3 space-y-2">
            {m.forPoints.map((p, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden />
                <span dir={rtl}>{p}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-bold" dir={rtl}>
            {m.notForTitle}
          </h2>
          <ul className="mt-3 space-y-2">
            {m.notForPoints.map((p, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <X className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                <span dir={rtl}>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── how the 45 minutes work ── */}
      <section className="mt-10" aria-labelledby="consult-how-title">
        <h2 id="consult-how-title" className="text-2xl font-bold" dir={rtl}>
          {m.howTitle}
        </h2>
        <p className="mt-1 text-muted-foreground" dir={rtl}>
          {m.howSub}
        </p>
        <ol className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {m.steps.map((s, i) => (
            <li key={i} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-600 to-teal-600 text-sm font-bold text-white">
                  {i + 1}
                </div>
                <span className="text-xs font-medium text-muted-foreground" dir={rtl}>
                  {s.time}
                </span>
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

      {/* ── the 24h memo ── */}
      <section
        className="mt-10 rounded-2xl border border-dashed border-emerald-500/40 bg-emerald-600/5 p-6"
        aria-labelledby="consult-memo-title"
      >
        <h2 id="consult-memo-title" className="flex items-center gap-2 text-xl font-bold" dir={rtl}>
          <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" aria-hidden />
          {m.memoTitle}
        </h2>
        <ul className="mt-3 space-y-2">
          {m.memoPoints.map((p, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden />
              <span dir={rtl}>{p}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ── request form ── */}
      <section id="request" className="mt-10 scroll-mt-24" aria-labelledby="consult-form-title">
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
          <h2 id="consult-form-title" className="text-2xl font-bold" dir={rtl}>
            {m.formTitle}
          </h2>
          <p className="mt-1 max-w-2xl text-muted-foreground" dir={rtl}>
            {m.formSub}
          </p>
          {status === 'done' ? (
            <div className="mt-6 rounded-2xl border border-emerald-500/40 bg-emerald-600/5 p-6" role="status">
              <h3 className="flex items-center gap-2 font-bold" dir={rtl}>
                <Check className="h-5 w-5 shrink-0 text-emerald-500" aria-hidden />
                {m.successTitle}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground" dir={rtl}>
                {m.successMsg}
              </p>
            </div>
          ) : (
            <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={onSubmit}>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="c-name" className="text-sm font-medium" dir={rtl}>
                  {m.nameLabel}
                </label>
                <input
                  id="c-name"
                  name="name"
                  required
                  maxLength={120}
                  autoComplete="name"
                  className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-emerald-500/60"
                  dir={rtl}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="c-email" className="text-sm font-medium" dir={rtl}>
                  {m.emailLabel}
                </label>
                <input
                  id="c-email"
                  name="email"
                  type="email"
                  required
                  maxLength={200}
                  autoComplete="email"
                  className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-emerald-500/60"
                />
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label htmlFor="c-q1" className="text-sm font-medium" dir={rtl}>
                  {m.q1}
                </label>
                <textarea
                  id="c-q1"
                  name="q1"
                  required
                  rows={2}
                  maxLength={400}
                  className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-emerald-500/60"
                  dir={rtl}
                />
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label htmlFor="c-q2" className="text-sm font-medium" dir={rtl}>
                  {m.q2}
                </label>
                <textarea
                  id="c-q2"
                  name="q2"
                  required
                  rows={2}
                  maxLength={400}
                  className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-emerald-500/60"
                  dir={rtl}
                />
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label htmlFor="c-q3" className="text-sm font-medium" dir={rtl}>
                  {m.q3}
                </label>
                <textarea
                  id="c-q3"
                  name="q3"
                  required
                  rows={2}
                  maxLength={400}
                  className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-emerald-500/60"
                  dir={rtl}
                />
              </div>
              <div className="sm:col-span-2">
                <Button
                  type="submit"
                  size="lg"
                  disabled={status === 'sending'}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 sm:w-auto"
                >
                  <Send className="me-2 h-4 w-4" />
                  {status === 'sending' ? m.sending : m.sendCta}
                </Button>
                {status === 'error' && (
                  <p className="mt-3 text-sm text-red-600 dark:text-red-400" dir={rtl}>
                    {m.errorMsg}{' '}
                    <Link href="/contact" className="underline">
                      /contact
                    </Link>
                  </p>
                )}
                <p className="mt-3 text-xs text-muted-foreground" dir={rtl}>
                  {m.privacyNote}
                </p>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* ── bridge back to the MVP Sprint funnel ── */}
      <section
        className="mt-10 rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-600/5 to-fuchsia-600/5 p-6"
        aria-labelledby="consult-mvp-note"
      >
        <h2 id="consult-mvp-note" className="text-lg font-bold" dir={rtl}>
          {m.mvpNote}
        </h2>
        <div className="mt-3">
          <Button
            asChild
            size="sm"
            variant="outline"
            className="border-violet-500/50 text-violet-700 hover:bg-violet-600/10 dark:text-violet-300"
          >
            <Link href="/mvp-sprint">{m.mvpCta} →</Link>
          </Button>
        </div>
      </section>

      {/* ── faq ── */}
      <section className="mt-10" aria-labelledby="consult-faq-title">
        <h2 id="consult-faq-title" className="text-2xl font-bold" dir={rtl}>
          {m.faqTitle}
        </h2>
        <div className="mt-4 space-y-3">
          {m.faq.map((f, i) => (
            <details key={i} className="group rounded-2xl border border-border bg-card p-4 open:border-emerald-500/40">
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
            className="border-emerald-500/50 text-emerald-700 hover:bg-emerald-600/10 dark:text-emerald-300"
          >
            <a href="#request" onClick={() => trackConsultCta({ placement: 'faq', lang })}>
              <CalendarCheck className="me-2 h-4 w-4" />
              {m.sendCta}
            </a>
          </Button>
        </div>
      </section>
    </div>
  );
}
