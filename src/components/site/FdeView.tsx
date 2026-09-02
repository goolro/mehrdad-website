'use client';

import { useEffect, useRef, useState } from 'react';
import { useApp } from './store';
import { ui } from './i18n';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowDown, ArrowRight, Compass, Search, Crosshair, PenTool, Hammer, FlaskConical,
  Rocket, BookOpen, Repeat, Lightbulb, PackageSearch, Wrench, Zap, Users, ServerCog,
  BrainCircuit, Bot, ShieldCheck, CircleCheck, Sparkles,
} from 'lucide-react';

/* ── tiny scroll-reveal (CSS-only motion, reduced-motion safe) ── */
function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={`transition-all duration-700 ease-out motion-reduce:transition-none ${
        shown ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      } ${className}`}
    >
      {children}
    </div>
  );
}

const PROCESS_ICONS = [Search, Crosshair, PenTool, Hammer, FlaskConical, Rocket, BookOpen, Repeat];
const WHO_ICONS = [Lightbulb, Wrench, Zap, Rocket, ServerCog, Users];

export function FdeView() {
  const { lang, setChatOpen } = useApp();
  const t = ui[lang];
  const f = t.fde;
  const [activeStep, setActiveStep] = useState(0);
  const processRef = useRef<HTMLDivElement>(null);

  /* SEO metadata (§16) — per-language, restored on unmount.
     Re-asserted after a short delay because Next's head manager may reset
     document.title late during hydration. */
  useEffect(() => {
    const prevTitle = document.title;
    const metaEl = document.querySelector('meta[name="description"]');
    const prevDesc = metaEl?.getAttribute('content') || '';
    const apply = () => {
      document.title = f.seoTitle;
      metaEl?.setAttribute('content', f.seoDescription);
    };
    apply();
    const timer = window.setTimeout(apply, 250);
    return () => {
      window.clearTimeout(timer);
      document.title = prevTitle;
      metaEl?.setAttribute('content', prevDesc);
    };
  }, [f.seoTitle, f.seoDescription]);

  const Arrow = () => <ArrowRight className="h-4 w-4 shrink-0 rtl:rotate-180" aria-hidden />;

  return (
    <div className="flex flex-col" dir={lang === 'fa' ? 'rtl' : 'ltr'}>

      {/* ── Hero (§14: powerful hero, big typography) ── */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-24 start-1/4 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl" />
          <div className="absolute top-40 end-0 h-80 w-80 rounded-full bg-fuchsia-600/10 blur-3xl" />
        </div>
        <div className="mx-auto flex max-w-5xl flex-col items-center px-4 pt-16 text-center sm:px-6 md:pt-24">
          <Badge variant="outline" className="border-violet-500/40 bg-violet-600/10 px-4 py-1.5 text-sm text-violet-600 dark:text-violet-400">
            <Compass className="me-2 h-4 w-4" aria-hidden />
            {f.hero.kicker}
          </Badge>
          <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl">
            {f.hero.title}
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">{f.hero.sub}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button
              size="lg"
              onClick={() => setChatOpen(true)}
              className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-700 hover:to-fuchsia-700"
            >
              {f.hero.ctaPrimary}
              <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" aria-hidden />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => processRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            >
              {f.hero.ctaSecondary}
            </Button>
          </div>

          {/* tags (§15) */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
            {f.tags.map((tag) => (
              <span key={tag} className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Core message (§3) ── */}
      <section className="mx-auto w-full max-w-5xl px-4 pt-16 sm:px-6">
        <Reveal>
          <div className="rounded-3xl border border-violet-500/25 bg-violet-600/5 p-8 text-center sm:p-12">
            <p className="text-xl font-bold leading-relaxed sm:text-2xl md:text-3xl">«{f.message.quote}»</p>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {f.message.body}
            </p>
          </div>
        </Reveal>
      </section>

      {/* ── What is FDE (§4) ── */}
      <section className="mx-auto w-full max-w-5xl px-4 pt-16 sm:px-6">
        <Reveal>
          <h2 className="text-2xl font-extrabold sm:text-3xl">{f.what.title}</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-6">
              <p className="leading-relaxed text-muted-foreground">{f.what.p1}</p>
              <p className="mt-3 leading-relaxed text-muted-foreground">{f.what.p2}</p>
            </div>
            <div className="flex flex-col justify-center gap-4 rounded-2xl border border-border bg-muted/30 p-6">
              <p className="text-lg font-bold">{f.what.p3}</p>
              <p className="text-lg font-bold text-violet-600 dark:text-violet-400">{f.what.p4}</p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Three roles + shared concept (§5) ── */}
      <section className="mx-auto w-full max-w-7xl px-4 pt-20 sm:px-6">
        <Reveal>
          <h2 className="text-center text-2xl font-extrabold sm:text-3xl">{f.roles.title}</h2>
        </Reveal>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {f.roles.items.map((r, i) => (
            <Reveal key={r.num} delay={i * 90}>
              <div className="group flex h-full flex-col rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-600/10">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-extrabold text-violet-600/30 dark:text-violet-400/30">{r.num}</span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600/10 text-violet-600 dark:text-violet-400">
                    {i === 0 ? <PackageSearch className="h-5 w-5" /> : i === 1 ? <Compass className="h-5 w-5" /> : <BrainCircuit className="h-5 w-5" />}
                  </div>
                </div>
                <h3 className="mt-4 text-lg font-bold">{r.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.tagline}</p>
                <div className="mt-4 flex flex-wrap gap-1.5 border-t border-border/60 pt-4">
                  {r.focus.map((k) => (
                    <span key={k} className="rounded-full bg-violet-600/5 px-2.5 py-1 text-[11px] font-medium text-violet-700 dark:text-violet-300">
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* the shared concept — visual anchor (§5) */}
        <Reveal>
          <div className="relative mt-6 overflow-hidden rounded-3xl border border-violet-500/30 bg-gradient-to-r from-violet-600/10 via-fuchsia-600/10 to-violet-600/10 p-6 text-center sm:p-8">
            <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-violet-600/5 to-fuchsia-600/5" />
            <div className="flex flex-col items-center justify-center gap-3 text-xl font-extrabold sm:flex-row sm:gap-4 sm:text-2xl md:text-3xl">
              <span>{f.roles.center.split('→')[0].trim()}</span>
              <ArrowRight className="h-7 w-7 text-violet-600 dark:text-violet-400 rtl:rotate-180" aria-label="→" />
              <span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent">
                {f.roles.center.split('→')[1]?.trim()}
              </span>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Process timeline (§6) ── */}
      <section ref={processRef} className="mx-auto w-full max-w-7xl scroll-mt-20 px-4 pt-20 sm:px-6">
        <Reveal>
          <h2 className="text-center text-2xl font-extrabold sm:text-3xl">{f.process.title}</h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">{f.process.hint}</p>
        </Reveal>
        <Reveal>
          <div
            className="mt-8 grid grid-cols-4 gap-2 sm:gap-3 lg:grid-cols-8"
            role="tablist"
            aria-label={f.process.title}
          >
            {f.process.steps.map((s, i) => {
              const Icon = PROCESS_ICONS[i % PROCESS_ICONS.length];
              const active = i === activeStep;
              return (
                <button
                  key={s.name}
                  role="tab"
                  aria-selected={active}
                  onMouseEnter={() => setActiveStep(i)}
                  onFocus={() => setActiveStep(i)}
                  onClick={() => setActiveStep(i)}
                  className={`flex flex-col items-center gap-2 rounded-2xl border p-3 text-center transition-all sm:p-4 ${
                    active
                      ? 'border-violet-500/60 bg-violet-600/10 shadow-md shadow-violet-600/10'
                      : 'border-border bg-card hover:border-violet-500/40'
                  }`}
                >
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${active ? 'bg-violet-600 text-white' : 'bg-violet-600/10 text-violet-600 dark:text-violet-400'}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wide sm:text-sm">{s.name}</span>
                  <span className="hidden text-[10px] text-muted-foreground lg:block">{String(i + 1).padStart(2, '0')}</span>
                </button>
              );
            })}
          </div>
          {/* active step detail */}
          <div className="mt-4 rounded-2xl border border-border bg-muted/30 p-5 text-center" aria-live="polite">
            <div className="text-sm font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
              {String(activeStep + 1).padStart(2, '0')} — {f.process.steps[activeStep].name}
            </div>
            <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              {f.process.steps[activeStep].desc}
            </p>
          </div>
        </Reveal>
      </section>

      {/* ── Who is it for (§7) ── */}
      <section className="mx-auto w-full max-w-7xl px-4 pt-20 sm:px-6">
        <Reveal>
          <h2 className="text-2xl font-extrabold sm:text-3xl">{f.who.title}</h2>
        </Reveal>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {f.who.items.map((item, i) => {
            const Icon = WHO_ICONS[i % WHO_ICONS.length];
            return (
              <Reveal key={item.q} delay={(i % 3) * 80}>
                <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-600/10">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-fuchsia-600/10 text-fuchsia-600 dark:text-fuchsia-400">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-bold leading-snug">{item.q}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ── Deliverables (§8) ── */}
      <section className="mx-auto w-full max-w-7xl px-4 pt-20 sm:px-6">
        <Reveal>
          <h2 className="text-2xl font-extrabold sm:text-3xl">{f.outputs.title}</h2>
        </Reveal>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {f.outputs.items.map((o, i) => (
            <Reveal key={o.label} delay={(i % 3) * 80}>
              <div className="flex h-full items-start gap-3 rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-1 hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-600/10">
                <CircleCheck className="mt-0.5 h-5 w-5 shrink-0 text-violet-600 dark:text-violet-400" aria-hidden />
                <div>
                  <div className="flex flex-wrap items-center gap-1.5 font-bold">
                    {o.label.split('→').map((part, j, arr) => (
                      <span key={j} className="inline-flex items-center gap-1.5">
                        <span className={j === arr.length - 1 && arr.length > 1 ? 'text-violet-600 dark:text-violet-400' : ''}>{part.trim()}</span>
                        {j < arr.length - 1 && <ArrowRight className="h-3.5 w-3.5 text-muted-foreground rtl:rotate-180" aria-hidden />}
                      </span>
                    ))}
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{o.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal>
          <p className="mt-5 rounded-2xl border border-border bg-muted/30 p-5 text-sm leading-relaxed text-muted-foreground">
            {f.outputs.note}
          </p>
        </Reveal>
      </section>

      {/* ── AI section (§9) — special design ── */}
      <section className="mx-auto w-full max-w-7xl px-4 pt-20 sm:px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-700 via-violet-600 to-fuchsia-600 px-6 py-12 text-white sm:px-12">
            <div className="pointer-events-none absolute -end-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" aria-hidden />
            <div className="mx-auto max-w-3xl text-center">
              <Bot className="mx-auto h-9 w-9" aria-hidden />
              <h2 className="mt-4 text-2xl font-extrabold leading-snug sm:text-3xl md:text-4xl">
                {lang === 'fa' ? f.ai.faTitle : f.ai.title}
              </h2>
              {lang === 'fa' && <p className="mt-2 text-sm text-white/70">{f.ai.title}</p>}

              <div className="mt-8 grid gap-6 text-start md:grid-cols-2">
                <div className="rounded-2xl bg-white/10 p-5 backdrop-blur-sm">
                  <div className="text-sm font-bold uppercase tracking-wider text-white/80">{f.ai.usesLabel}</div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {f.ai.uses.map((u) => (
                      <span key={u} className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium">{u}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-start rounded-2xl bg-white/10 p-5 backdrop-blur-sm">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
                    <p className="text-sm leading-relaxed text-white/90">{f.ai.humanNote}</p>
                  </div>
                </div>
              </div>

              {/* human/AI loop diagram (§9) */}
              <div className="mt-8" role="img" aria-label={f.ai.flowTitle}>
                <div className="text-xs font-bold uppercase tracking-wider text-white/70">{f.ai.flowTitle}</div>
                <div className="mx-auto mt-4 flex max-w-md flex-col items-center gap-1">
                  {f.ai.flow.map((step, i) => (
                    <div key={step} className="flex flex-col items-center">
                      <div className={`w-full max-w-sm rounded-xl px-4 py-2.5 text-sm font-semibold ${i % 2 === 0 ? 'bg-white/90 text-violet-700' : 'bg-white/15 text-white'}`}>
                        {step}
                      </div>
                      {i < f.ai.flow.length - 1 && <ArrowDown className="my-1 h-4 w-4 text-white/60" aria-hidden />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Comparison (§10) ── */}
      <section className="mx-auto w-full max-w-5xl px-4 pt-20 sm:px-6">
        <Reveal>
          <h2 className="text-2xl font-extrabold sm:text-3xl">{f.vs.title}</h2>
        </Reveal>
        <Reveal>
          <div className="mt-8 space-y-4">
            <div className="rounded-2xl border border-border bg-muted/30 p-5">
              <div className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{f.vs.traditional}</div>
              <div className="mt-3 flex flex-wrap items-center gap-x-1.5 gap-y-2" dir="ltr">
                {f.vs.tradFlow.map((n, i) => (
                  <div key={n} className="flex items-center gap-1.5">
                    <span className="rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-muted-foreground sm:text-sm">{n}</span>
                    {i < f.vs.tradFlow.length - 1 && <Arrow />}
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-violet-500/40 bg-violet-600/5 p-5">
              <div className="text-sm font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">{f.vs.fde}</div>
              <div className="mt-3 flex flex-wrap items-center gap-x-1.5 gap-y-2" dir="ltr">
                {f.vs.fdeFlow.map((n, i) => (
                  <div key={n} className="flex items-center gap-1.5">
                    <span className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold sm:text-sm ${i === 0 || i === f.vs.fdeFlow.length - 1 ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white' : 'border border-violet-500/40 bg-card text-foreground'}`}>{n}</span>
                    {i < f.vs.fdeFlow.length - 1 && <Arrow />}
                  </div>
                ))}
              </div>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">{f.vs.explain}</p>
          </div>
        </Reveal>
      </section>

      {/* ── Scenario case flow (§11) ── */}
      <section className="mx-auto w-full max-w-3xl px-4 pt-20 sm:px-6">
        <Reveal>
          <h2 className="text-2xl font-extrabold sm:text-3xl">{f.scenario.title}</h2>
        </Reveal>
        <Reveal>
          <div className="mt-6 rounded-2xl border border-border bg-card p-5 text-center">
            <Sparkles className="mx-auto h-5 w-5 text-violet-600 dark:text-violet-400" aria-hidden />
            <p className="mt-2 font-bold leading-relaxed">{f.scenario.quote}</p>
          </div>
          <div className="mt-6 flex flex-col items-center">
            {f.scenario.steps.map((s, i) => {
              const Icon = PROCESS_ICONS[i % PROCESS_ICONS.length];
              return (
                <div key={s.name} className="flex w-full flex-col items-center">
                  <div className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 text-start">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-600/10 text-violet-600 dark:text-violet-400">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold uppercase tracking-wide">{s.name}</div>
                      <div className="text-sm text-muted-foreground">{s.desc}</div>
                    </div>
                  </div>
                  {i < f.scenario.steps.length - 1 && <ArrowDown className="my-1.5 h-4 w-4 text-violet-500/60" aria-hidden />}
                </div>
              );
            })}
          </div>
        </Reveal>
      </section>

      {/* ── Big CTA (§12) ── */}
      <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-700 via-violet-600 to-fuchsia-600 px-6 py-14 text-center text-white sm:px-12">
            <div className="pointer-events-none absolute -start-16 -bottom-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" aria-hidden />
            <h2 className="mx-auto max-w-2xl text-3xl font-extrabold leading-tight sm:text-4xl">{f.cta.title}</h2>
            <p className="mt-4 text-white/85">{f.cta.sub1}</p>
            <p className="mt-1 text-white/85">{f.cta.sub2}</p>
            <Button
              size="lg"
              variant="secondary"
              className="mt-8 bg-white text-violet-700 hover:bg-white/90"
              onClick={() => setChatOpen(true)}
            >
              {f.cta.button}
              <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" aria-hidden />
            </Button>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
