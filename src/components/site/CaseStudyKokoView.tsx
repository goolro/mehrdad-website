'use client';

import Link from 'next/link';
import { useApp } from './store';
import { ui } from './i18n';
import { Button } from '@/components/ui/button';
import { Brain, Swords, Trophy, Repeat, ScanSearch, ArrowRight, ExternalLink, FileText, LineChart, Quote } from 'lucide-react';
import { caseStudies } from '@/lib/case-studies';
import { Testimonials } from './Testimonials';

const ICONS = { brain: Brain, swords: Swords, trophy: Trophy, repeat: Repeat, scan: ScanSearch } as const;

export function CaseStudyKokoView() {
  const { lang, setChatOpen } = useApp();
  const t = ui[lang];
  const cs = caseStudies['quiz-of-koko'];
  const fa = lang === 'fa';
  const rtl = fa ? 'rtl' : 'ltr';

  const pick = <T,>(en: T, faVal: T) => (fa ? faVal : en);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6">
      {/* ── hero: result-first ── */}
      <header className="flex flex-col items-center text-center">
        <span className="rounded-full border border-violet-200 bg-violet-600/10 px-3 py-1 text-xs font-semibold text-violet-700 dark:border-violet-800 dark:text-violet-300">
          {t.caseStudy.badge}
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl" dir={rtl}>
          {pick('Quiz of Koko — from idea to live product', 'کوئیز کوکو — از ایده تا محصول زنده')}
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-muted-foreground" dir={rtl}>
          {fa ? cs.headlineFa : cs.headlineEn}
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-sm">
          <span className="rounded-full bg-emerald-600/10 px-3 py-1 font-medium text-emerald-700 dark:text-emerald-300" dir={rtl}>
            ● {fa ? cs.statusFa : cs.statusEn}
          </span>
          <span className="rounded-full bg-card px-3 py-1 font-medium text-muted-foreground ring-1 ring-border" dir={rtl}>
            {fa ? cs.roleFa : cs.roleEn}
          </span>
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <a href={cs.liveUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="ms-1 h-4 w-4" />
              {t.caseStudy.tryLive}
            </a>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/mvp-sprint">{t.caseStudy.sameLoopCta}</Link>
          </Button>
        </div>
      </header>

      {/* ── challenge ── */}
      <section className="mt-14" aria-labelledby="cs-challenge">
        <h2 id="cs-challenge" className="text-2xl font-bold" dir={rtl}>
          {pick('The challenge', 'مسئله')}
        </h2>
        <div className="mt-4 space-y-3 text-lg leading-relaxed text-muted-foreground" dir={rtl}>
          {(fa ? cs.challengeFa : cs.challengeEn).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </section>

      {/* ── approach: FDE loop ── */}
      <section className="mt-12" aria-labelledby="cs-approach">
        <h2 id="cs-approach" className="text-2xl font-bold" dir={rtl}>
          {fa ? cs.approachTitleFa : cs.approachTitleEn}
        </h2>
        <ol className="mt-5 grid gap-4 sm:grid-cols-2">
          {cs.approachSteps.map((s) => ({ title: fa ? s.titleFa : s.titleEn, desc: fa ? s.descFa : s.descEn })).map((step, i) => (
            <li key={i} className="rounded-2xl border border-border bg-card p-5" dir={rtl}>
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-600/10 text-sm font-bold text-violet-600 dark:text-violet-400">
                  {i + 1}
                </span>
                <h3 className="font-semibold">{step.title}</h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ── what shipped ── */}
      <section className="mt-12" aria-labelledby="cs-shipped">
        <h2 id="cs-shipped" className="text-2xl font-bold" dir={rtl}>
          {fa ? cs.shippedTitleFa : cs.shippedTitleEn}
        </h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {cs.features.map((f) => {
            const Icon = ICONS[f.icon];
            return (
              <div key={f.titleEn} className="flex gap-3 rounded-2xl border border-border bg-card p-4" dir={rtl}>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-600/10 text-violet-600 dark:text-violet-400">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">{fa ? f.titleFa : f.titleEn}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{fa ? f.descFa : f.descEn}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── evidence & measurement ── */}
      <section className="mt-12 rounded-3xl border border-border bg-card p-6 sm:p-8" aria-labelledby="cs-evidence">
        <div className="flex items-center gap-2">
          <LineChart className="h-5 w-5 text-violet-600 dark:text-violet-400" />
          <h2 id="cs-evidence" className="text-2xl font-bold" dir={rtl}>
            {fa ? cs.measurementTitleFa : cs.measurementTitleEn}
          </h2>
        </div>
        <ul className="mt-4 space-y-3" dir={rtl}>
          {(fa ? cs.measurementFa : cs.measurementEn).map((m, i) => (
            <li key={i} className="flex gap-2.5 text-base leading-relaxed text-muted-foreground">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" aria-hidden />
              {m}
            </li>
          ))}
        </ul>
      </section>

      {/* ── testimonials: renders nothing until real quotes exist ── */}
      <Testimonials />

      {/* ── deep links ── */}
      <section className="mt-12" aria-labelledby="cs-links">
        <h2 id="cs-links" className="text-2xl font-bold" dir={rtl}>
          {t.caseStudy.deepLinksTitle}
        </h2>
        <div className="mt-5 grid gap-3">
          {cs.deepLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="group flex items-start gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-violet-300 hover:bg-violet-600/5 dark:hover:border-violet-700"
              dir={rtl}
            >
              <FileText className="mt-0.5 h-5 w-5 shrink-0 text-violet-600 dark:text-violet-400" />
              <div>
                <span className="font-semibold group-hover:text-violet-700 dark:group-hover:text-violet-300">
                  {fa ? l.labelFa : l.labelEn}
                </span>
                <p className="mt-0.5 text-sm text-muted-foreground">{fa ? l.noteFa : l.noteEn}</p>
              </div>
              <ArrowRight className="mt-1 ms-auto h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 rtl:rotate-180" />
            </Link>
          ))}
        </div>
      </section>

      {/* ── CTA: same loop for your product ── */}
      <section className="mt-14 rounded-3xl bg-gradient-to-br from-violet-700 via-violet-600 to-fuchsia-600 p-8 text-center text-white">
        <div className="mx-auto flex w-fit items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm">
          <Quote className="h-4 w-4" />
          <span dir={rtl}>{t.caseStudy.ctaBadge}</span>
        </div>
        <h2 className="mt-4 text-2xl font-extrabold sm:text-3xl" dir={rtl}>{t.caseStudy.ctaTitle}</h2>
        <p className="mx-auto mt-2 max-w-xl text-violet-100" dir={rtl}>{t.caseStudy.ctaSub}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button variant="secondary" className="bg-white text-violet-700 hover:bg-white/90" asChild>
            <Link href="/mvp-sprint">{t.caseStudy.ctaPrimary}</Link>
          </Button>
          <Button variant="secondary" className="bg-white/15 text-white hover:bg-white/25" asChild>
            <Link href="/contact?intent=services">{t.caseStudy.ctaSecondary}</Link>
          </Button>
          <Button variant="secondary" className="bg-white/15 text-white hover:bg-white/25" onClick={() => setChatOpen(true)}>
            ✦ {t.hero.cta2}
          </Button>
        </div>
      </section>
    </div>
  );
}
