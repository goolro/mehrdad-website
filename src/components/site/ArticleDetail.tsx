'use client';

/**
 * Full daily-article page body (/daily/[slug]) — the bilingual editorial:
 * summary box + full article + expert-verdict box + internal related
 * links. Everything is server-sanitized HTML arriving as props; the
 * component only picks the language and lays it out. No outbound links:
 * the section exists to publish the owner's own analysis.
 */

import Link from 'next/link';
import { useApp, formatDate, pick } from './store';
import { ui } from './i18n';
import { ShareBar } from './ShareBar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, ChevronRight, GraduationCap, ListOrdered } from 'lucide-react';

export interface DailyArticleFull {
  slug: string;
  day: string;
  titleEn: string;
  titleFa: string;
  summaryEn: string;
  summaryFa: string;
  bodyEn: string; // sanitized on the server before passing here
  bodyFa: string;
  verdictEn: string;
  verdictFa: string;
  tagsEn: string[];
  tagsFa: string[];
}

export function DailyArticleDetail({
  article,
  related,
}: {
  article: DailyArticleFull;
  related: { slug: string; day: string; titleEn: string; titleFa: string }[];
}) {
  const { lang } = useApp();
  const t = (ui[lang] as typeof ui.en).daily;
  const isFa = lang === 'fa';

  const title = pick(lang, article.titleEn, article.titleFa);
  const altTitle = isFa ? article.titleEn : article.titleFa;
  const summary = pick(lang, article.summaryEn, article.summaryFa);
  const body = isFa ? article.bodyFa : article.bodyEn;
  const verdict = isFa ? article.verdictFa : article.verdictEn;
  const tags = isFa ? article.tagsFa : article.tagsEn;

  return (
    <article className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
      {/* breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 pt-8 text-sm text-muted-foreground">
        <Link href="/daily" className="transition-colors hover:text-foreground">
          {t.back}
        </Link>
        <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden="true" />
        <span className="truncate text-foreground/80">{title}</span>
      </nav>

      <header className="mt-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <time dateTime={article.day}>{formatDate(lang, `${article.day}T00:00:00Z`)}</time>
          {tags.slice(0, 4).map((tg) => (
            <span key={tg}>#{tg}</span>
          ))}
        </div>
        <h1 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">{title}</h1>
        {/* the other language's headline — the section is bilingual by design */}
        <p className="mt-2 text-sm text-muted-foreground" dir={isFa ? 'ltr' : 'rtl'}>
          {altTitle}
        </p>
      </header>

      {/* summary — the requested خلاصه, visually separated from the body */}
      <aside
        aria-label={t.summary}
        className="mt-6 rounded-2xl border border-border bg-muted/40 p-4 sm:p-5"
      >
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <ListOrdered className="h-4 w-4" aria-hidden="true" />
          {t.summary}
        </div>
        <p className="mt-2 text-sm leading-relaxed text-foreground/90" dir={isFa ? 'rtl' : 'ltr'}>
          {summary}
        </p>
      </aside>

      {/* full article body */}
      <div className="prose-blog mt-8" dir={isFa ? 'rtl' : 'ltr'} dangerouslySetInnerHTML={{ __html: body }} />

      {/* expert verdict — the requested نظر کارشناسی in its own box */}
      <section
        aria-label={t.verdict}
        className="mt-10 rounded-2xl border border-violet-500/40 bg-violet-500/5 p-4 sm:p-6"
      >
        <div className="flex items-center gap-2 text-sm font-bold text-violet-700 dark:text-violet-300">
          <GraduationCap className="h-5 w-5" aria-hidden="true" />
          {t.verdict}
        </div>
        <div className="prose-blog mt-2" dir={isFa ? 'rtl' : 'ltr'} dangerouslySetInnerHTML={{ __html: verdict }} />
      </section>

      {/* tags as real badges for scannability */}
      {tags.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2">
          {tags.map((tg) => (
            <Badge key={tg} variant="outline" className="border-fuchsia-500/30 text-fuchsia-700 dark:text-fuchsia-300">
              #{tg}
            </Badge>
          ))}
        </div>
      )}

      <div className="mt-8 border-y border-border py-4">
        <ShareBar title={title} label={(ui[lang] as typeof ui.en).common.shareArticle} />
      </div>

      {related.length > 0 && (
        <div className="mt-12 border-t border-border pt-8">
          <h2 className="text-xl font-bold">{t.related}</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {related.map((r) => (
              <Link
                key={r.slug}
                href={`/daily/${r.slug}`}
                className="group block rounded-xl border border-border bg-card p-3 text-start transition-colors hover:border-violet-500/50"
              >
                <div className="text-xs text-muted-foreground">{formatDate(lang, `${r.day}T00:00:00Z`)}</div>
                <div className="mt-1 line-clamp-2 text-sm font-semibold transition-colors group-hover:text-violet-600 dark:group-hover:text-violet-400">
                  {pick(lang, r.titleEn, r.titleFa)}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-10">
        <Link
          href="/daily"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-violet-600 transition-colors hover:text-violet-500 dark:text-violet-400"
        >
          {isFa ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
          {t.back}
        </Link>
      </div>
    </article>
  );
}
