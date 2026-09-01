'use client';

import { useApp } from './store';
import { ui } from './i18n';
import { Button } from '@/components/ui/button';
import { Rocket, BrainCircuit, Code2, PenTool, Briefcase, Megaphone, Store, Lightbulb } from 'lucide-react';

export function AboutView() {
  const { lang, setView, setChatOpen } = useApp();
  const t = ui[lang];

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

      <div className="mt-10 space-y-4 text-lg leading-relaxed text-muted-foreground">
        <p>{t.about.p1}</p>
        <p>{t.about.p2}</p>
      </div>

      <h2 className="mt-12 text-xl font-bold">{t.about.skillsTitle}</h2>
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
        <h2 className="text-2xl font-extrabold">{t.about.cta}</h2>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Button variant="secondary" className="bg-white text-violet-700 hover:bg-white/90" onClick={() => setView('contact')}>
            {t.nav.contact}
          </Button>
          <Button variant="secondary" className="bg-white/15 text-white hover:bg-white/25" onClick={() => setChatOpen(true)}>
            ✦ {t.hero.cta2}
          </Button>
        </div>
      </div>
    </div>
  );
}
