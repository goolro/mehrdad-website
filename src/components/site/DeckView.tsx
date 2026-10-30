'use client';

/**
 * /investors-koko/deck — Investor Pitch Deck for «Quiz of Koko» (D-029).
 *
 * Built 2026-10-10 after the owner's own 19-section deck on
 * quizofkoko.com/deck (owner order: «این صفحه هم برای کوکو طراحی شده
 * ببین باید چیکار کنیم؟ دقیق بررسی کن»). The deck is the DEEP companion
 * to the /investors-koko overview: one long scroll, numbered sections
 * 01–19, every conversion CTA routes back to /investors-koko#briefing —
 * zero new backend surface, zero schema change.
 *
 * Design language mirrors the owner's deck palette: deep forest green +
 * lime accent + mint/ivory/yellow bands, geometric sans display, CSS
 * quiz-card mocks, numbered circular chips. Like InvestorsView, this is
 * a FIXED-palette page (theme-independent, like a PDF): SiteChrome drops
 * the ThemeBackground overlay for the whole /investors-koko/* namespace.
 *
 * Copy: 100% original bilingual text in src/components/site/i18n.ts →
 * ui[lang].deck (en + fa); only owner-published facts are used (1,287
 * pool, $25k–$30k, $500–$3,000/month, 40/20/14/11/8/7 allocation, FREE /
 * KOKO PLUS proposed / future tier, TAM/SAM/SOM blank). Every placeholder
 * stays a labelled placeholder — never an invented number.
 *
 * Web vs mobile (owner law #2): the engagement loop, the subscription
 * chain and the allocation band have DEDICATED mobile layouts (stacked
 * cards); the comparison/scenario tables scroll horizontally on mobile —
 * the same treatment the owner's own deck uses. Verified at lg + 390px.
 */

import { useApp } from './store';
import { ui } from './i18n';
import {
  ArrowDown,
  Briefcase,
  Check,
  Languages,
  Lightbulb,
  Megaphone,
  PenLine,
  Puzzle,
  Sparkles,
  Target,
  TrendingUp,
  Wrench,
} from 'lucide-react';

const BRIEF_URL = '/investors-koko#briefing';
const OVERVIEW_URL = '/investors-koko';

/* ── deck palette (fixed — this page is a pitch deck, not a themed page) ── */
const FOREST = '#142b21'; // dark bands + hero
const FOREST_DEEP = '#0f241a'; // cards on dark bands
const LIME = '#d9f45a'; // accent
const MINT = '#d9ecdf'; // light band
const YELLOW = '#f8e04e'; // light band
const YELLOW_CARD = '#fce98d'; // cards on yellow band
const IVORY = '#f2ede3'; // light band
const CARD = '#fdfbf6'; // cards on light bands
const INK = '#152a1f'; // text on light bands

/* ── shared bits ─────────────────────────────────────────────────────────── */

function SecHead({
  no,
  kicker,
  title,
  sub,
  dark,
}: {
  no: string;
  kicker: string;
  title: string;
  sub?: string;
  dark: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-6">
      <div className="max-w-3xl">
        <p className={`text-[11.5px] font-bold uppercase tracking-[0.16em] ${dark ? 'text-emerald-300' : 'text-emerald-800'}`}>
          {kicker}
        </p>
        <h2
          className={`mt-3 text-[1.7rem] font-extrabold leading-[1.2] tracking-tight sm:text-[2.2rem] ${
            dark ? 'text-[#f2f7f0]' : 'text-[#152a1f]'
          }`}
        >
          {title}
        </h2>
        {sub && (
          <p className={`mt-3 max-w-2xl text-[15px] leading-7 ${dark ? 'text-white/65' : 'text-[#152a1f]/70'}`}>
            {sub}
          </p>
        )}
      </div>
      <span
        className={`mt-1 hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border font-mono text-[11.5px] font-bold sm:grid ${
          dark ? 'border-white/25 text-white/60' : 'border-[#152a1f]/25 text-[#152a1f]/55'
        }`}
        dir="ltr"
        aria-hidden
      >
        {no}
      </span>
    </div>
  );
}

function FormulaChip({ text }: { text: string }) {
  return (
    <div className="overflow-x-auto rounded-lg bg-[#0d2016] px-4 py-2.5" dir="ltr">
      <code className="whitespace-nowrap font-mono text-[12px] font-semibold text-[#d9f45a]">{text}</code>
    </div>
  );
}

function ModelBadge({ label, dark }: { label: string; dark: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.1em] ${
        dark ? 'border border-white/25 text-white/70' : 'border border-[#152a1f]/20 text-[#152a1f]/70'
      }`}
    >
      {label}
    </span>
  );
}

function NoteBar({ text, dark }: { text: string; dark: boolean }) {
  return (
    <p
      className={`mt-6 inline-flex items-start gap-2.5 rounded-xl border px-4 py-3 text-[12.5px] leading-6 ${
        dark ? 'border-white/15 bg-white/5 text-white/60' : 'border-[#152a1f]/12 bg-white/60 text-[#152a1f]/70'
      }`}
    >
      <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden />
      {text}
    </p>
  );
}

/* ── view ────────────────────────────────────────────────────────────────── */

export function DeckView() {
  const { lang } = useApp();
  const t = ui[lang];
  const d = t.deck;
  const rtl = lang === 'fa';

  return (
    <div dir={rtl ? 'rtl' : 'ltr'} style={{ backgroundColor: IVORY }} className="investors-root text-[#152a1f]">
      {/* ── top bar ─────────────────────────────────────────────────────────── */}
      <header style={{ backgroundColor: FOREST }} className="text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
          <a href={OVERVIEW_URL} className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#d9f45a] text-[15px] font-extrabold text-[#142b21]">
              K
            </span>
            <span className="text-[14px] font-bold">{rtl ? 'کوییز کوکو' : 'Quiz of Koko'}</span>
          </a>
          <nav aria-label={rtl ? 'بخش‌های دک' : 'Deck sections'} className="hidden items-center gap-7 text-[13px] font-semibold text-white/75 md:flex">
            <a href="#product" className="transition hover:text-white">{d.chrome.navProduct}</a>
            <a href="#business" className="transition hover:text-white">{d.chrome.navBusiness}</a>
            <a href="#ask" className="transition hover:text-white">{d.chrome.navAsk}</a>
          </nav>
          <a href={OVERVIEW_URL} className="inline-flex min-h-[36px] items-center gap-2 text-[12.5px] font-bold text-white/80 transition hover:text-white">
            {d.chrome.back}
            <span aria-hidden>→</span>
          </a>
        </div>
      </header>

      {/* ── hero (forest) ───────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: FOREST }} className="relative overflow-hidden text-white">
        {/* soft glows */}
        <div aria-hidden className="pointer-events-none absolute -right-32 -top-40 h-[480px] w-[480px] rounded-full bg-emerald-500/15 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -left-40 top-64 h-[420px] w-[420px] rounded-full bg-[#d9f45a]/10 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-12 sm:px-6 lg:pb-24 lg:pt-16">
          <div className="grid items-center gap-12 lg:grid-cols-[1.02fr_0.98fr]">
            {/* left: badge + headline + CTA */}
            <div>
              <span className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-3.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-[#d9f45a]">
                {d.chrome.badge}
              </span>
              <h1 className="mt-6 text-[2.6rem] font-extrabold leading-[1.08] tracking-tight sm:text-[3.6rem]">
                {d.hero.l1}
                <br />
                {d.hero.l2}
                <br />
                <span className="text-[#d9f45a]">{d.hero.hl}</span>
              </h1>
              <p className="mt-5 max-w-xl text-[15.5px] leading-7 text-white/70">{d.hero.sub}</p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a
                  href="#overview"
                  className="inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-[#d9f45a] px-6 text-[14.5px] font-extrabold text-[#142b21] shadow-[0_10px_30px_-10px_rgba(217,244,90,0.5)] transition hover:brightness-105"
                >
                  {d.hero.cta}
                  <span aria-hidden>→</span>
                </a>
                <span className="text-[12.5px] text-white/50">{d.chrome.readTime}</span>
              </div>
            </div>

            {/* right: quiz-card mock — pure CSS, decorative */}
            <div className="relative mx-auto w-full max-w-sm py-6 lg:max-w-none">
              <div className="relative rounded-[1.8rem] border border-white/20 bg-white p-6 text-[#152a1f] shadow-[0_30px_70px_-30px_rgba(0,0,0,0.55)]">
                <div className="flex items-center justify-between text-[11.5px] font-bold">
                  <span className="font-mono uppercase tracking-[0.12em] text-[#152a1f]/60" dir="ltr">{d.hero.card.word}</span>
                  <span className="font-mono tabular-nums text-[#152a1f]/60" dir="ltr">{d.hero.card.pool}</span>
                </div>
                <div className="mx-auto mt-4 grid h-20 w-20 place-items-center rounded-full bg-[#d9ecdf] text-2xl font-extrabold text-[#142b21]">
                  ?
                </div>
                <p className="mt-4 text-center text-[15px] font-bold leading-7">
                  {d.hero.card.q1}
                  <br />
                  {d.hero.card.q2}
                </p>
                <div className="mt-5 grid grid-cols-2 gap-2.5" aria-hidden>
                  {d.hero.card.a.map((opt, i) => (
                    <span
                      key={opt}
                      className={`flex h-11 items-center justify-between rounded-xl border px-3.5 text-[13px] font-semibold ${
                        i === d.hero.card.ok
                          ? 'border-[#c8e34a] bg-[#e5f79b]'
                          : 'border-[#152a1f]/10 bg-[#f7f4ec]'
                      }`}
                    >
                      {opt}
                      {i === d.hero.card.ok && <Check className="h-4 w-4 text-[#3f5a12]" aria-hidden />}
                    </span>
                  ))}
                </div>
              </div>

              {/* floating pills */}
              <span
                aria-hidden
                className="absolute -start-3 top-24 -rotate-6 rounded-full bg-[#d9f45a] px-3.5 py-1.5 text-[12px] font-bold text-[#142b21] shadow-md sm:-start-6"
              >
                {d.hero.card.chipA}
              </span>
              <span
                aria-hidden
                className="absolute -end-2 top-1/3 rotate-6 rounded-full bg-[#cdb4f6] px-3.5 py-1.5 text-[12px] font-bold text-[#2a1d4a] shadow-md sm:-end-5"
              >
                {d.hero.card.chipB}
              </span>
              <span
                aria-hidden
                className="absolute -bottom-2 start-8 flex -rotate-3 items-center gap-2.5 rounded-2xl bg-[#f0784b] px-4 py-2.5 text-white shadow-lg"
              >
                <span className="text-2xl font-extrabold tabular-nums" dir="ltr">{d.hero.card.streakN}</span>
                <span className="text-start leading-tight">
                  <span className="block text-[12.5px] font-bold">{d.hero.card.streakT}</span>
                  <span className="block text-[10.5px] opacity-85">{d.hero.card.streakD}</span>
                </span>
              </span>
            </div>
          </div>
          <p className="mt-12 text-center text-[12px] font-semibold text-white/60">{d.chrome.scroll}</p>
        </div>
      </section>

      {/* ── 01 · one-minute overview (ivory) ────────────────────────────────── */}
      <section id="overview" className="mx-auto max-w-6xl scroll-mt-16 px-4 py-16 sm:px-6 lg:py-20">
        <SecHead no={d.s1.no} kicker={d.s1.kicker} title={d.s1.title} sub={d.s1.sub} dark={false} />
        <div className="mt-9 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="flex flex-col justify-between rounded-2xl p-6 text-white sm:p-7" style={{ backgroundColor: FOREST }}>
            <span aria-hidden className="grid h-11 w-11 place-items-center rounded-xl bg-[#d9f45a] text-[#142b21]">
              <Sparkles className="h-5 w-5" />
            </span>
            <p className="mt-8 text-[19px] font-extrabold leading-8">{d.s1.lead}</p>
          </div>
          <div className="grid gap-3">
            {d.s1.rows.map((r) => (
              <div key={r.k} className="rounded-2xl border border-[#152a1f]/10 bg-white p-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#152a1f]/50">{r.k}</p>
                <p className="mt-1 text-[15.5px] font-extrabold">{r.v}</p>
              </div>
            ))}
          </div>
        </div>
        <NoteBar text={d.s1.note} dark={false} />
      </section>

      {/* ── 02 · the problem (mint) ─────────────────────────────────────────── */}
      <section className="py-16 lg:py-20" style={{ backgroundColor: MINT }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SecHead no={d.s2.no} kicker={d.s2.kicker} title={d.s2.title} dark={false} />
          <div className="mt-9 grid gap-10 lg:grid-cols-2 lg:gap-14">
            <div>
              <p className="text-[17px] font-bold leading-8 text-[#152a1f]/90">{d.s2.sub}</p>
              <blockquote className="mt-7 border-s-4 border-[#142b21] ps-5 text-[15px] font-semibold italic leading-7 text-[#152a1f]/80">
                {d.s2.quote}
              </blockquote>
            </div>
            <ul>
              {d.s2.items.map((it, i) => (
                <li key={it.t} className={`flex gap-5 py-5 ${i > 0 ? 'border-t border-[#152a1f]/15' : ''}`}>
                  <span className="font-mono text-[12px] font-bold text-[#152a1f]/50" dir="ltr">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <p className="text-[15.5px] font-extrabold">{it.t}</p>
                    <p className="mt-1 text-[13.5px] leading-6 text-[#152a1f]/65">{it.d}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── 03 · the insight (forest) ───────────────────────────────────────── */}
      <section className="py-16 text-white lg:py-20" style={{ backgroundColor: FOREST }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SecHead no={d.s3.no} kicker={d.s3.kicker} title={d.s3.title} dark />
          <div className="mt-10 grid items-center gap-12 lg:grid-cols-2">
            {/* play → learn → return rings */}
            <div className="relative mx-auto grid h-72 w-72 place-items-center sm:h-80 sm:w-80" aria-hidden>
              <span className="absolute inset-0 rounded-full border border-white/10" />
              <span className="absolute inset-8 rounded-full border border-white/10" />
              <span className="absolute inset-16 rounded-full border border-white/15" />
              <div className="relative z-10 flex flex-col items-center gap-1.5">
                {d.s3.cycle.map((c, i) => (
                  <span key={c} className="flex flex-col items-center gap-1.5">
                    {i > 0 && <ArrowDown className="h-3.5 w-3.5 text-white/60" />}
                    <span className="font-mono text-[15px] font-bold tracking-[0.3em] text-[#d9f45a]">{c}</span>
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[11.5px] font-bold uppercase tracking-[0.16em] text-white/55">{d.s3.thesisK}</p>
              <p className="mt-4 text-[19px] font-extrabold leading-8 sm:text-[21px]">{d.s3.thesis}</p>
              <ul className="mt-7 space-y-3">
                {d.s3.checks.map((c) => (
                  <li key={c} className="flex items-center gap-3 text-[14px] text-white/75">
                    <Check className="h-4 w-4 shrink-0 text-[#d9f45a]" aria-hidden />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── 04 · the product (ivory) ────────────────────────────────────────── */}
      <section id="product" className="mx-auto max-w-6xl scroll-mt-16 px-4 py-16 sm:px-6 lg:py-20">
        <SecHead no={d.s4.no} kicker={d.s4.kicker} title={d.s4.title} dark={false} />
        <div className="mt-10 grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          {/* phone mock on mint panel */}
          <div className="rounded-[2rem] p-8 sm:p-10" style={{ backgroundColor: MINT }}>
            <div className="mx-auto w-full max-w-[270px] rounded-[2.2rem] border-[3px] border-[#142b21] bg-white p-5 shadow-[0_24px_50px_-24px_rgba(20,43,33,0.5)]">
              <div className="flex items-center justify-between text-[11.5px] font-bold">
                <span className="grid h-6 w-6 place-items-center rounded-md bg-[#142b21] text-[10px] font-extrabold text-[#d9f45a]">K</span>
                <span className="font-mono tabular-nums text-[#152a1f]/60" dir="ltr">{d.s4.mock.progress}</span>
              </div>
              <div className="mt-2.5 h-1.5 rounded-full bg-[#e8e4d8]" aria-hidden>
                <div className="h-full w-2/5 rounded-full bg-[#142b21]" />
              </div>
              <p className="mt-5 text-center text-[10.5px] font-bold uppercase tracking-[0.1em] text-[#152a1f]/60">{d.s4.mock.pill}</p>
              <p className="mt-2 text-center text-[22px] font-extrabold tracking-wide">{d.s4.mock.word}</p>
              <p className="mt-2 text-center text-[12px] leading-5 text-[#152a1f]/65">
                {d.s4.mock.sent1}
                <em className="not-italic font-bold text-[#3f5a12] underline decoration-[#d9f45a] decoration-2">{d.s4.mock.w}</em>
                {d.s4.mock.sent2}
              </p>
              <div className="mt-4 space-y-2" aria-hidden>
                {d.s4.mock.o.map((o, i) => (
                  <span
                    key={o}
                    className={`flex h-10 items-center justify-between rounded-lg border px-3 text-[12.5px] font-semibold ${
                      i === d.s4.mock.ok ? 'border-[#c8e34a] bg-[#e5f79b]' : 'border-[#152a1f]/10 bg-white'
                    }`}
                  >
                    {o}
                    {i === d.s4.mock.ok && <Check className="h-3.5 w-3.5 text-[#3f5a12]" />}
                  </span>
                ))}
              </div>
            </div>
          </div>
          {/* three product principles */}
          <ul>
            {d.s4.items.map((it, i) => (
              <li key={it.t} className={`py-6 ${i > 0 ? 'border-t border-[#152a1f]/12' : ''}`}>
                <div className="flex items-baseline gap-4">
                  <span className="font-mono text-[12px] font-bold text-[#152a1f]/70" dir="ltr">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <p className="text-[16.5px] font-extrabold">{it.t}</p>
                    <p className="mt-1.5 max-w-md text-[13.5px] leading-6 text-[#152a1f]/65">{it.d}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── 05 · how it works (yellow) ──────────────────────────────────────── */}
      <section className="py-16 lg:py-20" style={{ backgroundColor: YELLOW }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SecHead no={d.s5.no} kicker={d.s5.kicker} title={d.s5.title} dark={false} />
          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {d.s5.steps.map((st, i) => {
              const Icon = [Target, Lightbulb, TrendingUp][i];
              return (
                <div key={st.t} className="relative rounded-2xl p-6" style={{ backgroundColor: YELLOW_CARD }}>
                  <span className="absolute end-5 top-5 font-mono text-[11.5px] font-bold text-[#152a1f]/70" dir="ltr">{String(i + 1).padStart(2, '0')}</span>
                  <span aria-hidden className="grid h-10 w-10 place-items-center rounded-xl bg-[#142b21] text-[#d9f45a]">
                    <Icon className="h-4.5 w-4.5" />
                  </span>
                  <p className="mt-6 text-[17px] font-extrabold">{st.t}</p>
                  <p className="mt-1.5 text-[13px] leading-6 text-[#152a1f]/70">{st.d}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 06 · engagement loop (ivory) ────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <SecHead no={d.s6.no} kicker={d.s6.kicker} title={d.s6.title} dark={false} />

        {/* MOBILE: dedicated 2×2 stacked cards + center pill */}
        <div className="mt-9 lg:hidden">
          <div className="mx-auto flex w-fit flex-col items-center rounded-2xl px-6 py-4 text-white" style={{ backgroundColor: FOREST }}>
            <span className="font-mono text-[11px] text-[#d9f45a]" aria-hidden>K</span>
            <p className="text-[15px] font-extrabold leading-6">{d.s6.center1}<br />{d.s6.center2}</p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {d.s6.cells.map((c, i) => (
              <div key={c.t} className="rounded-2xl border border-[#152a1f]/10 bg-white p-4">
                <span className="font-mono text-[11px] font-bold text-[#152a1f]/70" dir="ltr">{String(i + 1).padStart(2, '0')}</span>
                <p className="mt-1.5 text-[14.5px] font-extrabold">{c.t}</p>
                <p className="mt-0.5 text-[12px] leading-5 text-[#152a1f]/60">{c.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* DESKTOP: ring diagram */}
        <div className="relative mx-auto mt-12 hidden h-[440px] max-w-2xl lg:block" aria-hidden>
          <span className="absolute inset-x-16 inset-y-0 rounded-full border border-dashed border-[#152a1f]/25" />
          <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
            <div className="grid h-44 w-44 place-items-center rounded-full border-8 border-[#d9ecdf] text-center text-white" style={{ backgroundColor: FOREST }}>
              <div>
                <span className="font-mono text-[11px] text-[#d9f45a]">K</span>
                <p className="text-[17px] font-extrabold leading-6">{d.s6.center1}<br />{d.s6.center2}</p>
              </div>
            </div>
          </div>
          {[
            { c: d.s6.cells[0], pos: 'start-2 top-8' },
            { c: d.s6.cells[1], pos: 'end-2 top-8' },
            { c: d.s6.cells[2], pos: 'end-2 bottom-8' },
            { c: d.s6.cells[3], pos: 'start-2 bottom-8' },
          ].map(({ c, pos }, i) => (
            <div key={c.t} className={`absolute ${pos} w-44 rounded-2xl border border-[#152a1f]/10 bg-white p-4 shadow-md`}>
              <span className="font-mono text-[11px] font-bold text-[#152a1f]/70" dir="ltr">{String(i + 1).padStart(2, '0')}</span>
              <p className="mt-1 text-[14.5px] font-extrabold">{c.t}</p>
              <p className="mt-0.5 text-[12px] text-[#152a1f]/60">{c.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 07 · who it serves (mint) ───────────────────────────────────────── */}
      <section className="py-16 lg:py-20" style={{ backgroundColor: MINT }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SecHead no={d.s7.no} kicker={d.s7.kicker} title={d.s7.title} dark={false} />
          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {d.s7.segs.map((s, i) => {
              const Icon = [Sparkles, Briefcase, Languages][i];
              return (
                <div key={s.t} className="rounded-2xl border border-[#152a1f]/8 bg-white p-6">
                  <span aria-hidden className="grid h-10 w-10 place-items-center rounded-xl bg-[#142b21] text-[#d9f45a]">
                    <Icon className="h-4.5 w-4.5" />
                  </span>
                  <p className="mt-5 text-[16.5px] font-extrabold">{s.t}</p>
                  <p className="mt-2 min-h-12 text-[13.5px] leading-6 text-[#152a1f]/65">{s.d}</p>
                  <p className="mt-4 inline-flex items-center gap-1.5 text-[11.5px] font-bold text-emerald-800">
                    {d.s7.tag}
                    <span aria-hidden>→</span>
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 08 · market opportunity (ivory) ─────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <SecHead no={d.s8.no} kicker={d.s8.kicker} title={d.s8.title} dark={false} />
        <div className="mt-10 grid items-center gap-12 lg:grid-cols-2">
          {/* venn */}
          <div className="relative mx-auto h-[340px] w-full max-w-sm sm:h-[380px]" aria-hidden>
            <div className="absolute start-6 top-2 grid h-40 w-40 place-items-center rounded-full bg-emerald-400/60 text-center text-[13.5px] font-bold text-[#0d2016] sm:h-44 sm:w-44">
              {d.s8.venn[0]}
            </div>
            <div className="absolute end-6 top-2 grid h-40 w-40 place-items-center rounded-full bg-violet-400/55 text-center text-[13.5px] font-bold text-[#241542] sm:h-44 sm:w-44">
              {d.s8.venn[1]}
            </div>
            <div className="absolute bottom-2 left-1/2 grid h-40 w-40 -translate-x-1/2 place-items-center rounded-full bg-yellow-300/75 text-center text-[13.5px] font-bold text-[#3d3208] sm:h-44 sm:w-44">
              {d.s8.venn[2]}
            </div>
            <span className="absolute left-1/2 top-[38%] z-10 -translate-x-1/2 rounded-full bg-white/90 px-3 py-1 text-[12px] font-extrabold shadow">
              {d.s8.center}
            </span>
          </div>
          {/* TAM / SAM / SOM */}
          <div>
            <p className="text-[16.5px] font-bold leading-7 text-[#152a1f]/90">{d.s8.side}</p>
            <div className="mt-6 rounded-2xl border border-[#152a1f]/10 bg-white px-5">
              {d.s8.tam.map((k) => (
                <div key={k} className="flex items-center justify-between gap-4 border-b border-[#152a1f]/10 py-4 last:border-b-0">
                  <span className="font-mono text-[13px] font-bold" dir="ltr">{k}</span>
                  <span className="text-[12.5px] text-[#152a1f]/50">{d.s8.tamValue}</span>
                </div>
              ))}
            </div>
            <NoteBar text={d.s8.note} dark={false} />
          </div>
        </div>
      </section>

      {/* ── 09 · why now (forest) ───────────────────────────────────────────── */}
      <section className="py-16 text-white lg:py-20" style={{ backgroundColor: FOREST }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SecHead no={d.s9.no} kicker={d.s9.kicker} title={d.s9.title} dark />
          <div className="mt-10 grid gap-8 md:grid-cols-3 md:gap-0">
            {d.s9.cols.map((c, i) => (
              <div key={c.k} className={`md:px-8 ${i > 0 ? 'md:border-s md:border-white/12' : 'md:pe-8'} ${i === 0 ? '' : ''}`}>
                <span className="font-mono text-[11.5px] text-white/60" dir="ltr">{String(i + 1).padStart(2, '0')}</span>
                <p className="mt-6 font-mono text-[22px] font-bold tracking-wide text-[#d9f45a]" dir="auto">{c.k}</p>
                <p className="mt-3 text-[13.5px] leading-6 text-white/65">{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 10 · the edge (ivory) — table scrolls horizontally on mobile ───── */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <SecHead no={d.s10.no} kicker={d.s10.kicker} title={d.s10.title} dark={false} />
        <div className="mt-9 overflow-x-auto rounded-2xl border border-[#152a1f]/10 bg-white">
          <table className="w-full min-w-[620px] border-collapse text-start">
            <thead>
              <tr style={{ backgroundColor: FOREST }} className="text-white">
                {d.s10.th.map((h) => (
                  <th key={h} className="px-5 py-3.5 text-start text-[11px] font-bold uppercase tracking-[0.1em]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {d.s10.rows.map((row, ri) => (
                <tr key={row[0]} className={ri % 2 === 1 ? 'bg-[#f7f3ea]' : ''}>
                  <td className="px-5 py-4 text-[13.5px] font-extrabold">{row[0]}</td>
                  <td className="px-5 py-4 text-[13px] text-[#152a1f]/60">{row[1]}</td>
                  <td className="bg-[#e2f1e7] px-5 py-4">
                    <span className="flex items-center gap-2 text-[13px] font-bold text-[#0d2016]">
                      <Check className="h-4 w-4 shrink-0 text-emerald-700" aria-hidden />
                      {row[2]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── 11 · business model (yellow) ────────────────────────────────────── */}
      <section id="business" className="scroll-mt-16 py-16 lg:py-20" style={{ backgroundColor: YELLOW }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SecHead no={d.s11.no} kicker={d.s11.kicker} title={d.s11.title} dark={false} />
          <div className="mt-9 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl p-6 sm:p-7" style={{ backgroundColor: YELLOW_CARD }}>
              <p className="font-mono text-[12px] font-bold text-[#152a1f]/70" dir="ltr">{d.s11.ad.t}</p>
              <p className="mt-6 text-[21px] font-extrabold leading-8">{d.s11.ad.h}</p>
              <p className="mt-3 text-[13.5px] leading-6 text-[#152a1f]/70">{d.s11.ad.d}</p>
              <ul className="mt-5 space-y-2.5">
                {d.s11.ad.b.map((b) => (
                  <li key={b} className="flex items-center gap-2.5 text-[13.5px] font-semibold text-[#152a1f]/80">
                    <Check className="h-4 w-4 text-[#3f5a12]" aria-hidden />{b}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl p-6 text-white sm:p-7" style={{ backgroundColor: FOREST }}>
              <p className="font-mono text-[12px] font-bold text-white/70" dir="ltr">{d.s11.sub.t}</p>
              <p className="mt-6 text-[21px] font-extrabold leading-8">{d.s11.sub.h}</p>
              <p className="mt-3 text-[13.5px] leading-6 text-white/70">{d.s11.sub.d}</p>
              <ul className="mt-5 space-y-2.5">
                {d.s11.sub.b.map((b) => (
                  <li key={b} className="flex items-center gap-2.5 text-[13.5px] font-semibold text-white/85">
                    <Check className="h-4 w-4 text-[#d9f45a]" aria-hidden />{b}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── 12 · advertising scenario (ivory) ───────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <SecHead no={d.s12.no} kicker={d.s12.kicker} title={d.s12.title} dark={false} />
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <div>
            <ModelBadge label={d.s12.badge} dark={false} />
            <p className="mt-2.5 text-[13px] text-[#152a1f]/60">{d.s12.note}</p>
          </div>
          <div className="w-full sm:w-auto sm:max-w-[55%]">
            <FormulaChip text={d.s12.formula} />
          </div>
        </div>
        <div className="mt-6 overflow-x-auto rounded-2xl border border-[#152a1f]/10 bg-white">
          <table className="w-full min-w-[640px] border-collapse">
            <thead>
              <tr style={{ backgroundColor: FOREST }} className="text-white">
                {d.s12.th.map((h) => (
                  <th key={h} className="px-5 py-3 text-start text-[11px] font-bold uppercase tracking-[0.1em]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {d.s12.rows.map((r, ri) => (
                <tr key={r} className={ri % 2 === 1 ? 'bg-[#f7f3ea]' : ''}>
                  <td className="px-5 py-3.5 text-[13px] font-extrabold">{r}</td>
                  {[0, 1, 2].map((ci) => (
                    <td key={ci} className="bg-[#fdf6d8] px-5 py-3.5 text-[12.5px] text-[#152a1f]/55">{d.s12.inputCell}</td>
                  ))}
                </tr>
              ))}
              <tr>
                <td className="px-5 py-3.5 text-[13px] font-extrabold">{d.s12.outRow}</td>
                {['A', 'B', 'C'].map((s) => (
                  <td key={s} className="bg-[#e2f1e7] px-5 py-3.5 text-[12.5px] font-bold text-[#0d2016]">
                    {d.s12.outCell} {s}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-4 max-w-4xl text-[12px] leading-6 text-[#152a1f]/55">{d.s12.disc}</p>
      </section>

      {/* ── 13 · subscription scenario (mint) ───────────────────────────────── */}
      <section className="py-16 lg:py-20" style={{ backgroundColor: MINT }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SecHead no={d.s13.no} kicker={d.s13.kicker} title={d.s13.title} dark={false} />
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
            <div>
              <ModelBadge label={d.s13.badge} dark={false} />
              <p className="mt-2.5 text-[13px] text-[#152a1f]/60">{d.s13.note}</p>
            </div>
            <div className="w-full sm:w-auto sm:max-w-[50%]">
              <FormulaChip text={d.s13.formula} />
            </div>
          </div>

          {/* chain — MOBILE vertical */}
          <div className="mt-6 lg:hidden">
            <div className="space-y-2">
              {d.s13.chain.map((c, i) => (
                <div key={c}>
                  <div className="rounded-xl border border-[#152a1f]/10 bg-white p-4">
                    <p className="text-[11.5px] text-[#152a1f]/55">{c}</p>
                    <p className="mt-0.5 text-[14.5px] font-extrabold">{d.s13.chainVals[i]}</p>
                  </div>
                  {i < d.s13.chain.length - 1 && <ArrowDown className="mx-auto my-1 h-4 w-4 text-[#152a1f]/40" aria-hidden />}
                </div>
              ))}
            </div>
            <ArrowDown className="mx-auto my-2 h-4 w-4 text-[#152a1f]/40" aria-hidden />
            <div className="rounded-xl p-4 text-white" style={{ backgroundColor: FOREST }}>
              <p className="text-[11.5px] text-[#d9f45a]">{d.s13.out}</p>
              <p className="mt-0.5 text-[15px] font-extrabold">{d.s13.outVal}</p>
            </div>
          </div>

          {/* chain — DESKTOP horizontal */}
          <div className="mt-6 hidden items-stretch gap-2 lg:flex" dir="ltr">
            {d.s13.chain.map((c, i) => (
              <div key={c} className="flex flex-1 items-center gap-2">
                <div className="w-full rounded-xl border border-[#152a1f]/10 bg-white p-4">
                  <p className="text-[11.5px] text-[#152a1f]/55">{c}</p>
                  <p className="mt-0.5 text-[14.5px] font-extrabold">{d.s13.chainVals[i]}</p>
                </div>
                {i < d.s13.chain.length - 1 && <span className="text-[#152a1f]/40" aria-hidden>›</span>}
              </div>
            ))}
            <div className="w-64 rounded-xl p-4 text-white" style={{ backgroundColor: FOREST }}>
              <p className="text-[11.5px] text-[#d9f45a]">{d.s13.out}</p>
              <p className="mt-0.5 text-[15px] font-extrabold">{d.s13.outVal}</p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2.5">
            {[d.s13.chipA, d.s13.chipB].map((c) => (
              <span key={c} className="rounded-lg bg-[#0d2016] px-3.5 py-2" dir="ltr">
                <code className="whitespace-nowrap font-mono text-[11.5px] font-semibold text-[#d9f45a]">{c}</code>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── 14 · proposed pricing (ivory) ───────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <SecHead no={d.s14.no} kicker={d.s14.kicker} title={d.s14.title} dark={false} />
        <div className="mt-10 grid items-stretch gap-4 md:grid-cols-3">
          {d.s14.tiers.map((tier) => {
            const featured = tier.badge !== '';
            return (
              <div
                key={tier.tag}
                className={`relative flex flex-col rounded-2xl p-6 sm:p-7 ${
                  featured ? 'text-white shadow-[0_28px_60px_-28px_rgba(20,43,33,0.6)] md:-my-4 md:py-11' : 'border border-[#152a1f]/12 bg-white'
                }`}
                style={featured ? { backgroundColor: FOREST } : undefined}
              >
                {featured && tier.badge && (
                  <span className="absolute end-5 top-5 rounded-full bg-[#d9f45a] px-3 py-1 font-mono text-[10.5px] font-bold uppercase tracking-[0.08em] text-[#142b21]">
                    {tier.badge}
                  </span>
                )}
                <p className={`text-[12px] font-bold uppercase tracking-[0.12em] ${featured ? 'text-[#d9f45a]' : 'text-[#152a1f]/55'}`} dir="auto">
                  {tier.tag}
                </p>
                <p className="mt-5 text-[26px] font-extrabold leading-8 tracking-tight" dir="auto">{tier.price}</p>
                <p className={`mt-2 text-[13px] ${featured ? 'text-white/70' : 'text-[#152a1f]/65'}`}>{tier.d}</p>
                <ul className="mt-6 space-y-2.5">
                  {tier.b.map((b) => (
                    <li key={b} className={`flex items-center gap-2.5 text-[13.5px] font-semibold ${featured ? 'text-white/85' : 'text-[#152a1f]/80'}`}>
                      <Check className={`h-4 w-4 shrink-0 ${featured ? 'text-[#d9f45a]' : 'text-emerald-700'}`} aria-hidden />{b}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
        <NoteBar text={d.s14.disc} dark={false} />
      </section>

      {/* ── 15 · go-to-market (forest) ──────────────────────────────────────── */}
      <section className="py-16 text-white lg:py-20" style={{ backgroundColor: FOREST }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SecHead no={d.s15.no} kicker={d.s15.kicker} title={d.s15.title} dark />
          <div className="mt-10 grid items-center gap-12 lg:grid-cols-2">
            <ol>
              {d.s15.steps.map((st, i) => (
                <li key={st.t} className={`flex gap-5 py-5 ${i > 0 ? 'border-t border-white/12' : ''}`}>
                  <span className="font-mono text-[12px] font-bold text-white/60" dir="ltr">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <p className="text-[16.5px] font-extrabold">{st.t}</p>
                    <p className="mt-1 text-[13.5px] leading-6 text-white/60">{st.d}</p>
                  </div>
                </li>
              ))}
            </ol>
            {/* grow ring */}
            <div className="relative mx-auto h-72 w-72 sm:h-80 sm:w-80" aria-hidden>
              <span className="absolute inset-6 rounded-full border border-dashed border-white/20" />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[26px] font-extrabold tracking-wide">
                {d.s15.ring[4]}
              </span>
              {[
                { l: d.s15.ring[0], pos: 'left-1/2 top-0 -translate-x-1/2' },
                { l: d.s15.ring[1], pos: 'right-0 top-1/2 -translate-y-1/2' },
                { l: d.s15.ring[2], pos: 'left-1/2 bottom-0 -translate-x-1/2' },
                { l: d.s15.ring[3], pos: 'left-0 top-1/2 -translate-y-1/2' },
              ].map(({ l, pos }) => (
                <span
                  key={l}
                  className={`absolute ${pos} rounded-full border border-[#d9f45a]/40 px-3 py-1 font-mono text-[10.5px] font-bold uppercase tracking-[0.08em] text-[#d9f45a]`}
                  style={{ backgroundColor: FOREST }}
                >
                  {l}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 16 · roadmap (ivory) ────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <SecHead no={d.s16.no} kicker={d.s16.kicker} title={d.s16.title} dark={false} />
        <div className="mt-10 grid gap-8 md:grid-cols-3 md:gap-0">
          {d.s16.cols.map((c, i) => (
            <div key={c.tag} className={`md:px-8 ${i > 0 ? 'md:border-s md:border-[#152a1f]/12' : ''}`}>
              <span className="inline-flex rounded-full border border-[#152a1f]/20 bg-white px-3.5 py-1 font-mono text-[10.5px] font-bold uppercase tracking-[0.1em] text-[#152a1f]/60" dir="ltr">
                {c.tag}
              </span>
              <p className="mt-5 text-[17px] font-extrabold leading-7">{c.t}</p>
              <ul className="mt-4 space-y-2.5">
                {c.b.map((b) => (
                  <li key={b} className="text-[13px] leading-6 text-[#152a1f]/65">{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-9 text-[12px] text-[#152a1f]/50">{d.s16.disc}</p>
      </section>

      {/* ── 17 · ways to support (yellow) ───────────────────────────────────── */}
      <section id="ask" className="scroll-mt-16 py-16 lg:py-20" style={{ backgroundColor: YELLOW }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SecHead no={d.s17.no} kicker={d.s17.kicker} title={d.s17.title} dark={false} />
          <div className="mt-9 grid gap-4 lg:grid-cols-2">
            {/* project support */}
            <div className="rounded-2xl p-6 sm:p-7" style={{ backgroundColor: YELLOW_CARD }}>
              <p className="text-[11.5px] font-bold uppercase tracking-[0.12em] text-[#152a1f]/70">{d.s17.support.tag}</p>
              <p className="mt-6 text-[34px] font-extrabold leading-none tracking-tight" dir="ltr">
                {d.s17.support.price}
                <span className="ms-1 align-baseline text-[13px] font-bold text-[#152a1f]/60">{d.s17.support.per}</span>
              </p>
              <p className="mt-5 text-[13.5px] leading-6 text-[#152a1f]/75">{d.s17.support.d}</p>
              <ul className="mt-5 space-y-2.5 border-t border-[#152a1f]/15 pt-5">
                {d.s17.support.b.map((b) => (
                  <li key={b} className="flex items-center gap-2.5 text-[13.5px] font-semibold text-[#152a1f]/80">
                    <Check className="h-4 w-4 text-[#3f5a12]" aria-hidden />{b}
                  </li>
                ))}
              </ul>
              <a
                href={BRIEF_URL}
                className="mt-6 inline-flex min-h-[44px] items-center gap-2 text-[13.5px] font-extrabold text-[#142b21] underline decoration-[#142b21]/30 underline-offset-4 transition hover:decoration-[#142b21]"
              >
                {d.s17.support.cta}
                <span aria-hidden>→</span>
              </a>
            </div>
            {/* angel investment */}
            <div className="rounded-2xl p-6 text-white sm:p-7" style={{ backgroundColor: FOREST }}>
              <p className="text-[11.5px] font-bold uppercase tracking-[0.12em] text-white/60">{d.s17.angel.tag}</p>
              <p className="mt-6 text-[26px] font-extrabold leading-8">{d.s17.angel.h}</p>
              <p className="mt-3 text-[13.5px] leading-6 text-white/70">{d.s17.angel.d}</p>
              <div className="mt-5 border-t border-white/15">
                {d.s17.angel.rows.map((row) => (
                  <div key={row[0]} className="flex items-center justify-between gap-4 border-b border-white/15 py-3">
                    <span className="text-[12.5px] text-white/55">{row[0]}</span>
                    <span className="text-[13px] font-bold" dir="auto">{row[1]}</span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-[11.5px] leading-5 text-white/50">{d.s17.angel.cover}</p>
              <a
                href={BRIEF_URL}
                className="mt-6 inline-flex min-h-[44px] items-center gap-2 text-[13.5px] font-extrabold text-white underline decoration-white/30 underline-offset-4 transition hover:decoration-white"
              >
                {d.s17.angel.cta}
                <span aria-hidden>→</span>
              </a>
            </div>
          </div>
          <NoteBar text={d.s17.disc} dark={false} />
        </div>
      </section>

      {/* ── 18 · what support unlocks (ivory) ───────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <SecHead no={d.s18.no} kicker={d.s18.kicker} title={d.s18.title} dark={false} />
        <div className="mt-10 grid gap-8 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {d.s18.cols.map((c, i) => {
            const Icon = [Puzzle, PenLine, Megaphone, Wrench][i];
            return (
              <div key={c.t} className="border-t border-[#152a1f]/12 pt-6">
                <div className="flex items-center justify-between">
                  <span aria-hidden className="grid h-10 w-10 place-items-center rounded-xl bg-[#142b21] text-[#d9f45a]">
                    <Icon className="h-4.5 w-4.5" />
                  </span>
                  <span className="font-mono text-[11px] font-bold text-[#152a1f]/40" dir="ltr">{String(i + 1).padStart(2, '0')}</span>
                </div>
                <p className="mt-5 text-[16.5px] font-extrabold">{c.t}</p>
                <p className="mt-1.5 text-[13px] leading-6 text-[#152a1f]/65">{c.d}</p>
              </div>
            );
          })}
        </div>

        {/* allocation band — MOBILE stacked / DESKTOP rows */}
        <div className="mt-12">
          <div className="flex flex-col gap-2 rounded-t-2xl px-6 py-4 text-white sm:flex-row sm:items-center sm:justify-between" style={{ backgroundColor: FOREST }}>
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-[#d9f45a]">{d.s18.alloc.band}</span>
            <span className="text-[12px] font-bold text-white/75">{d.s18.alloc.note}</span>
          </div>
          <div className="overflow-hidden rounded-b-2xl border border-t-0 border-[#152a1f]/10 bg-white">
            {/* MOBILE */}
            <div className="space-y-1 p-4 lg:hidden">
              {d.s18.alloc.rows.map((row) => (
                <div key={row[0]} className="flex items-center justify-between gap-4 rounded-xl px-2 py-2.5 odd:bg-[#f7f3ea]">
                  <span className="text-[13px] font-bold">{row[0]}</span>
                  <span className="text-[13px] font-extrabold tabular-nums" dir="ltr">{row[1]}</span>
                </div>
              ))}
            </div>
            {/* DESKTOP */}
            <div className="hidden lg:block">
              {d.s18.alloc.rows.map((row, i) => (
                <div key={row[0]} className={`flex items-center justify-between gap-6 px-6 py-3.5 ${i % 2 === 1 ? 'bg-[#f7f3ea]' : ''} ${i > 0 ? 'border-t border-[#152a1f]/5' : ''}`}>
                  <span className="text-[13.5px] font-extrabold">{row[0]}</span>
                  <span className="text-[13.5px] font-extrabold tabular-nums" dir="ltr">{row[1]}</span>
                </div>
              ))}
            </div>
          </div>
          <NoteBar text={d.s18.alloc.foot} dark={false} />
        </div>
      </section>

      {/* ── 19 · founder handoff (mint) ─────────────────────────────────────── */}
      <section className="py-16 lg:py-20" style={{ backgroundColor: MINT }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SecHead no={d.s19.no} kicker={d.s19.kicker} title={d.s19.title} dark={false} />
          <div className="mt-9 grid gap-3 sm:grid-cols-2">
            {d.s19.items.map((it) => (
              <div key={it} className="flex items-center gap-3.5 rounded-xl border border-[#152a1f]/8 bg-white px-4 py-3.5">
                <span aria-hidden className="h-4.5 w-4.5 shrink-0 rounded border-2 border-[#152a1f]/25" />
                <span className="text-[13px] font-semibold leading-5 text-[#152a1f]/80">{it}</span>
              </div>
            ))}
          </div>
          <NoteBar text={d.s19.note} dark={false} />
        </div>
      </section>

      {/* ── final CTA (forest, glowing) ─────────────────────────────────────── */}
      <section style={{ backgroundColor: FOREST }} className="relative overflow-hidden text-white">
        <div aria-hidden className="pointer-events-none absolute -bottom-48 right-0 h-[560px] w-[560px] rounded-full bg-[#d9f45a]/10 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-40 left-10 h-[420px] w-[420px] rounded-full bg-emerald-500/15 blur-3xl" />

        <div className="relative mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:py-28">
          <span className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-3.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-[#d9f45a]">
            {d.final.badge}
          </span>
          <h2 className="mt-7 text-[2.4rem] font-extrabold leading-[1.12] tracking-tight sm:text-[3.4rem]">
            {d.final.h1}
            <br />
            {d.final.h2} <span className="text-[#d9f45a]">{d.final.hl}</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[15px] leading-7 text-white/70">{d.final.sub}</p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={BRIEF_URL}
              className="inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-[#d9f45a] px-7 text-[14.5px] font-extrabold text-[#142b21] shadow-[0_10px_30px_-10px_rgba(217,244,90,0.5)] transition hover:brightness-105"
            >
              {d.final.cta}
              <span aria-hidden>→</span>
            </a>
            <a
              href={OVERVIEW_URL}
              className="inline-flex min-h-[48px] items-center rounded-xl border border-white/25 px-7 text-[14px] font-bold text-white/85 transition hover:bg-white/10"
            >
              {d.final.back}
            </a>
          </div>
        </div>

        <div className="relative border-t border-white/10">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-[11px] font-semibold text-white/60 sm:flex-row sm:px-6">
            <span>{d.chrome.deckFooter}</span>
            <span>{d.chrome.confidential}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
