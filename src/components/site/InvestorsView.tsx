'use client';

/**
 * /investors — Investor Overview for «Quiz of Koko».
 * Modeled on the structure of quizofkoko.com/investors (owner's own product
 * page) with fully custom copy; only owner-published product facts are used
 * (funding range, languages, question counts, build version, store targets).
 *
 * Layers:
 *  - copy: src/components/site/i18n.ts → ui[lang].investors (en + fa)
 *  - view: this file (bilingual, RTL-aware, mobile-specific layouts)
 *  - form: reuses the existing POST /api/contact pipeline (subject prefix
 *    `inv.formSubjectTag`) — zero new backend surface, zero schema change.
 */

import { useState } from 'react';
import { useApp } from './store';
import { ui } from './i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Bot,
  CheckCircle2,
  ExternalLink,
  Gamepad2,
  Globe,
  Lock,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  User,
} from 'lucide-react';

const PLAY_URL = 'https://quizofkoko.com';

export function InvestorsView() {
  const { lang, setChatOpen } = useApp();
  const t = ui[lang];
  const inv = t.investors;
  const rtl = lang === 'fa';

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
      const subject = `[${inv.s8.subjectTag}] ${inv.s8.formTitle}`;
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
        setError(data.error || inv.s8.error);
      }
    } catch {
      setError(inv.s8.error);
    } finally {
      setSending(false);
    }
  }

  function scrollToForm() {
    document.getElementById('briefing')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const SECTION_ICONS = [Gamepad2, Target, ShieldCheck, TrendingUp, Bot, User, Lock, Sparkles];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6" dir={rtl ? 'rtl' : 'ltr'}>
      {/* ── hero ─────────────────────────────────────────────── */}
      <header className="text-center">
        <span className="inline-flex min-h-[36px] items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 text-[13px] font-bold text-violet-700 dark:text-violet-300">
          <Sparkles className="h-4 w-4" />
          {inv.badge}
        </span>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
          {inv.title}
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-lg font-semibold text-muted-foreground">
          {inv.titleAccent}
        </p>
        <p className="mx-auto mt-3 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
          {inv.sub}
        </p>

        <div className="mx-auto mt-6 flex max-w-md flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            size="lg"
            onClick={scrollToForm}
            className="min-h-[48px] w-full bg-violet-600 text-white hover:bg-violet-700 sm:w-auto"
          >
            {inv.ctaBriefing}
          </Button>
          <Button size="lg" variant="outline" asChild className="min-h-[48px] w-full sm:w-auto">
            <a href={PLAY_URL} target="_blank" rel="noreferrer">
              <Gamepad2 className="h-4 w-4" />
              {inv.ctaPlay}
              <ExternalLink className="h-3.5 w-3.5 opacity-60" />
            </a>
          </Button>
        </div>

        {/* funding sought */}
        <div className="mx-auto mt-8 max-w-md rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="text-[13px] font-medium text-muted-foreground">{inv.seekLabel}</div>
          <div className="mt-1 text-3xl font-extrabold tracking-tight" dir="ltr">
            {inv.seekValue}
          </div>
          <div className="mt-1 text-[13px] text-muted-foreground">{inv.seekSub}</div>
        </div>
      </header>

      {/* ── live stats strip ─────────────────────────────────── */}
      <section aria-label="Product status" className="mt-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {inv.stats.map((s, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-4 text-center shadow-sm">
            <div className="text-xl font-extrabold text-violet-700 dark:text-violet-300" dir="auto">
              {s.value}
            </div>
            <div className="mt-1.5 text-[12px] leading-5 text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </section>

      {/* ── 01 product / 02 opportunity / 03 tech ───────────── */}
      {(
        [
          {
            icon: SECTION_ICONS[0],
            kicker: inv.s1.kicker,
            title: inv.s1.title,
            sub: inv.s1.sub,
            body: (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                    <h3 className="flex items-center gap-2 text-sm font-extrabold text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 className="h-4 w-4" />
                      {inv.s1.shippedTitle}
                    </h3>
                    <ul className="mt-3 space-y-2">
                      {inv.s1.shipped.map((x) => (
                        <li key={x} className="flex items-start gap-2 text-[13px] leading-6 text-muted-foreground">
                          <CheckCircle2 className="mt-1 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                          {x}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                    <h3 className="flex items-center gap-2 text-sm font-extrabold text-violet-700 dark:text-violet-300">
                      <TrendingUp className="h-4 w-4" />
                      {inv.s1.nextTitle}
                    </h3>
                    <ol className="mt-3 space-y-2">
                      {inv.s1.next.map((x, i) => (
                        <li key={x} className="flex items-start gap-2 text-[13px] leading-6 text-muted-foreground">
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-500/15 text-[11px] font-bold text-violet-700 dark:text-violet-300">
                            {i + 1}
                          </span>
                          {x}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>

                {/* evidence-gated steps */}
                <h3 className="mt-8 text-base font-extrabold">{inv.s1.stepsTitle}</h3>
                <ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  {inv.s1.steps.map((st, i) => (
                    <li key={st.t} className="rounded-xl border border-border bg-card p-4 shadow-sm">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-violet-600 text-[12px] font-bold text-white">
                        {i + 1}
                      </span>
                      <p className="mt-2 text-[13px] font-bold">{st.t}</p>
                      <p className="mt-1 text-[12px] leading-5 text-muted-foreground">{st.d}</p>
                    </li>
                  ))}
                </ol>
                <p className="mt-4 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-[13px] leading-6 text-amber-800 dark:text-amber-200">
                  {inv.s1.honestyNote}
                </p>
              </>
            ),
          },
          {
            icon: SECTION_ICONS[1],
            kicker: inv.s2.kicker,
            title: inv.s2.title,
            sub: inv.s2.sub,
            body: (
              <>
                <div className="grid gap-4 md:grid-cols-3">
                  {inv.s2.pillars.map((p) => (
                    <div key={p.t} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                      <h3 className="text-sm font-extrabold">{p.t}</h3>
                      <p className="mt-2 text-[13px] leading-6 text-muted-foreground">{p.d}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
                  <h3 className="text-sm font-extrabold">{inv.s2.proveLabel}</h3>
                  <p className="mt-2 text-[13px] leading-6 text-muted-foreground">{inv.s2.prove}</p>
                </div>
              </>
            ),
          },
          {
            icon: SECTION_ICONS[2],
            kicker: inv.s3.kicker,
            title: inv.s3.title,
            sub: inv.s3.sub,
            body: (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {inv.s3.items.map((it) => (
                  <div key={it.t} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                        it.state === 'Shipped' || it.state === 'عرضه‌شده'
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                          : 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                      }`}
                    >
                      {it.state}
                    </span>
                    <h3 className="mt-2.5 text-sm font-extrabold">{it.t}</h3>
                    <p className="mt-1.5 text-[13px] leading-6 text-muted-foreground">{it.d}</p>
                  </div>
                ))}
              </div>
            ),
          },
          {
            icon: SECTION_ICONS[3],
            kicker: inv.s4.kicker,
            title: inv.s4.title,
            sub: inv.s4.sub,
            body: (
              <>
                <div className="rounded-2xl border border-violet-500/30 bg-violet-500/5 p-5 shadow-sm">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="text-base font-extrabold">{inv.s4.stage1Title}</h3>
                    <span className="text-[12px] font-medium text-muted-foreground">{inv.s4.stage1Tag}</span>
                  </div>

                  {/* allocation — mobile: stacked cards / desktop: table rows */}
                  <h4 className="mt-5 text-[13px] font-bold text-muted-foreground">{inv.s4.allocTitle}</h4>

                  {/* MOBILE layout (dedicated) */}
                  <div className="mt-3 space-y-3 md:hidden">
                    {inv.s4.alloc.map((a) => (
                      <div key={a.t} className="rounded-xl border border-border bg-card p-4">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-lg font-extrabold" dir="ltr">{a.amt}</span>
                          <span className="rounded-full bg-violet-500/15 px-2.5 py-1 text-[11px] font-bold text-violet-700 dark:text-violet-300">
                            {a.pct}
                          </span>
                        </div>
                        <p className="mt-1.5 text-[13px] font-bold">{a.t}</p>
                        <p className="mt-1 text-[12px] leading-5 text-muted-foreground">{a.d}</p>
                      </div>
                    ))}
                  </div>

                  {/* DESKTOP layout */}
                  <div className="mt-3 hidden overflow-hidden rounded-xl border border-border md:block">
                    {inv.s4.alloc.map((a, i) => (
                      <div
                        key={a.t}
                        className={`grid grid-cols-[110px_90px_1fr_1.4fr] items-center gap-3 px-4 py-3 ${
                          i % 2 === 0 ? 'bg-card' : 'bg-muted/40'
                        }`}
                      >
                        <span className="text-sm font-extrabold" dir="ltr">{a.amt}</span>
                        <span className="text-[12px] font-bold text-violet-700 dark:text-violet-300">{a.pct}</span>
                        <span className="text-[13px] font-bold">{a.t}</span>
                        <span className="text-[12px] leading-5 text-muted-foreground">{a.d}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between bg-violet-600 px-4 py-3 text-white">
                      <span className="text-[13px] font-bold">{inv.s4.totalLabel}</span>
                      <span className="text-lg font-extrabold" dir="ltr">{inv.s4.totalAmt}</span>
                    </div>
                  </div>
                  <p className="mt-3 text-[12px] leading-5 text-muted-foreground">{inv.s4.allocNote}</p>
                </div>

                <div className="mt-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
                  <h3 className="text-base font-extrabold">{inv.s4.stage2Title}</h3>
                  <p className="mt-1 text-[13px] text-muted-foreground">{inv.s4.stage2Sub}</p>
                  <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                    {inv.s4.stage2.map((x) => (
                      <li key={x} className="flex items-start gap-2 text-[13px] leading-6 text-muted-foreground">
                        <CheckCircle2 className="mt-1 h-3.5 w-3.5 shrink-0 text-violet-600" />
                        {x}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-[12px] leading-5 text-muted-foreground">{inv.s4.stage2Note}</p>
                </div>
              </>
            ),
          },
          {
            icon: SECTION_ICONS[4],
            kicker: inv.s5.kicker,
            title: inv.s5.title,
            sub: inv.s5.sub,
            body: (
              <ol className="relative space-y-4 border-violet-500/30 ps-6 md:ms-4 md:border-s">
                {inv.s5.milestones.map((m, i) => (
                  <li key={m.t} className="relative rounded-2xl border border-border bg-card p-5 shadow-sm">
                    <span className="absolute -start-[37px] top-5 flex h-6 w-6 items-center justify-center rounded-full bg-violet-600 text-[11px] font-bold text-white">
                      {i + 1}
                    </span>
                    <h3 className="text-sm font-extrabold">{m.t}</h3>
                    <p className="mt-1.5 text-[13px] leading-6 text-muted-foreground">{m.d}</p>
                  </li>
                ))}
              </ol>
            ),
          },
        ] as const
      ).map(({ icon: Icon, kicker, title, sub, body }) => (
        <section key={kicker} className="mt-14">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-700 dark:text-violet-300">
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <div className="text-[12px] font-bold uppercase tracking-wide text-violet-700 dark:text-violet-300">
                {kicker}
              </div>
              <h2 className="text-xl font-extrabold sm:text-2xl">{title}</h2>
            </div>
          </div>
          <p className="mt-2.5 max-w-3xl text-sm leading-7 text-muted-foreground">{sub}</p>
          <div className="mt-5">{body}</div>
        </section>
      ))}

      {/* ── 06 assistant (reuses the site-wide chat widget) ──── */}
      <section className="mt-14 rounded-2xl border border-violet-500/30 bg-violet-500/5 p-6 text-center shadow-sm">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600 text-white">
          <Bot className="h-6 w-6" />
        </span>
        <h2 className="mt-3 text-lg font-extrabold">{inv.s6.title}</h2>
        <p className="mx-auto mt-2 max-w-2xl text-[13px] leading-6 text-muted-foreground">{inv.s6.sub}</p>
        <Button onClick={() => setChatOpen(true)} className="mt-4 min-h-[44px] bg-violet-600 text-white hover:bg-violet-700">
          {inv.s6.open}
        </Button>
      </section>

      {/* ── 07 founder ───────────────────────────────────────── */}
      <section className="mt-14">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-700 dark:text-violet-300">
            <User className="h-5 w-5" />
          </span>
          <div>
            <div className="text-[12px] font-bold uppercase tracking-wide text-violet-700 dark:text-violet-300">
              {inv.s7.kicker}
            </div>
            <h2 className="text-xl font-extrabold sm:text-2xl">{inv.s7.title}</h2>
          </div>
        </div>
        <p className="mt-2.5 max-w-3xl text-sm leading-7 text-muted-foreground">{inv.s7.sub}</p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {inv.s7.points.map((p) => (
            <li key={p} className="flex items-start gap-2 rounded-xl border border-border bg-card p-3.5 text-[13px] leading-6 shadow-sm">
              <CheckCircle2 className="mt-1 h-3.5 w-3.5 shrink-0 text-emerald-600" />
              {p}
            </li>
          ))}
        </ul>
        <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/5 p-4 text-[12px] leading-6 text-muted-foreground">
          {inv.s7.legal}
        </p>
      </section>

      {/* ── 08 briefing form ─────────────────────────────────── */}
      <section id="briefing" className="mt-14 scroll-mt-24">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-700 dark:text-violet-300">
            <Lock className="h-5 w-5" />
          </span>
          <div>
            <div className="text-[12px] font-bold uppercase tracking-wide text-violet-700 dark:text-violet-300">
              {inv.s8.kicker}
            </div>
            <h2 className="text-xl font-extrabold sm:text-2xl">{inv.s8.title}</h2>
          </div>
        </div>
        <p className="mt-2.5 max-w-3xl text-sm leading-7 text-muted-foreground">{inv.s8.sub}</p>

        {/* staged access */}
        <h3 className="mt-5 text-sm font-extrabold">{inv.s8.accessTitle}</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {inv.s8.access.map((a, i) => (
            <div key={a.when} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-violet-500/15 text-[11px] font-bold text-violet-700 dark:text-violet-300">
                {i + 1}
              </span>
              <p className="mt-2 text-[13px] font-extrabold">{a.when}</p>
              <ul className="mt-2 space-y-1.5">
                {a.items.map((x) => (
                  <li key={x} className="flex items-start gap-2 text-[12px] leading-5 text-muted-foreground">
                    <Globe className="mt-0.5 h-3 w-3 shrink-0" />
                    {x}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[12px] leading-6 text-muted-foreground">{inv.s8.protect}</p>

        {/* form — same pipeline as /contact */}
        <form onSubmit={submit} className="mt-6 max-w-2xl rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
          <h3 className="text-base font-extrabold">{inv.s8.formTitle}</h3>
          {done && (
            <div className="mt-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm font-medium text-emerald-700 dark:text-emerald-400">
              ✓ {inv.s8.success}
            </div>
          )}
          {error && (
            <div className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm font-medium text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="inv-name">{inv.s8.name}</Label>
              <Input
                id="inv-name"
                required
                minLength={2}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                autoComplete="name"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="inv-email">{inv.s8.email}</Label>
              <Input
                id="inv-email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                autoComplete="email"
                dir="ltr"
              />
            </div>
          </div>
          <div className="mt-4 space-y-1.5">
            <Label htmlFor="inv-org">{inv.s8.org}</Label>
            <Input
              id="inv-org"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
            />
          </div>
          <div className="mt-4 space-y-1.5">
            <Label htmlFor="inv-msg">{inv.s8.message}</Label>
            <Textarea
              id="inv-msg"
              required
              minLength={5}
              rows={4}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
          </div>
          <Button
            type="submit"
            disabled={sending}
            className="mt-5 min-h-[48px] w-full bg-violet-600 text-white hover:bg-violet-700 sm:w-auto"
          >
            {sending ? inv.s8.sending : inv.s8.submit}
          </Button>
          <p className="mt-3 text-[12px] leading-5 text-muted-foreground">{inv.s8.privacy}</p>
        </form>
      </section>

      {/* ── page disclaimer ──────────────────────────────────── */}
      <footer className="mt-12 border-t border-border pt-6 text-center text-[12px] leading-6 text-muted-foreground">
        {inv.disclaimer}
      </footer>
    </div>
  );
}
