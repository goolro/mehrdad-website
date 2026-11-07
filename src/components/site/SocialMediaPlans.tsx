import Link from 'next/link';
import { Check, ShieldCheck, BarChart3, Zap, CreditCard, ArrowLeft, ArrowRight } from 'lucide-react';
import {
  PLANS,
  SECTION_UI,
  PLAN_SLUGS,
  type Lang,
} from './social-media-plans-data';

/**
 * Social-media plans panel — bilingual (owner request 2026-11-07: «دو صفحه
 * باید جدا بسازی با صفحات داخلی جداگانه برای هر زبان…»). One component,
 * `lang` prop decides the copy: renders under the (fa) root layout
 * (dir=rtl) and the (site) root layout (dir=ltr), so the same approved
 * graphic serves both language trees.
 *
 * - «توضیحات بیشتر» is now a LINK to the plan's standalone detail page
 *   (/fa/social-media/[plan] · /social-media/[plan]) — full copy lives on
 *   its own crawlable URL, no inline duplication.
 * - Buy CTAs are highlighted (owner request: «دکمه خرید هم هایلت بیاد روش
 *   متناسب با گرافیک وب سایت») — the site's violet gradient on every plan,
 *   deeper glow on the recommended card.
 * - Server component, zero client JS; CTAs deep-link to the WhatsApp direct
 *   line with a prefilled per-plan message (wa.me built inline — the helper
 *   lives in a 'use client' module and can't cross the server boundary).
 */

const WA = 'https://wa.me/989103500310';
const wa = (msg: string) => `${WA}?text=${encodeURIComponent(msg)}`;

const detailHref = (lang: Lang, id: 'auto' | 'companion' | 'business') =>
  `${lang === 'fa' ? '/fa' : ''}/social-media/${PLAN_SLUGS[id]}`;

const TRUST_ICONS = [ShieldCheck, BarChart3, Zap, CreditCard] as const;

export function SocialMediaPlans({ lang }: { lang: Lang }) {
  const ui = SECTION_UI[lang];
  const plans = PLANS[lang];
  const ForwardArrow = lang === 'fa' ? ArrowLeft : ArrowRight;

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16" aria-labelledby="sm-plans-title">
      {/* breadcrumb (owner request 2026-11-07: «home social-media — کاربر
          بدونه کجاست و بتونه برگرده») — same visible trail as the detail
          pages, on the main panel too */}
      <nav aria-label={lang === 'fa' ? 'مسیر صفحه' : 'Breadcrumb'} className="mb-6 text-[13px] text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href={lang === 'fa' ? '/fa' : '/'} className="transition-colors hover:text-foreground">
              {ui.breadcrumbHome}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="font-medium text-foreground">{ui.breadcrumbPlans}</li>
        </ol>
      </nav>

      {/* هدر */}
      <h1 id="sm-plans-title" className="max-w-3xl text-3xl font-extrabold leading-snug sm:text-4xl sm:leading-snug lg:text-[40px]">
        {ui.titleLead}
        <span className="text-violet-600 dark:text-violet-400">{ui.titleAccent}</span>
      </h1>
      <p className="mt-4 max-w-2xl text-[17px] leading-9 text-muted-foreground">{ui.sub}</p>

      {/* پلن‌ها */}
      <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {Object.values(plans).map((plan) => (
          <div
            key={plan.id}
            className={`relative flex flex-col rounded-3xl border p-7 ${
              plan.hot
                ? 'border-violet-500/50 bg-gradient-to-b from-violet-500/10 to-card shadow-[0_0_44px_rgba(124,58,237,0.18)]'
                : 'border-border bg-card'
            }`}
          >
            {plan.hot && (
              <span className="absolute -top-3 start-6 rounded-full bg-gradient-to-l from-violet-600 to-violet-500 px-4 py-1 text-xs font-bold text-white shadow-lg">
                {lang === 'fa' ? 'پیشنهاد ما' : 'Our pick'}
              </span>
            )}
            <h2 className="text-xl font-extrabold">{plan.name}</h2>
            <p className="mt-1.5 text-[13.5px] leading-7 text-muted-foreground">{plan.tag}</p>
            <p className="mt-4 flex items-baseline gap-2">
              <b className="text-[42px] font-extrabold leading-none" dir="ltr">{plan.price}</b>
              <span className="text-[13px] text-muted-foreground">{ui.perMonth}</span>
            </p>
            <ul className="mt-4 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 py-[7px] text-sm leading-7 text-foreground/90">
                  <Check className="mt-2 h-4 w-4 shrink-0 text-violet-500" strokeWidth={3} aria-hidden="true" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            {/* توضیحات بیشتر → صفحهٔ اختصاصی پلن (سئو: محتوای کامل روی URL مستقل) */}
            <Link
              href={detailHref(lang, plan.id)}
              className="mt-4 flex items-center justify-center gap-1.5 rounded-xl border border-violet-500/45 bg-violet-500/5 px-4 py-2.5 text-[13.5px] font-bold text-violet-600 transition-colors hover:bg-violet-500/15 dark:text-violet-400"
            >
              {plan.detailsCta}
              <ForwardArrow className="h-4 w-4" aria-hidden="true" />
            </Link>

            {/* دکمهٔ خرید — هایلایت گرادیان بنفش سایت */}
            <a
              href={wa(plan.waMsg)}
              target="_blank"
              rel="noopener noreferrer"
              className={`mt-3 block rounded-xl bg-gradient-to-l from-violet-600 to-violet-500 py-3 text-center text-[15px] font-bold text-white transition-all hover:brightness-110 hover:shadow-[0_0_28px_rgba(124,58,237,0.45)] ${
                plan.hot ? 'shadow-[0_0_28px_rgba(124,58,237,0.4)] ring-2 ring-violet-400/60' : 'shadow-lg shadow-violet-600/25'
              }`}
            >
              {plan.cta}
            </a>
          </div>
        ))}
      </div>

      {/* شبکه */}
      <div className="mt-6 grid grid-cols-1 items-center gap-8 rounded-3xl border border-border bg-card p-7 sm:p-8 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <h2 className="text-lg font-extrabold">{ui.networkTitle}</h2>
          <p className="mt-2.5 text-[13.5px] leading-8 text-muted-foreground">{ui.networkTag}</p>
          <ul className="mt-3">
            {ui.networkFeatures.map((f) => (
              <li key={f} className="flex items-start gap-2.5 py-[6px] text-sm leading-7 text-foreground/90">
                <Check className="mt-2 h-4 w-4 shrink-0 text-violet-500" strokeWidth={3} aria-hidden="true" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="flex flex-wrap gap-2.5">
            {ui.networkTiers.map((t) => (
              <div key={t.label} className="min-w-[104px] flex-1 rounded-2xl border border-border/80 bg-muted/40 p-3.5 text-center">
                <b className="block text-xl font-extrabold text-violet-600 dark:text-violet-400" dir="ltr">{t.price}</b>
                <span className="text-[11.5px] leading-5 text-muted-foreground">
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
            className="mt-4 block rounded-xl border border-border py-3 text-center text-[15px] font-bold text-foreground transition-all hover:opacity-90"
          >
            {ui.networkCta}
          </a>
        </div>
      </div>

      {/* ساخت اکانت */}
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="rounded-3xl border border-border bg-card p-6">
          <h2 className="text-base font-extrabold">{ui.account1Title}</h2>
          <p className="mt-1.5 text-[13.5px] leading-7 text-muted-foreground">{ui.account1Tag}</p>
          <p className="mt-3 flex items-baseline gap-2">
            <b className="text-3xl font-extrabold" dir="ltr">$17</b>
            <span className="text-[13px] text-muted-foreground">{ui.perAccount}</span>
          </p>
        </div>
        <div className="rounded-3xl border border-border bg-card p-6">
          <h2 className="text-base font-extrabold">{ui.account2Title}</h2>
          <p className="mt-1.5 text-[13.5px] leading-7 text-muted-foreground">{ui.account2Tag}</p>
          <p className="mt-3 flex items-baseline gap-2">
            <b className="text-3xl font-extrabold" dir="ltr">$21</b>
            <span className="text-[13px] text-muted-foreground">{ui.perAccount}</span>
          </p>
        </div>
      </div>

      {/* نوار تعهد */}
      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {ui.trust.map((text, i) => {
          const Icon = TRUST_ICONS[i];
          return (
            <div key={text} className="flex items-center justify-center gap-2 rounded-2xl border border-violet-500/25 bg-violet-500/5 px-4 py-3.5 text-center text-[13.5px] font-medium text-foreground/85">
              <Icon className="h-4 w-4 shrink-0 text-violet-500" aria-hidden="true" />
              <span>{text}</span>
            </div>
          );
        })}
      </div>
      <p className="mt-6 text-center text-xs leading-7 text-muted-foreground">{ui.note}</p>
    </section>
  );
}
