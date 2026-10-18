'use client';

import { useState } from 'react';
import { useApp } from './store';
import { ui } from './i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookOpen, Check, Mail } from 'lucide-react';
import { trackPlaybookSubscribed } from '@/lib/analytics';

/**
 * The FDE Playbook — the lead magnet (phase 1, 2026-10-18).
 *
 * The 10 steps are shown in full on the page (no gatekeeping — trust first);
 * the email capture requests the expanded version with worksheets. The form
 * reuses the existing /api/contact pipeline (DB + SMTP + PostHog server
 * event) with a [Playbook] subject prefix — zero schema or API changes.
 */
export function PlaybookView() {
  const { lang } = useApp();
  const t = ui[lang];
  const p = t.playbook;
  const rtl = lang === 'fa' ? 'rtl' : 'ltr';

  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  async function subscribe(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: email.split('@')[0] || 'playbook-reader',
          email,
          subject: '[Playbook] subscribe',
          message:
            'Newsletter subscription request from the FDE Playbook page — send the full playbook (PDF + worksheets) to this address.',
        }),
      });
      if (res.ok) {
        setDone(true);
        setEmail('');
        trackPlaybookSubscribed({ placement: 'playbook_page', lang });
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || p.error);
      }
    } catch {
      setError(p.error);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      {/* ── hero ── */}
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-10">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
          <BookOpen className="h-3.5 w-3.5" />
          {p.badge}
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl" dir={rtl}>
          {p.title}
        </h1>
        <p className="mt-3 text-lg text-muted-foreground" dir={rtl}>
          {p.sub}
        </p>
      </div>

      {/* ── the 10 steps, ungated ── */}
      <section className="mt-10" aria-labelledby="steps-title">
        <h2 id="steps-title" className="text-2xl font-bold" dir={rtl}>
          {p.subTitle}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground" dir={rtl}>
          {p.subNote}
        </p>
        <ol className="mt-5 space-y-2.5">
          {p.steps.map((s, i) => (
            <li key={i} className="flex items-start gap-3 rounded-xl border border-border bg-card p-3.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 text-xs font-bold text-white">
                {i + 1}
              </span>
              <span className="text-sm leading-relaxed" dir={rtl}>
                {s}
              </span>
            </li>
          ))}
        </ol>
      </section>

      {/* ── email capture ── */}
      <section className="mt-10 rounded-3xl border border-violet-500/40 bg-violet-600/5 p-6 sm:p-8" aria-labelledby="form-title">
        <h2 id="form-title" className="text-xl font-bold" dir={rtl}>
          {p.formTitle}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground" dir={rtl}>
          {p.formSub}
        </p>

        {done ? (
          <div className="mt-5 flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm font-medium text-emerald-700 dark:text-emerald-400">
            <Check className="h-4 w-4 shrink-0" aria-hidden />
            {p.success}
          </div>
        ) : (
          <form onSubmit={subscribe} className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="pb-email">{p.emailLabel}</Label>
              <Input
                id="pb-email"
                type="email"
                required
                dir="ltr"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              disabled={sending}
              className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-700 hover:to-fuchsia-700"
            >
              <Mail className="me-2 h-4 w-4" />
              {sending ? p.sending : p.send}
            </Button>
          </form>
        )}
        {error && !done && (
          <div className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm font-medium text-red-600 dark:text-red-400">
            {error}
          </div>
        )}
      </section>
    </div>
  );
}
