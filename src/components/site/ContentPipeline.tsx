'use client';

/**
 * AI Content Pipeline — the 3-agent content studio.
 *
 * One form → three independent AI agents work on the piece:
 *   AI 1 WRITER → AI 2 SEO AUDITOR + AI 3 EDITOR (parallel, double-blind)
 *   → optional auto-revise loop → human approval → website | LinkedIn queue.
 *
 * The pipeline steps live in separate API endpoints so this UI can animate
 * every agent and chain them client-side ("run all") while keeping each
 * server call short enough for hosting timeouts.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useApp, pick } from './store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  PenLine, SearchCheck, UserCheck, Loader2, CheckCircle2, XCircle, AlertTriangle,
  Sparkles, Send, Trash2, RefreshCw, Wrench, Globe, Linkedin, ChevronDown, Eye, FileText,
} from 'lucide-react';

interface ReviewVerdict {
  agent: 'seo' | 'editor';
  revision: number;
  score: number;
  verdict: 'approve' | 'revise';
  issues: string[];
  must_fix: string[];
  notes: string;
  at: string;
}
interface InternalLink { slug: string; anchor: string }
interface Article {
  id: string;
  target: 'website' | 'linkedin';
  lang: 'fa' | 'en';
  topic: string;
  keyword: string | null;
  status: 'draft' | 'needs_revision' | 'approved' | 'published' | 'failed';
  titleFa: string | null;
  titleEn: string | null;
  slugIdea: string | null;
  excerptFa: string | null;
  excerptEn: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  keywords: string[];
  internalLinks: InternalLink[];
  hashtags: string[];
  contentFa: string | null;
  contentEn: string | null;
  reviews: ReviewVerdict[];
  seoScore: number | null;
  editorScore: number | null;
  revision: number;
  lastError: string | null;
  publishedSlug: string | null;
  createdAt: string;
}

type AgentState = 'idle' | 'running' | 'done' | 'needs_revision' | 'failed';
type Stage = 'idle' | 'writer' | 'review' | 'revise' | 'done';

const MAX_REVISIONS = 2;

function ScoreBadge({ score, label }: { score: number | null; label: string }) {
  const s = typeof score === 'number' ? score : null;
  const cls =
    s === null
      ? 'bg-muted text-muted-foreground'
      : s >= 85
        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
        : s >= 70
          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
          : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>
      {label}: {s === null ? '—' : s}
    </span>
  );
}

function StatusBadge({ status, L }: { status: Article['status']; L: (fa: string, en: string) => string }) {
  const map: Record<Article['status'], { label: string; cls: string }> = {
    draft: { label: L('در انتظار بازبینی', 'Awaiting review'), cls: 'bg-muted text-muted-foreground' },
    needs_revision: { label: L('نیاز به اصلاح', 'Needs revision'), cls: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' },
    approved: { label: L('تایید هوش مصنوعی', 'AI approved'), cls: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' },
    published: { label: L('منتشر شد', 'Published'), cls: 'bg-primary text-primary-foreground' },
    failed: { label: L('خطا', 'Failed'), cls: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' },
  };
  const v = map[status] || map.draft;
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${v.cls}`}>{v.label}</span>;
}

function AgentRow({
  icon, title, subtitle, state,
}: { icon: React.ReactNode; title: string; subtitle: string; state: AgentState }) {
  return (
    <div className={`flex items-center gap-3 rounded-xl border p-3 transition-colors ${
      state === 'running' ? 'border-primary/40 bg-primary/5' : 'border-border bg-card/50'}`}>
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
        state === 'running' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{title}</p>
        <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <div className="shrink-0">
        {state === 'running' && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
        {state === 'done' && <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
        {state === 'needs_revision' && <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />}
        {state === 'failed' && <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />}
        {state === 'idle' && <div className="h-5 w-5 rounded-full border-2 border-dashed border-muted-foreground/30" />}
      </div>
    </div>
  );
}

export function ContentPipeline() {
  const { lang } = useApp();
  const { toast } = useToast();
  const L = (fa: string, en: string) => pick(lang, fa, en);

  const [topic, setTopic] = useState('');
  const [keyword, setKeyword] = useState('');
  const [target, setTarget] = useState<'website' | 'linkedin'>('website');
  const [contentLang, setContentLang] = useState<'fa' | 'en'>('fa');
  const [autoFix, setAutoFix] = useState(true);

  const [running, setRunning] = useState(false);
  const [stage, setStage] = useState<Stage>('idle');
  const [agents, setAgents] = useState<{ writer: AgentState; seo: AgentState; editor: AgentState }>({
    writer: 'idle', seo: 'idle', editor: 'idle',
  });
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [current, setCurrent] = useState<Article | null>(null);
  const [showDetail, setShowDetail] = useState(true);
  const [queue, setQueue] = useState<Article[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [busyId, setBusyId] = useState('');

  const startTimer = () => {
    setElapsed(0);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
  };
  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  };
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const loadQueue = useCallback(() => {
    return fetch('/api/admin/ai-articles')
      .then((r) => r.json())
      .then((d) => setQueue(d.articles || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  /** Chain: writer → double-blind review → (auto-revise → review) loop. */
  async function runPipeline() {
    if (!topic.trim() || running) return;
    setRunning(true);
    setShowDetail(true);
    startTimer();
    try {
      // ── step 1 · writer
      setStage('writer');
      setAgents({ writer: 'running', seo: 'idle', editor: 'idle' });
      const g = await fetch('/api/admin/ai-articles/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, keyword, target, lang: contentLang }),
      }).then((r) => r.json());
      if (!g.ok || !g.article) throw new Error(g.error || 'Writer failed');
      let art: Article = g.article;
      setAgents((a) => ({ ...a, writer: 'done' }));

      // ── step 2 · double-blind review (AI 2 + AI 3 in parallel)
      setStage('review');
      setAgents((a) => ({ ...a, seo: 'running', editor: 'running' }));
      const r = await fetch(`/api/admin/ai-articles/${art.id}/review`, { method: 'POST' }).then((r) => r.json());
      if (!r.ok) throw new Error(r.error || 'Review failed');
      art = r.article;
      setAgents((a) => ({ ...a, seo: art.seoScore !== null && art.seoScore >= 85 ? 'done' : 'needs_revision', editor: art.editorScore !== null && art.editorScore >= 85 ? 'done' : 'needs_revision' }));

      // ── step 3 · bounded auto-fix loop
      while (art.status === 'needs_revision' && autoFix && art.revision <= MAX_REVISIONS) {
        setStage('revise');
        setAgents({ writer: 'running', seo: 'idle', editor: 'idle' });
        const rv = await fetch(`/api/admin/ai-articles/${art.id}/revise`, { method: 'POST' }).then((r) => r.json());
        if (!rv.ok) throw new Error(rv.error || 'Revision failed');
        art = rv.article;
        setStage('review');
        setAgents((a) => ({ ...a, seo: 'running', editor: 'running' }));
        const r2 = await fetch(`/api/admin/ai-articles/${art.id}/review`, { method: 'POST' }).then((r) => r.json());
        if (!r2.ok) throw new Error(r2.error || 'Review failed');
        art = r2.article;
        setAgents((a) => ({ ...a, seo: art.seoScore !== null && art.seoScore >= 85 ? 'done' : 'needs_revision', editor: art.editorScore !== null && art.editorScore >= 85 ? 'done' : 'needs_revision' }));
      }

      setCurrent(art);
      setStage('done');
      toast({
        title:
          art.status === 'approved'
            ? L('هر سه عامل تایید کردند — آماده انتشار', 'All three agents approved — ready to publish')
            : L('بازبینی انجام شد — تصمیم نهایی با شما', 'Review finished — final call is yours'),
      });
    } catch (e) {
      setAgents((a) => ({
        writer: a.writer === 'running' ? 'failed' : a.writer,
        seo: a.seo === 'running' ? 'failed' : a.seo,
        editor: a.editor === 'running' ? 'failed' : a.editor,
      }));
      setStage('idle');
      toast({ title: e instanceof Error ? e.message : 'Pipeline failed', variant: 'destructive' });
    } finally {
      setRunning(false);
      stopTimer();
      loadQueue();
    }
  }

  async function act(id: string, action: 'review' | 'revise' | 'publish', onDone?: (a: Article) => void) {
    if (busyId) return;
    setBusyId(id + action);
    try {
      const res = await fetch(`/api/admin/ai-articles/${id}/${action}`, { method: 'POST' }).then((r) => r.json());
      if (!res.ok) throw new Error(res.error || 'Action failed');
      if (action === 'publish') {
        const t =
          res.target === 'website'
            ? L(`در سایت منتشر شد: /blog/${res.slug}`, `Published: /blog/${res.slug}`)
            : L('به صف استودیو شبکه‌های اجتماعی اضافه شد', 'Added to the Social Studio queue');
        toast({ title: t });
      } else if (onDone) {
        onDone(res.article);
      }
      loadQueue();
    } catch (e) {
      toast({ title: e instanceof Error ? e.message : 'Action failed', variant: 'destructive' });
    } finally {
      setBusyId('');
    }
  }

  async function remove(id: string) {
    if (busyId) return;
    setBusyId(id + 'del');
    try {
      const res = await fetch(`/api/admin/ai-articles/${id}`, { method: 'DELETE' }).then((r) => r.json());
      if (!res.ok) throw new Error(res.error || 'Delete failed');
      if (current?.id === id) setCurrent(null);
      toast({ title: L('حذف شد', 'Deleted') });
      loadQueue();
    } catch (e) {
      toast({ title: e instanceof Error ? e.message : 'Delete failed', variant: 'destructive' });
    } finally {
      setBusyId('');
    }
  }

  const filtered = queue.filter((a) => statusFilter === 'all' || a.status === statusFilter);
  const detail = current;
  const detailContent = detail ? (detail.lang === 'fa' ? detail.contentFa : detail.contentEn) || detail.contentFa || detail.contentEn || '' : '';
  const detailIsHtml = detail?.target === 'website';
  const lastRound = detail && detail.reviews.length
    ? Math.max(...detail.reviews.map((r) => r.revision ?? 1))
    : 0;
  const lastReviews = detail ? detail.reviews.filter((r) => (r.revision ?? 1) === lastRound) : [];

  return (
    <div className="space-y-6" dir={pick(lang, 'rtl', 'ltr')}>
      {/* ── new piece ── */}
      <section className="rounded-2xl border border-border bg-card/40 p-4 sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-base font-bold sm:text-lg">
            {L('خط تولید محتوای هوشمند — سه عامل مستقل', 'AI Content Pipeline — three independent agents')}
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="cp-topic">{L('موضوع', 'Topic')} *</Label>
            <Input id="cp-topic" value={topic} onChange={(e) => setTopic(e.target.value)}
              placeholder={L('مثلاً: اینترنت اشیا در شهر هوشمند و نقش داده', 'e.g. IoT in smart cities and the role of data')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cp-keyword">{L('کلمه کلیدی سئو (اختیاری)', 'SEO focus keyword (optional)')}</Label>
            <Input id="cp-keyword" value={keyword} onChange={(e) => setKeyword(e.target.value)}
              placeholder={L('مثلاً: شهر هوشمند', 'e.g. smart city')} />
          </div>
          <div className="space-y-1.5">
            <Label>{L('مقصد محتوا', 'Content target')}</Label>
            <Select value={target} onValueChange={(v) => setTarget(v as 'website' | 'linkedin')}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="website"><span className="flex items-center gap-2"><Globe className="h-4 w-4" />{L('مقاله وب‌سایت (سئو کامل)', 'Website article (full SEO)')}</span></SelectItem>
                <SelectItem value="linkedin"><span className="flex items-center gap-2"><Linkedin className="h-4 w-4" />{L('پست لینکدین', 'LinkedIn post')}</span></SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>{L('زبان محتوا', 'Content language')}</Label>
            <Select value={contentLang} onValueChange={(v) => setContentLang(v as 'fa' | 'en')}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="fa">{L('فارسی', 'Persian')}</SelectItem>
                <SelectItem value="en">{L('انگلیسی', 'English')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <div className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2.5 w-full">
              <div className="min-w-0">
                <p className="text-sm font-medium">{L('حلقه اصلاح خودکار', 'Auto-revise loop')}</p>
                <p className="text-xs text-muted-foreground">{L('بازنویسی خودکار تا ۲ بار بر اساس بازخورد بازبین‌ها', 'Auto-rewrite up to 2× from reviewer feedback')}</p>
              </div>
              <Switch checked={autoFix} onCheckedChange={setAutoFix} aria-label="auto revise" />
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button onClick={runPipeline} disabled={running || !topic.trim()} className="min-h-11 gap-2">
            {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {running
              ? `${stage === 'writer' ? L('نویسنده در حال نوشتن…', 'Writer is writing…') : stage === 'review' ? L('بازبین‌ها در حال بررسی…', 'Auditors are reviewing…') : L('در حال بازنویسی…', 'Revising…')} (${elapsed}s)`
              : L('اجرای خط کامل: نویسنده + دو بازبین', 'Run full pipeline: writer + 2 auditors')}
          </Button>
          {running && stage === 'writer' && (
            <span className="text-xs text-muted-foreground">{L('نوشتن مقاله کامل تا ~۲ دقیقه طول می‌کشد', 'A full article can take up to ~2 minutes')}</span>
          )}
        </div>

        {/* 3-agent visualization */}
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <AgentRow icon={<PenLine className="h-4 w-4" />}
            title={`AI 1 · ${L('نویسنده', 'Writer')}`}
            subtitle={L('تولید محتوا + لینک‌سازی داخلی', 'Content + internal linking')}
            state={agents.writer} />
          <AgentRow icon={<SearchCheck className="h-4 w-4" />}
            title={`AI 2 · ${L('کارشناس سئو', 'SEO auditor')}`}
            subtitle={L('امتیاز سئو + فهرست اصلاحات', 'SEO score + fix list')}
            state={agents.seo} />
          <AgentRow icon={<UserCheck className="h-4 w-4" />}
            title={`AI 3 · ${L('سردبیر', 'Editor-in-chief')}`}
            subtitle={L('کیفیت لحن و صداقت محتوا', 'Voice, quality & honesty')}
            state={agents.editor} />
        </div>
      </section>

      {/* ── result / detail ── */}
      {detail && (
        <section className="rounded-2xl border border-border bg-card/40">
          <button type="button" onClick={() => setShowDetail((v) => !v)}
            className="flex w-full items-center justify-between gap-2 p-4 text-start sm:p-6">
            <div className="min-w-0">
              <h3 className="truncate text-base font-bold sm:text-lg">
                {detail.lang === 'fa' ? detail.titleFa || detail.titleEn : detail.titleEn || detail.titleFa || detail.topic}
              </h3>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <StatusBadge status={detail.status} L={L} />
                <ScoreBadge score={detail.seoScore} label={L('سئو', 'SEO')} />
                <ScoreBadge score={detail.editorScore} label={L('سردبیر', 'Editor')} />
                <Badge variant="outline" className="gap-1">
                  {detail.target === 'website' ? <Globe className="h-3 w-3" /> : <Linkedin className="h-3 w-3" />}
                  {detail.target === 'website' ? L('وب‌سایت', 'Website') : 'LinkedIn'} · {detail.lang}
                </Badge>
                <Badge variant="outline">{L(`بازنویسی ${detail.revision}`, `Revision ${detail.revision}`)}</Badge>
              </div>
            </div>
            <ChevronDown className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform ${showDetail ? 'rotate-180' : ''}`} />
          </button>

          {showDetail && (
            <div className="space-y-5 border-t border-border p-4 sm:p-6">
              {/* SEO meta + keywords */}
              {detail.target === 'website' && (
                <div className="grid gap-3 text-sm sm:grid-cols-2">
                  <div className="rounded-xl bg-muted/40 p-3">
                    <p className="mb-1 text-xs font-semibold text-muted-foreground">Meta title</p>
                    <p dir={/[\u0600-\u06FF]/.test(detail.metaTitle || '') ? 'rtl' : 'ltr'} className="break-words">{detail.metaTitle || '—'}</p>
                  </div>
                  <div className="rounded-xl bg-muted/40 p-3">
                    <p className="mb-1 text-xs font-semibold text-muted-foreground">Meta description</p>
                    <p dir={/[\u0600-\u06FF]/.test(detail.metaDescription || '') ? 'rtl' : 'ltr'} className="break-words">{detail.metaDescription || '—'}</p>
                  </div>
                </div>
              )}
              {(detail.keywords.length > 0 || detail.hashtags.length > 0) && (
                <div className="flex flex-wrap gap-1.5">
                  {detail.keywords.map((k) => <Badge key={k} variant="secondary" className="text-xs">{k}</Badge>)}
                  {detail.hashtags.map((h) => <Badge key={h} variant="secondary" className="text-xs">{h}</Badge>)}
                </div>
              )}
              {detail.internalLinks.length > 0 && (
                <div className="text-sm">
                  <p className="mb-1.5 text-xs font-semibold text-muted-foreground">{L('لینک‌های داخلی استفاده‌شده', 'Internal links used')}</p>
                  <ul className="space-y-1">
                    {detail.internalLinks.map((l) => (
                      <li key={l.slug} className="flex flex-wrap items-center gap-1.5">
                        <a href={`/blog/${l.slug}`} target="_blank" rel="noreferrer" className="text-xs font-mono text-primary hover:underline">/blog/{l.slug}</a>
                        <span className="text-xs text-muted-foreground">«{l.anchor}»</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* reviews */}
              {lastReviews.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold">{L('نتیجه بازبینی دور آخر', 'Latest review round')}</p>
                  {lastReviews.map((r) => (
                    <div key={r.agent} className="rounded-xl border border-border p-3 text-sm">
                      <div className="mb-1.5 flex flex-wrap items-center gap-2">
                        {r.agent === 'seo' ? <SearchCheck className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                        <span className="font-semibold">{r.agent === 'seo' ? L('کارشناس سئو', 'SEO auditor') : L('سردبیر', 'Editor')}</span>
                        <ScoreBadge score={r.score} label={L('امتیاز', 'Score')} />
                        <Badge variant={r.verdict === 'approve' ? 'default' : 'destructive'} className="text-xs">
                          {r.verdict === 'approve' ? L('تایید', 'Approve') : L('اصلاح', 'Revise')}
                        </Badge>
                      </div>
                      {r.must_fix.length > 0 && (
                        <ul className="mb-1.5 list-disc space-y-0.5 ps-5 text-xs text-red-700 dark:text-red-400">
                          {r.must_fix.map((f, i) => <li key={i}>{f}</li>)}
                        </ul>
                      )}
                      {r.issues.length > 0 && (
                        <ul className="mb-1.5 list-disc space-y-0.5 ps-5 text-xs text-muted-foreground">
                          {r.issues.map((f, i) => <li key={i}>{f}</li>)}
                        </ul>
                      )}
                      {r.notes && <p className="text-xs text-muted-foreground">{r.notes}</p>}
                    </div>
                  ))}
                </div>
              )}

              {/* content preview */}
              <div>
                <p className="mb-1.5 text-sm font-semibold">{L('پیش‌نمایش محتوا', 'Content preview')}</p>
                {detailIsHtml ? (
                  <div className="max-h-96 overflow-y-auto rounded-xl border border-border bg-background p-4 text-sm leading-7 [&_a]:text-primary [&_a]:underline [&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:text-base [&_h2]:font-bold [&_h3]:mb-1.5 [&_h3]:mt-3 [&_h3]:text-sm [&_h3]:font-semibold [&_li]:ms-4 [&_li]:list-disc [&_p]:mb-2.5"
                    dir={detail.lang === 'fa' ? 'rtl' : 'ltr'}
                    dangerouslySetInnerHTML={{ __html: detailContent }} />
                ) : (
                  <p className="max-h-96 overflow-y-auto whitespace-pre-wrap rounded-xl border border-border bg-background p-4 text-sm leading-7"
                    dir={detail.lang === 'fa' ? 'rtl' : 'ltr'}>{detailContent}</p>
                )}
              </div>

              {/* actions */}
              <div className="flex flex-wrap gap-2">
                {detail.status !== 'published' && (
                  <Button className="min-h-11 gap-2" disabled={busyId !== ''}
                    onClick={() => act(detail.id, 'publish')}>
                    {busyId === detail.id + 'publish' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    {detail.target === 'website'
                      ? L('انتشار در وب‌سایت', 'Publish to website')
                      : L('ارسال به صف لینکدین', 'Send to LinkedIn queue')}
                  </Button>
                )}
                {detail.status === 'published' && detail.publishedSlug && (
                  <Button variant="outline" className="min-h-11 gap-2" asChild>
                    <a href={`/blog/${detail.publishedSlug}`} target="_blank" rel="noreferrer"><Eye className="h-4 w-4" />{L('مشاهده در سایت', 'View on site')}</a>
                  </Button>
                )}
                <Button variant="outline" className="min-h-11 gap-2" disabled={busyId !== ''}
                  onClick={() => act(detail.id, 'review', (a) => setCurrent(a))}>
                  {busyId === detail.id + 'review' ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  {L('بازبینی دوباره', 'Re-review')}
                </Button>
                <Button variant="outline" className="min-h-11 gap-2" disabled={busyId !== '' || detail.revision > MAX_REVISIONS}
                  onClick={() => act(detail.id, 'revise', (a) => setCurrent(a))}>
                  {busyId === detail.id + 'revise' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wrench className="h-4 w-4" />}
                  {L('اصلاح با بازخورد عامل‌ها', 'Fix with agent feedback')}
                </Button>
                <Button variant="ghost" className="min-h-11 gap-2 text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/40"
                  disabled={busyId !== ''} onClick={() => remove(detail.id)}>
                  {busyId === detail.id + 'del' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  {L('حذف', 'Delete')}
                </Button>
              </div>
              {detail.revision > MAX_REVISIONS && detail.status === 'needs_revision' && (
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  {L('حد مجاز بازنویسی خودکار به پایان رسید — یا دستی منتشر کنید یا موضوع را تغییر دهید.', 'Auto-revision budget exhausted — publish manually or change the topic.')}
                </p>
              )}
            </div>
          )}
        </section>
      )}

      {/* ── queue ── */}
      <section className="rounded-2xl border border-border bg-card/40 p-4 sm:p-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 text-base font-bold">
            <FileText className="h-4 w-4 text-primary" />{L('صف بررسی و انتشار', 'Review & publish queue')}
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'all', label: L('همه', 'All') },
              { id: 'draft', label: L('در انتظار بازبینی', 'Awaiting') },
              { id: 'needs_revision', label: L('نیاز به اصلاح', 'Needs fix') },
              { id: 'approved', label: L('تایید شده', 'Approved') },
              { id: 'published', label: L('منتشر شده', 'Published') },
            ].map((f) => (
              <button key={f.id} type="button" onClick={() => setStatusFilter(f.id)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  statusFilter === f.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">{L('هنوز چیزی در خط تولید نیست.', 'Nothing in the pipeline yet.')}</p>
        ) : (
          <ScrollArea className="max-h-96">
            <ul className="space-y-2 pe-2">
              {filtered.map((a) => (
                <li key={a.id} className="rounded-xl border border-border bg-card/60 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <button type="button" className="min-w-0 flex-1 text-start" onClick={() => { setCurrent(a); setShowDetail(true); }}>
                      <p className="truncate text-sm font-semibold">
                        {a.lang === 'fa' ? a.titleFa || a.titleEn : a.titleEn || a.titleFa || a.topic}
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <StatusBadge status={a.status} L={L} />
                        <ScoreBadge score={a.seoScore} label="SEO" />
                        <ScoreBadge score={a.editorScore} label={L('سردبیر', 'Ed.')} />
                        <span className="text-xs text-muted-foreground">
                          {a.target === 'website' ? <Globe className="inline h-3 w-3" /> : <Linkedin className="inline h-3 w-3" />}
                          {' '}· {new Date(a.createdAt).toLocaleDateString(lang === 'fa' ? 'fa-IR' : 'en-US')}
                        </span>
                      </div>
                    </button>
                    <div className="flex shrink-0 items-center gap-1.5">
                      {a.status === 'approved' && (
                        <Button size="sm" variant="outline" className="gap-1.5" disabled={busyId !== ''}
                          onClick={() => { setCurrent(a); act(a.id, 'publish'); }}>
                          {busyId === a.id + 'publish' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                          {a.target === 'website' ? L('انتشار', 'Publish') : L('به صف لینکدین', 'To queue')}
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/40"
                        disabled={busyId !== ''} onClick={() => remove(a.id)} aria-label="delete">
                        {busyId === a.id + 'del' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </ScrollArea>
        )}
      </section>
    </div>
  );
}
