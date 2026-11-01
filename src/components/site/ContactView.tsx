'use client';

import { useEffect, useState } from 'react';
import { useApp } from './store';
import { useLang } from './lang-context';
import { ui } from './i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Send, Sparkles } from 'lucide-react';
import { trackLeadSubmitted } from '@/lib/analytics';

const INTENT_KEYS = ['general', 'services', 'collaboration', 'feedback', 'investment'] as const;
type Intent = (typeof INTENT_KEYS)[number];

// Qualification options for the services intent (phase 1, 2026-10-18) —
// both raw values travel into the message body and the PostHog event, so
// the inbox stays readable AND the funnel stays analyzable.
const BUDGET_OPTIONS = ['< $2k', '$2k–$5k', '$5k–$10k', '$10k+', 'not sure yet'] as const;
const TIMELINE_OPTIONS = ['as soon as possible', 'within a month', 'this quarter', 'flexible'] as const;

export function ContactView() {
  const lang = useLang();
  const { setChatOpen } = useApp();
  const t = ui[lang];
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  // intent selector — investment exists ONLY here as one option among several,
  // never as a homepage callout (content-authenticity restructure, 2026-09-07)
  const [intent, setIntent] = useState<Intent>('general');
  const [budget, setBudget] = useState<string | null>(null);
  const [timeline, setTimeline] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  // Deep-link support (phase 1): /contact?intent=services from the MVP Sprint
  // CTAs preselects the intent. Read once from location.search instead of
  // useSearchParams — keeps the page statically renderable (no Suspense
  // boundary requirement). Applied on a macrotask so the first paint keeps
  // the SSR default (no hydration mismatch) and the react-hooks
  // set-state-in-effect rule stays satisfied.
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const param = new URLSearchParams(window.location.search).get('intent');
        if (param && (INTENT_KEYS as readonly string[]).includes(param)) {
          setIntent(param as Intent);
        }
      } catch {}
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError('');
    try {
      // non-general intents travel as a subject prefix — no schema/API change,
      // and the inbox stays readable at a glance
      const intentLabel = t.contact.intents[intent];
      const subject = intent !== 'general'
        ? `[${intentLabel}] ${form.subject || intentLabel}`
        : form.subject;
      // services qualification rides INSIDE the message body — the API,
      // schema and admin views stay untouched, yet every lead arrives
      // pre-qualified for triage
      const qualifiedMessage =
        intent === 'services' && (budget || timeline)
          ? `${form.message}\n\n— ${lang === 'fa' ? 'بودجه تقریبی' : 'Budget'}: ${budget ?? '—'}\n— ${lang === 'fa' ? 'زمان‌بندی' : 'Timeline'}: ${timeline ?? '—'}`
          : form.message;
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, message: qualifiedMessage, subject }),
      });
      const data = await res.json();
      if (res.ok) {
        setDone(true);
        trackLeadSubmitted({
          intent,
          lang,
          ...(intent === 'services' ? { budget: budget ?? undefined, timeline: timeline ?? undefined } : {}),
        });
        setForm({ name: '', email: '', subject: '', message: '' });
        setIntent('general');
        setBudget(null);
        setTimeline(null);
      } else {
        setError(data.error || t.contact.error);
      }
    } catch {
      setError(t.contact.error);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-extrabold sm:text-4xl">{t.contact.title}</h1>
      <p className="mt-2 text-muted-foreground">{t.contact.sub}</p>

      <div className="mt-8 flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-600/10 text-violet-600 dark:text-violet-400">
          <Send className="h-5 w-5" />
        </div>
        <div>
          <div className="text-sm text-muted-foreground">{t.contact.emailUs}</div>
          <div className="font-semibold" dir="auto">
            {lang === 'fa' ? 'فرم زیر را پر کنید — پیام‌تان مستقیم به صندوق ایمیل ما می‌رسد.' : 'Fill in the form below — your message goes straight to our inbox.'}
          </div>
        </div>
      </div>

      {done && (
        <div
          role="status"
          className="mt-6 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm font-medium text-emerald-700 dark:text-emerald-400"
        >
          ✓ {t.contact.success}
        </div>
      )}
      {error && (
        <div
          role="alert"
          className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm font-medium text-red-700 dark:text-red-400"
        >
          {error}
        </div>
      )}

      <form onSubmit={submit} className="mt-6 space-y-4">
        <div className="space-y-2">
          <Label>{t.contact.intentLabel}</Label>
          {/* a11y phase-4: honest ARIA mapping — these are toggle chips (every
              chip is a tab stop, no arrow-key roving tabindex is implemented).
              role="radio" promised an unfulfilled keyboard pattern; aria-pressed
              toggle buttons describe exactly what this UI does. */}
          <div className="flex flex-wrap gap-1.5" role="group" aria-label={t.contact.intentLabel}>
            {INTENT_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                aria-pressed={intent === key}
                onClick={() => setIntent(key)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  intent === key
                    ? 'border-violet-500/50 bg-violet-600/10 text-violet-700 dark:text-violet-300'
                    : 'border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                {t.contact.intents[key]}
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="c-name">{t.contact.name} *</Label>
            <Input id="c-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="c-email">{t.contact.email} *</Label>
            <Input id="c-email" type="email" required dir="ltr" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="c-subject">{t.contact.subject}</Label>
          <Input id="c-subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="c-message">{t.contact.message} *</Label>
          <Textarea id="c-message" required rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
        </div>

        {/* services qualification — appears ONLY for the services intent so
            the general contact flow stays exactly as light as before */}
        {intent === 'services' && (
          <div className="space-y-4 rounded-2xl border border-violet-500/40 bg-violet-600/5 p-4">
            <div className="space-y-2">
              <Label>{lang === 'fa' ? 'بودجه تقریبی (اختیاری، اما کمک بزرگی است)' : 'Rough budget (optional, but a big help)'}</Label>
              <div className="flex flex-wrap gap-1.5" role="group" aria-label={lang === 'fa' ? 'بودجه' : 'Budget'}>
                {BUDGET_OPTIONS.map((b) => (
                  <button
                    key={b}
                    type="button"
                    aria-pressed={budget === b}
                    onClick={() => setBudget(budget === b ? null : b)}
                    dir="ltr"
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                      budget === b
                        ? 'border-violet-500/50 bg-violet-600/10 text-violet-700 dark:text-violet-300'
                        : 'border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>{lang === 'fa' ? 'زمان‌بندی (اختیاری)' : 'Timeline (optional)'}</Label>
              <div className="flex flex-wrap gap-1.5" role="group" aria-label={lang === 'fa' ? 'زمان‌بندی' : 'Timeline'}>
                {TIMELINE_OPTIONS.map((tl) => (
                  <button
                    key={tl}
                    type="button"
                    aria-pressed={timeline === tl}
                    onClick={() => setTimeline(timeline === tl ? null : tl)}
                    dir="ltr"
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                      timeline === tl
                        ? 'border-violet-500/50 bg-violet-600/10 text-violet-700 dark:text-violet-300'
                        : 'border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {tl}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <Button
          type="submit"
          disabled={sending}
          aria-busy={sending}
          size="lg"
          className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-700 hover:to-fuchsia-700 sm:w-auto"
        >
          <Send className="me-2 h-4 w-4 rtl:rotate-180" />
          {sending ? t.contact.sending : t.contact.send}
        </Button>
      </form>

      <button
        onClick={() => setChatOpen(true)}
        className="mt-6 flex w-full items-center gap-3 rounded-2xl border border-dashed border-violet-500/40 bg-violet-600/5 p-4 text-start transition-colors hover:bg-violet-600/10"
      >
        <Sparkles className="h-5 w-5 shrink-0 text-violet-600 dark:text-violet-400" />
        <span className="text-sm text-muted-foreground">{t.contact.aiHint}</span>
      </button>
    </div>
  );
}
