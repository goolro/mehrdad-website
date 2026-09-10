'use client';

/**
 * Social Media Studio — generate platform-tailored posts from the site's
 * own content (blog posts via DB, topics via the RAG knowledge base) and
 * manage saved drafts. Voice + per-platform format rules live in the
 * generate API; this component owns the flow: pick → generate → edit →
 * copy / save.
 */

import { useCallback, useEffect, useState } from 'react';
import { useApp, pick } from './store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Share2, Loader2, Sparkles, Copy, Save, Trash2, Check, RefreshCw } from 'lucide-react';

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
  createdAt: string;
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

  const L = (fa: string, en: string) => pick(lang, fa, en);
  // Persian copy is primary on this site; keep textarea direction honest.
  const isFa = (v: string) => /[\u0600-\u06FF]/.test(v);

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

  function editResult(idx: number, content: string) {
    setResults((prev) => prev.map((r, i) => (i === idx ? { ...r, content } : r)));
  }

  const canGenerate = generating === false && platforms.length > 0 && (source === 'post' ? !!slug : !!topic.trim());

  return (
    <div className="space-y-6">
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

        {!loadingDrafts && drafts.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {L('هنوز پستی ذخیره نشده است.', 'No saved posts yet.')}
          </p>
        ) : (
          <ScrollArea className="max-h-96">
            <div className="space-y-3 pe-3">
              {drafts.map((d) => (
                <div key={d.id} className="rounded-xl border border-border/60 bg-background/50 p-3">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Badge className="bg-violet-600/15 text-violet-600 dark:text-violet-400" variant="secondary">
                      {lang === 'fa' ? PLATFORM_FA[d.platform] || d.platform : d.platform}
                    </Badge>
                    <Badge variant="secondary" className="uppercase">
                      {d.lang}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{new Date(d.createdAt).toLocaleDateString()}</span>
                    <div className="ms-auto flex gap-1">
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
                      <Button size="sm" variant="ghost" onClick={() => removeDraft(d.id)} aria-label="delete">
                        <Trash2 className="h-3.5 w-3.5 text-red-500" />
                      </Button>
                    </div>
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
    </div>
  );
}
