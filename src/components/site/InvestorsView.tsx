'use client';

/**
 * /investors-koko — Investor Overview for «Quiz of Koko» (v2 — deck redesign).
 * (Route moved from /investors to /investors-koko by D-029, 2026-10-10;
 * /investors 308-redirects here. The deep pitch deck lives at
 * /investors-koko/deck — DeckView.tsx.)
 *
 * REDESIGNED 2026-10-10 after the owner's own refreshed investor page on
 * quizofkoko.com (owner order: «این لینک باز طراحی شده نگاه کن»). The new
 * reference uses an editorial deck language: ivory paper, ink bands,
 * serif display headline, numbered sections, decision-gated milestones and
 * an allocation table. This view adopts that LANGUAGE with 100% original
 * bilingual copy — only owner-published facts are used (1,287-question
 * live pool, 10 interface / 10 question languages, $25k–$30k Stage-1
 * runway, 40/20/14/11/8/7 allocation, web live today / mobile as a
 * milestone). Claims the refreshed page dropped (signed store builds,
 * store names, 13-language count) are deliberately absent so the two
 * pages never contradict each other.
 *
 * Layers:
 *  - copy: src/components/site/i18n.ts → ui[lang].investors (en + fa)
 *  - view: this file — a FIXED deck palette (ivory + ink, theme-independent,
 *    like a PDF pitch deck); SiteChrome drops the ThemeBackground overlay
 *    on this route for the same reason.
 *  - form: reuses the existing POST /api/contact pipeline (subject prefix
 *    `inv.s9.subjectTag`) — zero new backend surface, zero schema change.
 *
 * Web vs mobile (owner law #2): the allocation table and the milestone
 * rows have DEDICATED mobile layouts (stacked cards), not scaled-down
 * copies of the desktop rows. Verified at lg and 390px.
 */

import { useState } from 'react';
import { useApp } from './store';
import { ui } from './i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, ArrowRight, Bot, ExternalLink, Gamepad2 } from 'lucide-react';

const PLAY_URL = 'https://quizofkoko.com';

/* ── deck palette (fixed — this page is a pitch deck, not a themed page) ── */
const PAPER = '#f6f1e7';
const CARD = '#fffdf8';
const LINE = '#e4dcc8';
const INK = '#171a20';
const INK_CARD = '#1f242c';

/* ── shared bits ─────────────────────────────────────────────────────────── */

function Kicker({ no, kicker, tone }: { no: string; kicker: string; tone: 'paper' | 'ink' }) {
  const ink = tone === 'ink';
  return (
    <div className="flex items-center gap-2.5">
      <span
        className={`font-mono text-[13px] font-bold tabular-nums ${ink ? 'text-emerald-400' : 'text-emerald-700'}`}
        dir="ltr"
      >
        {no}
      </span>
      <span className={`h-px w-6 ${ink ? 'bg-white/25' : 'bg-[#191713]/25'}`} aria-hidden />
      <span
        className={`text-[12px] font-bold uppercase tracking-[0.14em] ${ink ? 'text-white/60' : 'text-[#191713]/60'}`}
      >
        {kicker}
      </span>
    </div>
  );
}

function SectionHead({
  no,
  kicker,
  title,
  sub,
  tone,
  serif,
}: {
  no: string;
  kicker: string;
  title: string;
  sub?: string;
  tone: 'paper' | 'ink';
  serif: boolean;
}) {
  const ink = tone === 'ink';
  return (
    <div className="max-w-3xl">
      <Kicker no={no} kicker={kicker} tone={tone} />
      <h2
        className={`mt-3 text-2xl font-extrabold leading-snug tracking-tight sm:text-[2rem] ${serif ? 'font-serif' : ''} ${
          ink ? 'text-[#f3efe6]' : 'text-[#191713]'
        }`}
      >
        {title}
      </h2>
      {sub && (
        <p className={`mt-3 text-[15px] leading-7 ${ink ? 'text-white/70' : 'text-[#191713]/70'}`}>
          {sub}
        </p>
      )}
    </div>
  );
}

/* ── view ────────────────────────────────────────────────────────────────── */

export function InvestorsView() {
  const { lang, setChatOpen } = useApp();
  const t = ui[lang];
  const inv = t.investors;
  const rtl = lang === 'fa';
  const serif = rtl ? false : true; // serif display exists for EN; FA keeps Vazirmatn
  const Arrow = rtl ? ArrowLeft : ArrowRight;

  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError('');
    try {
      // same pipeline as the contact form: intent travels as a subject prefix,
      // so the owner's inbox stays readable and no schema/API change is needed
      const subject = `[${inv.s9.subjectTag}] ${inv.s9.formTitle}`;
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, subject }),
      });
      const data = await res.json();
      if (res.ok) {
        setDone(true);
        setForm({ name: '', email: '', subject: '', message: '' });
      } else {
        setError(data.error || inv.s9.error);
      }
    } catch {
      setError(inv.s9.error);
    } finally {
      setSending(false);
    }
  }

  function scrollToForm() {
    document.getElementById('briefing')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div dir={rtl ? 'rtl' : 'ltr'} style={{ backgroundColor: PAPER }} className="investors-root text-[#191713]">
      {/* ── announcement bar ─────────────────────────────────────────────── */}
      <div className="bg-[#b3261e] text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-2 px-4 py-2.5 text-[13px] sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="font-semibold leading-6">{inv.ann.text}</p>
          <button
            onClick={scrollToForm}
            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full bg-white px-4 text-[12.5px] font-bold text-[#b3261e] transition hover:bg-white/90"
          >
            {inv.ann.cta}
            <Arrow className="h-3.5 w-3.5" aria-hidden />
          </button>
        </div>
      </div>

      {/* ── hero ─────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 pb-14 pt-12 sm:px-6 lg:pb-20 lg:pt-16">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          {/* left: story + ask + CTAs */}
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-700/30 bg-emerald-600/10 px-3.5 py-1.5 text-[12.5px] font-bold text-emerald-800">
              <span className="relative flex h-2 w-2" aria-hidden>
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-600 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-700" />
              </span>
              {inv.hero.eyebrow}
            </span>

            <h1
              className={`mt-5 text-[2.5rem] font-extrabold leading-[1.12] tracking-tight sm:text-[3.4rem] ${
                serif ? 'font-serif font-bold' : ''
              }`}
            >
              {inv.hero.titleA}{' '}
              <span className="text-emerald-700">{inv.hero.titleB}</span>
            </h1>
            <p className="mt-4 max-w-xl text-[15.5px] leading-7 text-[#191713]/70 sm:text-base">
              {inv.hero.sub}
            </p>

            {/* the ask — inline strip on desktop, stacked card on mobile */}
            <div className="mt-7 flex flex-col gap-4 rounded-2xl border border-[#191713]/10 bg-[#fffdf8] p-5 sm:flex-row sm:items-center sm:gap-6">
              <div>
                <div className="text-[12.5px] font-semibold text-[#191713]/60">{inv.hero.fundLabel}</div>
                <div className="mt-0.5 text-3xl font-extrabold tracking-tight tabular-nums" dir="ltr">
                  {inv.hero.fundValue}
                </div>
              </div>
              <p className="border-t border-dashed border-[#191713]/15 pt-3 text-[13px] leading-6 text-[#191713]/70 sm:border-s sm:border-t-0 sm:ps-6 sm:pt-0">
                {inv.hero.fundSub}
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a
                href={PLAY_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-[#191713] px-6 text-[14.5px] font-bold text-[#f6f1e7] shadow-sm transition hover:bg-[#2a2e36]"
              >
                <Gamepad2 className="h-4.5 w-4.5" aria-hidden />
                {inv.hero.ctaPlay}
                <ExternalLink className="h-3.5 w-3.5 opacity-60" aria-hidden />
              </a>
              <Button
                size="lg"
                onClick={scrollToForm}
                className="min-h-[48px] rounded-xl border border-[#191713]/15 bg-transparent px-6 text-[14.5px] font-bold text-[#191713] shadow-none hover:bg-[#191713]/5"
                variant="outline"
              >
                {inv.hero.ctaBrief}
              </Button>
            </div>
            <p className="mt-3 text-[12.5px] text-[#191713]/55">{inv.hero.micro}</p>
          </div>

          {/* right: product mock card — pure CSS, no fake data, no extra copy */}
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div
              className="relative rounded-[2rem] border border-[#191713]/10 p-6 shadow-[0_24px_60px_-24px_rgba(25,23,19,0.35)] sm:p-7"
              style={{ backgroundColor: CARD }}
            >
              {/* AI badge */}
              <span
                className="absolute -top-4 flex h-9 w-9 items-center justify-center rounded-full bg-emerald-700 text-[11px] font-extrabold text-white shadow-md end-6"
                aria-hidden
              >
                AI
              </span>

              <p className="text-[13.5px] font-bold leading-6">{inv.hero.mockTitle}</p>

              {/* question skeleton (graphic, language-neutral) */}
              <div className="mt-4 space-y-2.5" aria-hidden>
                <div className="h-3 w-4/5 rounded-full bg-[#e8e0cd]" />
                <div className="h-3 w-3/5 rounded-full bg-[#e8e0cd]" />
              </div>
              <div className="mt-5 space-y-3" aria-hidden>
                <div className="flex h-11 items-center gap-3 rounded-xl border border-[#191713]/10 bg-white px-4">
                  <span className="h-4 w-4 rounded-full border-2 border-emerald-700 bg-emerald-600/20" />
                  <span className="h-2.5 w-2/5 rounded-full bg-[#e8e0cd]" />
                </div>
                <div className="flex h-11 items-center gap-3 rounded-xl border border-[#191713]/10 bg-white px-4">
                  <span className="h-4 w-4 rounded-full border-2 border-[#191713]/20" />
                  <span className="h-2.5 w-1/2 rounded-full bg-[#e8e0cd]" />
                </div>
                <div className="flex h-11 items-center gap-3 rounded-xl border border-[#191713]/10 bg-white px-4">
                  <span className="h-4 w-4 rounded-full border-2 border-[#191713]/20" />
                  <span className="h-2.5 w-1/3 rounded-full bg-[#e8e0cd]" />
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                {inv.hero.mockChips.map((c) => (
                  <span
                    key={c}
                    className="rounded-full border border-[#191713]/10 bg-[#f6f1e7] px-3 py-1 text-[11.5px] font-semibold text-[#191713]/70"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── stats band (ink) ─────────────────────────────────────────────── */}
      <section className="text-[#f3efe6]" style={{ backgroundColor: INK }} aria-label={inv.stats[0].t}>
        {/* mobile: 2×2 grid with cell borders — desktop: 4 inline columns */}
        <div className="mx-auto grid max-w-6xl grid-cols-2 px-4 sm:px-6 lg:grid-cols-4">
          {inv.stats.map((s, i) => (
            <div
              key={s.t}
              className={`px-2 py-7 sm:px-6 lg:py-9 ${
                i % 2 === 1 ? 'border-s border-white/10' : ''
              } ${i >= 2 ? 'border-t border-white/10 lg:border-t-0' : ''} ${
                i > 0 ? 'lg:border-s lg:border-white/10' : ''
              }`}
            >
              <div className="text-2xl font-extrabold tracking-tight text-emerald-400 tabular-nums sm:text-3xl" dir="auto">
                {s.v}
              </div>
              <div className="mt-1.5 text-[13px] font-bold">{s.t}</div>
              <div className="mt-0.5 text-[12px] leading-5 text-white/55">{s.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 01 · the product ─────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-20">
        <SectionHead no={inv.s1.no} kicker={inv.s1.kicker} title={inv.s1.title} sub={inv.s1.sub} tone="paper" serif={serif} />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {inv.s1.cards.map((c, i) => (
            <div
              key={c.t}
              className="rounded-2xl border border-[#191713]/10 p-5 shadow-sm transition hover:shadow-md sm:p-6"
              style={{ backgroundColor: CARD }}
            >
              <span
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#191713] font-mono text-[12px] font-bold text-[#f6f1e7]"
                dir="ltr"
                aria-hidden
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-4 text-[15px] font-extrabold">{c.t}</h3>
              <p className="mt-2 text-[13.5px] leading-6 text-[#191713]/65">{c.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 02 · why this product ────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6 lg:pb-20">
        <SectionHead no={inv.s2.no} kicker={inv.s2.kicker} title={inv.s2.title} sub={inv.s2.sub} tone="paper" serif={serif} />
        {/* hypothesis flow — stacked steps on mobile, connected row on desktop */}
        <ol className="mt-8 grid gap-4 lg:grid-cols-3">
          {inv.s2.steps.map((st, i) => (
            <li
              key={st.t}
              className="relative flex items-center gap-4 rounded-2xl border border-[#191713]/10 p-5 sm:gap-5"
              style={{ backgroundColor: CARD }}
            >
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-emerald-700/30 bg-emerald-600/10 font-mono text-[13px] font-bold text-emerald-800"
                dir="ltr"
                aria-hidden
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <p className="text-[15px] font-extrabold">{st.t}</p>
                <p className="mt-0.5 text-[12.5px] leading-5 text-[#191713]/60">{st.d}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ── 03 · the opportunity ─────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6 lg:pb-20">
        <SectionHead no={inv.s3.no} kicker={inv.s3.kicker} title={inv.s3.title} sub={inv.s3.sub} tone="paper" serif={serif} />
        <div className="mt-8 grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
          {/* what stage 1 must prove */}
          <div className="rounded-2xl border border-[#191713]/10 p-5 shadow-sm sm:p-6" style={{ backgroundColor: CARD }}>
            <h3 className="text-[15px] font-extrabold">{inv.s3.proveTitle}</h3>
            <ul className="mt-4 divide-y divide-dashed divide-[#191713]/10">
              {inv.s3.prove.map((p) => (
                <li key={p.t} className="flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:gap-5">
                  <span className="w-28 shrink-0 text-[14px] font-extrabold text-emerald-800">{p.t}</span>
                  <span className="text-[13.5px] leading-6 text-[#191713]/70">{p.d}</span>
                </li>
              ))}
            </ul>
          </div>
          {/* counterpoint — ink card */}
          <div className="flex flex-col rounded-2xl p-6 text-[#f3efe6]" style={{ backgroundColor: INK_CARD }}>
            <h3 className="text-[15px] font-extrabold text-emerald-400">{inv.s3.vanityTitle}</h3>
            <p className="mt-3 text-[13.5px] leading-7 text-white/70">{inv.s3.vanity}</p>
            <p className="mt-auto pt-5 text-[12.5px] font-bold tracking-wide text-white/80">
              {inv.s3.vanityTag}
            </p>
          </div>
        </div>
      </section>

      {/* ── 04 · milestones (ink band) ───────────────────────────────────── */}
      <section className="py-14 text-[#f3efe6] lg:py-20" style={{ backgroundColor: INK }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHead no={inv.s4.no} kicker={inv.s4.kicker} title={inv.s4.title} sub={inv.s4.sub} tone="ink" serif={serif} />

          {/* MOBILE: stacked gate cards (dedicated layout, not shrunken rows) */}
          <ol className="mt-8 space-y-3 lg:hidden">
            {inv.s4.rows.map((r, i) => (
              <li key={r.t} className="rounded-2xl border border-white/10 p-5" style={{ backgroundColor: INK_CARD }}>
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2 font-mono text-[12px] font-bold text-emerald-400" dir="auto">
                    <span className="text-white/40" dir="ltr">{String(i + 1).padStart(2, '0')}</span>
                    {r.phase}
                  </span>
                  <span className="rounded-full border border-emerald-400/40 px-3 py-1 text-[11.5px] font-bold text-emerald-300">
                    {r.badge}
                  </span>
                </div>
                <p className="mt-3 text-[14.5px] font-extrabold leading-6">{r.t}</p>
                <p className="mt-1.5 text-[13px] leading-6 text-white/60">{r.d}</p>
              </li>
            ))}
          </ol>

          {/* DESKTOP: decision-gate rows */}
          <ol className="mt-8 hidden overflow-hidden rounded-2xl border border-white/10 lg:block" style={{ backgroundColor: INK_CARD }}>
            {inv.s4.rows.map((r, i) => (
              <li
                key={r.t}
                className={`grid grid-cols-[110px_1.1fr_1.5fr_120px] items-center gap-6 px-6 py-5 ${
                  i > 0 ? 'border-t border-white/10' : ''
                }`}
              >
                <span className="font-mono text-[12px] font-bold text-emerald-400" dir="auto">
                  <span className="me-2 text-white/40" dir="ltr">{String(i + 1).padStart(2, '0')}</span>
                  {r.phase}
                </span>
                <span className="text-[14.5px] font-extrabold leading-6">{r.t}</span>
                <span className="text-[13px] leading-6 text-white/60">{r.d}</span>
                <span className="justify-self-end rounded-full border border-emerald-400/40 px-3.5 py-1 text-[11.5px] font-bold text-emerald-300">
                  {r.badge}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── 05 · funding plan ────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-20">
        <SectionHead no={inv.s5.no} kicker={inv.s5.kicker} title={inv.s5.title} sub={inv.s5.sub} tone="paper" serif={serif} />

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-[#191713] px-4 py-1.5 text-[12.5px] font-bold text-[#f6f1e7]">
            {inv.s5.stageTag}
          </span>
          <span className="rounded-full border border-emerald-700/30 bg-emerald-600/10 px-4 py-1.5 text-[12.5px] font-bold text-emerald-800">
            {inv.s5.monthly}
          </span>
        </div>

        <h3 className="mt-7 text-[14px] font-extrabold text-[#191713]/70">{inv.s5.allocTitle}</h3>

        {/* MOBILE: dedicated stacked allocation cards */}
        <div className="mt-4 space-y-3 lg:hidden">
          {inv.s5.alloc.map((a) => (
            <div key={a.t} className="rounded-2xl border border-[#191713]/10 p-4" style={{ backgroundColor: CARD }}>
              <div className="flex items-center justify-between gap-3">
                <span className="text-xl font-extrabold tabular-nums" dir="ltr">{a.amt}</span>
                <span className="rounded-full bg-emerald-600/10 px-3 py-1 text-[12px] font-bold text-emerald-800" dir="auto">
                  {a.pct}
                </span>
              </div>
              <p className="mt-2 text-[14px] font-extrabold">{a.t}</p>
              <p className="mt-1 text-[12.5px] leading-5 text-[#191713]/60">{a.d}</p>
            </div>
          ))}
          <div className="flex items-center justify-between rounded-2xl bg-[#191713] px-5 py-4 text-[#f6f1e7]">
            <span className="text-[13.5px] font-bold">{inv.s5.totalLabel}</span>
            <span className="text-xl font-extrabold tabular-nums" dir="ltr">{inv.s5.totalAmt}</span>
          </div>
        </div>

        {/* DESKTOP: allocation table */}
        <div className="mt-4 hidden overflow-hidden rounded-2xl border border-[#191713]/10 lg:block" style={{ backgroundColor: CARD }}>
          {inv.s5.alloc.map((a, i) => (
            <div
              key={a.t}
              className={`grid grid-cols-[120px_90px_1fr_1.5fr] items-center gap-5 px-6 py-4 ${
                i % 2 === 1 ? 'bg-[#f6f1e7]/60' : ''
              } ${i > 0 ? 'border-t border-[#191713]/5' : ''}`}
            >
              <span className="text-[17px] font-extrabold tabular-nums" dir="ltr">{a.amt}</span>
              <span className="text-[12.5px] font-bold text-emerald-800" dir="auto">{a.pct}</span>
              <span className="text-[14px] font-extrabold">{a.t}</span>
              <span className="text-[12.5px] leading-5 text-[#191713]/60">{a.d}</span>
            </div>
          ))}
          <div className="flex items-center justify-between bg-[#191713] px-6 py-4 text-[#f6f1e7]">
            <span className="text-[13.5px] font-bold">{inv.s5.totalLabel}</span>
            <span className="text-xl font-extrabold tabular-nums" dir="ltr">{inv.s5.totalAmt}</span>
          </div>
        </div>

        <p className="mt-4 max-w-3xl text-[12.5px] leading-6 text-[#191713]/55">{inv.s5.allocNote}</p>
        <p className="mt-3 inline-flex rounded-full border border-[#191713]/15 px-4 py-1.5 text-[12.5px] font-bold text-[#191713]/75">
          {inv.s5.noStage2}
        </p>
      </section>

      {/* ── 06 · business model ──────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6 lg:pb-20">
        <SectionHead no={inv.s6.no} kicker={inv.s6.kicker} title={inv.s6.title} sub={inv.s6.sub} tone="paper" serif={serif} />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {inv.s6.cards.map((c) => (
            <div
              key={c.t}
              className="rounded-2xl border border-[#191713]/10 p-5 shadow-sm transition hover:shadow-md sm:p-6"
              style={{ backgroundColor: CARD }}
            >
              <span className="rounded-full border border-emerald-700/30 bg-emerald-600/10 px-3 py-1 text-[11.5px] font-bold text-emerald-800">
                {c.badge}
              </span>
              <h3 className="mt-3.5 text-[15px] font-extrabold">{c.t}</h3>
              <p className="mt-2 text-[13.5px] leading-6 text-[#191713]/65">{c.d}</p>
            </div>
          ))}
        </div>
        <p className="mt-5 rounded-2xl border border-amber-700/30 bg-amber-500/10 p-4 text-[13px] leading-6 text-amber-900">
          {inv.s6.caution}
        </p>
      </section>

      {/* ── 07 · founder & investment (ink band) ─────────────────────────── */}
      <section className="py-14 text-[#f3efe6] lg:py-20" style={{ backgroundColor: INK }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
            <div>
              <SectionHead no={inv.s7.no} kicker={inv.s7.kicker} title={inv.s7.title} sub={inv.s7.sub} tone="ink" serif={serif} />
              <a
                href="/about"
                className="mt-6 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#f6f1e7] px-5 text-[13.5px] font-bold text-[#191713] transition hover:bg-white"
              >
                {inv.s7.founderCta}
                <Arrow className="h-4 w-4" aria-hidden />
              </a>
            </div>
            <div className="rounded-2xl border border-white/10 p-6" style={{ backgroundColor: INK_CARD }}>
              <h3 className="text-[15px] font-extrabold text-emerald-400">{inv.s7.structTitle}</h3>
              <ul className="mt-4 space-y-3.5">
                {inv.s7.struct.map((s) => (
                  <li key={s} className="flex items-start gap-3 text-[13.5px] leading-6 text-white/75">
                    <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" aria-hidden />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── 08 · start a conversation ────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
          <div>
            <SectionHead no={inv.s8.no} kicker={inv.s8.kicker} title={inv.s8.title} sub={inv.s8.sub} tone="paper" serif={serif} />
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a
                href={PLAY_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-[#191713] px-6 text-[14px] font-bold text-[#f6f1e7] transition hover:bg-[#2a2e36]"
              >
                <Gamepad2 className="h-4 w-4" aria-hidden />
                {inv.s8.playCta}
              </a>
              <Button
                size="lg"
                onClick={scrollToForm}
                variant="outline"
                className="min-h-[48px] rounded-xl border border-[#191713]/15 bg-transparent px-6 text-[14px] font-bold text-[#191713] shadow-none hover:bg-[#191713]/5"
              >
                {inv.s8.briefCta}
              </Button>
            </div>
          </div>
          <div className="rounded-2xl border border-[#191713]/10 p-6 shadow-sm" style={{ backgroundColor: CARD }}>
            <h3 className="text-[15px] font-extrabold">{inv.s8.convTitle}</h3>
            <ul className="mt-4 flex flex-wrap gap-2">
              {inv.s8.convItems.map((c) => (
                <li
                  key={c}
                  className="rounded-full border border-[#191713]/10 bg-[#f6f1e7] px-3.5 py-1.5 text-[12.5px] font-semibold text-[#191713]/75"
                >
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* assistant strip — reuses the site-wide chat widget */}
        <div className="mt-8 flex flex-col items-start gap-4 rounded-2xl border border-emerald-700/20 bg-emerald-600/[0.06] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#191713] text-[#f6f1e7]">
              <Bot className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <p className="text-[14.5px] font-extrabold">{inv.s8.assistTitle}</p>
              <p className="mt-1 max-w-xl text-[13px] leading-6 text-[#191713]/65">{inv.s8.assistSub}</p>
            </div>
          </div>
          <Button
            onClick={() => setChatOpen(true)}
            className="min-h-[44px] shrink-0 rounded-xl bg-[#191713] text-[13px] font-bold text-[#f6f1e7] hover:bg-[#2a2e36]"
          >
            {inv.s8.assistOpen}
          </Button>
        </div>
      </section>

      {/* ── full pitch deck banner → /investors-koko/deck (D-029) ─────────── */}
      <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6 lg:pb-20">
        <a
          href="/investors-koko/deck"
          className="group flex flex-col gap-5 rounded-2xl border border-[#191713]/10 p-5 shadow-sm transition hover:shadow-md sm:flex-row sm:items-center sm:justify-between sm:p-6"
          style={{ backgroundColor: CARD }}
        >
          <div>
            <p className="text-[11.5px] font-bold uppercase tracking-[0.14em] text-emerald-800">
              {t.deck.overviewLink.kicker}
            </p>
            <p className="mt-1.5 text-[16.5px] font-extrabold">{t.deck.overviewLink.title}</p>
            <p className="mt-1 max-w-2xl text-[13px] leading-6 text-[#191713]/65">{t.deck.overviewLink.sub}</p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span className="hidden rounded-full border border-[#191713]/10 bg-[#f6f1e7] px-3 py-1 text-[11.5px] font-semibold text-[#191713]/70 sm:inline-flex">
              {t.deck.overviewLink.meta}
            </span>
            <span className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#191713] px-5 text-[13.5px] font-bold text-[#f6f1e7] transition group-hover:bg-[#2a2e36]">
              {t.deck.overviewLink.cta}
              <Arrow className="h-4 w-4" aria-hidden />
            </span>
          </div>
        </a>
      </section>

      {/* ── 09 · private briefing form ───────────────────────────────────── */}
      <section id="briefing" className="mx-auto max-w-6xl scroll-mt-24 px-4 pb-16 sm:px-6 lg:pb-24">
        <SectionHead no={inv.s9.no} kicker={inv.s9.kicker} title={inv.s9.title} sub={inv.s9.sub} tone="paper" serif={serif} />

        <form
          onSubmit={submit}
          className="mt-8 max-w-2xl rounded-2xl border border-[#191713]/10 p-5 shadow-sm sm:p-7"
          style={{ backgroundColor: CARD }}
        >
          <h3 className="text-[15px] font-extrabold">{inv.s9.formTitle}</h3>
          {done && (
            <div className="mt-4 rounded-xl border border-emerald-700/30 bg-emerald-600/10 p-4 text-[13.5px] font-semibold text-emerald-900">
              ✓ {inv.s9.success}
            </div>
          )}
          {error && (
            <div className="mt-4 rounded-xl border border-[#b3261e]/30 bg-[#b3261e]/10 p-4 text-[13.5px] font-semibold text-[#b3261e]">
              {error}
            </div>
          )}
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="inv-name" className="text-[12.5px] font-bold text-[#191713]/70">{inv.s9.name}</Label>
              <Input
                id="inv-name"
                required
                minLength={2}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                autoComplete="name"
                className="h-11 rounded-xl border-[#191713]/15 bg-white focus-visible:ring-emerald-700/40"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="inv-email" className="text-[12.5px] font-bold text-[#191713]/70">{inv.s9.email}</Label>
              <Input
                id="inv-email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                autoComplete="email"
                dir="ltr"
                className="h-11 rounded-xl border-[#191713]/15 bg-white focus-visible:ring-emerald-700/40"
              />
            </div>
          </div>
          <div className="mt-4 space-y-1.5">
            <Label htmlFor="inv-org" className="text-[12.5px] font-bold text-[#191713]/70">{inv.s9.org}</Label>
            <Input
              id="inv-org"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="h-11 rounded-xl border-[#191713]/15 bg-white focus-visible:ring-emerald-700/40"
            />
          </div>
          <div className="mt-4 space-y-1.5">
            <Label htmlFor="inv-msg" className="text-[12.5px] font-bold text-[#191713]/70">{inv.s9.message}</Label>
            <Textarea
              id="inv-msg"
              required
              minLength={5}
              rows={4}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="rounded-xl border-[#191713]/15 bg-white focus-visible:ring-emerald-700/40"
            />
          </div>
          <Button
            type="submit"
            disabled={sending}
            className="mt-6 min-h-[48px] w-full rounded-xl bg-[#191713] text-[14px] font-bold text-[#f6f1e7] hover:bg-[#2a2e36] sm:w-auto sm:px-8"
          >
            {sending ? inv.s9.sending : inv.s9.submit}
          </Button>
          <p className="mt-4 text-[12px] leading-5 text-[#191713]/55">{inv.s9.privacy}</p>
        </form>
      </section>

      {/* ── page disclaimer (closing ink band) ───────────────────────────── */}
      <footer className="px-4 py-8 text-center sm:px-6" style={{ backgroundColor: INK }}>
        <p className="mx-auto max-w-3xl text-[12px] leading-6 text-white/55">{inv.disclaimer}</p>
      </footer>
    </div>
  );
}
