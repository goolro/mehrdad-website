'use client';

/**
 * Daily Articles Studio — the admin side of the daily publication
 * (/daily). The owner writes ORIGINAL bilingual editorials (summary +
 * full article + expert verdict) — no feed imports and no outbound
 * links, by explicit owner decision. Every mutation fires the deploy
 * hook server-side so the static /daily pages rebuild with the content.
 */

import { useCallback, useEffect, useState } from 'react';
import { useApp, formatDate } from './store';
import { ui } from './i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Pencil, Trash2, CalendarClock, Check, X } from 'lucide-react';

interface Article {
  id: string;
  slug: string;
  day: string;
  category: string;
  titleEn: string;
  titleFa: string;
  summaryEn: string;
  summaryFa: string;
  bodyEn: string;
  bodyFa: string;
  verdictEn: string;
  verdictFa: string;
  tagsEn: string | null;
  tagsFa: string | null;
  published: boolean;
  publishAt: string | null;
}

interface FormState {
  id: string | null;
  slug: string;
  day: string;
  category: string;
  titleEn: string;
  titleFa: string;
  summaryEn: string;
  summaryFa: string;
  bodyEn: string;
  bodyFa: string;
  verdictEn: string;
  verdictFa: string;
  tagsEn: string;
  tagsFa: string;
  published: boolean;
  publishAt: string; // datetime-local value — '' = live now
}

const EMPTY_FORM = (): FormState => ({
  id: null,
  slug: '',
  day: new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tehran' }).format(new Date()),
  category: 'product',
  titleEn: '',
  titleFa: '',
  summaryEn: '',
  summaryFa: '',
  bodyEn: '',
  bodyFa: '',
  verdictEn: '',
  verdictFa: '',
  tagsEn: '',
  tagsFa: '',
  published: true,
  publishAt: '',
});

/** ISO → the browser-local value a datetime-local input expects */
function isoToLocalInput(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function localInputToIso(v: string): string | null {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function formatSlot(lang: 'en' | 'fa', iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString(lang === 'fa' ? 'fa-IR' : 'en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

type PubStatus = 'draft' | 'scheduled' | 'live';

function statusOf(a: Article): PubStatus {
  if (!a.published) return 'draft';
  if (a.publishAt && new Date(a.publishAt).getTime() > Date.now()) return 'scheduled';
  return 'live';
}

function parseTagsJson(v: string | null): string {
  try {
    const arr = JSON.parse(v || '[]');
    return Array.isArray(arr) ? arr.join(', ') : '';
  } catch {
    return '';
  }
}

export function DailyStudio() {
  const { lang } = useApp();
  const t = (ui[lang] as typeof ui.en).admin.daily;
  const { toast } = useToast();
  const [items, setItems] = useState<Article[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [autoBusy, setAutoBusy] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState | null>(null);

  const load = useCallback(() => {
    fetch('/api/admin/daily')
      .then((r) => r.json())
      .then((d) => setItems(d.items || []))
      .catch(() => setItems([]));
  }, []);

  useEffect(load, [load]);

  async function save() {
    if (!form) return;
    setSaving(true);
    try {
      const payload = {
        slug: form.slug,
        day: form.day,
        category: form.category,
        titleEn: form.titleEn,
        titleFa: form.titleFa,
        summaryEn: form.summaryEn,
        summaryFa: form.summaryFa,
        bodyEn: form.bodyEn,
        bodyFa: form.bodyFa,
        verdictEn: form.verdictEn,
        verdictFa: form.verdictFa,
        tagsEn: form.tagsEn.split(',').map((s) => s.trim()).filter(Boolean),
        tagsFa: form.tagsFa.split(',').map((s) => s.trim()).filter(Boolean),
        published: form.published,
        publishAt: localInputToIso(form.publishAt),
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
        toast({ title: t.saved });
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

  /** staggered publishing: queue every complete draft into the next free slots */
  async function autoSchedule() {
    setAutoBusy(true);
    try {
      const res = await fetch('/api/admin/daily/schedule', { method: 'POST' });
      const d = await res.json();
      if (!res.ok || !d.ok) {
        toast({ title: d.error || 'Scheduling failed', variant: 'destructive' });
      } else if (d.scheduled > 0) {
        toast({ title: t.autoScheduleDone.replace('{n}', String(d.scheduled)) });
        load();
      } else {
        toast({ title: t.autoScheduleNone });
      }
    } catch {
      toast({ title: 'Scheduling failed', variant: 'destructive' });
    }
    setAutoBusy(false);
  }

  /** the owner's Approve — hands the piece the next free random slot */
  async function approve(id: string) {
    setApprovingId(id);
    try {
      const res = await fetch(`/api/admin/daily/${id}/approve`, { method: 'POST' });
      const d = await res.json();
      if (!res.ok || !d.ok) {
        toast({ title: d.error || 'Approve failed', variant: 'destructive' });
        return;
      }
      toast({ title: t.approvedDone.replace('{time}', formatSlot(lang, d.publishAt)) });
      load();
    } catch {
      toast({ title: 'Approve failed', variant: 'destructive' });
    } finally {
      setApprovingId(null);
    }
  }

  /** reject = remove from the queue entirely */
  async function reject(id: string) {
    if (!confirm(t.confirmReject)) return;
    await fetch(`/api/admin/daily/${id}`, { method: 'DELETE' });
    load();
  }

  function editItem(a: Article) {
    setForm({
      id: a.id,
      slug: a.slug,
      day: a.day,
      category: a.category || 'product',
      titleEn: a.titleEn,
      titleFa: a.titleFa,
      summaryEn: a.summaryEn,
      summaryFa: a.summaryFa,
      bodyEn: a.bodyEn,
      bodyFa: a.bodyFa,
      verdictEn: a.verdictEn,
      verdictFa: a.verdictFa,
      tagsEn: parseTagsJson(a.tagsEn),
      tagsFa: parseTagsJson(a.tagsFa),
      published: a.published,
      publishAt: isoToLocalInput(a.publishAt),
    });
  }

  // group by day (items already arrive day-desc) — drafts live in the
  // approval queue above instead
  const review = (items || []).filter((a) => !a.published);
  const groups: { day: string; items: Article[] }[] = [];
  for (const a of (items || []).filter((x) => x.published)) {
    const last = groups[groups.length - 1];
    if (last && last.day === a.day) last.items.push(a);
    else groups.push({ day: a.day, items: [a] });
  }

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => (f ? { ...f, [k]: e.target.value } : f));

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold">{t.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t.desc}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={() => setForm(EMPTY_FORM())} className="gap-1.5">
          <Plus className="h-4 w-4" />
          {t.add}
        </Button>
        <Button onClick={autoSchedule} disabled={autoBusy} variant="outline" className="gap-1.5">
          {autoBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarClock className="h-4 w-4" />}
          {autoBusy ? t.autoScheduling : t.autoSchedule}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">{t.slotsNote}</p>

      {review.length > 0 && (
        <section className="rounded-2xl border-2 border-amber-500/40 bg-amber-500/5 p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="flex items-center gap-2 font-bold text-amber-700 dark:text-amber-400">
              <CalendarClock className="h-4 w-4" />
              {t.reviewTitle}
              <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400" variant="secondary">
                {review.length}
              </Badge>
            </h3>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{t.reviewHint}</p>
          <div className="mt-3 space-y-2">
            {review.map((a) => (
              <div
                key={a.id}
                className="flex flex-col gap-2 rounded-xl border border-amber-500/30 bg-card p-3 sm:flex-row sm:items-center sm:gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate text-sm font-semibold">{a.titleFa || a.titleEn}</span>
                    <Badge variant="outline" className="shrink-0 text-[10px] text-violet-600">
                      {t.cats[(a.category || 'product') as 'product']}
                    </Badge>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground" dir="auto">
                    {a.summaryFa || a.summaryEn}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <Button
                    size="sm"
                    className="gap-1 bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => approve(a.id)}
                    disabled={approvingId === a.id}
                  >
                    {approvingId === a.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                    {approvingId === a.id ? t.approving : t.approve}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-red-500 hover:text-red-600"
                    onClick={() => reject(a.id)}
                    title={t.reject}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => editItem(a)} title={t.edit}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

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
                  {g.items.map((a) => (
                    <div
                      key={a.id}
                      className="flex flex-col gap-2 rounded-lg border border-border/60 bg-card p-3 sm:flex-row sm:items-start sm:gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="truncate text-sm font-semibold">{a.titleEn}</span>
                          <Badge variant="outline" className="shrink-0 text-[10px] text-violet-600">
                            {t.cats[(a.category || 'product') as 'product']}
                          </Badge>
                          {statusOf(a) === 'draft' && (
                            <Badge variant="outline" className="shrink-0 text-[10px] text-amber-600">
                              DRAFT
                            </Badge>
                          )}
                          {statusOf(a) === 'scheduled' && (
                            <Badge variant="outline" className="shrink-0 gap-1 border-violet-500/40 text-[10px] text-violet-600">
                              <CalendarClock className="h-3 w-3" />
                              {t.scheduled} · {formatSlot(lang, a.publishAt)}
                            </Badge>
                          )}
                          {statusOf(a) === 'live' && (
                            <Badge variant="outline" className="shrink-0 text-[10px] text-emerald-600">
                              {t.live}
                            </Badge>
                          )}
                        </div>
                        <p className="mt-0.5 truncate text-xs text-foreground/80">{a.titleFa}</p>
                        <p className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground" dir="ltr">
                          /daily/{a.slug}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => editItem(a)} title={t.edit}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-red-500 hover:text-red-600"
                          onClick={() => remove(a.id)}
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
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{form?.id ? t.edit : t.add}</DialogTitle>
          </DialogHeader>
          {form && (
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>{t.slug}</Label>
                  <Input value={form.slug} onChange={set('slug')} placeholder="product-name-here" dir="ltr" className="font-mono" />
                </div>
                <div className="space-y-1.5">
                  <Label>{t.day}</Label>
                  <Input value={form.day} onChange={set('day')} placeholder="YYYY-MM-DD" dir="ltr" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>{t.category}</Label>
                <Select value={form.category} onValueChange={(v) => setForm((f) => (f ? { ...f, category: v } : f))}>
                  <SelectTrigger dir="ltr">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="product">{t.cats.product}</SelectItem>
                    <SelectItem value="ai">{t.cats.ai}</SelectItem>
                    <SelectItem value="startup">{t.cats.startup}</SelectItem>
                    <SelectItem value="linkedin">{t.cats.linkedin}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>{t.titleEn}</Label>
                  <Input value={form.titleEn} onChange={set('titleEn')} dir="ltr" />
                </div>
                <div className="space-y-1.5">
                  <Label>{t.titleFa}</Label>
                  <Input value={form.titleFa} onChange={set('titleFa')} />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>{t.summaryEn}</Label>
                  <Textarea value={form.summaryEn} onChange={set('summaryEn')} rows={3} dir="ltr" />
                </div>
                <div className="space-y-1.5">
                  <Label>{t.summaryFa}</Label>
                  <Textarea value={form.summaryFa} onChange={set('summaryFa')} rows={3} />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>{t.bodyEn}</Label>
                  <Textarea value={form.bodyEn} onChange={set('bodyEn')} rows={9} dir="ltr" className="font-mono text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label>{t.bodyFa}</Label>
                  <Textarea value={form.bodyFa} onChange={set('bodyFa')} rows={9} className="font-mono text-xs" />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>{t.verdictEn}</Label>
                  <Textarea value={form.verdictEn} onChange={set('verdictEn')} rows={4} dir="ltr" className="font-mono text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label>{t.verdictFa}</Label>
                  <Textarea value={form.verdictFa} onChange={set('verdictFa')} rows={4} className="font-mono text-xs" />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>{t.tagsEn}</Label>
                  <Input value={form.tagsEn} onChange={set('tagsEn')} dir="ltr" placeholder="AI, productivity" />
                </div>
                <div className="space-y-1.5">
                  <Label>{t.tagsFa}</Label>
                  <Input value={form.tagsFa} onChange={set('tagsFa')} placeholder="هوش مصنوعی — بدون ویرگول" />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="daily-published"
                  checked={form.published}
                  onCheckedChange={(v) => setForm((f) => (f ? { ...f, published: !!v } : f))}
                />
                <Label htmlFor="daily-published" className="cursor-pointer">{t.published}</Label>
              </div>

              <div className="space-y-1.5 rounded-xl border border-violet-500/30 bg-violet-500/5 p-3">
                <Label htmlFor="daily-publishat">{t.publishAt}</Label>
                <Input
                  id="daily-publishat"
                  type="datetime-local"
                  value={form.publishAt}
                  onChange={set('publishAt')}
                  dir="ltr"
                />
                <p className="text-xs text-muted-foreground">{t.publishAtHint}</p>
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
