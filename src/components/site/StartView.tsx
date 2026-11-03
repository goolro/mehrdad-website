'use client';

import Link from 'next/link';
import { useLang } from './lang-context';
import { ui } from './i18n';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, PhoneCall, Sparkles } from 'lucide-react';

interface Step { t: string; d: string }
interface FaqItem { q: string; a: string }

/**
 * /start — survey fix #2 (2026-11): 5 of 14 tested personas found the site
 * cluttered / too dense, and two of them explicitly asked for "one simple
 * page in plain language for non-technical visitors". This is that page:
 * three steps, four honest answers, the same published price anchors —
 * zero new numbers, zero jargon. Static build, no client data, same
 * violet/fuchsia identity as the rest of the site.
 */
export function StartView() {
  const lang = useLang();
  const t = ui[lang];
  const rtl = lang === 'fa' ? 'rtl' : 'ltr';
  // ui is `as const` — readonly tuples; relax through unknown for uniform rendering
  const steps = t.start.steps as unknown as readonly Step[];
  const faq = t.start.faq as unknown as readonly FaqItem[];
  // step numbers follow the surrounding language: ۱ ۲ ۳ on the Persian page
  const stepNum = (i: number) => (lang === 'fa' ? ['۱', '۲', '۳'][i] : String(i + 1));

  return (
    <div className="flex w-full flex-col">
      {/* ── hero ── */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-24 start-1/4 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl" />
          <div className="absolute top-32 end-0 h-80 w-80 rounded-full bg-fuchsia-600/10 blur-3xl" />
        </div>
        <div className="mx-auto w-full max-w-7xl px-4 pb-8 pt-12 text-center sm:px-6 sm:pt-16">
          <Badge variant="outline" className="mb-3 border-violet-500/40 bg-violet-600/10 px-3 py-1 text-xs text-violet-600 sm:mb-5 sm:px-4 sm:py-1.5 sm:text-sm dark:text-violet-400">
            ☼ {t.start.badge}
          </Badge>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl" dir={rtl}>
            {t.start.title}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:mt-6 sm:text-lg" dir={rtl}>
            {t.start.sub}
          </p>
        </div>
      </section>

      {/* ── three steps ── */}
      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
        <h2 className="text-2xl font-extrabold sm:text-3xl" dir={rtl}>{t.start.stepsTitle}</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {steps.map((s, i) => (
            <div key={i} className="relative flex flex-col rounded-2xl border border-border bg-card p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-600/10 text-lg font-extrabold text-violet-600 dark:text-violet-400" dir={rtl}>
                {stepNum(i)}
              </div>
              <h3 className="mt-4 text-lg font-bold" dir={rtl}>{s.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground" dir={rtl}>{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── prices: the same published anchors, one compact row ── */}
      <section className="border-y border-border/40 bg-muted/30">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {t.pricing.homeStripTiers.map((tier, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card p-5" dir={rtl}>
                <h3 className="text-sm font-bold text-muted-foreground" dir={rtl}>{tier.name}</h3>
                <p className="mt-1 text-xl font-extrabold text-violet-600 dark:text-violet-400" dir={rtl}>{tier.price}</p>
                <p className="mt-0.5 text-xs text-muted-foreground" dir={rtl}>{tier.time}</p>
              </div>
            ))}
          </div>
          <Link
            href={lang === 'fa' ? '/fa/pricing' : '/pricing'}
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-violet-600 hover:underline dark:text-violet-400"
            dir={rtl}
          >
            {t.start.priceCta}
            <Check className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </section>

      {/* ── plain FAQ ── */}
      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
        <h2 className="text-2xl font-extrabold sm:text-3xl" dir={rtl}>{t.start.faqTitle}</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {faq.map((f, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-5">
              <h3 className="font-bold" dir={rtl}>{f.q}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground" dir={rtl}>{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── final CTA ── */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-700 via-violet-600 to-fuchsia-600 px-6 py-14 text-center text-white sm:px-12">
          <div className="pointer-events-none absolute -end-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <PhoneCall className="mx-auto h-10 w-10" aria-hidden />
          <h2 className="mt-4 text-2xl font-extrabold sm:text-3xl" dir={rtl}>{t.start.ctaTitle}</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/85" dir={rtl}>{t.start.ctaSub}</p>
          <Button
            size="lg"
            variant="secondary"
            asChild
            className="mt-7 bg-white text-violet-700 hover:bg-white/90"
          >
            <Link href={lang === 'fa' ? '/fa/contact' : '/contact'} dir={rtl}>
              <Sparkles className="me-2 h-4 w-4" aria-hidden />
              {t.start.ctaBtn}
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
