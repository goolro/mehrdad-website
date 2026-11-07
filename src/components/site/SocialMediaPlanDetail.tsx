import Link from 'next/link';
import { Check, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { PLANS, SECTION_UI, PLAN_SLUGS, type Lang, type SocialPlanId } from './social-media-plans-data';

/**
 * Standalone detail page for one social-media plan (owner request
 * 2026-11-07: «برای هر قسمت توضیحات هم صفحات جدا باید باشه») — the full
 * «توضیحات بیشتر» copy promoted to its own crawlable URL in BOTH language
 * trees (/fa/social-media/[plan] · /social-media/[plan]). Server component:
 * everything ships in the prerendered HTML. Breadcrumb + sibling-plan links
 * + back-to-plans link keep the internal link graph tight for SEO.
 */

const WA = 'https://wa.me/989103500310';
const wa = (msg: string) => `${WA}?text=${encodeURIComponent(msg)}`;

const detailHref = (lang: Lang, id: SocialPlanId) =>
  `${lang === 'fa' ? '/fa' : ''}/social-media/${PLAN_SLUGS[id]}`;

const mainHref = (lang: Lang) => `${lang === 'fa' ? '/fa' : ''}/social-media`;

export function SocialMediaPlanDetail({ lang, planId }: { lang: Lang; planId: SocialPlanId }) {
  const ui = SECTION_UI[lang];
  const plan = PLANS[lang][planId];
  const BackArrow = lang === 'fa' ? ArrowRight : ArrowLeft;
  const ForwardArrow = lang === 'fa' ? ArrowLeft : ArrowRight;

  return (
    <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16" aria-labelledby="sm-plan-title">
      {/* breadcrumb (visible + mirrored in JSON-LD by the page) */}
      <nav aria-label={lang === 'fa' ? 'مسیر صفحه' : 'Breadcrumb'} className="mb-6 text-[13px] text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href={lang === 'fa' ? '/fa' : '/'} className="transition-colors hover:text-foreground">
              {ui.breadcrumbHome}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href={mainHref(lang)} className="transition-colors hover:text-foreground">
              {ui.breadcrumbPlans}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="font-medium text-foreground">{plan.name}</li>
        </ol>
      </nav>

      <h1 id="sm-plan-title" className="text-3xl font-extrabold leading-snug sm:text-4xl">
        {plan.detail.h1}
      </h1>
      <p className="mt-3 text-[16px] leading-8 text-muted-foreground">{plan.detail.intro}</p>

      {/* قیمت + خرید */}
      <div className="mt-8 flex flex-col items-start gap-5 rounded-3xl border border-violet-500/40 bg-gradient-to-b from-violet-500/10 to-card p-7 shadow-[0_0_44px_rgba(124,58,237,0.15)] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm font-bold text-violet-600 dark:text-violet-400">{plan.name}</div>
          <p className="mt-1 flex items-baseline gap-2">
            <b className="text-[40px] font-extrabold leading-none" dir="ltr">{plan.price}</b>
            <span className="text-[13px] text-muted-foreground">{ui.perMonth}</span>
          </p>
        </div>
        <a
          href={wa(plan.waMsg)}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full rounded-xl bg-gradient-to-l from-violet-600 to-violet-500 py-3.5 text-center text-[16px] font-bold text-white shadow-[0_0_28px_rgba(124,58,237,0.4)] ring-2 ring-violet-400/60 transition-all hover:brightness-110 hover:shadow-[0_0_36px_rgba(124,58,237,0.55)] sm:w-auto sm:px-10"
        >
          {plan.cta}
        </a>
      </div>

      {/* امکانات */}
      <h2 className="mt-10 text-xl font-extrabold">{lang === 'fa' ? 'امکانات پلن' : 'What the plan includes'}</h2>
      <ul className="mt-4 grid grid-cols-1 gap-x-8 sm:grid-cols-2">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 py-[7px] text-sm leading-7 text-foreground/90">
            <Check className="mt-2 h-4 w-4 shrink-0 text-violet-500" strokeWidth={3} aria-hidden="true" />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      {/* توضیحات کامل — بدنهٔ اصلی صفحه */}
      <div className="mt-10 space-y-4">
        {plan.detail.sections.map((s) => (
          <div key={s.h} className="rounded-3xl border border-border bg-card p-7">
            <h2 className="text-lg font-extrabold text-violet-600 dark:text-violet-400">{s.h}</h2>
            <p className="mt-2.5 text-[15px] leading-9 text-foreground/85">{s.p}</p>
          </div>
        ))}
        <div className="flex items-center gap-3 rounded-3xl border border-violet-500/25 bg-violet-500/5 p-6">
          <ShieldCheck className="h-6 w-6 shrink-0 text-violet-500" aria-hidden="true" />
          <p className="text-[14.5px] font-medium leading-8 text-foreground/85">
            <b>{lang === 'fa' ? 'شرایط: ' : 'Terms: '}</b>
            {plan.detail.terms}
          </p>
        </div>
      </div>

      {/* پلن‌های دیگر */}
      <h2 className="mt-12 text-lg font-extrabold">{ui.otherPlans}</h2>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {Object.values(PLANS[lang])
          .filter((p) => p.id !== planId)
          .map((p) => (
            <Link
              key={p.id}
              href={detailHref(lang, p.id)}
              className="group rounded-2xl border border-border bg-card p-5 transition-colors hover:border-violet-500/40"
            >
              <div className="flex items-center justify-between">
                <b className="font-extrabold">{p.name}</b>
                <b className="text-violet-600 dark:text-violet-400" dir="ltr">{p.price}</b>
              </div>
              <p className="mt-1.5 line-clamp-2 text-[13px] leading-6 text-muted-foreground">{p.tag}</p>
              <span className="mt-2 inline-flex items-center gap-1 text-[12.5px] font-bold text-violet-600 dark:text-violet-400">
                {plan.detailsCta}
                <ForwardArrow className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5 rtl:group-hover:-translate-x-0.5 ltr:group-hover:translate-x-0.5" aria-hidden="true" />
              </span>
            </Link>
          ))}
      </div>

      <Link
        href={mainHref(lang)}
        className="mt-8 inline-flex items-center gap-1.5 text-[14px] font-bold text-violet-600 transition-colors hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
      >
        <BackArrow className="h-4 w-4" aria-hidden="true" />
        {ui.backToPlans}
      </Link>
      <p className="mt-8 text-center text-xs leading-7 text-muted-foreground">{ui.note}</p>
    </section>
  );
}
