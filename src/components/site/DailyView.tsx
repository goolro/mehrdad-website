'use client';

/**
 * Daily articles (/daily) — the owner's daily publication of ORIGINAL
 * bilingual product analysis. Not a link dump: every card is an editorial
 * written for this site (summary + full article + expert verdict) and
 * links INTERNALLY to /daily/[slug]. Server-rendered article cards arrive
 * from /daily and /daily/cat/[cat] (force-static, rebuilt by the deploy
 * hook). The category tabs are REAL crawlable links — each lane has its
 * own indexable page at /daily/cat/<category>.
 */

import Link from 'next/link';
import { useApp, formatDate } from './store';
import { ui } from './i18n';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Newspaper } from 'lucide-react';
import { DAILY_CATEGORIES } from '@/lib/daily';

export interface DailyArticleCard {
  slug: string;
  day: string;
  category: string;
  titleEn: string;
  titleFa: string;
  summaryEn: string;
  summaryFa: string;
  tagsEn: string[];
  tagsFa: string[];
}

export function DailyView({
  articles,
  category,
}: {
  articles: DailyArticleCard[];
  /** preselected lane when rendered on /daily/cat/<category> */
  category?: string;
}) {
  const { lang } = useApp();
  const t = (ui[lang] as typeof ui.en).daily;
  const isFa = lang === 'fa';
  const pick = (en: string, fa: string) => (isFa ? fa : en);

  // group by publication day, newest first (articles already arrive sorted)
  const groups: { day: string; items: DailyArticleCard[] }[] = [];
  for (const a of articles) {
    const last = groups[groups.length - 1];
    if (last && last.day === a.day) last.items.push(a);
    else groups.push({ day: a.day, items: [a] });
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
      {/* hero — same rhythm as the rest of the site's page headers */}
      <section className="pt-10 sm:pt-14">
        <Badge variant="outline" className="gap-1 border-violet-500/40 bg-violet-500/10 text-violet-600 dark:text-violet-400">
          <Newspaper className="h-3.5 w-3.5" />
          {t.badge}
        </Badge>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{t.title}</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">{t.subtitle}</p>
      </section>

      {/* category lanes — real crawlable links to /daily/cat/<category> */}
      <nav aria-label={isFa ? 'دسته‌بندی تحلیل‌ها' : 'Analysis categories'} className="mt-7 flex flex-wrap gap-2">
        <Link href="/daily">
          <Badge
            variant={!category ? 'default' : 'outline'}
            aria-current={!category ? 'page' : undefined}
            className={`cursor-pointer px-3 py-1.5 ${!category ? 'bg-violet-600 hover:bg-violet-700' : 'hover:border-violet-500/60'}`}
          >
            {t.cats.all}
          </Badge>
        </Link>
        {DAILY_CATEGORIES.map((c) => (
          <Link key={c} href={`/daily/cat/${c}`}>
            <Badge
              variant={category === c ? 'default' : 'outline'}
              aria-current={category === c ? 'page' : undefined}
              className={`cursor-pointer px-3 py-1.5 ${category === c ? 'bg-violet-600 hover:bg-violet-700' : 'hover:border-violet-500/60'}`}
            >
              {t.cats[c]}
            </Badge>
          </Link>
        ))}
      </nav>

      {articles.length === 0 && (
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

          <div className="grid gap-4 lg:grid-cols-2">
            {group.items.map((a) => (
              <Link
                key={a.slug}
                href={`/daily/${a.slug}`}
                className="group flex flex-col rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-violet-500/40 hover:shadow-lg hover:shadow-violet-600/5"
              >
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <time dateTime={a.day}>{formatDate(lang, `${a.day}T00:00:00Z`)}</time>
                  <span className="text-violet-600 dark:text-violet-400">{t.cats[a.category as keyof typeof t.cats] || a.category}</span>
                  {(isFa ? a.tagsFa : a.tagsEn).slice(0, 3).map((tg) => (
                    <span key={tg}>#{tg}</span>
                  ))}
                </div>

                <h3 className="mt-2 text-lg font-bold leading-snug transition-colors group-hover:text-violet-600 dark:group-hover:text-violet-400">
                  {pick(a.titleEn, a.titleFa)}
                </h3>
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                  {pick(a.summaryEn, a.summaryFa)}
                </p>

                <span className="mt-auto inline-flex items-center gap-1 pt-3 text-sm font-medium text-violet-600 dark:text-violet-400">
                  {t.readMore}
                  {isFa ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                </span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
