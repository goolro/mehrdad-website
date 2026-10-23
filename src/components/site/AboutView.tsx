'use client';

import Link from 'next/link';
import { useApp } from './store';
import { ui } from './i18n';
import { Button } from '@/components/ui/button';
import { Rocket, BrainCircuit, Code2, PenTool, Briefcase, Megaphone, Store, Lightbulb, ArrowRight, FileText, Sparkles } from 'lucide-react';
import { Testimonials } from './Testimonials';

export function AboutView() {
  const { lang, setChatOpen } = useApp();
  const t = ui[lang];
  const rtl = lang === 'fa' ? 'rtl' : 'ltr';

  const skills = [
    { icon: Rocket, label: lang === 'fa' ? 'استارتاپ' : 'Startups' },
    { icon: BrainCircuit, label: lang === 'fa' ? 'هوش مصنوعی' : 'Artificial Intelligence' },
    { icon: Code2, label: lang === 'fa' ? 'توسعه وب و اپ' : 'Web & App Development' },
    { icon: PenTool, label: lang === 'fa' ? 'طراحی محصول' : 'Product Design' },
    { icon: Briefcase, label: lang === 'fa' ? 'مشاوره کسب‌وکار' : 'Business Consulting' },
    { icon: Megaphone, label: lang === 'fa' ? 'دیجیتال مارکتینگ' : 'Digital Marketing' },
    { icon: Store, label: lang === 'fa' ? 'فروش سنتی' : 'Traditional Sales' },
    { icon: Lightbulb, label: lang === 'fa' ? 'تجاری‌سازی اختراع' : 'Invention Commercialization' },
  ];

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-5xl text-white shadow-xl shadow-violet-600/25">
          ☼
        </div>
        <h1 className="mt-6 text-3xl font-extrabold sm:text-4xl">{t.about.title}</h1>
        <p className="mt-1 text-muted-foreground">{t.hero.badge}</p>
      </div>

      <div className="mt-10 space-y-4 text-lg leading-relaxed text-muted-foreground" dir={rtl}>
        <p>{t.about.p1}</p>
        <p>{t.about.p2}</p>
        <p>{t.about.p3}</p>
        <p>{t.about.p4}</p>
      </div>

      {/* ── how I work: the FDE loop ── */}
      <section className="mt-12" aria-labelledby="about-how">
        <h2 id="about-how" className="text-xl font-bold" dir={rtl}>{t.about.howTitle}</h2>
        <ol className="mt-5 grid gap-3 sm:grid-cols-2" dir={rtl}>
          {t.about.howSteps.map((step, i) => (
            <li key={i} className="flex gap-3 rounded-2xl border border-border bg-card p-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-600/10 text-sm font-bold text-violet-600 dark:text-violet-400">
                {i + 1}
              </span>
              <span className="text-sm leading-relaxed">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* ── proof, not promises ── */}
      <section className="mt-12" aria-labelledby="about-proof">
        <h2 id="about-proof" className="text-xl font-bold" dir={rtl}>{t.about.proofTitle}</h2>
        <Link
          href="/case-studies/quiz-of-koko"
          className="group mt-5 flex items-start gap-4 rounded-3xl border border-border bg-card p-6 transition-colors hover:border-violet-300 hover:bg-violet-600/5 dark:hover:border-violet-700"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white">
            <FileText className="h-6 w-6" />
          </div>
          <div dir={rtl}>
            <h3 className="font-bold group-hover:text-violet-700 dark:group-hover:text-violet-300">{t.about.proofCaseTitle}</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{t.about.proofCaseSub}</p>
            <span className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-violet-600 dark:text-violet-400">
              {t.about.proofCaseCta}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180" />
            </span>
          </div>
        </Link>
      </section>

      {/* ── testimonials: renders nothing until real quotes exist ── */}
      <Testimonials />

      <h2 className="mt-12 text-xl font-bold" dir={rtl}>{t.about.skillsTitle}</h2>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {skills.map((s) => (
          <div key={s.label} className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-4 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600/10 text-violet-600 dark:text-violet-400">
              <s.icon className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-3xl bg-gradient-to-br from-violet-700 via-violet-600 to-fuchsia-600 p-8 text-center text-white">
        <h2 className="text-2xl font-extrabold" dir={rtl}>{t.about.cta}</h2>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Button variant="secondary" className="bg-white text-violet-700 hover:bg-white/90" asChild>
            <Link href="/mvp-sprint">
              <Sparkles className="ms-1 h-4 w-4" />
              {lang === 'fa' ? 'اسپرینت MVP' : 'MVP Sprint'}
            </Link>
          </Button>
          <Button variant="secondary" className="bg-white/15 text-white hover:bg-white/25" asChild>
            <Link href="/contact">{t.nav.contact}</Link>
          </Button>
          <Button variant="secondary" className="bg-white/15 text-white hover:bg-white/25" onClick={() => setChatOpen(true)}>
            ✦ {t.hero.cta2}
          </Button>
        </div>
      </div>
    </div>
  );
}
