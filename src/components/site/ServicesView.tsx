'use client';

import { useEffect, useState } from 'react';
import { useApp, pick } from './store';
import { ui } from './i18n';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Rocket, BrainCircuit, Code2, PenTool, Briefcase, Megaphone, Store, Lightbulb, Sparkles, ChevronRight, Compass } from 'lucide-react';

const ICONS: Record<string, typeof Rocket> = {
  Rocket, BrainCircuit, Code2, PenTool, Briefcase, Megaphone, Store, Lightbulb, Sparkles, Compass,
};

const FDE_SLUG = 'forward-deployed-engineering';

interface ServiceItem {
  id: string; slug: string; titleEn: string; titleFa: string; descEn: string; descFa: string; icon: string;
}

export function ServicesView() {
  const { lang, setView } = useApp();
  const t = ui[lang];
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [selected, setSelected] = useState<ServiceItem | null>(null);

  useEffect(() => {
    fetch('/api/site').then((r) => r.json()).then((d) => setServices(d.services || [])).catch(() => {});
  }, []);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-extrabold sm:text-4xl">{t.sections.servicesTitle}</h1>
      <p className="mt-2 text-muted-foreground">{t.sections.servicesSub}</p>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {services.map((s) => {
          const Icon = ICONS[s.icon] || Sparkles;
          const isFde = s.slug === FDE_SLUG;
          return (
            <button
              key={s.id}
              onClick={() => (isFde ? setView('fde') : setSelected(s))}
              aria-label={isFde ? `${pick(lang, s.titleEn, s.titleFa)} — ${t.services.explore}` : undefined}
              className={
                isFde
                  ? 'group relative flex flex-col rounded-2xl border-2 border-violet-500/60 bg-gradient-to-b from-violet-600/10 via-card to-card p-6 text-start shadow-lg shadow-violet-600/15 transition-all hover:-translate-y-1 hover:border-violet-500 hover:shadow-xl hover:shadow-violet-600/20 sm:col-span-2 lg:col-span-2'
                  : 'group rounded-2xl border border-border bg-card p-6 text-start transition-all hover:-translate-y-1 hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-600/10'
              }
            >
              {isFde && (
                <span className="absolute -top-3 end-4 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-3 py-1 text-[11px] font-bold text-white shadow-md">
                  ★ {t.services.core}
                </span>
              )}
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${isFde ? 'bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-md' : 'bg-gradient-to-br from-violet-600/15 to-fuchsia-600/15 text-violet-600 dark:text-violet-400'}`}>
                <Icon className="h-6 w-6" />
              </div>
              <h3 className={`mt-4 font-bold ${isFde ? 'text-xl' : 'text-lg'}`}>{pick(lang, s.titleEn, s.titleFa)}</h3>
              {isFde && (
                <p className="mt-1 text-xs font-medium text-muted-foreground">{pick(lang, s.titleFa, s.titleEn)}</p>
              )}
              <p className={`mt-2 text-sm text-muted-foreground ${isFde ? 'line-clamp-2' : 'line-clamp-3'}`}>{pick(lang, s.descEn, s.descFa)}</p>
              {isFde && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {t.fde.tags.map((tag) => (
                    <span key={tag} className="rounded-full border border-violet-500/30 bg-violet-600/5 px-2 py-0.5 text-[10px] font-medium text-violet-700 dark:text-violet-300">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <span className={`mt-4 inline-flex items-center gap-1 font-medium text-violet-600 dark:text-violet-400 ${isFde ? 'text-sm font-bold' : 'text-sm'}`}>
                {isFde ? t.services.explore : t.services.details}
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180" />
              </span>
            </button>
          );
        })}
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-lg" dir={lang === 'fa' ? 'rtl' : 'ltr'}>
          {selected && (
            <>
              <DialogHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-600/10 text-violet-600 dark:text-violet-400">
                  {(ICONS[selected.icon] || Sparkles) && (() => {
                    const Icon = ICONS[selected.icon] || Sparkles;
                    return <Icon className="h-6 w-6" />;
                  })()}
                </div>
                <DialogTitle className="text-xl">{pick(lang, selected.titleEn, selected.titleFa)}</DialogTitle>
                <DialogDescription className="text-base leading-relaxed">
                  {pick(lang, selected.descEn, selected.descFa)}
                </DialogDescription>
              </DialogHeader>
              <Button
                onClick={() => {
                  setSelected(null);
                  setView('contact');
                }}
                className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-700 hover:to-fuchsia-700"
              >
                {t.services.contact}
                <ChevronRight className="ms-2 h-4 w-4 rtl:rotate-180" />
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
