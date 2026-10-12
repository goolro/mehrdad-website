'use client';

/**
 * Social Media Studio — generate platform-tailored posts from the site's
 * own content (blog posts via DB, topics via the RAG knowledge base) and
 * manage saved drafts. Voice + per-platform format rules live in the
 * generate API; this component owns the flow: pick → generate → edit →
 * copy / save.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useApp, pick } from './store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Share2, Loader2, Sparkles, Copy, Save, Trash2, Check, RefreshCw, Zap, Send, Globe, FileText, TriangleAlert, Linkedin, Instagram, Twitter, type LucideIcon } from 'lucide-react';

interface PostOption {
  slug: string;
  titleEn: string;
  titleFa: string;
  date: string;
}
interface GeneratedPost {
  platform: string;
  lang: string;
  hook: string;
  content: string;
  limit: number;
}
interface DraftItem {
  id: string;
  platform: string;
  lang: string;
  topic: string | null;
  sourceSlug: string | null;
  content: string;
  posted: boolean;
  createdAt: string;
}
interface AutopilotResult {
  created: { slug: string; title: string; platform: string; lang: string }[];
  skipped: { slug: string; reason: string }[];
  failed: { slug: string; error: string }[];
}

const PLATFORMS = [
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'x', label: 'X' },
  { id: 'telegram', label: 'Telegram' },
] as const;

const PLATFORM_FA: Record<string, string> = {
  linkedin: 'لینکدین',
  instagram: 'اینستاگرام',
  x: 'ایکس (توییتر)',
  telegram: 'تلگرام',
};

const PLATFORM_LIMITS: Record<string, number> = { linkedin: 3000, instagram: 2200, x: 280, telegram: 4096 };

const PLATFORM_EN: Record<string, string> = Object.fromEntries(PLATFORMS.map((p) => [p.id, p.label]));

/** Wizard step 2 icons — the owner picks networks visually, not by id. */
const AP_PLATFORM_ICONS: Record<string, LucideIcon> = {
  linkedin: Linkedin,
  instagram: Instagram,
  x: Twitter,
  telegram: Send,
};

const AP_LANGS = [
  { id: 'fa', fa: 'فارسی', en: 'Persian', faHint: 'همه پست‌ها فارسی ساخته می‌شوند', enHint: 'All posts written in Persian' },
  { id: 'en', fa: 'انگلیسی', en: 'English', faHint: 'همه پست‌ها انگلیسی ساخته می‌شوند', enHint: 'All posts written in English' },
  { id: 'both', fa: 'هر دو', en: 'Both', faHint: 'هر مقاله دو نسخه می‌گیرد', enHint: 'Each post gets both versions' },
] as const;

type ApLang = (typeof AP_LANGS)[number]['id'];

export function SocialStudio() {
  const { lang } = useApp();
  const { toast } = useToast();

  const [source, setSource] = useState<'post' | 'topic'>('post');
  const [posts, setPosts] = useState<PostOption[]>([]);
  const [slug, setSlug] = useState('');
  const [topic, setTopic] = useState('');
  const [platforms, setPlatforms] = useState<string[]>(['linkedin', 'instagram']);
  const [postLang, setPostLang] = useState<'fa' | 'en' | 'both'>('fa');
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState<GeneratedPost[]>([]);
  const [copied, setCopied] = useState('');
  const [saving, setSaving] = useState('');
  const [drafts, setDrafts] = useState<DraftItem[]>([]);
  const [loadingDrafts, setLoadingDrafts] = useState(false);
  const [autopilotRunning, setAutopilotRunning] = useState(false);
  const [autopilotCount, setAutopilotCount] = useState('3');
  // Owner-requested wizard (2026-10-13): the auto-pilot was Persian+LinkedIn
  // hardcoded; language and networks are now chosen in a 3-step wizard
  // (زبان → شبکه → اجرا) instead of being implied by the shared form below.
  const [apStep, setApStep] = useState<1 | 2 | 3>(1);
  const [apLang, setApLang] = useState<ApLang>('fa');
  const [apPlatforms, setApPlatforms] = useState<string[]>(['linkedin']);
  // Owner-requested visibility: autopilot used to report only via transient
  // toasts (and hid failure details in server logs the owner cannot see),
  // so a failed run looked like «هیچ چیزی نشان نمی‌دهد». Everything now
  // lands in a persistent, inline result card.
  const [autopilotResult, setAutopilotResult] = useState<AutopilotResult | null>(null);
  const [autopilotError, setAutopilotError] = useState('');
  const [autopilotElapsed, setAutopilotElapsed] = useState(0);
  const autopilotTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [publishingId, setPublishingId] = useState('');
  const [linkedinSetup, setLinkedinSetup] = useState<string[] | null>(null);
  // Deleting a draft is permanent — route it through a confirm dialog.
  const [draftToDelete, setDraftToDelete] = useState<DraftItem | null>(null);

  const L = (fa: string, en: string) => pick(lang, fa, en);
  // Persian copy is primary on this site; keep textarea direction honest.
  const isFa = (v: string) => /[\u0600-\u06FF]/.test(v);

  /** Client-side guard mirroring the server-side language assertion: flags
   * drafts whose text language does not match their stored label. */
  const langMismatch = (d: DraftItem): boolean => (d.lang === 'fa' ? !isFa(d.content) : isFa(d.content));

  /** Source-article lookup for draft cards. Production stores percent-encoded
   * WP slugs, so the display title decodes first and falls back to the admin
   * post list, then to the decoded slug itself. */
  const sourceInfoFor = (d: DraftItem): { title: string; href: string } | null => {
    if (!d.sourceSlug) return null;
    const post = posts.find((p) => p.slug === d.sourceSlug);
    let display = d.sourceSlug;
    try {
      display = decodeURIComponent(d.sourceSlug);
    } catch {
      /* keep raw slug */
    }
    return { title: post?.titleFa || post?.titleEn || display, href: `/blog/${d.sourceSlug}` };
  };

  const loadDrafts = useCallback(() => {
    return fetch('/api/admin/social/drafts')
      .then((r) => r.json())
      .then((d) => setDrafts(d.drafts || []))
      .catch(() => {})
      .finally(() => setLoadingDrafts(false));
  }, []);

  useEffect(() => {
    fetch('/api/admin/posts')
      .then((r) => r.json())
      .then((d) => setPosts(d.posts || []))
      .catch(() => {});
    loadDrafts();
  }, [loadDrafts]);

  function togglePlatform(id: string) {
    setPlatforms((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  }

  function toggleApPlatform(id: string) {
    setApPlatforms((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  }

  const platformLabel = (id: string) => (lang === 'fa' ? PLATFORM_FA[id] || id : PLATFORM_EN[id] || id);
  const apLangLabel = apLang === 'fa' ? L('فارسی', 'Persian') : apLang === 'en' ? L('انگلیسی', 'English') : L('فارسی + انگلیسی', 'Persian + English');
  const apEstimate = (Number(autopilotCount) || 3) * Math.max(apPlatforms.length, 1) * (apLang === 'both' ? 2 : 1);

  async function generate() {
    setGenerating(true);
    setResults([]);
    try {
      const res = await fetch('/api/admin/social/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source,
          slug: source === 'post' ? slug : undefined,
          topic: source === 'topic' ? topic : undefined,
          platforms,
          lang: postLang,
        }),
      });
      const d = await res.json();
      if (d.ok) {
        setResults(d.posts || []);
        toast({ title: L('تولید شد! ویرایش کن، بعد کپی یا ذخیره.', 'Generated! Edit, then copy or save.') });
      } else {
        toast({ title: d.error || 'Failed', variant: 'destructive' });
      }
    } catch {
      toast({ title: L('خطا در تولید', 'Generation failed'), variant: 'destructive' });
    } finally {
      setGenerating(false);
    }
  }

  async function copy(p: GeneratedPost) {
    try {
      await navigator.clipboard.writeText(p.content);
      setCopied(`${p.platform}:${p.lang}`);
      setTimeout(() => setCopied(''), 1500);
    } catch {
      toast({ title: L('کپی نشد — دستی انتخاب کن', 'Copy failed — select manually'), variant: 'destructive' });
    }
  }

  async function save(p: GeneratedPost) {
    setSaving(`${p.platform}:${p.lang}`);
    try {
      const res = await fetch('/api/admin/social/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: p.platform,
          lang: p.lang,
          content: p.content,
          topic: source === 'topic' ? topic : null,
          sourceSlug: source === 'post' ? slug : null,
        }),
      });
      const d = await res.json();
      if (d.ok) {
        toast({ title: L('ذخیره شد ✓', 'Saved ✓') });
        loadDrafts();
      } else {
        toast({ title: d.error || 'Failed', variant: 'destructive' });
      }
    } catch {
      toast({ title: L('ذخیره نشد', 'Save failed'), variant: 'destructive' });
    } finally {
      setSaving('');
    }
  }

  async function removeDraft(id: string) {
    await fetch(`/api/admin/social/drafts?id=${id}`, { method: 'DELETE' }).catch(() => {});
    loadDrafts();
  }

  /** Auto-pilot: fill missing LinkedIn drafts from the latest posts (idempotent). */
  async function runAutopilot() {
    setAutopilotRunning(true);
    setLinkedinSetup(null);
    setAutopilotResult(null);
    setAutopilotError('');
    setAutopilotElapsed(0);
    if (autopilotTimer.current) clearInterval(autopilotTimer.current);
    autopilotTimer.current = setInterval(() => setAutopilotElapsed((s) => s + 1), 1000);
    try {
      const res = await fetch('/api/admin/social/autopilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: Number(autopilotCount) || 3, lang: apLang, platforms: apPlatforms }),
      });
      const d = (await res.json()) as (AutopilotResult & { ok?: boolean; error?: string }) | { error?: string };
      if ('created' in d) {
        const r = d as AutopilotResult;
        setAutopilotResult(r);
        if (r.created.length > 0) {
          toast({
            title: L(
              `${r.created.length} پیش‌نویس ساخته شد — جزئیات پایین همین کارت ✓`,
              `${r.created.length} draft(s) created — details in the card below ✓`
            ),
          });
        }
        loadDrafts();
      } else {
        setAutopilotError((d as { error?: string }).error || 'Failed');
      }
    } catch {
      setAutopilotError(
        L(
          'اتصال قطع شد یا سرور به سقف زمانی میزبان خورد. دوباره «ساخت خودکار» را بزن — اجرای مجدد چیزی را تکرار نمی‌کند و فقط جاهای خالی را پر می‌کند.',
          'Connection dropped or the server hit its hosting time cap. Press Auto-fill again — re-running never duplicates, it only fills the gaps.'
        )
      );
    } finally {
      if (autopilotTimer.current) clearInterval(autopilotTimer.current);
      autopilotTimer.current = null;
      setAutopilotRunning(false);
    }
  }

  useEffect(
    () => () => {
      if (autopilotTimer.current) clearInterval(autopilotTimer.current);
    },
    []
  );

  /** Publish a saved LinkedIn draft via the LinkedIn API (needs env config). */
  async function publishDraft(id: string) {
    setPublishingId(id);
    setLinkedinSetup(null);
    try {
      const res = await fetch('/api/admin/social/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const d = await res.json();
      if (d.ok) {
        toast({ title: L('در لینکدین منتشر شد ✓', 'Published to LinkedIn ✓') });
        loadDrafts();
      } else if (res.status === 503 && Array.isArray(d.setup)) {
        setLinkedinSetup(d.setup as string[]);
      } else {
        toast({ title: d.error || 'Failed', variant: 'destructive' });
      }
    } catch {
      toast({ title: L('انتشار ناموفق', 'Publish failed'), variant: 'destructive' });
    } finally {
      setPublishingId('');
    }
  }

  function editResult(idx: number, content: string) {
    setResults((prev) => prev.map((r, i) => (i === idx ? { ...r, content } : r)));
  }

  const canGenerate = generating === false && platforms.length > 0 && (source === 'post' ? !!slug : !!topic.trim());

  return (
    <div className="space-y-6">
      {/* ── auto-pilot ── */}
      <div className="rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-600/10 to-fuchsia-600/5 p-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-600/15">
            <Zap className="h-5 w-5 text-violet-600 dark:text-violet-400" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold">{L('اتوماتیک‌پایلوت', 'Auto-pilot')}</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {L(
                'از جدیدترین مقالات، با زبان و شبکه‌هایی که خودت انتخاب می‌کنی پست می‌سازد و در صف بازبینی می‌گذارد. اجرای دوباره چیزی را تکرار نمی‌کند.',
                'Scans the latest posts and creates drafts in the language and networks you pick — queued for your review. Re-running never duplicates.',
              )}
            </p>
          </div>
        </div>

        {/* wizard steps — chips are clickable for back-navigation */}
        <ol className="mt-4 flex flex-wrap items-center gap-1.5 text-xs">
          {[
            { id: 1 as const, fa: 'زبان', en: 'Language' },
            { id: 2 as const, fa: 'شبکه', en: 'Networks' },
            { id: 3 as const, fa: 'اجرا', en: 'Run' },
          ].map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => !autopilotRunning && setApStep(s.id)}
                disabled={autopilotRunning}
                aria-current={apStep === s.id ? 'step' : undefined}
                className={`rounded-full border px-3.5 py-1.5 font-medium transition-colors disabled:cursor-not-allowed ${
                  apStep === s.id
                    ? 'border-violet-600 bg-violet-600 text-white'
                    : 'border-border bg-background text-muted-foreground hover:bg-muted'
                }`}
              >
                {L(
                  `${s.id === 1 ? '۱' : s.id === 2 ? '۲' : '۳'} ${s.fa}`,
                  `${s.id} ${s.en}`,
                )}
              </button>
            </li>
          ))}
        </ol>

        {/* step 1 — language */}
        {apStep === 1 && (
          <div className="mt-4 space-y-2">
            <Label>{L('پست‌ها به چه زبانی ساخته شوند؟', 'Which language should the posts be in?')}</Label>
            <div className="grid gap-2 sm:grid-cols-3">
              {AP_LANGS.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => setApLang(o.id)}
                  aria-pressed={apLang === o.id}
                  className={`rounded-xl border p-3 text-start transition-colors ${
                    apLang === o.id ? 'border-violet-600 bg-violet-600/10' : 'border-border bg-background hover:bg-muted'
                  }`}
                >
                  <span className="flex items-center justify-between gap-2 font-bold">
                    {L(o.fa, o.en)}
                    {apLang === o.id && <Check className="h-4 w-4 shrink-0 text-violet-600 dark:text-violet-400" />}
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground">{L(o.faHint, o.enHint)}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* step 2 — networks (multi-select) */}
        {apStep === 2 && (
          <div className="mt-4 space-y-2">
            <Label>{L('برای کدام شبکه‌ها؟ (چندتایی مجاز)', 'Which networks? (multi-select)')}</Label>
            <div className="grid gap-2 sm:grid-cols-2">
              {PLATFORMS.map((p) => {
                const on = apPlatforms.includes(p.id);
                const Icon = AP_PLATFORM_ICONS[p.id];
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => toggleApPlatform(p.id)}
                    aria-pressed={on}
                    className={`flex items-center gap-3 rounded-xl border p-3 text-start transition-colors ${
                      on ? 'border-violet-600 bg-violet-600/10' : 'border-border bg-background hover:bg-muted'
                    }`}
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                        on ? 'bg-violet-600 text-white' : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-bold">{platformLabel(p.id)}</span>
                      <span className="block text-xs text-muted-foreground" dir="ltr">
                        {PLATFORM_LIMITS[p.id]} {L('نویسه', 'chars')}
                      </span>
                    </span>
                    {on && <Check className="h-4 w-4 shrink-0 text-violet-600 dark:text-violet-400" />}
                  </button>
                );
              })}
            </div>
            {apPlatforms.length === 0 && (
              <p className="text-xs text-red-500">{L('حداقل یک شبکه انتخاب کن.', 'Pick at least one network.')}</p>
            )}
          </div>
        )}

        {/* step 3 — batch size, summary, run */}
        {apStep === 3 && (
          <div className="mt-4 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <Label className="shrink-0">{L('تعداد مقالات', 'Posts to process')}</Label>
              <Select value={autopilotCount} onValueChange={setAutopilotCount} disabled={autopilotRunning}>
                <SelectTrigger className="h-9 w-[130px]" aria-label={L('تعداد مقالات', 'Batch size')}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {L(`${n} مقاله`, `${n} posts`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="rounded-xl border border-violet-500/30 bg-background/60 p-3 text-sm">
              <p>
                {L('خلاصه اجرا: ', 'Run summary: ')}
                <b>
                  {`${Number(autopilotCount) || 3} ${L('مقاله × ', 'post(s) × ')}`}
                  {apPlatforms.map(platformLabel).join(L('، ', ', '))}
                  {` × ${apLangLabel} ≈ ${apEstimate} ${L('پیش‌نویس', 'draft(s)')}`}
                </b>
              </p>
              <p className="mt-1.5 text-xs text-muted-foreground">
                {L(
                  'هر پیش‌نویس حدود ۳۰ تا ۶۰ ثانیه؛ فقط برای مقاله‌هایی ساخته می‌شود که از قبل پیش‌نویسِ هم‌شبکه و هم‌زبان نداشته باشند.',
                  'Each draft takes ~30-60s; drafts are only created for posts that do not already have one in the same network + language.',
                )}
              </p>
            </div>
            <Button
              onClick={runAutopilot}
              disabled={autopilotRunning || apPlatforms.length === 0}
              className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-700 hover:to-fuchsia-700"
            >
              {autopilotRunning ? (
                <>
                  <Loader2 className="me-2 h-4 w-4 animate-spin" />
                  {L('در حال ساخت...', 'Working...')} ({autopilotElapsed}s)
                </>
              ) : (
                <>
                  <Zap className="me-2 h-4 w-4" />
                  {L('ساخت خودکار', 'Auto-fill')}
                </>
              )}
            </Button>
          </div>
        )}

        {/* wizard nav — hidden while a run is in flight */}
        {!autopilotRunning && (
          <div className="mt-4 flex items-center gap-2">
            {apStep > 1 && (
              <Button size="sm" variant="ghost" onClick={() => setApStep((s) => (s - 1) as 1 | 2)}>
                {L('قبلی', 'Back')}
              </Button>
            )}
            {apStep < 3 && (
              <Button
                size="sm"
                onClick={() => setApStep((s) => (s + 1) as 2 | 3)}
                disabled={apStep === 2 && apPlatforms.length === 0}
              >
                {L('بعدی', 'Next')}
              </Button>
            )}
          </div>
        )}
        {autopilotRunning && (
          <p className="mt-3 text-xs text-muted-foreground">
            {L(
              'هر پیش‌نویس حدود ۳۰ تا ۶۰ ثانیه طول می‌کشد — صفحه را نبند؛ نتیجه در همین کارت و در «پیش‌نویس‌های ذخیره‌شده» ظاهر می‌شود.',
              'Each draft takes ~30-60s — keep this page open; the result appears in this card and under “Saved drafts”.'
            )}
          </p>
        )}
        {autopilotError && (
          <div className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-400">
            {autopilotError}
          </div>
        )}
        {autopilotResult && (
          <div className="mt-4 space-y-2 rounded-xl border border-border bg-background/60 p-4 text-sm">
            <p className="font-bold">
              {autopilotResult.created.length > 0
                ? L(
                    `${autopilotResult.created.length} پیش‌نویس ساخته شد — در «پیش‌نویس‌های ذخیره‌شده» پایین صفحه است ✓`,
                    `${autopilotResult.created.length} draft(s) created — see “Saved drafts” below ✓`
                  )
                : autopilotResult.failed.length > 0
                  ? L('پیش‌نویس جدیدی ساخته نشد — خطاها را پایین ببین.', 'No new drafts were created — see the failures below.')
                  : L('چیزی برای ساختن نبود — همه این مقالات از قبل پیش‌نویس دارند.', 'Nothing to create — these posts already have drafts.')}
            </p>
            {autopilotResult.created.length > 0 && (
              <ul className="list-inside list-disc space-y-0.5 text-emerald-700 dark:text-emerald-400">
                {autopilotResult.created.map((c, i) => (
                  <li key={`${c.slug}:${c.platform}:${c.lang}:${i}`}>
                    {c.title || c.slug} — {platformLabel(c.platform)} ({c.lang})
                  </li>
                ))}
              </ul>
            )}
            {autopilotResult.failed.length > 0 && (
              <div>
                <p className="font-semibold text-red-700 dark:text-red-400">{L('ناموفق:', 'Failed:')}</p>
                <ul className="list-inside list-disc space-y-0.5 text-red-700 dark:text-red-400">
                  {autopilotResult.failed.map((f, i) => (
                    <li key={`${f.slug}:${i}`} className="break-words">
                      {f.slug} — {f.error}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {autopilotResult.skipped.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {L(
                  `${autopilotResult.skipped.length} مورد از قبل پیش‌نویس داشتند و رد شدند.`,
                  `${autopilotResult.skipped.length} item(s) skipped — already had drafts.`
                )}
              </p>
            )}
          </div>
        )}
        {linkedinSetup && (
          <div className="mt-4 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
            <div className="mb-2 flex items-center gap-2 font-bold text-amber-700 dark:text-amber-400">
              <Globe className="h-4 w-4" />
              {L('انتشار مستقیم لینکدین هنوز فعال نشده — یک‌بار این مراحل را طی کن:', 'Direct LinkedIn publishing is not configured yet — one-time setup:')}
            </div>
            <ol className="list-inside list-decimal space-y-1 text-xs text-muted-foreground" dir="ltr">
              {linkedinSetup.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
            <p className="mt-2 text-xs text-muted-foreground">
              {L('تا آن زمان: دکمه کپی همان کار را انجام می‌دهد.', 'Until then: the copy button does the same job manually.')}
            </p>
          </div>
        )}
      </div>

      {/* ── controls ── */}
      <div className="grid gap-4 rounded-2xl border border-border bg-card p-5 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Button
              size="sm"
              variant={source === 'post' ? 'default' : 'outline'}
              onClick={() => setSource('post')}
              className="w-full"
            >
              {L('از مقالات بلاگ', 'From blog posts')}
            </Button>
            <Button
              size="sm"
              variant={source === 'topic' ? 'default' : 'outline'}
              onClick={() => setSource('topic')}
              className="w-full"
            >
              {L('موضوع دلخواه', 'Custom topic')}
            </Button>
          </div>

          {source === 'post' ? (
            <div className="space-y-2">
              <Label>{L('انتخاب مقاله', 'Pick a post')}</Label>
              <Select value={slug} onValueChange={setSlug}>
                <SelectTrigger dir="auto">
                  <SelectValue placeholder={L('یک مقاله انتخاب کن', 'Select a post')} />
                </SelectTrigger>
                <SelectContent>
                  {posts.map((p) => (
                    <SelectItem key={p.slug} value={p.slug}>
                      {pick(lang, p.titleFa || p.titleEn, p.titleEn || p.titleFa)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-2">
              <Label>{L('موضوع پست', 'Post topic')}</Label>
              <Textarea
                rows={2}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder={L('مثلاً: ۳ درس از ساخت اولین محصول من', 'e.g. 3 lessons from building my first product')}
                dir="auto"
              />
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{L('پلتفرم‌ها', 'Platforms')}</Label>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => togglePlatform(p.id)}
                  aria-pressed={platforms.includes(p.id)}
                  className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                    platforms.includes(p.id)
                      ? 'border-violet-600 bg-violet-600 text-white'
                      : 'border-border bg-background text-foreground hover:bg-muted'
                  }`}
                >
                  {lang === 'fa' ? PLATFORM_FA[p.id] : p.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>{L('زبان پست', 'Post language')}</Label>
            <Select value={postLang} onValueChange={(v) => setPostLang(v as 'fa' | 'en' | 'both')}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fa">{L('فارسی', 'Persian')}</SelectItem>
                <SelectItem value="en">{L('انگلیسی', 'English')}</SelectItem>
                <SelectItem value="both">{L('هر دو', 'Both')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="lg:col-span-2">
          <Button
            onClick={generate}
            disabled={!canGenerate}
            className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-700 hover:to-fuchsia-700"
          >
            {generating ? (
              <>
                <Loader2 className="me-2 h-4 w-4 animate-spin" />
                {L('در حال تولید پست‌ها...', 'Generating posts...')}
              </>
            ) : (
              <>
                <Sparkles className="me-2 h-4 w-4" />
                {L('تولید پست‌های شبکه‌های اجتماعی', 'Generate social posts')}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* ── results ── */}
      {results.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {results.map((p, i) => {
            const over = p.content.length > (PLATFORM_LIMITS[p.platform] ?? p.limit);
            const key = `${p.platform}:${p.lang}`;
            return (
              <div key={`${key}:${i}`} className="flex flex-col rounded-2xl border border-border bg-card p-4">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge className="bg-violet-600/15 text-violet-600 dark:text-violet-400" variant="secondary">
                    <Share2 className="me-1 h-3 w-3" />
                    {lang === 'fa' ? PLATFORM_FA[p.platform] || p.platform : p.platform}
                  </Badge>
                  <Badge variant="secondary" className="uppercase">
                    {p.lang}
                  </Badge>
                  <span className={`ms-auto text-xs ${over ? 'font-bold text-red-500' : 'text-muted-foreground'}`}>
                    {p.content.length} / {PLATFORM_LIMITS[p.platform] ?? p.limit}
                  </span>
                </div>
                <Textarea
                  value={p.content}
                  onChange={(e) => editResult(i, e.target.value)}
                  rows={10}
                  dir={isFa(p.content) ? 'rtl' : 'ltr'}
                  className="max-h-96 flex-1 resize-y overflow-y-auto"
                />
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Button size="sm" variant="outline" onClick={() => copy(p)}>
                    {copied === key ? (
                      <>
                        <Check className="me-1.5 h-3.5 w-3.5 text-emerald-500" />
                        {L('کپی شد', 'Copied')}
                      </>
                    ) : (
                      <>
                        <Copy className="me-1.5 h-3.5 w-3.5" />
                        {L('کپی', 'Copy')}
                      </>
                    )}
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => save(p)} disabled={saving === key}>
                    {saving === key ? <Loader2 className="me-1.5 h-3.5 w-3.5 animate-spin" /> : <Save className="me-1.5 h-3.5 w-3.5" />}
                    {L('ذخیره', 'Save')}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── saved drafts ── */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-bold">
            <Save className="h-4 w-4 text-violet-500" />
            {L('پیش‌نویس‌های ذخیره‌شده', 'Saved drafts')}
            {drafts.length > 0 && (
              <Badge variant="secondary" className="ms-1">
                {drafts.length}
              </Badge>
            )}
          </h3>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setLoadingDrafts(true);
              loadDrafts();
            }}
            disabled={loadingDrafts}
          >
            {loadingDrafts ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </div>

        {/* platform filter */}
        <div className="mb-3 flex flex-wrap gap-1.5">
          {(['all', ...PLATFORMS.map((p) => p.id)] as string[]).map((id) => (
            <button key={id} type="button" onClick={() => setPlatformFilter(id)} aria-pressed={platformFilter === id}>
              <Badge
                variant={platformFilter === id ? 'default' : 'outline'}
                className={`cursor-pointer px-2.5 py-1 text-xs ${platformFilter === id && id !== 'all' ? 'bg-violet-600 hover:bg-violet-700' : ''}`}
              >
                {id === 'all' ? L('همه', 'All') : lang === 'fa' ? PLATFORM_FA[id] || id : id}
              </Badge>
            </button>
          ))}
        </div>

        {!loadingDrafts && drafts.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {L(
              'هنوز پستی ذخیره نشده — با «ساخت خودکار» بالا یا «تولید پست‌ها» اولین را بساز؛ اینجا ظاهر می‌شود.',
              'No saved posts yet — create the first one with Auto-fill or Generate above; it will appear here.'
            )}
          </p>
        ) : (
          <ScrollArea className="max-h-96">
            <div className="space-y-3 pe-3">
              {drafts
                .filter((d) => platformFilter === 'all' || d.platform === platformFilter)
                .map((d) => (
                <div key={d.id} className={`rounded-xl border p-3 ${d.posted ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-border/60 bg-background/50'}`}>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Badge className="bg-violet-600/15 text-violet-600 dark:text-violet-400" variant="secondary">
                      {lang === 'fa' ? PLATFORM_FA[d.platform] || d.platform : d.platform}
                    </Badge>
                    <Badge variant="secondary" className="uppercase">
                      {d.lang}
                    </Badge>
                    {d.posted && (
                      <Badge variant="secondary" className="bg-emerald-600/15 text-emerald-600">
                        <Check className="me-1 h-3 w-3" />
                        {L('منتشر شد', 'Published')}
                      </Badge>
                    )}
                    <div className="ms-auto flex gap-1">
                      {d.platform === 'linkedin' && !d.posted && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 gap-1 text-xs"
                          disabled={publishingId === d.id}
                          onClick={() => publishDraft(d.id)}
                        >
                          {publishingId === d.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Send className="h-3 w-3" />
                          )}
                          {L('انتشار', 'Publish')}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          navigator.clipboard.writeText(d.content).catch(() => {});
                          toast({ title: L('کپی شد', 'Copied') });
                        }}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setDraftToDelete(d)} aria-label={L('حذف پیش‌نویس', 'Delete draft')}>
                        <Trash2 className="h-3.5 w-3.5 text-red-500" />
                      </Button>
                    </div>
                  </div>
                  {/* context row: source article, language guard, size, date */}
                  <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    {d.sourceSlug ? (
                      <a
                        href={sourceInfoFor(d)?.href || `/blog/${d.sourceSlug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-w-0 max-w-full items-center gap-1 hover:text-foreground hover:underline"
                        title={L('مقاله‌ی مبدأ این پیش‌نویس', 'Source article of this draft')}
                      >
                        <FileText className="h-3 w-3 shrink-0" />
                        <span className="truncate">{sourceInfoFor(d)?.title || d.sourceSlug}</span>
                      </a>
                    ) : d.topic ? (
                      <span className="inline-flex min-w-0 max-w-full items-center gap-1">
                        <Sparkles className="h-3 w-3 shrink-0" />
                        <span className="truncate">{d.topic}</span>
                      </span>
                    ) : null}
                    {langMismatch(d) && (
                      <Badge variant="secondary" className="bg-red-600/15 text-red-600 dark:text-red-400">
                        <TriangleAlert className="me-1 h-3 w-3" />
                        {L('زبان ناهمخوان', 'Language mismatch')}
                      </Badge>
                    )}
                    <span className="ms-auto shrink-0" dir="ltr">
                      {d.content.length.toLocaleString(lang === 'fa' ? 'fa-IR' : 'en-US')} {L('نویسه', 'chars')}
                    </span>
                    <span className="shrink-0" dir="ltr">
                      {new Date(d.createdAt).toLocaleDateString(lang === 'fa' ? 'fa-IR' : undefined)}
                    </span>
                  </div>
                  <p
                    className="max-h-24 overflow-y-auto whitespace-pre-wrap text-sm text-muted-foreground"
                    dir={isFa(d.content) ? 'rtl' : 'ltr'}
                  >
                    {d.content}
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>

      {/* delete confirmation — permanent, so it asks once */}
      <AlertDialog open={!!draftToDelete} onOpenChange={(o) => !o && setDraftToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader dir="rtl">
            <AlertDialogTitle>{L('حذف این پیش‌نویس؟', 'Delete this draft?')}</AlertDialogTitle>
            <AlertDialogDescription>
              {L(
                'این پیش‌نویس برای همیشه حذف می‌شود و قابل بازگشت نیست.',
                'This draft will be permanently removed — it cannot be restored.'
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{L('انصراف', 'Cancel')}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={() => {
                if (draftToDelete) removeDraft(draftToDelete.id);
                setDraftToDelete(null);
              }}
            >
              {L('حذف', 'Delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
