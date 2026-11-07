import Link from 'next/link';
import { Check, ArrowLeft, ArrowRight, ShieldCheck, Zap, UserCheck, TrendingUp } from 'lucide-react';
import { PLANS, SECTION_UI, PLAN_SLUGS, type Lang, type SocialPlanId } from './social-media-plans-data';

/**
 * Standalone detail page for one social-media plan — its own crawlable URL
 * in BOTH language trees (/fa/social-media/[plan] · /social-media/[plan]).
 *
 * Owner feedback 2026-11-08 («توضیحات بیشتر باید توی صفحه جدیدی باز بشه…
 * باکس‌ها کوچکتر و مختصرتر… ۶ باکس بالا باید تعریف می‌کردی»):
 * - the page is a genuinely NEW read, not a continuation of the plan card:
 *   fresh intro text + every feature box carries a one-line definition
 *   (featureNotes) — nothing is repeated verbatim from the tariff panel;
 * - all boxes compact: tight paddings, smaller type, sections collapsed
 *   into one divided card, terms live only in the buy box (no duplicate).
 * Server component: everything ships in the prerendered HTML. Breadcrumb +
 * sibling links + back link keep the internal link graph tight for SEO.
 */

const WA = 'https://wa.me/989103500310';
const wa = (msg: string) => `${WA}?text=${encodeURIComponent(msg)}`;

const detailHref = (lang: Lang, id: SocialPlanId) =>
  `${lang === 'fa' ? '/fa' : ''}/social-media/${PLAN_SLUGS[id]}`;

const mainHref = (lang: Lang) => `${lang === 'fa' ? '/fa' : ''}/social-media`;

/** white-on-fill ≥ 4.5:1 across the whole gradient (skill CTA contrast rule) */
const CTA_GRAD = 'bg-gradient-to-l from-violet-700 via-violet-600 to-violet-600';
const CTA_FOCUS = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400';
const GLASS = 'border-black/[0.07] bg-card/75 backdrop-blur-xl dark:border-white/10';

const PLAN_ICONS = { auto: Zap, companion: UserCheck, business: TrendingUp } as const;

export function SocialMediaPlanDetail({ lang, planId }: { lang: Lang; planId: SocialPlanId }) {
  const ui = SECTION_UI[lang];
  const plan = PLANS[lang][planId];
  const BackArrow = lang === 'fa' ? ArrowRight : ArrowLeft;
  const ForwardArrow = lang === 'fa' ? ArrowLeft : ArrowRight;
  const PlanIcon = PLAN_ICONS[planId];
  const isFa = lang === 'fa';

  return (
    <section className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12" aria-labelledby="sm-plan-title">
      {/* hero glow backdrop — vibrant bg behind the frosted panels */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[320px] overflow-hidden">
        <div className={`absolute ${isFa ? 'end-[10%]' : 'start-[10%]'} top-0 h-56 w-56 rounded-full bg-violet-600/25 blur-[120px]`} />
        <div className={`absolute ${isFa ? 'start-[20%]' : 'end-[20%]'} top-20 h-48 w-48 rounded-full bg-fuchsia-500/15 blur-[100px]`} />
      </div>

      <div className="relative">
        {/* breadcrumb (visible + mirrored in JSON-LD by the page) */}
        <nav aria-label={isFa ? 'مسیر صفحه' : 'Breadcrumb'} className="mb-6 text-[13px] text-muted-foreground">
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

        {/* معرفی — متن تازهٔ این صفحه، تکرارِ کارت تعرفه نیست */}
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-violet-600 dark:text-violet-400">
            <PlanIcon className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-[12px] font-bold text-violet-600 dark:text-violet-300">
            {plan.name}
            {plan.hot ? (isFa ? ' · پیشنهاد ما' : ' · Our pick') : ''}
          </span>
        </div>
        <h1 id="sm-plan-title" className="mt-4 text-2xl font-extrabold leading-snug text-balance sm:text-3xl">
          {plan.detail.h1}
        </h1>
        <p className="mt-2.5 max-w-3xl text-[15px] leading-8 text-muted-foreground">{plan.detail.intro}</p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
          {/* جعبهٔ خرید — DOM اول ⇒ در موبایل بلافاصله بعد از معرفی می‌آید؛
              در دسکتاپ با lg:order-2 ستون کناری چسبان می‌شود */}
          <aside className="self-start lg:order-2 lg:sticky lg:top-24">
            <div className="rounded-[22px] bg-gradient-to-b from-violet-500/70 via-violet-500/25 to-violet-500/10 p-px shadow-[0_0_44px_rgba(124,58,237,0.25)]">
              <div className={`rounded-[21px] bg-gradient-to-b from-violet-500/[0.14] to-card/80 p-5 backdrop-blur-xl`}>
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-violet-600 dark:text-violet-400">
                    <PlanIcon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div className="text-[13px] font-bold text-violet-600 dark:text-violet-400">
                    {plan.name}
                    {plan.hot ? (isFa ? ' · پیشنهاد ما' : ' · Our pick') : ''}
                  </div>
                </div>
                <p className="mt-2.5 flex items-baseline gap-2">
                  <b className="text-[34px] font-extrabold leading-none tracking-tight" dir="ltr">{plan.price}</b>
                  <span className="text-[12.5px] text-muted-foreground">{ui.perMonth}</span>
                </p>
                <a
                  href={wa(plan.waMsg)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`mt-4 block rounded-xl ${CTA_GRAD} py-3 text-center text-[14.5px] font-bold text-white shadow-[0_0_24px_rgba(124,58,237,0.38)] ring-2 ring-violet-400/60 transition-all hover:brightness-110 hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] motion-reduce:transition-none ${CTA_FOCUS}`}
                >
                  {plan.cta}
                </a>
                <p className="mt-3 flex items-start gap-1.5 text-[12px] leading-5 text-muted-foreground">
                  <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-500" aria-hidden="true" />
                  {plan.detail.terms}
                </p>
              </div>
            </div>
          </aside>

          {/* ستون اصلی — برگهٔ مشخصات فشرده */}
          <div className="lg:order-1">
            {/* امکانات — هر باکس: عنوان + تعریف یک‌خطی (درخواست مالک) */}
            <h2 className="text-base font-extrabold">{isFa ? 'امکانات پلن' : 'What the plan includes'}</h2>
            <ul className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {plan.features.map((f, i) => (
                <li key={f} className={`rounded-2xl border p-3.5 ${GLASS}`}>
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-violet-500/15" aria-hidden="true">
                      <Check className="h-3 w-3 text-violet-500" strokeWidth={3.5} />
                    </span>
                    <b className="text-[13px] font-bold leading-6 text-foreground">{f}</b>
                  </div>
                  <p className="mt-1 ps-[26px] text-[12.5px] leading-6 text-muted-foreground">
                    {plan.featureNotes[i]}
                  </p>
                </li>
              ))}
            </ul>

            {/* توضیحات — یک کارت واحد با ردیف‌های جدا‌شده؛ خیلی جمع‌وجورتر از جعبه‌های جدا */}
            <div className={`mt-6 divide-y divide-black/[0.06] rounded-3xl border dark:divide-white/[0.07] ${GLASS}`}>
              {plan.detail.sections.map((s, i) => (
                <div key={s.h} className="p-4 sm:p-5">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-[12px] font-extrabold text-violet-600 dark:text-violet-400">
                      {i + 1}
                    </span>
                    <h2 className="text-[15px] font-extrabold">{s.h}</h2>
                  </div>
                  <p className="mt-1.5 ps-[34px] text-[13.5px] leading-7 text-foreground/80">{s.p}</p>
                </div>
              ))}
            </div>

            {/* پلن‌های دیگر */}
            <h2 className="mt-8 text-base font-extrabold">{ui.otherPlans}</h2>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {Object.values(PLANS[lang])
                .filter((p) => p.id !== planId)
                .map((p) => {
                  const Icon = PLAN_ICONS[p.id];
                  return (
                    <Link
                      key={p.id}
                      href={detailHref(lang, p.id)}
                      className={`group rounded-2xl border p-4 transition-colors hover:border-violet-500/40 dark:border-white/10 ${GLASS} ${CTA_FOCUS}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/15 text-violet-600 dark:text-violet-400">
                            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                          </span>
                          <b className="text-[14px] font-extrabold">{p.name}</b>
                        </span>
                        <b className="text-[14px] font-extrabold text-violet-600 dark:text-violet-400" dir="ltr">{p.price}</b>
                      </div>
                      <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-6 text-muted-foreground">{p.tag}</p>
                      <span className="mt-1.5 inline-flex items-center gap-1 text-[12px] font-bold text-violet-600 dark:text-violet-400">
                        {plan.detailsCta}
                        <ForwardArrow className="h-3.5 w-3.5 transition-transform rtl:group-hover:-translate-x-0.5 ltr:group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden="true" />
                      </span>
                    </Link>
                  );
                })}
            </div>

            <Link
              href={mainHref(lang)}
              className={`mt-6 inline-flex items-center gap-1.5 text-[13.5px] font-bold text-violet-600 transition-colors hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 ${CTA_FOCUS}`}
            >
              <BackArrow className="h-4 w-4" aria-hidden="true" />
              {ui.backToPlans}
            </Link>
          </div>
        </div>

        <p className="mt-8 text-center text-xs leading-6 text-muted-foreground">{ui.note}</p>
      </div>
    </section>
  );
}
