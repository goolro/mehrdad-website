'use client';

/**
 * Daily Digest Studio — the admin side of the Product Hunt daily
 * publication (/daily). The owner's workflow, kept tiny on purpose:
 *   1. Import from the PH feed (one click) — creates EN rows + auto-FA.
 *   2. Fill anything the translator missed (translate button / inline edit).
 *   3. Add a product by hand when the feed misses a winner.
 * Every mutation fires the deploy hook server-side so the static /daily
 * page rebuilds with the new content.
 */

import { useCallback, useEffect, useState } from 'react';
import { useApp, formatDate } from './store';
import { ui } from './i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, RefreshCw, Rocket, Trash2, Languages, Pencil } from 'lucide-react';

interface Item {
  id: string;
  day: string;
  name: string;
  taglineEn: string;
  taglineFa: string | null;
  url: string;
  logo: string | null;
  votes: number;
  order: number;
}

interface FormState {
  id: string | null;
  day: string;
  name: string;
  url: string;
  taglineEn: string;
  taglineFa: string;
  logo: string;
  votes: string;
  order: string;
}

const EMPTY_FORM = (): FormState => ({
  id: null,
  day: new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tehran' }).format(new Date()),
  name: '',
  url: '',
  taglineEn: '',
  taglineFa: '',
  logo: '',
  votes: '0',
  order: '0',
});

export function DailyStudio() {
  const { lang } = useApp();
  const t = (ui[lang] as typeof ui.en).admin.daily;
  const { toast } = useToast();
  const [items, setItems] = useState<Item[] | null>(null);
  const [importing, setImporting] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState | null>(null);

  const load = useCallback(() => {
    fetch('/api/admin/daily')
      .then((r) => r.json())
      .then((d) => setItems(d.items || []))
      .catch(() => setItems([]));
  }, []);

  useEffect(load, [load]);

  async function runImport() {
    setImporting(true);
    try {
      const res = await fetch('/api/admin/daily/import', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ mode: 'import', limit: 8 }),
      });
      const d = await res.json();
      if (!res.ok || !d.ok) {
        toast({ title: t.importFailed, variant: 'destructive' });
      } else if (d.created.length === 0) {
        toast({ title: t.nothingNew });
      } else {
        toast({ title: t.imported(d.created.length) });
      }
      load();
    } catch {
      toast({ title: t.importFailed, variant: 'destructive' });
    }
    setImporting(false);
  }

  async function runTranslate() {
    setTranslating(true);
    try {
      const res = await fetch('/api/admin/daily/import', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ mode: 'translate' }),
      });
      const d = await res.json();
      if (res.ok && d.ok) toast({ title: t.translatedDone(d.translated) });
      else toast({ title: t.importFailed, variant: 'destructive' });
      load();
    } catch {
      toast({ title: t.importFailed, variant: 'destructive' });
    }
    setTranslating(false);
  }

  async function save() {
    if (!form) return;
    setSaving(true);
    try {
      const payload = {
        day: form.day,
        name: form.name,
        url: form.url,
        taglineEn: form.taglineEn,
        taglineFa: form.taglineFa,
        logo: form.logo,
        votes: Number(form.votes) || 0,
        order: Number(form.order) || 0,
      };
      const res = await fetch(form.id ? `/api/admin/daily/${form.id}` : '/api/admin/daily', {
        method: form.id ? 'PATCH' : 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const d = await res.json();
      if (!res.ok || !d.ok) {
        toast({ title: d.error || 'Save failed', variant: 'destructive' });
      } else {
        setForm(null);
        load();
      }
    } catch {
      toast({ title: 'Save failed', variant: 'destructive' });
    }
    setSaving(false);
  }

  async function remove(id: string) {
    if (!confirm(t.confirmDel)) return;
    await fetch(`/api/admin/daily/${id}`, { method: 'DELETE' });
    load();
  }

  function editItem(item: Item) {
    setForm({
      id: item.id,
      day: item.day,
      name: item.name,
      url: item.url,
      taglineEn: item.taglineEn,
      taglineFa: item.taglineFa || '',
      logo: item.logo || '',
      votes: String(item.votes),
      order: String(item.order),
    });
  }

  // group by day (items already come day-desc)
  const groups: { day: string; items: Item[] }[] = [];
  for (const item of items || []) {
    const last = groups[groups.length - 1];
    if (last && last.day === item.day) last.items.push(item);
    else groups.push({ day: item.day, items: [item] });
  }

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => (f ? { ...f, [k]: e.target.value } : f));

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold">{t.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t.desc}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={runImport} disabled={importing} className="gap-1.5">
          {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
          {importing ? t.importing : t.importBtn}
        </Button>
        <Button onClick={runTranslate} disabled={translating} variant="outline" className="gap-1.5">
          {translating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Languages className="h-4 w-4" />}
          {translating ? t.translating : t.translateAll}
        </Button>
        <Button onClick={() => setForm(EMPTY_FORM())} variant="outline" className="gap-1.5">
          <Plus className="h-4 w-4" />
          {t.add}
        </Button>
      </div>

      {items && items.length === 0 && (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          {t.empty}
        </div>
      )}

      {items && items.length > 0 && (
        <ScrollArea className="max-h-[70vh] rounded-xl border border-border">
          <div className="p-3">
            {groups.map((g) => (
              <div key={g.day} className="mb-4 last:mb-0">
                <div className="mb-2 flex items-center gap-2 px-1">
                  <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    {formatDate(lang, `${g.day}T00:00:00Z`)}
                  </span>
                  <span className="h-px flex-1 bg-border" />
                  <Badge variant="outline" className="text-[10px]">{g.items.length}</Badge>
                </div>
                <div className="space-y-2">
                  {g.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col gap-2 rounded-lg border border-border/60 bg-card p-3 sm:flex-row sm:items-start sm:gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="truncate text-sm font-semibold hover:text-violet-600 dark:hover:text-violet-400"
                          >
                            {item.name}
                          </a>
                          {!item.taglineFa && (
                            <Badge variant="outline" className="shrink-0 text-[10px] text-amber-600">
                              FA
                            </Badge>
                          )}
                        </div>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">{item.taglineEn}</p>
                        {item.taglineFa && (
                          <p className="mt-0.5 truncate text-xs text-foreground/80">{item.taglineFa}</p>
                        )}
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => editItem(item)} title={t.edit}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-red-500 hover:text-red-600"
                          onClick={() => remove(item.id)}
                          title={t.del}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}

      <Dialog open={!!form} onOpenChange={(o) => !o && setForm(null)}>
        <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{form?.id ? t.edit : t.add}</DialogTitle>
          </DialogHeader>
          {form && (
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>{t.name}</Label>
                  <Input value={form.name} onChange={set('name')} />
                </div>
                <div className="space-y-1.5">
                  <Label>{t.day}</Label>
                  <Input value={form.day} onChange={set('day')} placeholder="YYYY-MM-DD" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>{t.url}</Label>
                <Input value={form.url} onChange={set('url')} placeholder="https://www.producthunt.com/products/..." dir="ltr" />
              </div>
              <div className="space-y-1.5">
                <Label>{t.taglineEn}</Label>
                <Input value={form.taglineEn} onChange={set('taglineEn')} dir="ltr" />
              </div>
              <div className="space-y-1.5">
                <Label>{t.taglineFa}</Label>
                <Input value={form.taglineFa} onChange={set('taglineFa')} />
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-1.5 sm:col-span-3">
                  <Label>{t.logo}</Label>
                  <Input value={form.logo} onChange={set('logo')} dir="ltr" />
                </div>
                <div className="space-y-1.5">
                  <Label>{t.votes}</Label>
                  <Input type="number" value={form.votes} onChange={set('votes')} min="0" />
                </div>
                <div className="space-y-1.5">
                  <Label>{t.order}</Label>
                  <Input type="number" value={form.order} onChange={set('order')} min="0" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <Button variant="outline" onClick={() => setForm(null)}>
                  {t.cancel}
                </Button>
                <Button onClick={save} disabled={saving} className="gap-1.5">
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {t.save}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
