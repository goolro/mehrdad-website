'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useApp } from './store';
import { ui } from './i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Copy, Check, Download, FileText, ShieldCheck, RotateCcw, Wrench } from 'lucide-react';
import { trackScopeBuilderCompleted } from '@/lib/analytics';

/**
 * MVP Scope Builder — free tool (phase 3, 2026-10-18).
 *
 * The tool IS the MVP Sprint scope-call prep: five scoping questions in,
 * a one-page scope out. Purely client-side — no answer ever leaves the
 * browser (privacy note shown on page). The CTA copies the generated scope
 * to the clipboard and hands the visitor to /contact?intent=services, so a
 * tool session converts into the same qualified-lead funnel PostHog tracks.
 */
export function ScopeBuilderView() {
  const { lang } = useApp();
  const t = ui[lang];
  const m = t.scopeBuilder;
  const fa = lang === 'fa';
  const rtl = fa ? 'rtl' : 'ltr';

  const [who, setWho] = useState('');
  const [problem, setProblem] = useState('');
  const [alternative, setAlternative] = useState('');
  const [working, setWorking] = useState('');
  const [smallest, setSmallest] = useState('');
  const [copied, setCopied] = useState(false);

  const complete = who.trim() && problem.trim() && alternative.trim() && working.trim();
  const progress = [who, problem, alternative, working, smallest].filter((v) => v.trim()).length;

  const scope = useMemo(() => {
    if (!complete) return '';
    const nl = '\n';
    const lines = fa
      ? [
          '# دامنه MVP — یک صفحه',
          `_${m.generatedBy}_`,
          '',
          '## مسئله',
          problem.trim(),
          '',
          '## چه کسی درد دارد',
          who.trim(),
          '',
          '## جایگزین فعلی',
          alternative.trim(),
          '',
          '## «کار کردن» یعنی',
          working.trim(),
          '',
          '## کوچک‌ترین نسخه قابل‌آزمایش',
          smallest.trim() || 'در جلسه دامنه‌یابی شکل می‌گیرد',
          '',
          '---',
          m.nextStepLine,
        ]
      : [
          '# MVP Scope — One-Pager',
          `_${m.generatedBy}_`,
          '',
          '## Problem',
          problem.trim(),
          '',
          '## Who hurts',
          who.trim(),
          '',
          '## Current alternative',
          alternative.trim(),
          '',
          '## What "working" means',
          working.trim(),
          '',
          '## Smallest testable version',
          smallest.trim() || (fa ? 'در جلسه دامنه‌یابی شکل می‌گیرد' : 'To be shaped on the scope call'),
          '',
          '---',
          m.nextStepLine,
        ];
    return lines.join(nl);
  }, [complete, who, problem, alternative, working, smallest, fa, m]);

  const handleCopy = async () => {
    if (!scope) return;
    try {
      await navigator.clipboard.writeText(scope);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // clipboard unavailable — the scope is still visible for manual copy
    }
  };

  const handleDownload = () => {
    if (!scope) return;
    const blob = new Blob([scope], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mvp-scope.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCta = () => {
    if (!scope) return;
    handleCopy();
    trackScopeBuilderCompleted({ lang, hadSmallestVersion: !!smallest.trim() });
  };

  const fields = [
    { key: 'who', label: m.q1Label, ph: m.q1Ph, value: who, set: setWho, optional: false },
    { key: 'problem', label: m.q2Label, ph: m.q2Ph, value: problem, set: setProblem, optional: false },
    { key: 'alternative', label: m.q3Label, ph: m.q3Ph, value: alternative, set: setAlternative, optional: false },
    { key: 'working', label: m.q4Label, ph: m.q4Ph, value: working, set: setWorking, optional: false },
    { key: 'smallest', label: m.q5Label, ph: m.q5Ph, value: smallest, set: setSmallest, optional: true },
  ] as const;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6">
      {/* ── hero ── */}
      <header className="flex flex-col items-center text-center">
        <span className="rounded-full border border-violet-200 bg-violet-600/10 px-3 py-1 text-xs font-semibold text-violet-700 dark:border-violet-800 dark:text-violet-300" dir={rtl}>
          {m.badge}
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl" dir={rtl}>
          {m.title}
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-muted-foreground" dir={rtl}>
          {m.sub}
        </p>
        <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground" dir={rtl}>
          <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          {m.privacy}
        </p>
      </header>

      {/* ── progress ── */}
      <div className="mx-auto mt-8 flex max-w-md items-center gap-2" aria-hidden>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full ${progress >= i ? 'bg-violet-600' : 'bg-border'}`} />
        ))}
      </div>
      <p className="mt-2 text-center text-xs text-muted-foreground" dir={rtl}>
        {m.progress.replace('{n}', String(Math.min(progress + (progress < 4 ? 1 : 0), 5)))}
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        {/* ── questions ── */}
        <section className="space-y-5" aria-label={rtl === 'rtl' ? 'سؤال‌ها' : 'Questions'}>
          {fields.map((f, i) => (
            <div key={f.key} className="rounded-2xl border border-border bg-card p-5" dir={rtl}>
              <Label htmlFor={`sb-${f.key}`} className="text-base font-semibold">
                <span className="me-2 inline-flex h-6 w-6 items-center justify-center rounded-md bg-violet-600/10 text-xs font-bold text-violet-600 dark:text-violet-400">
                  {i + 1}
                </span>
                {f.label}
                {f.optional && <span className="ms-2 text-xs font-normal text-muted-foreground">({m.optional})</span>}
              </Label>
              {f.key === 'problem' || f.key === 'alternative' ? (
                <Textarea
                  id={`sb-${f.key}`}
                  value={f.value}
                  onChange={(e) => f.set(e.target.value)}
                  placeholder={f.ph}
                  rows={2}
                  className="mt-3 resize-none"
                />
              ) : (
                <Input
                  id={`sb-${f.key}`}
                  value={f.value}
                  onChange={(e) => f.set(e.target.value)}
                  placeholder={f.ph}
                  className="mt-3"
                />
              )}
            </div>
          ))}
        </section>

        {/* ── live result ── */}
        <section className="lg:sticky lg:top-24 lg:self-start" aria-labelledby="sb-result">
          <div className="rounded-3xl border border-border bg-card p-6">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              <h2 id="sb-result" className="text-xl font-bold" dir={rtl}>
                {m.resultTitle}
              </h2>
            </div>

            {complete ? (
              <>
                <pre
                  className="mt-4 max-h-96 overflow-y-auto whitespace-pre-wrap rounded-2xl bg-muted/50 p-4 text-sm leading-relaxed"
                  dir={rtl}
                >
                  {scope}
                </pre>
                <p className="mt-2 text-xs italic text-muted-foreground" dir={rtl}>
                  {m.resultNote}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={handleCopy}>
                    {copied ? <Check className="me-1.5 h-4 w-4 text-emerald-600" /> : <Copy className="me-1.5 h-4 w-4" />}
                    {copied ? m.copied : m.copy}
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleDownload}>
                    <Download className="me-1.5 h-4 w-4" />
                    {m.download}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-muted-foreground"
                    onClick={() => {
                      setWho(''); setProblem(''); setAlternative(''); setWorking(''); setSmallest('');
                    }}
                  >
                    <RotateCcw className="me-1.5 h-4 w-4" />
                    {m.restart}
                  </Button>
                </div>
                <div className="mt-6 rounded-2xl bg-gradient-to-br from-violet-700 via-violet-600 to-fuchsia-600 p-5 text-center text-white">
                  <Button variant="secondary" className="bg-white text-violet-700 hover:bg-white/90" asChild>
                    <Link href="/contact?intent=services" onClick={handleCta}>
                      <Wrench className="me-1.5 h-4 w-4" />
                      {m.ctaPrimary}
                    </Link>
                  </Button>
                  <p className="mt-3 text-xs text-violet-100" dir={rtl}>
                    {m.ctaSub}
                  </p>
                </div>
              </>
            ) : (
              <div className="mt-4 rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground" dir={rtl}>
                {m.needAll}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
