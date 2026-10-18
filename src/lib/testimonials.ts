/**
 * Testimonials — phase 2 credibility (2026-10-18).
 *
 * OWNER INSTRUCTIONS: add ONLY real, verifiable quotes — one object per
 * quote, with the person's actual name/role and (when possible) a source
 * link (email thread, LinkedIn post, product review). A quote without a
 * traceable source must NOT be added: this site's credibility strategy is
 * honesty, and one fabricated testimonial costs more than zero testimonials.
 *
 * Suggested real sources to collect from (phase 2 owner tasks):
 *   - Koko players' feedback (app reviews, support emails)
 *   - MVP Sprint scope-call follow-ups ("you leave with a written scope")
 *   - Past collaboration partners (health-app, agency work)
 *
 * The <Testimonials /> component renders NOTHING while this array is
 * empty — no empty section shells in production. The moment the first
 * real quote lands here, it appears on /about and the Koko case study.
 */

export interface Testimonial {
  /** The quote, verbatim. */
  quoteEn: string;
  /** The quote in Persian — only if the person actually said it in Persian; otherwise leave '' and the EN is shown. */
  quoteFa: string;
  author: string;
  roleEn: string;
  roleFa: string;
  /** Optional public URL backing the quote (LinkedIn, review page, published post). */
  sourceUrl?: string;
}

export const testimonials: Testimonial[] = [];
