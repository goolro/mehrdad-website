'use client';

import { useLang } from './lang-context';
import { ui } from './i18n';
import { Quote } from 'lucide-react';
import { testimonials } from '@/lib/testimonials';

/**
 * Testimonials section — conditional by design: renders NOTHING until at
 * least one real, source-backed quote exists in src/lib/testimonials.ts.
 * No fake quotes, no empty shells (phase 2 honesty rule).
 */
export function Testimonials() {
  const lang = useLang();
  const t = ui[lang];
  const fa = lang === 'fa';
  const rtl = fa ? 'rtl' : 'ltr';

  if (testimonials.length === 0) return null;

  return (
    <section className="mt-12" aria-labelledby="testimonials-title">
      <h2 id="testimonials-title" className="text-2xl font-bold" dir={rtl}>
        {t.caseStudy.testimonialsTitle}
      </h2>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {testimonials.map((tm) => (
          <figure key={tm.author} className="rounded-2xl border border-border bg-card p-5" dir={rtl}>
            <Quote className="h-4 w-4 text-violet-500" aria-hidden />
            <blockquote className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {fa && tm.quoteFa ? tm.quoteFa : tm.quoteEn}
            </blockquote>
            <figcaption className="mt-3 text-sm font-semibold">
              {tm.author}
              <span className="ms-1.5 font-normal text-muted-foreground">{fa ? tm.roleFa : tm.roleEn}</span>
              {tm.sourceUrl ? (
                <a
                  href={tm.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ms-2 text-xs font-normal text-violet-600 underline-offset-2 hover:underline dark:text-violet-400"
                >
                  {t.caseStudy.testimonialsSource}
                </a>
              ) : null}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
