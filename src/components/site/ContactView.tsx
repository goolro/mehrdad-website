'use client';

import { useState } from 'react';
import { useApp } from './store';
import { ui } from './i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Send, Sparkles } from 'lucide-react';

export function ContactView() {
  const { lang, setChatOpen } = useApp();
  const t = ui[lang];
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setDone(true);
        setForm({ name: '', email: '', subject: '', message: '' });
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
        <div className="mt-6 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm font-medium text-emerald-700 dark:text-emerald-400">
          ✓ {t.contact.success}
        </div>
      )}
      {error && (
        <div className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm font-medium text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={submit} className="mt-6 space-y-4">
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
        <Button
          type="submit"
          disabled={sending}
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
