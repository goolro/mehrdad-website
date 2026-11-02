'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Check, Copy, Play, RotateCcw, Users } from 'lucide-react';

type PlanAgent = { key: string; name: string; color: string; task: string };

type Step =
  | { type: 'status'; agent: string; color: string; step: number; total: number }
  | { type: 'plan'; title: string; agents: PlanAgent[] }
  | { type: 'agent'; agent: string; color: string; text: string; step: number; total: number }
  | { type: 'deliverable'; agent: string; text: string }
  | { type: 'error'; message: string };

const COLOR: Record<string, { dot: string; card: string; badge: string }> = {
  emerald: {
    dot: 'bg-emerald-400',
    card: 'border-emerald-400/20',
    badge: 'text-emerald-300 bg-emerald-400/10 border-emerald-400/20',
  },
  amber: {
    dot: 'bg-amber-400',
    card: 'border-amber-400/20',
    badge: 'text-amber-300 bg-amber-400/10 border-amber-400/20',
  },
  violet: {
    dot: 'bg-violet-400',
    card: 'border-violet-400/20',
    badge: 'text-violet-300 bg-violet-400/10 border-violet-400/20',
  },
  orange: {
    dot: 'bg-orange-400',
    card: 'border-orange-400/20',
    badge: 'text-orange-300 bg-orange-400/10 border-orange-400/20',
  },
  rose: {
    dot: 'bg-rose-400',
    card: 'border-rose-400/20',
    badge: 'text-rose-300 bg-rose-400/10 border-rose-400/20',
  },
  teal: {
    dot: 'bg-teal-400',
    card: 'border-teal-400/20',
    badge: 'text-teal-300 bg-teal-400/10 border-teal-400/20',
  },
};

const EXAMPLES = [
  'یک پست لینکدین برای معرفی ابزار رایگان Scope Builder بنویس',
  '۳ ایده محتوایی با هوک برای هفته آینده بده',
  'برنامه ۷ روزه جذب اولین کاربرها برای یک ابزار رایگان بچین',
];

function RichText({ text }: { text: string }) {
  const parts = text.split('**');
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <strong key={i} className='font-semibold text-zinc-100'>
            {p}
          </strong>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}

export default function TeamRoom() {
  const [mission, setMission] = useState('');
  const [steps, setSteps] = useState<Step[]>([]);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [copied, setCopied] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [steps]);

  const deliverable = steps.find((s) => s.type === 'deliverable');
  const lastStatus = [...steps].reverse().find((s) => s.type === 'status');
  const progress = steps.filter(
    (s) => s.type === 'plan' || s.type === 'agent' || s.type === 'deliverable'
  ).length;

  async function start() {
    const m = mission.trim();
    if (m.length < 5 || running) return;
    setRunning(true);
    setCompleted(false);
    setCopied(false);
    setSteps([]);
    try {
      const res = await fetch('/api/team-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mission: m }),
      });
      if (!res.ok || !res.body) {
        const j = await res.json().catch(() => null);
        setSteps([{ type: 'error', message: j?.error ?? 'اتصال برقرار نشد.' }]);
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';
      let sawDone = false;
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const ev = JSON.parse(line) as Step | { type: 'done' };
            if (ev.type === 'done') {
              sawDone = true;
              continue;
            }
            setSteps((prev) => [...prev, ev as Step]);
          } catch {
            /* skip malformed line */
          }
        }
      }
      setCompleted(sawDone);
    } catch {
      setSteps((prev) => [...prev, { type: 'error', message: 'ارتباط قطع شد — دوباره اجرا کن.' }]);
    } finally {
      setRunning(false);
    }
  }

  function reset() {
    setSteps([]);
    setMission('');
    setCompleted(false);
    setCopied(false);
  }

  async function copyDeliverable() {
    if (deliverable?.type === 'deliverable') {
      try {
        await navigator.clipboard.writeText(deliverable.text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      } catch {
        /* clipboard unavailable */
      }
    }
  }

  return (
    <div
      dir='rtl'
      className='min-h-dvh bg-zinc-950 text-zinc-100'
      style={{ fontFamily: 'var(--font-vazirmatn), system-ui, sans-serif' }}
    >
      <main className='mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-4'>
        {/* Header */}
        <header className='flex shrink-0 items-center justify-between gap-3 py-5'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900'>
              <Users className='h-5 w-5 text-emerald-400' aria-hidden='true' />
            </div>
            <div>
              <h1 className='text-lg font-bold leading-tight'>اتاق تیم</h1>
              <p className='text-xs text-zinc-400'>
                مثل Grok: فقط یک مأموریت می‌نویسی — کاپیتان خودش تقسیم کار می‌کند
              </p>
            </div>
          </div>
          {steps.length > 0 && !running ? (
            <button
              type='button'
              onClick={reset}
              className='rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:bg-zinc-800'
            >
              <RotateCcw className='ml-1 inline h-3.5 w-3.5' aria-hidden='true' />
              مأموریت جدید
            </button>
          ) : (
            <Link
              href='/'
              className='rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:bg-zinc-800'
            >
              mehrdad.ir
            </Link>
          )}
        </header>

        {/* Mission input */}
        <section className='shrink-0 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4'>
          <label htmlFor='mission' className='mb-2 block text-sm font-medium text-zinc-300'>
            مأموریت تیم چیست؟ <span className='text-zinc-500'>(فقط یک جمله — تقسیم کار با کاپیتان)</span>
          </label>
          <textarea
            id='mission'
            value={mission}
            onChange={(e) => setMission(e.target.value)}
            placeholder='مثلاً: یک پست لینکدین برای معرفی ابزار رایگان ما بنویس…'
            rows={2}
            maxLength={600}
            className='w-full resize-none rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-400/40 focus:outline-none'
          />
          <div className='mt-3 flex flex-wrap items-center justify-between gap-3'>
            <div className='flex flex-wrap gap-2'>
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  type='button'
                  disabled={running}
                  onClick={() => setMission(ex)}
                  className='rounded-full border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:border-emerald-400/30 hover:text-emerald-300 disabled:opacity-40'
                >
                  {ex}
                </button>
              ))}
            </div>
            <button
              type='button'
              onClick={start}
              disabled={running || mission.trim().length < 5}
              className='inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-zinc-950 transition-colors hover:bg-emerald-400 disabled:opacity-50'
            >
              {running ? (
                'تیم در حال کار…'
              ) : (
                <>
                  <Play className='h-4 w-4' aria-hidden='true' />
                  شروع تیم
                </>
              )}
            </button>
          </div>
          {running && lastStatus?.type === 'status' && (
            <div className='mt-3'>
              <div className='h-1 w-full overflow-hidden rounded-full bg-zinc-800'>
                <div
                  className='h-full rounded-full bg-emerald-400 transition-all duration-700'
                  style={{ width: `${(progress / 7) * 100}%` }}
                />
              </div>
              <p className='mt-2 flex items-center gap-2 text-xs text-zinc-400'>
                <span
                  className='inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-400'
                  aria-hidden='true'
                />
                {lastStatus.agent} در حال کار… (قدم {lastStatus.step} از {lastStatus.total})
              </p>
            </div>
          )}
        </section>

        {/* Live transcript */}
        <section className='min-h-0 flex-1 space-y-4 overflow-y-auto py-6' aria-live='polite'>
          {steps.length === 0 && !running && (
            <div className='flex flex-col items-center gap-3 py-16 text-center'>
              <div className='flex -space-x-2' dir='ltr'>
                {['bg-emerald-400', 'bg-amber-400', 'bg-violet-400', 'bg-orange-400', 'bg-rose-400', 'bg-teal-400'].map(
                  (c) => (
                    <span
                      key={c}
                      className={`h-8 w-8 rounded-full border-2 border-zinc-950 ${c}`}
                      aria-hidden='true'
                    />
                  )
                )}
              </div>
              <h2 className='text-xl font-bold'>تیم آماده است</h2>
              <p className='max-w-md text-sm leading-6 text-zinc-400'>
                کاپیتان + ۵ متخصص (پژوهشگر، استراتژیست، سازنده، ناقد، پرداخت‌گر). تو فقط یک مأموریت کلی
                می‌نویسی — کاپیتان کار را بین‌شان تقسیم می‌کند، با هم می‌سازند، ناقد cross-check می‌کند و
                کاپیتان تحویل نهایی را می‌دهد.
              </p>
            </div>
          )}

          {steps.map((s, i) => {
            if (s.type === 'status') {
              return (
                <p key={i} className='flex items-center gap-2 text-xs text-zinc-500'>
                  <span
                    className='inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-500'
                    aria-hidden='true'
                  />
                  {s.agent} در حال کار…
                </p>
              );
            }
            if (s.type === 'plan') {
              return (
                <article
                  key={i}
                  className='rounded-2xl border border-emerald-400/25 bg-emerald-400/5 p-4'
                >
                  <div className='mb-1 flex flex-wrap items-center gap-2'>
                    <span className='inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-xs font-medium text-emerald-300'>
                      <span className='h-1.5 w-1.5 rounded-full bg-emerald-400' aria-hidden='true' />
                      کاپیتان · نقشه‌ی تقسیم کار
                    </span>
                    <span className='text-xs text-zinc-500'>تو فقط یک مأموریت نوشتی — بقیه‌اش با او</span>
                  </div>
                  <h3 className='mb-3 text-sm font-bold text-zinc-100'>{s.title}</h3>
                  <ul className='space-y-2'>
                    {s.agents.map((a) => {
                      const c = COLOR[a.color] ?? COLOR.emerald;
                      return (
                        <li key={a.key} className='flex items-start gap-2.5 text-sm'>
                          <span
                            className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${c.dot}`}
                            aria-hidden='true'
                          />
                          <span className='shrink-0 font-medium text-zinc-300'>{a.name}:</span>
                          <span className='leading-6 text-zinc-400'>{a.task}</span>
                        </li>
                      );
                    })}
                  </ul>
                </article>
              );
            }
            if (s.type === 'agent') {
              const c = COLOR[s.color] ?? COLOR.emerald;
              return (
                <article key={i} className={`rounded-2xl border bg-zinc-900/60 p-4 ${c.card}`}>
                  <div
                    className={`mb-2 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${c.badge}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} aria-hidden='true' />
                    {s.agent}
                    <span className='text-zinc-500'>
                      · قدم {s.step}/{s.total}
                    </span>
                  </div>
                  <p className='whitespace-pre-wrap text-sm leading-7 text-zinc-200'>
                    <RichText text={s.text} />
                  </p>
                </article>
              );
            }
            if (s.type === 'deliverable') {
              return (
                <article
                  key={i}
                  className='rounded-2xl border-2 border-emerald-400/30 bg-emerald-400/5 p-5'
                >
                  <div className='mb-3 flex items-center justify-between gap-2'>
                    <h3 className='flex items-center gap-2 text-sm font-bold text-emerald-300'>
                      <Check className='h-4 w-4' aria-hidden='true' />
                      تحویل نهایی — {s.agent}
                    </h3>
                    <button
                      type='button'
                      onClick={copyDeliverable}
                      className='rounded-lg border border-emerald-400/30 px-3 py-1.5 text-xs text-emerald-300 transition-colors hover:bg-emerald-400/10'
                    >
                      {copied ? 'کپی شد' : 'کپی'}
                    </button>
                  </div>
                  <p className='whitespace-pre-wrap text-sm leading-7 text-zinc-100'>
                    <RichText text={s.text} />
                  </p>
                </article>
              );
            }
            return (
              <div
                key={i}
                className='rounded-xl border border-rose-400/30 bg-rose-400/10 p-4 text-sm text-rose-200'
              >
                {s.message}
              </div>
            );
          })}

          {completed && deliverable?.type === 'deliverable' && (
            <p className='pb-2 text-center text-xs text-zinc-500'>
              مأموریت تمام شد — کاپیتان + ۵ متخصص، یک تحویل. خروجی خام است؛ قبل از استفاده، یک بار خودت بخوانش.
            </p>
          )}
          <div ref={bottomRef} />
        </section>

        {/* Footer */}
        <footer className='shrink-0 border-t border-zinc-900 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]'>
          <p className='text-center text-xs text-zinc-600'>
            ساخت تیم چندایجنتی روی mehrdad.ir — خروجی خام است و بازبینی انسانی لازم دارد.{' '}
            <Link href='/' className='underline decoration-zinc-700 underline-offset-4 hover:text-zinc-400'>
              بازگشت به سایت
            </Link>
          </p>
        </footer>
      </main>
    </div>
  );
}
