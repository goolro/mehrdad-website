'use client';

/**
 * Daily Product Hunt digest (/daily) — the owner's daily publication:
 * successful launches distilled to ONE line, English + Persian.
 * Server-rendered groups arrive from /daily (force-static, rebuilt by the
 * deploy hook); this view renders them in the site's card language and
 * picks the Persian line first for FA readers.
 */

import { useApp, formatDate } from './store';
import { ui } from './i18n';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, ChevronUp, Flame, ExternalLink } from 'lucide-react';

interface Item {
  id: string;
  day: string;
  name: string;
  taglineEn: string;
  taglineFa: string | null;
  url: string;
  logo: string | null;
  votes: number;
}
interface Group {
  day: string;
  items: Item[];
}

export function DailyView({ groups }: { groups: Group[] }) {
  const { lang } = useApp();
  const t = (ui[lang] as typeof ui.en).daily;
  const total = groups.reduce((n, g) => n + g.items.length, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
      {/* hero — same rhythm as the rest of the site's page headers */}
      <section className="pt-10 sm:pt-14">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="gap-1 border-violet-500/40 bg-violet-500/10 text-violet-600 dark:text-violet-400">
            <Flame className="h-3.5 w-3.5" />
            Product Hunt
          </Badge>
          <span className="text-xs text-muted-foreground">{total} {lang === 'fa' ? 'محصول' : 'products'}</span>
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{t.title}</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">{t.subtitle}</p>
        <a
          href="https://www.producthunt.com"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-violet-600 transition-colors hover:text-violet-500 dark:text-violet-400"
        >
          {t.poweredBy}
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </section>

      {total === 0 && (
        <div className="mt-10 rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
          {t.empty}
        </div>
      )}

      {groups.map((group) => (
        <section key={group.day} className="mt-10" aria-label={group.day}>
          <div className="mb-4 flex items-center gap-3">
            <h2 className="text-lg font-bold tracking-tight">
              {formatDate(lang, `${group.day}T00:00:00Z`)}
            </h2>
            <span className="h-px flex-1 bg-border" aria-hidden="true" />
            <span className="text-xs text-muted-foreground">{group.items.length}</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {group.items.map((item) => {
              const primary = lang === 'fa' ? item.taglineFa || item.taglineEn : item.taglineEn;
              const secondary = lang === 'fa' ? item.taglineEn : item.taglineFa;
              return (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-violet-500/40 hover:shadow-lg hover:shadow-violet-600/5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {item.logo ? (
                        // remote PH CDN icons — plain img keeps the static
                        // page free of image-optimizer runtime dependencies
                        <img
                          src={item.logo}
                          alt=""
                          loading="lazy"
                          className="h-10 w-10 rounded-xl border border-border/60 object-cover"
                        />
                      ) : (
                        <span
                          className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-base font-bold text-white"
                          aria-hidden="true"
                        >
                          {item.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                      <h3 className="font-semibold leading-snug">{item.name}</h3>
                    </div>
                    {item.votes > 0 && (
                      <span className="flex shrink-0 flex-col items-center rounded-lg border border-border px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                        <ChevronUp className="h-3 w-3" />
                        {item.votes}
                      </span>
                    )}
                  </div>

                  <p className="text-sm leading-relaxed text-foreground/90">{primary}</p>
                  {secondary && secondary !== primary && (
                    <p className="text-xs leading-relaxed text-muted-foreground" dir={lang === 'fa' ? 'ltr' : 'rtl'}>
                      {secondary}
                    </p>
                  )}

                  <span className="mt-auto inline-flex items-center gap-1 text-xs font-medium text-violet-600 opacity-80 transition-opacity group-hover:opacity-100 dark:text-violet-400">
                    {t.visit}
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </a>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
