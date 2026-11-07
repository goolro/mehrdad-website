import Link from 'next/link';
import {
  Check,
  ShieldCheck,
  BarChart3,
  Zap,
  CreditCard,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Network,
  UserPlus,
  ShieldPlus,
  UserCheck,
  TrendingUp,
  ChevronDown,
  Minus,
} from 'lucide-react';
import {
  PLANS,
  SECTION_UI,
  PLAN_SLUGS,
  SOCIAL_PLANS,
  COMPARE_UI,
  COMPARE_ROWS,
  FAQ,
  FINAL_CTA,
  type Lang,
  type CompareCell,
} from './social-media-plans-data';

/**
 * Social-media plans panel — bilingual (owner request 2026-11-07: «دو صفحه
 * باید جدا بسازی با صفحات داخلی جداگانه برای هر زبان…»). One component,
 * `lang` prop decides the copy: renders under the (fa) root layout
 * (dir=rtl) and the (site) root layout (dir=ltr) — separate routes, separate
 * copy, one approved design.
 *
 * Redesign driven by the ui-ux-pro-max skill (owner request 2026-11-07):
 * - pricing-page-cta pattern → section order: hero → plan cards → comparison
 *   table → network/setup extras → FAQ → final CTA (all FAQ/table strings
 *   composed from owner-approved facts only).
 * - glassmorphism style row (rtl_level: full) → frosted cards: bg-card/75 +
 *   backdrop-blur + subtle 1px border, violet glow behind.
 * - CTA contrast rule (≥4.5:1 on button fill) → buy gradient darkened to
 *   violet-700→violet-600 (white text = 7.1:1 / 5.7:1; the old violet-500
 *   end was 4.23:1).
 * - a11y: focus-visible outlines on every link/CTA, motion-reduce guards,
 *   text-balance headings, native <details> FAQ (zero client JS).
 * - sticky-CTA-in-nav suggestion skipped on purpose: the site's floating
 *   MiroFish button occupies that corner; final CTA band covers the
 *   "bottom CTA" slot instead.
 * Copy stays 1:1 with the owner-approved tariff panel. Server component,
 * zero client JS; CTAs deep-link to WhatsApp with prefilled messages.
 *
 * Owner feedback 2026-11-08 («باکس‌ها کوچکتر و مختصرتر… توضیحات بیشتر
 * باید توی صفحه جدیدی باز بشه»): whole panel compacted (tighter paddings,
 * smaller type) and every «توضیحات بیشتر» link now opens the plan's own
 * page in a NEW TAB so the tariff panel stays open.
 */

const WA = 'https://wa.me/989103500310';
const wa = (msg: string) => `${WA}?text=${encodeURIComponent(msg)}`;

const detailHref = (lang: Lang, id: 'auto' | 'companion' | 'business') =>
  `${lang === 'fa' ? '/fa' : ''}/social-media/${PLAN_SLUGS[id]}`;

/** white-on-fill ≥ 4.5:1 across the whole gradient (skill CTA contrast rule) */
const CTA_GRAD =
  'bg-gradient-to-l from-violet-700 via-violet-600 to-violet-600';
const CTA_FOCUS = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400';
const GLASS = 'border-black/[0.07] bg-card/75 backdrop-blur-xl dark:border-white/10';

const PLAN_ICONS = { auto: Zap, companion: UserCheck, business: TrendingUp } as const;
const TRUST_ICONS = [ShieldCheck, BarChart3, Zap, CreditCard] as const;
/** indices into ui.trust surfaced as hero guarantee chips (same approved copy) */
const HERO_TRUST = [2, 0, 3] as const;

function CompareCellView({ cell }: { cell: CompareCell }) {
  if (cell === true)
    return (
      <span className="inline-flex h-[19px] w-[19px] items-center justify-center rounded-full bg-violet-500/15" aria-hidden="true">
        <Check className="h-3 w-3 text-violet-500" strokeWidth={3.5} />
      </span>
    );
  if (cell === false)
    return (
      <span className="inline-flex text-muted-foreground/50" aria-hidden="true">
        <Minus className="h-3.5 w-3.5" strokeWidth={2.5} />
      </span>
    );
  return <span className="text-[11.5px] font-medium leading-5 text-foreground/80">{cell}</span>;
}

export function SocialMediaPlans({ lang }: { lang: Lang }) {
  const ui = SECTION_UI[lang];
  const plans = PLANS[lang];
  const ForwardArrow = lang === 'fa' ? ArrowLeft : ArrowRight;
  const isFa = lang === 'fa';
  const cmpUi = COMPARE_UI[lang];

  return (
    <section className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12" aria-labelledby="sm-plans-title">
      {/* hero glow backdrop — glassmorphism needs a vibrant background behind the blur */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[560px] overflow-hidden">
        <div className={`absolute ${isFa ? 'end-[6%]' : 'start-[6%]'} top-6 h-72 w-72 rounded-full bg-violet-600/25 blur-[130px]`} />
        <div className={`absolute ${isFa ? 'start-[16%]' : 'end-[16%]'} top-40 h-64 w-64 rounded-full bg-fuchsia-500/15 blur-[120px]`} />
      </div>

      <div className="relative">
        {/* breadcrumb (owner request: کاربر بدونه کجاست و بتونه برگرده) */}
        <nav aria-label={isFa ? 'مسیر صفحه' : 'Breadcrumb'} className="mb-6 text-[13px] text-muted-foreground">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href={isFa ? '/fa' : '/'} className={`rounded transition-colors hover:text-foreground ${CTA_FOCUS}`}>
                {ui.breadcrumbHome}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="font-medium text-foreground">{ui.breadcrumbPlans}</li>
          </ol>
        </nav>

        {/* هدر */}
        <span className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-[13px] font-bold text-violet-600 dark:text-violet-300">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          {isFa ? 'تعرفه‌های ماهانه' : 'Monthly plans'}
        </span>
        <h1 id="sm-plans-title" className="mt-4 max-w-3xl text-3xl font-extrabold leading-snug text-balance sm:text-4xl sm:leading-snug lg:text-[42px]">
          {ui.titleLead}
          <span className="bg-gradient-to-l from-violet-600 to-fuchsia-500 bg-clip-text text-transparent dark:from-violet-400 dark:to-fuchsia-300">
            {ui.titleAccent}
          </span>
        </h1>
        <p className="mt-3.5 max-w-2xl text-[16px] leading-8 text-muted-foreground">{ui.sub}</p>

        {/* گارانتی‌ها — همان متن‌های تأییدشده */}
        <div className="mt-6 flex flex-wrap gap-2">
          {HERO_TRUST.map((i) => {
            const Icon = TRUST_ICONS[i];
            return (
              <span key={i} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/80 px-3.5 py-1.5 text-[12.5px] font-medium text-foreground/85 backdrop-blur">
                <Icon className="h-4 w-4 text-violet-500" aria-hidden="true" />
                {ui.trust[i]}
              </span>
            );
          })}
        </div>
      </div>

      {/* پلن‌ها — کارت‌های شیشه‌ای */}
      <div className="relative mt-8 grid grid-cols-1 items-stretch gap-5 lg:grid-cols-3">
        {Object.values(plans).map((plan) => {
          const Icon = PLAN_ICONS[plan.id];
          const body = (
            <>
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-violet-600 dark:text-violet-400">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <h2 className="text-lg font-extrabold">{plan.name}</h2>
              </div>
              <p className="mt-2 min-h-[3rem] text-[13px] leading-6 text-muted-foreground">{plan.tag}</p>
              <p className="mt-3 flex items-baseline gap-2">
                <b
                  dir="ltr"
                  className={`text-[38px] font-extrabold leading-none tracking-tight ${
                    plan.hot
                      ? 'bg-gradient-to-l from-violet-600 to-fuchsia-500 bg-clip-text text-transparent dark:from-violet-300 dark:to-fuchsia-300'
                      : ''
                  }`}
                >
                  {plan.price}
                </b>
                <span className="text-[13px] text-muted-foreground">{ui.perMonth}</span>
              </p>

              <ul className="mt-4 flex-1 border-t border-black/[0.06] pt-3.5 dark:border-white/[0.07]">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 py-1 text-[13.5px] leading-6 text-foreground/90">
                    <span className="mt-1.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-violet-500/15" aria-hidden="true">
                      <Check className="h-3 w-3 text-violet-500" strokeWidth={3.5} />
                    </span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-5 border-t border-black/[0.06] pt-4 dark:border-white/[0.07]">
                {/* توضیحات بیشتر → صفحهٔ اختصاصی پلن، در تب جدید (پنل تعرفه باز می‌ماند) */}
                <Link
                  href={detailHref(lang, plan.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group inline-flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-[13px] font-bold text-violet-600 transition-colors hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 ${CTA_FOCUS}`}
                >
                  {plan.detailsCta}
                  <ForwardArrow className="h-4 w-4 transition-transform rtl:group-hover:-translate-x-0.5 ltr:group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden="true" />
                </Link>

                {/* دکمهٔ خرید — گرادیان امن از نظر کنتراست */}
                <a
                  href={wa(plan.waMsg)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`mt-2 block rounded-xl ${CTA_GRAD} py-2.5 text-center text-[14.5px] font-bold text-white transition-all hover:brightness-110 hover:shadow-[0_0_28px_rgba(124,58,237,0.5)] motion-reduce:transition-none ${
                    plan.hot ? 'shadow-[0_0_30px_rgba(124,58,237,0.45)] ring-2 ring-violet-400/60' : 'shadow-lg shadow-violet-600/25'
                  } ${CTA_FOCUS}`}
                >
                  {plan.cta}
                </a>
              </div>
            </>
          );

          return plan.hot ? (
            <div
              key={plan.id}
              className="relative rounded-[25px] bg-gradient-to-b from-violet-500/70 via-violet-500/25 to-violet-500/10 p-px shadow-[0_0_55px_rgba(124,58,237,0.28)]"
            >
              <span className="absolute -top-3.5 start-6 rounded-full bg-gradient-to-l from-violet-600 to-violet-500 px-4 py-1 text-xs font-bold text-white shadow-lg">
                {isFa ? 'پیشنهاد ما' : 'Our pick'}
              </span>
              <div className="flex h-full flex-col rounded-3xl p-6">{body}</div>
            </div>
          ) : (
            <div
              key={plan.id}
              className={`flex h-full flex-col rounded-3xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/40 hover:shadow-[0_20px_55px_-18px_rgba(124,58,237,0.35)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${GLASS}`}
            >
              {body}
            </div>
          );
        })}
      </div>

      {/* جدول مقایسه — الگوی pricing-page-cta اسکیل */}
      <div className="relative mt-10">
        <h2 className="text-lg font-extrabold">{cmpUi.title}</h2>
        <div className={`mt-4 overflow-hidden rounded-3xl border ${GLASS}`}>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-black/[0.07] dark:border-white/10">
                <th scope="col" className="p-3 text-start text-[12.5px] font-bold text-muted-foreground">
                  {cmpUi.featuresCol}
                </th>
                {SOCIAL_PLANS.map((id) => {
                  const p = plans[id];
                  return (
                    <th scope="col" key={id} className={`p-3 text-center ${p.hot ? 'bg-violet-500/10' : ''}`}>
                      <span className="block text-[13px] font-extrabold">{p.name}</span>
                      <b className="block text-[15px] font-extrabold text-violet-600 dark:text-violet-400" dir="ltr">{p.price}</b>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {COMPARE_ROWS[lang].map((row, i) => (
                <tr key={row.label} className={i % 2 === 1 ? 'bg-muted/25' : ''}>
                  <th scope="row" className="p-3 text-start text-[12.5px] font-medium leading-6 text-foreground/85 sm:text-[13.5px]">
                    {row.label}
                  </th>
                  {row.cells.map((cell, ci) => (
                    <td key={ci} className={`p-3 text-center ${SOCIAL_PLANS[ci] === 'companion' ? 'bg-violet-500/[0.06]' : ''}`}>
                      <CompareCellView cell={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* شبکه */}
      <div className="relative mt-6 overflow-hidden rounded-3xl border border-violet-500/25 bg-card p-5 sm:p-6">
        <div aria-hidden="true" className="pointer-events-none absolute -top-24 start-1/4 h-56 w-56 rounded-full bg-violet-600/10 blur-[100px]" />
        <div className="relative grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-violet-600 dark:text-violet-400">
                <Network className="h-4 w-4" aria-hidden="true" />
              </span>
              <h2 className="text-lg font-extrabold">{ui.networkTitle}</h2>
            </div>
            <p className="mt-3 text-[13px] leading-7 text-muted-foreground">{ui.networkTag}</p>
            <ul className="mt-2.5">
              {ui.networkFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2 py-1 text-[13.5px] leading-6 text-foreground/90">
                  <span className="mt-1.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-violet-500/15" aria-hidden="true">
                    <Check className="h-3 w-3 text-violet-500" strokeWidth={3.5} />
                  </span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {ui.networkTiers.map((t) => (
                <div key={t.label} className="rounded-2xl border border-border bg-background/60 p-3.5 text-center">
                  <b className="block text-xl font-extrabold text-violet-600 dark:text-violet-400" dir="ltr">{t.price}</b>
                  <span className="mt-1 block text-[11.5px] leading-5 text-muted-foreground">
                    {t.label}
                    <br />
                    {ui.perAccountMonth}
                  </span>
                </div>
              ))}
            </div>
            <a
              href={wa(ui.networkWaMsg)}
              target="_blank"
              rel="noopener noreferrer"
              className={`mt-4 block rounded-xl ${CTA_GRAD} py-2.5 text-center text-[14.5px] font-bold text-white shadow-lg shadow-violet-600/25 transition-all hover:brightness-110 hover:shadow-[0_0_28px_rgba(124,58,237,0.5)] motion-reduce:transition-none ${CTA_FOCUS}`}
            >
              {ui.networkCta}
            </a>
          </div>
        </div>
      </div>

      {/* ساخت اکانت */}
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {[
          { icon: UserPlus, title: ui.account1Title, tag: ui.account1Tag, price: '$17' },
          { icon: ShieldPlus, title: ui.account2Title, tag: ui.account2Tag, price: '$21' },
        ].map((a) => (
          <div key={a.title} className={`rounded-3xl border ${GLASS} p-5 transition-colors hover:border-violet-500/35 motion-reduce:transition-none`}>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-violet-600 dark:text-violet-400">
                <a.icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <h2 className="text-[15px] font-extrabold">{a.title}</h2>
            </div>
            <p className="mt-2 text-[13px] leading-6 text-muted-foreground">{a.tag}</p>
            <p className="mt-3.5 flex items-baseline gap-2 border-t border-black/[0.06] pt-3.5 dark:border-white/[0.07]">
              <b className="text-2xl font-extrabold" dir="ltr">{a.price}</b>
              <span className="text-[13px] text-muted-foreground">{ui.perAccount}</span>
            </p>
          </div>
        ))}
      </div>

      {/* سؤالات پرتکرار — الگوی pricing-page-cta */}
      <div className="mt-10">
        <h2 className="text-lg font-extrabold">{isFa ? 'سؤالات پرتکرار' : 'Frequently asked questions'}</h2>
        <div className="mt-3 space-y-2">
          {FAQ[lang].map((item) => (
            <details key={item.q} className={`group rounded-2xl border ${GLASS} px-4`}>
              <summary className={`flex cursor-pointer list-none items-center justify-between gap-3 py-3.5 text-[14px] font-bold [&::-webkit-details-marker]:hidden ${CTA_FOCUS}`}>
                {item.q}
                <ChevronDown className="h-4 w-4 shrink-0 text-violet-500 transition-transform group-open:rotate-180 motion-reduce:transition-none" aria-hidden="true" />
              </summary>
              <p className="pb-3.5 text-[13px] leading-7 text-muted-foreground">{item.a}</p>
            </details>
          ))}
        </div>
      </div>

      {/* نوار تعهد */}
      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {ui.trust.map((text, i) => {
          const Icon = TRUST_ICONS[i];
          return (
            <div key={text} className="flex items-center gap-2.5 rounded-2xl border border-border bg-card/70 px-3.5 py-3 text-[13px] font-medium text-foreground/85">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-violet-500">
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <span>{text}</span>
            </div>
          );
        })}
      </div>

      {/* CTA پایانی — الگوی pricing-page-cta */}
      <div className="relative mt-8 overflow-hidden rounded-3xl border border-violet-500/30 bg-gradient-to-l from-violet-600/15 via-card to-card p-6 text-center sm:p-8">
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 start-1/3 h-56 w-56 rounded-full bg-violet-600/15 blur-[100px]" />
        <div className="relative">
          <h2 className="text-xl font-extrabold text-balance sm:text-2xl">{FINAL_CTA[lang].h}</h2>
          <p className="mt-1.5 text-[14px] text-muted-foreground">{FINAL_CTA[lang].p}</p>
          <a
            href={wa(FINAL_CTA[lang].waMsg)}
            target="_blank"
            rel="noopener noreferrer"
            className={`mt-5 inline-block rounded-xl ${CTA_GRAD} px-9 py-3 text-[14.5px] font-bold text-white shadow-[0_0_30px_rgba(124,58,237,0.4)] ring-2 ring-violet-400/50 transition-all hover:brightness-110 hover:shadow-[0_0_36px_rgba(124,58,237,0.55)] motion-reduce:transition-none ${CTA_FOCUS}`}
          >
            {FINAL_CTA[lang].btn}
          </a>
        </div>
      </div>

      <p className="mt-6 text-center text-xs leading-6 text-muted-foreground">{ui.note}</p>
    </section>
  );
}
