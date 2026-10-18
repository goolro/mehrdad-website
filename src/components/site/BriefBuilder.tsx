'use client';

/**
 * Brief Builder — the owner's NotebookLM workflow, native:
 *   competitor sources (seeded + editable) → live heading scan → AI keeps
 *   the important headings → the owner's «نیازمندی محتوا» prompt produces a
 *   complete content brief (H2/H3 outline + must-cover topics + missing
 *   headings + FAQ questions) → copy it or push it straight into the
 *   article pipeline where the writer must follow it.
 */

import { useCallback, useEffect, useState } from 'react';
import { useApp, formatDate } from './store';
import { ui } from './i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash2, Radar, ListTree, Copy, Send, Globe, Power } from 'lucide-react';

interface SourceItem {
  id: string;
  name: string;
  url: string;
  lang: string;
  category: string;
  active: boolean;
  note: string | null;
  lastHeadingCount: number | null;
  lastScanAt: string | null;
}

interface ScanSummaryItem {
  sourceId: string;
  name: string;
  url: string;
  lang: string;
  ok: boolean;
  error?: string;
  headingCount: number;
  cached?: boolean;
}

interface BriefStructure {
  h2: string[];
  h3: { text: string; under: string }[];
  topics: string[];
  missing: string[];
  faq: string[];
}

interface BriefResult {
  id: string;
  topic: string;
  category: string;
  structure: BriefStructure;
  filtered: { keep: string[]; clusters: string[] };
  briefMd: string;
  sourceCount: number;
  scanned: number;
  failedSources: { name: string; error?: string }[];
}

interface HistoryItem {
  id: string;
  topic: string;
  category: string;
  status: string;
  sourceCount: number;
  h2Count: number;
  createdAt: string;
}

const CATS = ['product', 'ai', 'startup'] as const;
const CAT_LABEL: Record<string, { en: string; fa: string }> = {
  product: { en: 'Product', fa: 'محصول' },
  ai: { en: 'AI', fa: 'هوش مصنوعی' },
  startup: { en: 'Startup', fa: 'استارتاپ' },
};

function ChipList({ items }: { items: string[] }) {
  if (!items?.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((t, i) => (
        <Badge key={i} variant="secondary" className="max-w-full whitespace-normal text-start font-normal">
          {t}
        </Badge>
      ))}
    </div>
  );
}

export function BriefBuilder() {
  const lang = useApp((s) => s.lang);
  const t = ui[lang].admin.brief;
  const { toast } = useToast();

  const [sources, setSources] = useState<SourceItem[]>([]);
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [newSource, setNewSource] = useState({ name: '', url: '', lang: 'en', category: 'product' });
  const [adding, setAdding] = useState(false);

  const [scanResults, setScanResults] = useState<ScanSummaryItem[] | null>(null);
  const [scanning, setScanning] = useState(false);

  const [topic, setTopic] = useState('');
  const [briefCat, setBriefCat] = useState<string>('product');
  const [building, setBuilding] = useState(false);
  const [brief, setBrief] = useState<BriefResult | null>(null);
  const [sending, setSending] = useState(false);

  const [history, setHistory] = useState<HistoryItem[]>([]);

  const loadSources = useCallback(() => {
    fetch('/api/admin/brief/sources')
      .then((r) => r.json())
      .then((d) => setSources(d.items || []))
      .catch(() => {});
  }, []);

  const loadHistory = useCallback(() => {
    fetch('/api/admin/brief')
      .then((r) => r.json())
      .then((d) => setHistory(d.items || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadSources();
    loadHistory();
  }, [loadSources, loadHistory]);

  async function addSource() {
    if (!newSource.name.trim() || !newSource.url.trim()) return;
    setAdding(true);
    const res = await fetch('/api/admin/brief/sources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSource),
    });
    const d = await res.json();
    setAdding(false);
    if (!res.ok || !d.ok) {
      toast({ title: d.error || 'Error', variant: 'destructive' });
      return;
    }
    setNewSource({ name: '', url: '', lang: 'en', category: newSource.category });
    loadSources();
  }

  async function toggleSource(s: SourceItem) {
    setSources((prev) => prev.map((x) => (x.id === s.id ? { ...x, active: !x.active } : x)));
    await fetch(`/api/admin/brief/sources/${s.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !s.active }),
    }).catch(() => {});
  }

  async function deleteSource(s: SourceItem) {
    setSources((prev) => prev.filter((x) => x.id !== s.id));
    await fetch(`/api/admin/brief/sources/${s.id}`, { method: 'DELETE' }).catch(() => {});
  }

  async function runScan(force: boolean) {
    setScanning(true);
    try {
      const res = await fetch('/api/admin/brief/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: briefCat, force }),
      });
      const d = await res.json();
      if (!res.ok || !d.ok) {
        toast({ title: d.error || 'Scan failed', variant: 'destructive' });
        return;
      }
      setScanResults(d.results as ScanSummaryItem[]);
      toast({
        title: t.scanDone,
        description: t.scanSummary.replace('{ok}', String(d.okCount)).replace('{n}', String(d.scanned)).replace('{h}', String(d.totalHeadings)),
      });
      loadSources();
    } finally {
      setScanning(false);
    }
  }

  async function buildBrief() {
    if (!topic.trim()) return;
    setBuilding(true);
    setBrief(null);
    try {
      const res = await fetch('/api/admin/brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, category: briefCat }),
      });
      const d = await res.json();
      if (!res.ok || !d.ok) {
        toast({ title: d.error || 'Brief failed', variant: 'destructive' });
        return;
      }
      setBrief(d.brief as BriefResult);
      loadHistory();
    } finally {
      setBuilding(false);
    }
  }

  async function sendToPipeline() {
    if (!brief) return;
    setSending(true);
    try {
      const res = await fetch('/api/admin/ai-articles/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: brief.topic,
          target: 'website',
          lang: 'fa',
          brief: brief.briefMd,
        }),
      });
      const d = await res.json();
      if (!res.ok || !d.ok) {
        toast({ title: d.error || 'Failed', variant: 'destructive' });
        return;
      }
      toast({ title: t.toPipelineDone });
      await fetch(`/api/admin/brief/${brief.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'used' }),
      }).catch(() => {});
      loadHistory();
    } finally {
      setSending(false);
    }
  }

  async function copyBrief() {
    if (!brief) return;
    try {
      await navigator.clipboard.writeText(brief.briefMd);
      toast({ title: t.copied });
    } catch {
      toast({ title: 'Clipboard blocked', variant: 'destructive' });
    }
  }

  async function deleteBrief(id: string) {
    setHistory((prev) => prev.filter((h) => h.id !== id));
    await fetch(`/api/admin/brief/${id}`, { method: 'DELETE' }).catch(() => {});
  }

  const visibleSources = sources.filter((s) => sourceFilter === 'all' || s.category === sourceFilter);

  return (
    <div>
      <h2 className="text-xl font-extrabold">{t.title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{t.sub}</p>

      {/* ── sources ── */}
      <section className="mt-6 rounded-2xl border border-border bg-card p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="flex items-center gap-2 font-bold">
            <Globe className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            {t.sources}
            <span className="text-xs font-normal text-muted-foreground">({sources.length})</span>
          </h3>
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="h-8 w-40 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{lang === 'fa' ? 'همه دسته‌ها' : 'All lanes'}</SelectItem>
              {CATS.map((c) => (
                <SelectItem key={c} value={c}>
                  {CAT_LABEL[c][lang]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{t.sourcesHint}</p>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {visibleSources.map((s) => (
            <div
              key={s.id}
              className={`flex items-center gap-2 rounded-xl border p-2.5 text-sm ${s.active ? 'border-border bg-background' : 'border-dashed border-border opacity-60'}`}
            >
              <button
                onClick={() => toggleSource(s)}
                aria-label={s.active ? t.active : t.off}
                className={`shrink-0 rounded-full p-1.5 ${s.active ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-muted text-muted-foreground'}`}
              >
                <Power className="h-3.5 w-3.5" />
              </button>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="truncate font-semibold">{s.name}</span>
                  <Badge variant="outline" className="h-4 px-1 text-[9px] uppercase">
                    {s.lang}
                  </Badge>
                  <Badge variant="outline" className="h-4 px-1 text-[9px]">
                    {CAT_LABEL[s.category]?.[lang] || s.category}
                  </Badge>
                  {s.lastHeadingCount !== null && (
                    <span className="shrink-0 text-[10px] text-muted-foreground">H:{s.lastHeadingCount}</span>
                  )}
                </div>
                <div className="truncate text-[11px] text-muted-foreground" dir="ltr">
                  {s.note || s.url.replace(/^https?:\/\//, '')}
                </div>
              </div>
              <button
                onClick={() => deleteSource(s)}
                aria-label={t.delete}
                className="shrink-0 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-600"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-2 rounded-xl bg-muted/40 p-3 sm:flex-row">
          <Input
            value={newSource.name}
            onChange={(e) => setNewSource({ ...newSource, name: e.target.value })}
            placeholder={t.name}
            className="sm:w-36"
          />
          <Input
            value={newSource.url}
            onChange={(e) => setNewSource({ ...newSource, url: e.target.value })}
            placeholder={t.url}
            dir="ltr"
            className="flex-1"
          />
          <Select value={newSource.lang} onValueChange={(v) => setNewSource({ ...newSource, lang: v })}>
            <SelectTrigger className="sm:w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">EN</SelectItem>
              <SelectItem value="fa">FA</SelectItem>
            </SelectContent>
          </Select>
          <Select value={newSource.category} onValueChange={(v) => setNewSource({ ...newSource, category: v })}>
            <SelectTrigger className="sm:w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATS.map((c) => (
                <SelectItem key={c} value={c}>
                  {CAT_LABEL[c][lang]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" onClick={addSource} disabled={adding || !newSource.name.trim() || !newSource.url.trim()}>
            {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {t.addSource}
          </Button>
        </div>
      </section>

      {/* ── build ── */}
      <section className="mt-6 rounded-2xl border border-border bg-card p-4 sm:p-6">
        <h3 className="flex items-center gap-2 font-bold">
          <Radar className="h-4 w-4 text-violet-600 dark:text-violet-400" />
          {t.title}
        </h3>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={t.topicPh}
            className="flex-1"
          />
          <Select value={briefCat} onValueChange={setBriefCat}>
            <SelectTrigger className="sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATS.map((c) => (
                <SelectItem key={c} value={c}>
                  {CAT_LABEL[c][lang]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => runScan(true)} disabled={scanning || building}>
            {scanning ? <Loader2 className="me-1 h-4 w-4 animate-spin" /> : <Radar className="me-1 h-4 w-4" />}
            {scanning ? t.scanning : t.scan}
          </Button>
          <Button onClick={buildBrief} disabled={building || scanning || !topic.trim()}>
            {building ? <Loader2 className="me-1 h-4 w-4 animate-spin" /> : <ListTree className="me-1 h-4 w-4" />}
            {building ? t.building : t.build}
          </Button>
        </div>

        {scanResults && (
          <div className="mt-4 rounded-xl border border-border p-3">
            <div className="grid max-h-44 gap-1 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3">
              {scanResults.map((r) => (
                <div key={r.sourceId} className="flex items-center gap-1.5 text-xs">
                  <span
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${r.ok ? (r.headingCount > 0 ? 'bg-emerald-500' : 'bg-amber-500') : 'bg-red-500'}`}
                  />
                  <span className="truncate font-medium">{r.name}</span>
                  {r.ok ? (
                    <span className="shrink-0 text-muted-foreground">
                      {r.headingCount}H{r.cached ? ' · ' + t.cached : ''}
                    </span>
                  ) : (
                    <span className="shrink-0 text-red-500">{t.failed}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── result ── */}
      {brief && (
        <section className="mt-6 rounded-2xl border-2 border-violet-500/30 bg-card p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="flex items-center gap-2 font-bold">
              <ListTree className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              {t.result}
              <span className="text-xs font-normal text-muted-foreground">
                — {brief.topic} · {brief.sourceCount} {t.sourcesUnder}
              </span>
            </h3>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={copyBrief}>
                <Copy className="me-1 h-3.5 w-3.5" />
                {t.copy}
              </Button>
              <Button size="sm" onClick={sendToPipeline} disabled={sending}>
                {sending ? <Loader2 className="me-1 h-3.5 w-3.5 animate-spin" /> : <Send className="me-1 h-3.5 w-3.5" />}
                {t.toPipeline}
              </Button>
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {[
              { title: t.h2s, items: brief.structure.h2, chip: false },
              { title: t.topics, items: brief.structure.topics, chip: true },
              { title: t.missing, items: brief.structure.missing, chip: true },
              { title: t.faq, items: brief.structure.faq, chip: true },
              { title: t.clusters, items: brief.filtered.clusters, chip: true },
              { title: t.keep, items: brief.filtered.keep, chip: true },
            ]
              .filter((g) => g.items.length > 0)
              .map((g) => (
                <div key={g.title} className="rounded-xl border border-border p-3">
                  <div className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">{g.title}</div>
                  {g.chip ? (
                    <ChipList items={g.items} />
                  ) : (
                    <ol className="list-decimal space-y-1 pe-4 text-sm">
                      {g.items.map((h, i) => (
                        <li key={i} className="font-medium">
                          {h}
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              ))}

            {brief.structure.h3.length > 0 && (
              <div className="rounded-xl border border-border p-3 lg:col-span-2">
                <div className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">{t.h3s}</div>
                <div className="grid max-h-64 gap-1 overflow-y-auto text-sm sm:grid-cols-2">
                  {brief.structure.h3.map((h, i) => (
                    <div key={i} className="truncate">
                      <span className="font-medium">{h.text}</span>
                      {h.under && <span className="text-xs text-muted-foreground"> — {h.under}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {brief.failedSources.length > 0 && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-xs lg:col-span-2">
                <div className="mb-1 font-bold">{t.failed}:</div>
                <div className="flex flex-wrap gap-2">
                  {brief.failedSources.map((f, i) => (
                    <span key={i} className="rounded-md bg-amber-500/10 px-1.5 py-0.5">
                      {f.name} {f.error ? `(${f.error})` : ''}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-xl border border-border p-3 lg:col-span-2">
              <div className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">Markdown</div>
              <ScrollArea className="max-h-72">
                <pre className="whitespace-pre-wrap break-words pe-3 font-mono text-xs leading-relaxed text-muted-foreground" dir="auto">
                  {brief.briefMd}
                </pre>
              </ScrollArea>
            </div>
          </div>
        </section>
      )}

      {/* ── history ── */}
      <section className="mt-6 rounded-2xl border border-border bg-card p-4 sm:p-6">
        <h3 className="font-bold">{t.history}</h3>
        {history.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">{t.noHistory}</p>
        ) : (
          <div className="mt-3 max-h-72 space-y-1.5 overflow-y-auto">
            {history.map((h) => (
              <div key={h.id} className="flex items-center gap-2 rounded-xl border border-border p-2.5 text-sm">
                <Badge variant="outline" className="h-5 shrink-0 px-1.5 text-[10px]">
                  {CAT_LABEL[h.category]?.[lang] || h.category}
                </Badge>
                <span className="min-w-0 flex-1 truncate font-medium">{h.topic}</span>
                <span className="shrink-0 text-[11px] text-muted-foreground">
                  {h.h2Count} H2 · {h.sourceCount} {lang === 'fa' ? 'منبع' : 'sources'} · {formatDate(lang, h.createdAt)}
                </span>
                <button
                  onClick={() => deleteBrief(h.id)}
                  aria-label={t.delete}
                  className="shrink-0 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-600"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
