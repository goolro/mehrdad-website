import Link from 'next/link';
import { Check, ArrowLeft, ArrowRight, ShieldCheck, Zap, UserCheck, TrendingUp } from 'lucide-react';
import { PLANS, SECTION_UI, PLAN_SLUGS, type Lang, type SocialPlanId } from './social-media-plans-data';

/**
 * Standalone detail page for one social-media plan (owner request
 * 2026-11-07: «برای هر قسمت توضیحات هم صفحات جدا باید باشه») — the full
 * «توضیحات بیشتر» copy promoted to its own crawlable URL in BOTH language
 * trees (/fa/social-media/[plan] · /social-media/[plan]). Server component:
 * everything ships in the prerendered HTML.
 *
 * ui-ux-pro-max design pass: buy-box card (price + gradient CTA + terms)
 * first on mobile (DOM-first aside) and a sticky sidebar on desktop
 * (lg:order swap), frosted-glass buy box (glassmorphism row, rtl_level:
 * full), CTA gradient darkened to violet-700→violet-600 so white text
 * keeps ≥4.5:1 contrast on the fill, focus-visible outlines, text-balance
 * headings, numbered explainer sections, sibling plan cards. Breadcrumb +
 * sibling links + back link keep the internal link graph tight for SEO.
 * Copy unchanged from the owner-approved tariff panel.
 */

const WA = 'https://wa.me/989103500310';
const wa = (msg: string) => `${WA}?text=${encodeURIComponent(msg)}`;

const detailHref = (lang: Lang, id: SocialPlanId) =>
  `${lang === 'fa' ? '/fa' : ''}/social-media/${PLAN_SLUGS[id]}`;

const mainHref = (lang: Lang) => `${lang === 'fa' ? '/fa' : ''}/social-media`;

/** white-on-fill ≥ 4.5:1 across the whole gradient (skill CTA contrast rule) */
const CTA_GRAD = 'bg-gradient-to-l from-violet-700 via-violet-600 to-violet-600';
const CTA_FOCUS = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400';

const PLAN_ICONS = { auto: Zap, companion: UserCheck, business: TrendingUp } as const;

export function SocialMediaPlanDetail({ lang, planId }: { lang: Lang; planId: SocialPlanId }) {
  const ui = SECTION_UI[lang];
  const plan = PLANS[lang][planId];
  const BackArrow = lang === 'fa' ? ArrowRight : ArrowLeft;
  const ForwardArrow = lang === 'fa' ? ArrowLeft : ArrowRight;
  const PlanIcon = PLAN_ICONS[planId];
  const isFa = lang === 'fa';

  return (
    <section className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16" aria-labelledby="sm-plan-title">
      {/* hero glow backdrop — vibrant bg behind the frosted panels */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[380px] overflow-hidden">
        <div className={`absolute ${isFa ? 'end-[10%]' : 'start-[10%]'} top-0 h-64 w-64 rounded-full bg-violet-600/25 blur-[130px]`} />
        <div className={`absolute ${isFa ? 'start-[20%]' : 'end-[20%]'} top-24 h-52 w-52 rounded-full bg-fuchsia-500/15 blur-[110px]`} />
      </div>

      <div className="relative">
        {/* breadcrumb (visible + mirrored in JSON-LD by the page) */}
        <nav aria-label={isFa ? 'مسیر صفحه' : 'Breadcrumb'} className="mb-7 text-[13px] text-muted-foreground">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href={isFa ? '/fa' : '/'} className={`rounded transition-colors hover:text-foreground ${CTA_FOCUS}`}>
                {ui.breadcrumbHome}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href={mainHref(lang)} className={`rounded transition-colors hover:text-foreground ${CTA_FOCUS}`}>
                {ui.breadcrumbPlans}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="font-medium text-foreground">{plan.name}</li>
          </ol>
        </nav>

        {/* معرفی — تمام‌عرض (موبایل: قبل از جعبهٔ خرید) */}
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-600 dark:text-violet-400">
            <PlanIcon className="h-6 w-6" aria-hidden="true" />
          </span>
          <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-3.5 py-1 text-[12.5px] font-bold text-violet-600 dark:text-violet-300">
            {plan.name}
            {plan.hot ? (isFa ? ' · پیشنهاد ما' : ' · Our pick') : ''}
          </span>
        </div>
        <h1 id="sm-plan-title" className="mt-5 text-3xl font-extrabold leading-snug text-balance sm:text-4xl">
          {plan.detail.h1}
        </h1>
        <p className="mt-3 max-w-2xl text-[16px] leading-8 text-muted-foreground">{plan.detail.intro}</p>

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* جعبهٔ خرید — DOM اول ⇒ در موبایل بلافاصله بعد از معرفی می‌آید؛
              در دسکتاپ با lg:order-2 ستون کناری چسبان می‌شود */}
          <aside className="self-start lg:order-2 lg:sticky lg:top-24">
            <div className="rounded-[25px] bg-gradient-to-b from-violet-500/70 via-violet-500/25 to-violet-500/10 p-px shadow-[0_0_55px_rgba(124,58,237,0.28)]">
              <div className="rounded-[24px] bg-gradient-to-b from-violet-500/[0.16] to-card/75 p-6 backdrop-blur-xl">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-violet-600 dark:text-violet-400">
                    <PlanIcon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="text-sm font-bold text-violet-600 dark:text-violet-400">
                    {plan.name}
                    {plan.hot ? (isFa ? ' · پیشنهاد ما' : ' · Our pick') : ''}
                  </div>
                </div>
                <p className="mt-3 flex items-baseline gap-2">
                  <b className="text-[42px] font-extrabold leading-none tracking-tight" dir="ltr">{plan.price}</b>
                  <span className="text-[13px] text-muted-foreground">{ui.perMonth}</span>
                </p>
                <a
                  href={wa(plan.waMsg)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`mt-5 block rounded-xl ${CTA_GRAD} py-3.5 text-center text-[15px] font-bold text-white shadow-[0_0_28px_rgba(124,58,237,0.4)] ring-2 ring-violet-400/60 transition-all hover:brightness-110 hover:shadow-[0_0_36px_rgba(124,58,237,0.55)] motion-reduce:transition-none ${CTA_FOCUS}`}
                >
                  {plan.cta}
                </a>
                <p className="mt-4 flex items-start gap-2 text-[12.5px] leading-6 text-muted-foreground">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-violet-500" aria-hidden="true" />
                  {plan.detail.terms}
                </p>
              </div>
            </div>
          </aside>

          {/* ستون اصلی */}
          <div className="lg:order-1">
            {/* امکانات */}
            <h2 className="text-xl font-extrabold">{isFa ? 'امکانات پلن' : 'What the plan includes'}</h2>
            <ul className="mt-4 grid grid-cols-1 gap-x-8 rounded-3xl border border-black/[0.07] bg-card/75 p-6 backdrop-blur-xl sm:grid-cols-2 sm:p-7 dark:border-white/10">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 py-[7px] text-sm leading-7 text-foreground/90">
                  <span className="mt-1.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-violet-500/15" aria-hidden="true">
                    <Check className="h-3 w-3 text-violet-500" strokeWidth={3.5} />
                  </span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            {/* توضیحات کامل — بدنهٔ اصلی صفحه، مرحله‌شماری‌شده */}
            <div className="mt-10 space-y-4">
              {plan.detail.sections.map((s, i) => (
                <div key={s.h} className="rounded-3xl border border-black/[0.07] bg-card/75 p-7 backdrop-blur-xl dark:border-white/10">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-sm font-extrabold text-violet-600 dark:text-violet-400">
                      {i + 1}
                    </span>
                    <h2 className="text-lg font-extrabold">{s.h}</h2>
                  </div>
                  <p className="mt-3 text-[15px] leading-9 text-foreground/85">{s.p}</p>
                </div>
              ))}
              <div className="flex items-center gap-3 rounded-3xl border border-violet-500/25 bg-violet-500/5 p-6">
                <ShieldCheck className="h-6 w-6 shrink-0 text-violet-500" aria-hidden="true" />
                <p className="text-[14.5px] font-medium leading-8 text-foreground/85">
                  <b>{isFa ? 'شرایط: ' : 'Terms: '}</b>
                  {plan.detail.terms}
                </p>
              </div>
            </div>

            {/* پلن‌های دیگر */}
            <h2 className="mt-12 text-lg font-extrabold">{ui.otherPlans}</h2>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {Object.values(PLANS[lang])
                .filter((p) => p.id !== planId)
                .map((p) => {
                  const Icon = PLAN_ICONS[p.id];
                  return (
                    <Link
                      key={p.id}
                      href={detailHref(lang, p.id)}
                      className={`group rounded-2xl border border-black/[0.07] bg-card/75 p-5 backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-violet-500/40 motion-reduce:transition-none motion-reduce:hover:translate-y-0 dark:border-white/10 ${CTA_FOCUS}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2.5">
                          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/15 text-violet-600 dark:text-violet-400">
                            <Icon className="h-4 w-4" aria-hidden="true" />
                          </span>
                          <b className="font-extrabold">{p.name}</b>
                        </span>
                        <b className="text-violet-600 dark:text-violet-400" dir="ltr">{p.price}</b>
                      </div>
                      <p className="mt-2 line-clamp-2 text-[13px] leading-6 text-muted-foreground">{p.tag}</p>
                      <span className="mt-2 inline-flex items-center gap-1 text-[12.5px] font-bold text-violet-600 dark:text-violet-400">
                        {plan.detailsCta}
                        <ForwardArrow className="h-3.5 w-3.5 transition-transform rtl:group-hover:-translate-x-0.5 ltr:group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden="true" />
                      </span>
                    </Link>
                  );
                })}
            </div>

            <Link
              href={mainHref(lang)}
              className={`mt-8 inline-flex items-center gap-1.5 text-[14px] font-bold text-violet-600 transition-colors hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 ${CTA_FOCUS}`}
            >
              <BackArrow className="h-4 w-4" aria-hidden="true" />
              {ui.backToPlans}
            </Link>
          </div>
        </div>

        <p className="mt-10 text-center text-xs leading-7 text-muted-foreground">{ui.note}</p>
      </div>
    </section>
  );
}
