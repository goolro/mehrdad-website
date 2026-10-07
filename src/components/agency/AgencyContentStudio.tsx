'use client';

/**
 * استودیو محتوا (Content Studio) — Task 55.
 *
 * The FIRST and default tab of the agency panel: turn the owner's 10
 * reference Instagram reels into 5 similar-not-copied Reel concepts each,
 * generate the AI video (CogVideoX 9:16), attach caption + hashtags, and
 * hand over a downloadable MP4 ending on the branded outro card.
 *
 * Owner asked for big fonts and an immediately visible studio, so type
 * scale here is deliberately larger than the rest of the panel.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  Check,
  Copy,
  Download,
  ExternalLink,
  Film,
  Hash,
  Instagram,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
  Wand2,
  Image as ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { agencyFetch } from '@/components/agency/agency-client';

// ── types mirroring /api/agency/content payloads ─────────────────────────

interface VideoNode {
  id: string;
  status: 'generating' | 'ready' | 'failed';
  url?: string | null;
  coverUrl?: string | null;
  error?: string | null;
  createdAt: string;
}

interface IdeaNode {
  id: string;
  idx: number;
  title: string;
  hook: string;
  script: string;
  videoPrompt: string;
  caption: string;
  hashtags: string; // JSON string[]
  status: string;
  videos: VideoNode[];
}

interface SampleNode {
  id: string;
  reelId: string;
  url: string;
  account: string;
  styleTag: string;
  title: string;
  note: string;
  likes: string;
  hashtags: string; // JSON string[]
  ideas: IdeaNode[];
}

interface TagNode {
  id: string;
  tag: string;
  lang: string;
  category: string;
}

const STYLE_LABELS: Record<string, string> = {
  'ai-cinematic': 'سینمایی AI',
  'ai-art': 'هنر AI',
  nature: 'طبیعت',
  'motivation-fa': 'انگیزشی فارسی',
  brand: 'برند و بیزینس',
  pets: 'حیوانات',
};

function parseTags(json: string): string[] {
  try {
    const v = JSON.parse(json);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

const faNum = (n: number | string) => String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);

// ── component ────────────────────────────────────────────────────────────

export function AgencyContentStudio() {
  const { toast } = useToast();
  const [samples, setSamples] = useState<SampleNode[] | null>(null);
  const [studioWarning, setStudioWarning] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [ideating, setIdeating] = useState<string | null>(null); // sampleId
  const [submittingIdea, setSubmittingIdea] = useState<string | null>(null); // ideaId
  const [copied, setCopied] = useState<string | null>(null);
  const [showPrompt, setShowPrompt] = useState<string | null>(null); // ideaId
  const [tags, setTags] = useState<TagNode[]>([]);
  const [newTag, setNewTag] = useState('');
  const [newTagLang, setNewTagLang] = useState<'fa' | 'en'>('fa');
  const [addingTag, setAddingTag] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── data loading ───────────────────────────────────────────────────────
  const loadSamples = useCallback(() => {
    agencyFetch<{ samples: SampleNode[]; warning?: string }>('/api/agency/content/samples')
      .then((d) => {
        setSamples(d.samples);
        setStudioWarning(d.warning ?? null);
        setSelectedId((cur) => cur ?? d.samples[0]?.id ?? null);
      })
      .catch((e: Error) => {
        toast({ title: 'خطا در بارگذاری استودیو', description: e.message, variant: 'destructive' });
        setSamples([]);
      });
  }, [toast]);

  const loadTags = useCallback(() => {
    agencyFetch<{ tags: TagNode[] }>('/api/agency/content/hashtags')
      .then((d) => setTags(d.tags))
      .catch(() => {
        /* bank is non-critical */
      });
  }, []);

  useEffect(() => {
    loadSamples();
    loadTags();
  }, [loadSamples, loadTags]);

  // ── polling for generating videos ──────────────────────────────────────
  const patchIdeaVideos = useCallback((ideaId: string, videos: VideoNode[]) => {
    setSamples((prev) =>
      prev?.map((s) => ({
        ...s,
        ideas: s.ideas.map((i) => (i.id === ideaId ? { ...i, videos } : i)),
      })) ?? prev
    );
  }, []);

  useEffect(() => {
    const pending = (samples ?? []).flatMap((s) => s.ideas).filter((i) => i.videos.some((v) => v.status === 'generating'));
    if (pending.length === 0) {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      return;
    }
    if (pollRef.current) return; // already polling
    pollRef.current = setInterval(async () => {
      const current = (samples ?? []).flatMap((s) => s.ideas).filter((i) => i.videos.some((v) => v.status === 'generating'));
      for (const idea of current) {
        try {
          const d = await agencyFetch<{ videos: VideoNode[] }>(`/api/agency/content/video?ideaId=${idea.id}`);
          patchIdeaVideos(idea.id, d.videos);
          const done = d.videos.find((v) => v.status === 'ready');
          if (done) toast({ title: '🎬 ویدیو آماده شد!', description: 'پیش‌نمایش و دانلود در کارت ایده.' });
        } catch {
          /* keep polling */
        }
      }
    }, 10_000);
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [samples, patchIdeaVideos, toast]);

  // ── actions ────────────────────────────────────────────────────────────
  const copyText = async (key: string, text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      toast({ title: `${label} کپی شد` });
      setTimeout(() => setCopied((c) => (c === key ? null : c)), 1600);
    } catch {
      toast({ title: 'کپی نشد — دستی انتخاب و کپی کن', variant: 'destructive' });
    }
  };

  const generateIdeas = async (sampleId: string) => {
    setIdeating(sampleId);
    try {
      await agencyFetch('/api/agency/content/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sampleId }),
      });
      toast({ title: '✨ ۵ ایده ساخته شد', description: 'هر ایده هوک، سناریو، کپشن و هشتگ دارد.' });
      loadSamples();
    } catch (e) {
      toast({ title: 'تولید ایده ناموفق بود', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setIdeating(null);
    }
  };

  const submitVideo = async (ideaId: string, duration: 5 | 10) => {
    setSubmittingIdea(ideaId);
    try {
      await agencyFetch('/api/agency/content/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ideaId, duration }),
      });
      const d = await agencyFetch<{ videos: VideoNode[] }>(`/api/agency/content/video?ideaId=${ideaId}`);
      patchIdeaVideos(ideaId, d.videos);
      toast({ title: '🎬 تولید ویدیو شروع شد', description: 'حدود ۲-۳ دقیقه طول می‌کشد — خودکار چک می‌شود.' });
    } catch (e) {
      toast({ title: 'شروع تولید ناموفق بود', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setSubmittingIdea(null);
    }
  };

  const addTag = async () => {
    const tag = newTag.trim().replace(/^#/, '');
    if (!tag) return;
    setAddingTag(true);
    try {
      await agencyFetch('/api/agency/content/hashtags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tag, lang: newTagLang }),
      });
      setNewTag('');
      await loadTags();
    } catch (e) {
      toast({ title: (e as Error).message, variant: 'destructive' });
    } finally {
      setAddingTag(false);
    }
  };

  const removeTag = async (id: string) => {
    try {
      await agencyFetch(`/api/agency/content/hashtags?id=${id}`, { method: 'DELETE' });
      setTags((t) => t.filter((x) => x.id !== id));
    } catch (e) {
      toast({ title: 'حذف ناموفق', description: (e as Error).message, variant: 'destructive' });
    }
  };

  // ── derived ────────────────────────────────────────────────────────────
  const selected = useMemo(() => samples?.find((s) => s.id === selectedId) ?? null, [samples, selectedId]);
  const totals = useMemo(() => {
    const ideas = (samples ?? []).flatMap((s) => s.ideas);
    const videos = ideas.flatMap((i) => i.videos);
    return {
      samples: samples?.length ?? 0,
      ideas: ideas.length,
      ready: videos.filter((v) => v.status === 'ready').length,
    };
  }, [samples]);

  // ── render ─────────────────────────────────────────────────────────────
  if (samples === null) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-lg">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p>در حال آماده‌سازی استودیو...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-lg">
      {/* degraded-DB banner — PERSISTENT (not a toast): the 2026-10-08 incident
          rendered a silent empty studio that looked like «the feature does not
          exist». The owner must always see the true state of the studio. */}
      {studioWarning && (
        <div className="flex items-start gap-3 rounded-2xl border-2 border-amber-400/60 bg-amber-400/10 p-4">
          <AlertTriangle className="mt-1 h-6 w-6 shrink-0 text-amber-400" aria-hidden />
          <div>
            <p className="text-lg font-bold text-amber-300">هشدار اتصال</p>
            <p className="mt-1 text-base leading-relaxed text-amber-100/90">{studioWarning}</p>
          </div>
        </div>
      )}

      {/* header */}
      <header className="space-y-2">
        <h2 className="flex items-center gap-3 text-3xl font-extrabold">
          <Wand2 className="h-8 w-8 text-primary" />
          استودیو محتوا
        </h2>
        <p className="text-xl text-muted-foreground">
          از هر نمونه اینستاگرام، ۵ ویدیوی مشابه (نه کپی) با کپشن و هشتگ آماده برای پیج{' '}
          <span className="font-bold text-foreground">startup_mt@</span> و وب‌سایت{' '}
          <span className="font-bold text-foreground">Mehrdad.ir</span> بساز.
        </p>
        <div className="flex flex-wrap gap-3 pt-1 text-lg">
          <span className="rounded-full bg-primary/10 px-4 py-1.5 font-bold text-primary">
            {faNum(totals.samples)} نمونه مرجع
          </span>
          <span className="rounded-full bg-primary/10 px-4 py-1.5 font-bold text-primary">
            {faNum(totals.ideas)} ایده
          </span>
          <span className="rounded-full bg-primary/10 px-4 py-1.5 font-bold text-primary">
            {faNum(totals.ready)} ویدیوی آماده
          </span>
        </div>
      </header>

      {/* outro card */}
      <section className="flex flex-col items-start gap-4 rounded-2xl border bg-card p-5 sm:flex-row sm:items-center">
        <img
          src="/agency-content/outro-card.png"
          alt="کارت پایانی برند با آیکون اینستاگرام و وب‌سایت"
          className="h-40 w-auto rounded-xl border shadow-sm"
        />
        <div className="space-y-1.5">
          <h3 className="flex items-center gap-2 text-2xl font-bold">
            <Instagram className="h-6 w-6 text-primary" />
            پایان هر ویدیو = کارت برند
          </h3>
          <p className="text-lg text-muted-foreground">
            آیکون اینستاگرام <span className="font-bold text-foreground">startup_mt@</span> و آیکون وب‌سایت{' '}
            <span className="font-bold text-foreground">Mehrdad.ir</span> در قاب پایانی هر ویدیو نمایش داده می‌شود.
          </p>
        </div>
      </section>

      {/* step 1 — samples */}
      <section className="space-y-4">
        <h3 className="text-2xl font-bold">
          <span className="me-2 rounded-lg bg-primary px-2.5 py-0.5 text-lg font-bold text-primary-foreground">۱</span>
          نمونه‌های مرجع — روی یکی بزن
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {(samples ?? []).map((s) => {
            const active = s.id === selectedId;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelectedId(s.id)}
                className={`min-w-0 rounded-2xl border-2 p-5 text-start transition-all hover:border-primary/60 ${
                  active ? 'border-primary bg-primary/5 shadow-md' : 'border-border bg-card'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xl font-bold leading-snug">{s.title}</h4>
                  <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-base font-bold text-primary">
                    {s.likes}
                  </span>
                </div>
                <p className="mt-2 text-base text-muted-foreground" dir="ltr">
                  @{s.account}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full border px-3 py-0.5 text-base">{STYLE_LABELS[s.styleTag] ?? s.styleTag}</span>
                  <span className="rounded-full border px-3 py-0.5 text-base">{faNum(s.ideas.length)} ایده</span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* step 2 — ideas of the selected sample */}
      {selected && (
        <section className="space-y-5 rounded-2xl border-2 border-primary/30 bg-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-2xl font-bold">
              <span className="me-2 rounded-lg bg-primary px-2.5 py-0.5 text-lg font-bold text-primary-foreground">۲</span>
              ایده‌های «{selected.title}»
            </h3>
            <div className="flex gap-2">
              <Button
                size="lg"
                className="h-12 text-lg font-bold"
                disabled={ideating === selected.id}
                onClick={() => generateIdeas(selected.id)}
              >
                {ideating === selected.id ? (
                  <>
                    <Loader2 className="me-2 h-5 w-5 animate-spin" />
                    در حال تولید ۵ ایده (۳۰ ثانیه)...
                  </>
                ) : (
                  <>
                    <Wand2 className="me-2 h-5 w-5" />
                    {selected.ideas.length > 0 ? 'ساخت مجدد ۵ ایده' : 'ساخت ۵ ایده'}
                  </>
                )}
              </Button>
              <a href={selected.url} target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="h-12 text-lg">
                  <ExternalLink className="me-2 h-5 w-5" />
                  نمونه اصلی
                </Button>
              </a>
            </div>
          </div>
          <p className="text-base text-muted-foreground">{selected.note}</p>

          {selected.ideas.length === 0 && (
            <div className="rounded-xl border border-dashed p-8 text-center text-xl text-muted-foreground">
              هنوز ایده‌ای ساخته نشده — دکمه «ساخت ۵ ایده» را بزن.
            </div>
          )}

          <div className="max-h-[75vh] space-y-5 overflow-y-auto pe-1">
            {selected.ideas.map((idea) => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                submitting={submittingIdea === idea.id}
                copied={copied}
                showPrompt={showPrompt === idea.id}
                onCopy={copyText}
                onTogglePrompt={() => setShowPrompt((p) => (p === idea.id ? null : idea.id))}
                onGenerate={(d) => submitVideo(idea.id, d)}
              />
            ))}
          </div>
        </section>
      )}

      {/* hashtag bank */}
      <section className="space-y-4 rounded-2xl border bg-card p-5">
        <h3 className="flex items-center gap-2 text-2xl font-bold">
          <Hash className="h-6 w-6 text-primary" />
          بانک هشتگ‌های پرکاربرد
        </h3>
        <div className="flex flex-wrap gap-2">
          {tags.map((t) => (
            <span
              key={t.id}
              className="group flex items-center gap-1.5 rounded-full border bg-background px-4 py-1.5 text-lg"
            >
              <span dir={t.lang === 'fa' ? 'rtl' : 'ltr'}>#{t.tag}</span>
              <button
                type="button"
                onClick={() => removeTag(t.id)}
                aria-label={`حذف هشتگ ${t.tag}`}
                className="text-muted-foreground transition-colors hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTag()}
            placeholder="هشتگ جدید بدون #"
            className="h-12 w-56 text-lg"
          />
          <div className="flex overflow-hidden rounded-lg border">
            {(['fa', 'en'] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setNewTagLang(l)}
                className={`px-4 py-2.5 text-lg font-bold ${newTagLang === l ? 'bg-primary text-primary-foreground' : 'bg-background'}`}
              >
                {l === 'fa' ? 'فارسی' : 'EN'}
              </button>
            ))}
          </div>
          <Button size="lg" className="h-12 text-lg" disabled={addingTag || !newTag.trim()} onClick={addTag}>
            <Plus className="me-1.5 h-5 w-5" />
            افزودن
          </Button>
        </div>
      </section>
    </div>
  );
}

// ── idea card ────────────────────────────────────────────────────────────

function IdeaCard({
  idea,
  submitting,
  copied,
  showPrompt,
  onCopy,
  onTogglePrompt,
  onGenerate,
}: {
  idea: IdeaNode;
  submitting: boolean;
  copied: string | null;
  showPrompt: boolean;
  onCopy: (key: string, text: string, label: string) => Promise<void>;
  onTogglePrompt: () => void;
  onGenerate: (duration: 5 | 10) => Promise<void>;
}) {
  const hashtags = parseTags(idea.hashtags);
  const captionFull = `${idea.caption}\n\n${hashtags.map((h) => `#${h}`).join(' ')}`;
  const generating = idea.videos.some((v) => v.status === 'generating');
  const ready = idea.videos.filter((v) => v.status === 'ready');
  const failed = idea.videos.filter((v) => v.status === 'failed');
  const latest = ready[0];

  return (
    <article className="space-y-4 rounded-2xl border-2 bg-background p-5">
      <div className="flex items-start justify-between gap-3">
        <h4 className="text-xl font-extrabold leading-snug">
          <span className="me-2 text-primary">{faNum(idea.idx)}.</span>
          {idea.title}
        </h4>
        <button
          type="button"
          onClick={() => onCopy(`cap-${idea.id}`, captionFull, 'کپشن + هشتگ‌ها')}
          aria-label="کپی کپشن و هشتگ‌ها"
          className="shrink-0 rounded-lg border p-2 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          {copied === `cap-${idea.id}` ? <Check className="h-5 w-5 text-green-600" /> : <Copy className="h-5 w-5" />}
        </button>
      </div>

      {/* hook */}
      <div className="rounded-xl border-s-4 border-primary bg-primary/5 p-4">
        <p className="text-base font-bold text-primary">قلاب ۳ ثانیه‌ای:</p>
        <p className="mt-1 text-lg font-bold leading-relaxed">{idea.hook}</p>
      </div>

      {/* script */}
      <details className="rounded-xl border p-4">
        <summary className="cursor-pointer text-lg font-bold">🎬 سناریوی صحنه‌به‌صحنه</summary>
        <p className="mt-2 whitespace-pre-wrap text-lg leading-relaxed text-muted-foreground">{idea.script}</p>
      </details>

      {/* video prompt */}
      <div className="rounded-xl border p-4">
        <button type="button" onClick={onTogglePrompt} className="flex w-full items-center gap-2 text-start text-base font-bold text-muted-foreground">
          <Film className="h-4 w-4" />
          {showPrompt ? 'پنهان کردن پرامپت ویدیو' : 'نمایش پرامپت ویدیو (برای ابزارهای دیگر مثل Google Vids)'}
        </button>
        {showPrompt && (
          <p className="mt-2 whitespace-pre-wrap text-base leading-relaxed text-muted-foreground" dir="ltr">
            {idea.videoPrompt}
          </p>
        )}
      </div>

      {/* caption */}
      <div className="rounded-xl border p-4">
        <div className="flex items-center justify-between">
          <p className="text-base font-bold text-primary">کپشن آماده انتشار:</p>
          <button
            type="button"
            onClick={() => onCopy(`cpt-${idea.id}`, idea.caption, 'کپشن')}
            aria-label="کپی کپشن"
            className="text-muted-foreground transition-colors hover:text-primary"
          >
            {copied === `cpt-${idea.id}` ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
        <p className="mt-1.5 whitespace-pre-wrap text-lg leading-relaxed">{idea.caption}</p>
      </div>

      {/* hashtags */}
      <div className="rounded-xl border p-4">
        <div className="flex items-center justify-between">
          <p className="text-base font-bold text-primary">هشتگ‌ها:</p>
          <button
            type="button"
            onClick={() => onCopy(`ht-${idea.id}`, hashtags.map((h) => `#${h}`).join(' '), 'هشتگ‌ها')}
            aria-label="کپی هشتگ‌ها"
            className="text-muted-foreground transition-colors hover:text-primary"
          >
            {copied === `ht-${idea.id}` ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {hashtags.map((h) => (
            <span key={h} className="rounded-full bg-muted px-3 py-1 text-base">
              #{h}
            </span>
          ))}
        </div>
      </div>

      {/* video section */}
      <div className="space-y-3 rounded-xl border-2 border-primary/25 bg-primary/[0.03] p-4">
        <p className="text-base font-bold text-primary">🎬 ویدیوی AI (۹:۱۶ عمودی):</p>

        {generating && (
          <div className="flex items-center gap-3 p-3 text-lg">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            در حال ساخت ویدیو... حدود ۲-۳ دقیقه (خودکار چک می‌شود)
          </div>
        )}

        {latest && (
          <div className="space-y-2">
            <video src={latest.url ?? undefined} poster={latest.coverUrl ?? undefined} controls className="max-h-[60vh] w-full rounded-xl border bg-black" />
            <div className="flex flex-wrap items-center gap-2">
              <a href={`/api/agency/content/file?id=${latest.id}&final=1`}>
                <Button size="lg" className="h-12 text-lg font-bold">
                  <Download className="me-2 h-5 w-5" />
                  دانلود نهایی (با کارت برند)
                </Button>
              </a>
              <a href={`/api/agency/content/file?id=${latest.id}`}>
                <Button size="lg" variant="outline" className="h-12 text-lg">
                  نسخه خام صحنه
                </Button>
              </a>
            </div>
            <p className="text-base text-muted-foreground">
              نسخه نهایی ≈ ویدیو + ۲.۵ ثانیه کارت پایان (اینستاگرام + Mehrdad.ir). لینک سرویس موقت است — همین امروز دانلود کن.
            </p>
          </div>
        )}

        {failed.length > 0 && !generating && (
          <p className="text-lg text-destructive">
            {failed[0].error ?? 'تولید شکست خورد'} — دوباره تلاش کن.
          </p>
        )}

        {!generating && (
          <div className="flex flex-wrap gap-2">
            <Button size="lg" className="h-12 text-lg font-bold" disabled={submitting} onClick={() => onGenerate(10)}>
              {submitting ? <Loader2 className="me-2 h-5 w-5 animate-spin" /> : <ImageIcon className="me-2 h-5 w-5" />}
              تولید ویدیو (۱۰ ثانیه)
            </Button>
            <Button size="lg" variant="outline" className="h-12 text-lg" disabled={submitting} onClick={() => onGenerate(5)}>
              نسخه کوتاه (۵ ثانیه)
            </Button>
            {ready.length > 0 && (
              <Button size="lg" variant="ghost" className="h-12 text-lg" disabled={submitting} onClick={() => onGenerate(10)}>
                <RefreshCw className="me-2 h-5 w-5" />
                نسخه جدید
              </Button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
