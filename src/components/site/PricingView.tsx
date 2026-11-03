'use client';

import Link from 'next/link';
import { useLang } from './lang-context';
import { ui } from './i18n';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, ShieldCheck, Wallet, KeyRound } from 'lucide-react';

interface Tier {
  name: string;
  price: string;
  time: string;
  points: string[];
  cta: string;
  href: string;
  featured?: boolean;
}

interface HowPoint { t: string; d: string }
interface FaqItem { q: string; a: string }

/**
 * /pricing — survey fix #1 (2026-11): 8 of 14 tested personas named
 * "no clear pricing" as their top complaint. This page republishes the
 * owner-confirmed anchors that already existed inside /mvp-sprint and
 * /consult — no new numbers invented. Static build (force-static on the
 * page), zero client data, same violet/fuchsia identity as the rest.
 */
export function PricingView() {
  const lang = useLang();
  const t = ui[lang];
  const rtl = lang === 'fa' ? 'rtl' : 'ltr';
  // ui is `as const` — readonly tuples; relax through unknown for uniform rendering
  const tiers = t.pricing.tiers as unknown as readonly Tier[];
  const howIcons = [ShieldCheck, Wallet, KeyRound];

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
            ☼ {t.pricing.badge}
          </Badge>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl" dir={rtl}>
            {t.pricing.title}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:mt-6 sm:text-lg" dir={rtl}>
            {t.pricing.sub}
          </p>
        </div>
      </section>

      {/* ── four tiers ── */}
      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
        <h2 className="text-2xl font-extrabold sm:text-3xl" dir={rtl}>{t.pricing.tiersTitle}</h2>
        <p className="mt-1 text-sm text-muted-foreground sm:text-base" dir={rtl}>{t.pricing.tiersSub}</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tiers.map((tier, i) => (
            <div
              key={i}
              className={`relative flex flex-col rounded-2xl border p-6 ${
                tier.featured
                  ? 'border-violet-500/50 bg-violet-600/5 shadow-lg shadow-violet-600/10'
                  : 'border-border bg-card'
              }`}
            >
              {tier.featured && (
                <span
                  className="absolute -top-2.5 end-4 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-2.5 py-0.5 text-[11px] font-bold text-white"
                  dir={rtl}
                >
                  ★
                </span>
              )}
              <h3 className="text-lg font-bold" dir={rtl}>{tier.name}</h3>
              <div className="mt-1 flex flex-wrap items-baseline gap-x-2" dir={rtl}>
                <span className="text-2xl font-extrabold text-violet-600 dark:text-violet-400">{tier.price}</span>
                <span className="text-sm text-muted-foreground">· {tier.time}</span>
              </div>
              <ul className="mt-4 flex-1 space-y-2">
                {tier.points.map((p, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden />
                    <span dir={rtl}>{p}</span>
                  </li>
                ))}
              </ul>
              <Button asChild variant={tier.featured ? 'default' : 'outline'} className="mt-5 w-full">
                <Link href={tier.href}>{tier.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
        <p className="mt-4 max-w-3xl text-xs leading-relaxed text-muted-foreground" dir={rtl}>
          {t.pricing.note}
        </p>
      </section>

      {/* ── how the pricing works ── */}
      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
        <h2 className="text-2xl font-extrabold sm:text-3xl" dir={rtl}>{t.pricing.howTitle}</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {t.pricing.howPoints.map((h: HowPoint, i) => {
            const Icon = howIcons[i % howIcons.length];
            return (
              <div key={i} className="rounded-2xl border border-border bg-card p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-600/10 text-violet-600 dark:text-violet-400">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-bold" dir={rtl}>{h.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground" dir={rtl}>{h.d}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── what moves the quote ── */}
      <section className="border-y border-border/40 bg-muted/30">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
          <h2 className="text-2xl font-extrabold sm:text-3xl" dir={rtl}>{t.pricing.quoteTitle}</h2>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base" dir={rtl}>{t.pricing.quoteSub}</p>
          <ul className="mt-5 grid gap-3 md:grid-cols-3">
            {t.pricing.quotePoints.map((q, i) => (
              <li key={i} className="flex items-start gap-2 rounded-xl border border-border bg-card p-4 text-sm">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden />
                <span dir={rtl}>{q}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── pricing FAQ ── */}
      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
        <h2 className="text-2xl font-extrabold sm:text-3xl" dir={rtl}>{t.pricing.faqTitle}</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {t.pricing.faq.map((f: FaqItem, i) => (
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
          <h2 className="text-2xl font-extrabold sm:text-3xl" dir={rtl}>{t.pricing.ctaTitle}</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/85" dir={rtl}>{t.pricing.ctaSub}</p>
          <Button
            size="lg"
            variant="secondary"
            asChild
            className="mt-7 bg-white text-violet-700 hover:bg-white/90"
          >
            <Link href={lang === 'fa' ? '/fa/contact' : '/mvp-sprint'}>{t.pricing.ctaBtn}</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
