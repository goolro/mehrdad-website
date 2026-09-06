'use client';

import { useCallback, useEffect, useState } from 'react';
import { useApp, pick, formatDate } from './store';
import { ui } from './i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  LayoutDashboard, FileText, Sparkles, Mail, Lock, Trash2, Languages,
  RefreshCw, ImageIcon, Eye, Loader2, LogOut, Globe, MessageSquare, Check, X, Palette,
  Bot, MessagesSquare, Phone, KeyRound, PlayCircle, Pencil, BadgeCheck, UserCheck,
} from 'lucide-react';
import { THEMES } from '@/lib/themes';

interface CategoryItem { id: string; slug: string; nameEn: string; nameFa: string; count: number }
interface AdminPost {
  id: string; slug: string; titleEn: string; titleFa: string; date: string;
  published: boolean; source: string; cover: string | null; contentEn: string | null;
  categories: { nameEn: string; nameFa: string }[];
}
interface Msg { id: string; name: string; email: string; subject: string | null; body: string; read: boolean; createdAt: string }
interface AiProviderItem {
  id: string; name: string; baseUrl: string; model: string; active: boolean; keyMasked: string; createdAt: string;
}
interface ChatListItem {
  id: string; createdAt: string; read: boolean; lead: boolean;
  contactName: string | null; contactEmail: string | null; contactPhone: string | null; contactNote: string | null;
  messageCount: number; firstUserMessage: string | null;
  lastMessage: { role: string; content: string; createdAt: string } | null;
}
interface ChatDetail extends ChatListItem {
  messages: { id: string; role: string; content: string; createdAt: string }[];
}
interface AdminComment {
  id: string; author: string; content: string; date: string; approved: boolean;
  post: { slug: string; titleEn: string; titleFa: string } | null;
}
interface Generated {
  titleEn: string; titleFa: string; excerptEn: string; excerptFa: string;
  contentEn: string; contentFa: string;
}

export function AdminView() {
  const { lang } = useApp();
  const t = ui[lang] as T;
  const { toast } = useToast();
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState('');
  const [totp, setTotp] = useState('');
  const [needTotp, setNeedTotp] = useState(false);
  const [loginErr, setLoginErr] = useState(false);

  // session restore: the HttpOnly session cookie survives page reloads, so
  // the admin doesn't have to re-type the password on every visit; the
  // response also advertises whether the TOTP second factor is configured
  useEffect(() => {
    fetch('/api/admin/auth')
      .then(async (r) => {
        if (r.ok) setAuthed(true);
        try {
          const d = await r.json();
          if (d?.totpRequired) setNeedTotp(true);
        } catch {}
      })
      .catch(() => {});
  }, []);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(needTotp ? { password: pw, totp } : { password: pw }),
    });
    if (res.ok) {
      // clear the password/code from memory — the server cookie authenticates now
      setPw('');
      setTotp('');
      setAuthed(true);
      setLoginErr(false);
    } else if (res.status === 401) {
      const d = await res.json().catch(() => null);
      if (d?.error === 'totp_required') {
        setNeedTotp(true);
        setLoginErr(false);
      } else {
        setLoginErr(true);
      }
    } else {
      setLoginErr(true);
    }
  }

  async function logout() {
    // expire the session server-side too
    await fetch('/api/admin/auth', { method: 'DELETE' }).catch(() => {});
    setAuthed(false);
  }

  if (!authed) {
    return (
      <div className="mx-auto flex w-full max-w-sm flex-col items-center px-4 py-24">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-600/10 text-violet-600 dark:text-violet-400">
          <Lock className="h-7 w-7" />
        </div>
        <h1 className="mt-5 text-2xl font-extrabold">{t.admin.title}</h1>
        <form onSubmit={login} className="mt-6 w-full space-y-3">
          <Input
            type="password"
            placeholder={t.admin.password}
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            dir="ltr"
          />
          {needTotp && (
            <Input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder={t.admin.totp}
              value={totp}
              onChange={(e) => setTotp(e.target.value.replace(/\D/g, ''))}
              dir="ltr"
            />
          )}
          {loginErr && <p className="text-sm text-red-500">{t.admin.wrongPw}</p>}
          {needTotp && !loginErr && <p className="text-xs text-muted-foreground">{t.admin.totpRequired}</p>}
          <Button type="submit" className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white">
            {t.admin.login}
          </Button>
        </form>
        <p className="mt-4 text-xs text-muted-foreground">
          {lang === 'fa' ? 'دسترسی فقط برای مدیر سایت' : 'Site owner access only'}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">{t.admin.title}</h1>
        <Button variant="outline" size="sm" onClick={logout}>
          <LogOut className="me-1 h-4 w-4" /> {t.admin.logout}
        </Button>
      </div>

      <Tabs defaultValue="dashboard" className="mt-6">
        <TabsList className="flex w-full justify-start overflow-x-auto sm:w-auto">
          <TabsTrigger value="dashboard" className="gap-1.5"><LayoutDashboard className="h-4 w-4" />{t.admin.tabs.dashboard}</TabsTrigger>
          <TabsTrigger value="posts" className="gap-1.5"><FileText className="h-4 w-4" />{t.admin.tabs.posts}</TabsTrigger>
          <TabsTrigger value="writer" className="gap-1.5"><Sparkles className="h-4 w-4" />{t.admin.tabs.writer}</TabsTrigger>
          <TabsTrigger value="messages" className="gap-1.5"><Mail className="h-4 w-4" />{t.admin.tabs.messages}</TabsTrigger>
          <TabsTrigger value="comments" className="gap-1.5"><MessageSquare className="h-4 w-4" />{t.admin.tabs.comments}</TabsTrigger>
          <TabsTrigger value="theme" className="gap-1.5"><Palette className="h-4 w-4" />{t.admin.tabs.theme}</TabsTrigger>
          <TabsTrigger value="ai" className="gap-1.5"><Bot className="h-4 w-4" />{t.admin.tabs.ai}</TabsTrigger>
          <TabsTrigger value="chats" className="gap-1.5"><MessagesSquare className="h-4 w-4" />{t.admin.tabs.chats}</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard"><Dashboard t={t} lang={lang} /></TabsContent>
        <TabsContent value="posts"><PostsTab t={t} /></TabsContent>
        <TabsContent value="writer"><WriterTab t={t} lang={lang} /></TabsContent>
        <TabsContent value="messages"><MessagesTab t={t} /></TabsContent>
        <TabsContent value="comments"><CommentsTab t={t} /></TabsContent>
        <TabsContent value="theme"><ThemeTab t={t} lang={lang} /></TabsContent>
        <TabsContent value="ai"><AiProvidersTab t={t} lang={lang} /></TabsContent>
        <TabsContent value="chats"><ChatsTab t={t} lang={lang} /></TabsContent>
      </Tabs>
    </div>
  );
}

type T = typeof ui.en;

// ─────────── Dashboard ───────────

function Dashboard({ t, lang }: { t: T; lang: 'en' | 'fa' }) {
  const [stats, setStats] = useState<{ posts: number; translated: number; kbChunks: number; messages: number; unread: number } | null>(null);
  const [rebuilding, setRebuilding] = useState(false);
  const { toast } = useToast();

  const load = useCallback(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  useEffect(load, [load]);

  async function rebuild() {
    setRebuilding(true);
    const res = await fetch('/api/admin/kb', { method: 'POST' });
    const d = await res.json();
    setRebuilding(false);
    if (d.ok) toast({ title: `KB rebuilt: ${d.chunks} chunks` });
    load();
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: t.admin.totalPosts, value: stats?.posts ?? '—', icon: FileText },
          { label: t.admin.translated, value: stats?.translated ?? '—', icon: Globe },
          { label: t.admin.kbChunks, value: stats?.kbChunks ?? '—', icon: Sparkles },
          { label: t.admin.messages, value: stats ? `${stats.messages} (${stats.unread} ${t.admin.unread})` : '—', icon: Mail },
        ].map((c) => (
          <div key={c.label} className="rounded-2xl border border-border bg-card p-5">
            <c.icon className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            <div className="mt-3 text-2xl font-extrabold">{c.value}</div>
            <div className="mt-1 text-xs text-muted-foreground">{c.label}</div>
          </div>
        ))}
      </div>

      <Button onClick={rebuild} disabled={rebuilding} variant="outline" className="mt-6">
        {rebuilding ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <RefreshCw className="me-2 h-4 w-4" />}
        {t.admin.regenerateKb}
      </Button>
    </div>
  );
}

// ─────────── Posts ───────────

function PostsTab({ t }: { t: T }) {
  const { toast } = useToast();
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [translating, setTranslating] = useState<string>('');
  const [preview, setPreview] = useState<AdminPost | null>(null);
  const [q, setQ] = useState('');

  const load = useCallback(() => {
    fetch('/api/admin/posts')
      .then((r) => r.json())
      .then((d) => setPosts(d.posts || []))
      .catch(() => {});
  }, []);

  useEffect(load, [load]);

  async function translate(id: string) {
    setTranslating(id);
    const res = await fetch('/api/admin/ai/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId: id }),
    });
    const d = await res.json();
    setTranslating('');
    if (d.ok) toast({ title: d.translatedTo === 'none' ? d.message : `✓ Translated (${d.translatedTo})` });
    else toast({ title: d.error || 'Failed', variant: 'destructive' });
    load();
  }

  async function remove(id: string) {
    if (!confirm('Delete this post permanently?')) return;
    const res = await fetch(`/api/admin/posts/${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast({ title: 'Deleted' });
      load();
    }
  }

  const filtered = posts.filter(
    (p) => !q || (p.titleEn || '').toLowerCase().includes(q.toLowerCase()) || (p.titleFa || '').includes(q)
  );

  return (
    <div>
      <Input placeholder="Search..." value={q} onChange={(e) => setQ(e.target.value)} className="mb-4 max-w-sm" dir="auto" />
      <ScrollArea className="h-[60vh] rounded-xl border border-border">
        <div className="divide-y divide-border">
          {filtered.map((p) => (
            <div key={p.id} className="flex items-center gap-3 p-3 text-sm" dir="ltr">
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold">{p.titleEn || p.titleFa}</div>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{formatDate('en', p.date)}</span>
                  {p.source === 'ai' && <Badge className="bg-fuchsia-600/15 text-fuchsia-600" variant="secondary">AI</Badge>}
                  {!p.contentEn && (
                    <Badge variant="outline" className="text-amber-600 border-amber-500/40">FA only</Badge>
                  )}
                  {p.categories?.[0] && (
                    <span className="truncate">{p.categories[0].nameEn}</span>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setPreview(p)} title="Preview">
                  <Eye className="h-4 w-4" />
                </Button>
                {!p.contentEn && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1 text-xs"
                    disabled={translating === p.id}
                    onClick={() => translate(p.id)}
                  >
                    {translating === p.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Languages className="h-3.5 w-3.5" />}
                    {translating === p.id ? t.admin.translating : t.admin.translateBtn}
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => remove(p.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
          {preview && (
            <>
              <DialogHeader>
                <DialogTitle dir="ltr">{preview.titleEn || preview.titleFa}</DialogTitle>
              </DialogHeader>
              <div
                className="prose-blog"
                dir="ltr"
                dangerouslySetInnerHTML={{ __html: preview.contentEn || `<p>${preview.titleFa}</p><p dir="rtl">این مقاله هنوز ترجمه نشده است.</p>` }}
              />
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─────────── AI Writer ───────────

function WriterTab({ t, lang }: { t: T; lang: 'en' | 'fa' }) {
  const { toast } = useToast();
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [cats, setCats] = useState<CategoryItem[]>([]);
  const [generating, setGenerating] = useState(false);
  const [genImage, setGenImage] = useState(false);
  const [article, setArticle] = useState<Generated | null>(null);
  const [coverUrl, setCoverUrl] = useState<string>('');
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    fetch('/api/site').then((r) => r.json()).then((d) => setCats(d.categories || [])).catch(() => {});
  }, []);

  async function generate() {
    if (!topic.trim()) return;
    setGenerating(true);
    setArticle(null);
    setCoverUrl('');
    try {
      const res = await fetch('/api/admin/ai/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, keywords }),
      });
      const d = await res.json();
      if (d.ok) {
        setArticle(d.article);
        toast({ title: t.admin.generated });
      } else {
        toast({ title: d.error || 'Failed', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Failed', variant: 'destructive' });
    }
    // generate cover image in parallel
    setGenImage(true);
    fetch('/api/admin/ai/image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: topic }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) setCoverUrl(d.url);
      })
      .catch(() => {})
      .finally(() => setGenImage(false));
    setGenerating(false);
  }

  async function publish() {
    if (!article) return;
    setPublishing(true);
    const res = await fetch('/api/admin/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        titleEn: article.titleEn,
        titleFa: article.titleFa,
        excerptEn: article.excerptEn,
        excerptFa: article.excerptFa,
        contentEn: article.contentEn,
        contentFa: article.contentFa,
        cover: coverUrl || null,
        categoryId: categoryId || undefined,
        slug: article.titleEn,
      }),
    });
    const d = await res.json();
    setPublishing(false);
    if (d.ok) {
      toast({ title: t.admin.publishOk });
      setArticle(null);
      setTopic('');
      setKeywords('');
      setCoverUrl('');
    } else {
      toast({ title: d.error || 'Failed', variant: 'destructive' });
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4 rounded-2xl border border-border bg-card p-5">
        <div className="space-y-2">
          <Label>{t.admin.writerTopic} *</Label>
          <Textarea rows={2} value={topic} onChange={(e) => setTopic(e.target.value)} placeholder={lang === 'fa' ? 'مثلاً: آینده شهرهای هوشمند با هوش مصنوعی' : 'e.g. The future of smart cities with AI'} dir="auto" />
        </div>
        <div className="space-y-2">
          <Label>{t.admin.writerKeywords}</Label>
          <Input value={keywords} onChange={(e) => setKeywords(e.target.value)} dir="auto" />
        </div>
        <div className="space-y-2">
          <Label>{t.admin.writerCategory}</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger>
              <SelectValue placeholder="—" />
            </SelectTrigger>
            <SelectContent>
              {cats.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {pick(lang, c.nameEn, c.nameFa)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={generate}
          disabled={generating || !topic.trim()}
          className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-700 hover:to-fuchsia-700"
        >
          {generating ? (
            <>
              <Loader2 className="me-2 h-4 w-4 animate-spin" />
              {t.admin.writerGenerating}
            </>
          ) : (
            <>
              <Sparkles className="me-2 h-4 w-4" />
              {t.admin.writerGenerate}
            </>
          )}
        </Button>
        {(generating || genImage) && genImage && !generating && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Generating cover image...
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        {!article ? (
          <div className="flex h-full min-h-64 flex-col items-center justify-center text-center text-muted-foreground">
            <Sparkles className="h-10 w-10 opacity-30" />
            <p className="mt-3 text-sm">{lang === 'fa' ? 'مقاله تولیدشده اینجا نمایش داده می‌شود' : 'Generated article will appear here'}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <Badge className="bg-emerald-600/15 text-emerald-600" variant="secondary">✓ {t.admin.writerPreview}</Badge>
            {coverUrl && (
               
              <img src={coverUrl} alt="cover" className="aspect-video w-full rounded-xl object-cover" />
            )}
            {genImage && !coverUrl && (
              <div className="flex aspect-video w-full items-center justify-center rounded-xl bg-muted">
                <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
              </div>
            )}
            <div>
              <div className="text-xs font-bold text-muted-foreground">EN</div>
              <h3 className="font-bold">{article.titleEn}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{article.excerptEn}</p>
            </div>
            <div dir="rtl">
              <div className="text-xs font-bold text-muted-foreground">FA</div>
              <h3 className="font-bold">{article.titleFa}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{article.excerptFa}</p>
            </div>
            <details className="text-sm">
              <summary className="cursor-pointer font-medium text-violet-600 dark:text-violet-400">
                Full content (EN)
              </summary>
              <div className="prose-blog mt-2 max-h-60 overflow-y-auto" dangerouslySetInnerHTML={{ __html: article.contentEn }} />
            </details>
            <Button onClick={publish} disabled={publishing} className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white">
              {publishing ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <ImageIcon className="me-2 h-4 w-4" />}
              {publishing ? t.admin.writerPublishing : t.admin.writerPublish}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────── Theme Picker ───────────

function ThemeTab({ t, lang }: { t: T; lang: 'en' | 'fa' }) {
  const { toast } = useToast();
  const setTheme = useApp((s) => s.setTheme);
  const [active, setActive] = useState<string>('default');
  const [saving, setSaving] = useState<string>('');

  const load = useCallback(() => {
    fetch('/api/site')
      .then((r) => r.json())
      .then((d) => setActive(d.theme || 'default'))
      .catch(() => {});
  }, []);

  useEffect(load, [load]);

  async function apply(id: string) {
    setSaving(id);
    const th = THEMES.find((x) => x.id === id);
    const res = await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme: id }),
    });
    setSaving('');
    if (res.ok) {
      setActive(id);
      setTheme(id); // apply instantly for the admin too
      toast({ title: lang === 'fa' ? `✓ تم «${th?.nameFa}» فعال شد` : `✓ ${th?.nameEn} theme applied` });
    } else {
      toast({ title: 'Failed', variant: 'destructive' });
    }
  }

  return (
    <div>
      <p className="mb-4 text-sm text-muted-foreground">
        {lang === 'fa'
          ? 'تم رنگی و پس‌زمینه متحرک کل سایت را انتخاب کنید — بازدیدکنندگان بلافاصله آن را می‌بینند.'
          : 'Select the color theme & animated background for the whole site — visitors see it immediately.'}
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {THEMES.map((th) => (
          <button
            key={th.id}
            onClick={() => apply(th.id)}
            disabled={saving === th.id}
            className={`rounded-2xl border-2 bg-card p-4 text-start transition-all hover:-translate-y-0.5 hover:shadow-lg ${
              active === th.id ? 'border-violet-600 shadow-md' : 'border-border hover:border-violet-500/50'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">{th.emoji}</span>
              <span className="font-bold">{th.nameEn}</span>
              <span className="text-sm text-muted-foreground">· {th.nameFa}</span>
              {active === th.id && (
                <Badge className="ms-auto bg-emerald-600/15 text-emerald-600" variant="secondary">
                  ✓ {lang === 'fa' ? 'فعال' : 'Active'}
                </Badge>
              )}
            </div>
            <div className="mt-3 flex gap-1.5">
              {th.swatch.map((c, i) => (
                <span key={i} className="h-7 flex-1 rounded-lg border border-black/5" style={{ background: c }} />
              ))}
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              {lang === 'fa' ? 'پس‌زمینه' : 'effect'}: {th.effect}{saving === th.id ? ' …' : ''}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─────────── Comments Moderation ───────────

function CommentsTab({ t }: { t: T }) {
  const { toast } = useToast();
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    fetch(`/api/admin/comments?status=${filter}`)
      .then((r) => r.json())
      .then((d) => setComments(d.comments || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(load, [load]);

  async function setApproved(id: string, approved: boolean) {
    await fetch('/api/admin/comments', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, approved }),
    });
    toast({ title: approved ? '✓ Approved' : 'Unapproved' });
    load();
  }

  async function remove(id: string) {
    if (!confirm('Delete this comment permanently?')) return;
    await fetch('/api/admin/comments', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    toast({ title: 'Deleted' });
    load();
  }

  return (
    <div>
      <div className="mb-4 flex gap-2">
        <Button variant={filter === 'pending' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('pending')}>
          {t.admin.pendingComments}
        </Button>
        <Button variant={filter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('all')}>
          {t.admin.approvedLabel}
        </Button>
      </div>

      <ScrollArea className="h-[60vh] rounded-xl border border-border">
        <div className="divide-y divide-border">
          {loading && <div className="p-8 text-center text-sm text-muted-foreground">{t.common.loading}</div>}
          {!loading && comments.length === 0 && (
            <div className="p-8 text-center text-sm text-muted-foreground">—</div>
          )}
          {comments.map((c) => (
            <div key={c.id} className="p-4" dir="auto">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">{c.author}</span>
                <Badge variant="secondary" className={c.approved ? 'bg-emerald-600/15 text-emerald-600' : 'bg-amber-600/15 text-amber-600'}>
                  {c.approved ? t.admin.approvedLabel : t.admin.pendingLabel}
                </Badge>
                <span className="text-xs text-muted-foreground">{formatDate('en', c.date)}</span>
                {c.post && (
                  <span className="max-w-52 truncate text-xs text-violet-600 dark:text-violet-400">
                    ↳ {c.post.titleEn || c.post.titleFa}
                  </span>
                )}
                <div className="ms-auto flex items-center gap-1">
                  {!c.approved ? (
                    <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs text-emerald-600 hover:text-emerald-700" onClick={() => setApproved(c.id, true)}>
                      <Check className="h-3.5 w-3.5" /> {t.admin.approve}
                    </Button>
                  ) : (
                    <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs text-amber-600 hover:text-amber-700" onClick={() => setApproved(c.id, false)}>
                      <X className="h-3.5 w-3.5" /> {t.admin.unapprove}
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => remove(c.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{c.content}</p>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

// ─────────── Messages ───────────

function MessagesTab({ t }: { t: T }) {
  const [messages, setMessages] = useState<Msg[]>([]);

  const load = useCallback(() => {
    fetch('/api/admin/messages')
      .then((r) => r.json())
      .then((d) => setMessages(d.messages || []))
      .catch(() => {});
  }, []);

  useEffect(load, [load]);

  async function markRead(m: Msg) {
    if (m.read) return;
    await fetch('/api/admin/messages', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: m.id, read: true }),
    });
    load();
  }

  return (
    <ScrollArea className="h-[60vh] rounded-xl border border-border">
      <div className="divide-y divide-border">
        {messages.length === 0 && <div className="p-8 text-center text-sm text-muted-foreground">—</div>}
        {messages.map((m) => (
          <button key={m.id} onClick={() => markRead(m)} className={`block w-full p-4 text-start ${m.read ? '' : 'bg-violet-600/5'}`} dir="ltr">
            <div className="flex items-center gap-2">
              {!m.read && <span className="h-2 w-2 rounded-full bg-violet-600" />}
              <span className="font-semibold">{m.name}</span>
              <span className="text-xs text-muted-foreground">{m.email}</span>
              <span className="ms-auto text-xs text-muted-foreground">{formatDate('en', m.createdAt)}</span>
            </div>
            {m.subject && <div className="mt-1 text-sm font-medium">{m.subject}</div>}
            <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{m.body}</p>
          </button>
        ))}
      </div>
    </ScrollArea>
  );
}

// ─────────── AI Providers ───────────

function AiProvidersTab({ t, lang }: { t: T; lang: 'en' | 'fa' }) {
  const { toast } = useToast();
  const [providers, setProviders] = useState<AiProviderItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [testingId, setTestingId] = useState('');
  const [editingId, setEditingId] = useState('');
  const [form, setForm] = useState({ name: '', baseUrl: '', apiKey: '', model: '' });

  const load = useCallback(() => {
    fetch('/api/admin/ai-providers')
      .then((r) => r.json())
      .then((d) => setProviders(d.providers || []))
      .catch(() => {});
  }, []);

  useEffect(load, [load]);

  async function addOrUpdate(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const editing = editingId !== '';
    const res = await fetch('/api/admin/ai-providers', {
      method: editing ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editing ? { id: editingId, ...form, apiKey: form.apiKey || undefined } : form),
    });
    const d = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.ok && d.ok) {
      toast({ title: editing ? '✓ Updated' : '✓ Added' });
      setForm({ name: '', baseUrl: '', apiKey: '', model: '' });
      setEditingId('');
      load();
    } else {
      toast({ title: d.error || 'Failed', variant: 'destructive' });
    }
  }

  async function toggleActive(p: AiProviderItem) {
    await fetch('/api/admin/ai-providers', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: p.id, active: !p.active }),
    });
    load();
  }

  async function test(p: AiProviderItem) {
    setTestingId(p.id);
    const res = await fetch('/api/admin/ai-providers/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: p.id }),
    });
    const d = await res.json().catch(() => ({}));
    setTestingId('');
    if (res.ok && d.ok) {
      toast({ title: `${t.admin.aiTestOk} (${d.latencyMs}ms · ${d.model})` });
    } else {
      toast({ title: `${t.admin.aiTestFail}: ${d.error || res.status}`, variant: 'destructive' });
    }
  }

  async function remove(id: string) {
    if (!confirm(lang === 'fa' ? 'این سرویس حذف شود؟' : 'Delete this provider?')) return;
    await fetch(`/api/admin/ai-providers?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    toast({ title: 'Deleted' });
    load();
  }

  function startEdit(p: AiProviderItem) {
    setEditingId(p.id);
    setForm({ name: p.name, baseUrl: p.baseUrl, apiKey: '', model: p.model });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-2 rounded-xl border border-violet-500/30 bg-violet-600/5 p-4 text-sm text-muted-foreground">
        <KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-violet-600 dark:text-violet-400" />
        <p>{t.admin.aiHint}</p>
      </div>

      <form onSubmit={addOrUpdate} className="space-y-3 rounded-2xl border border-border bg-card p-5">
        <h3 className="font-bold">{editingId ? t.admin.aiEdit : t.admin.aiAdd}</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>{t.admin.aiName} *</Label>
            <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="OpenRouter" dir="auto" />
          </div>
          <div className="space-y-1.5">
            <Label>{t.admin.aiModel} *</Label>
            <Input required value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} placeholder="gpt-4o-mini" dir="ltr" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>{t.admin.aiBaseUrl} *</Label>
          <Input required value={form.baseUrl} onChange={(e) => setForm({ ...form, baseUrl: e.target.value })} placeholder="https://openrouter.ai/api/v1" dir="ltr" />
          <p className="text-xs text-muted-foreground">{t.admin.aiHintBaseUrl}</p>
        </div>
        <div className="space-y-1.5">
          <Label>{t.admin.aiApiKey} {editingId ? '' : '*'}</Label>
          <Input
            type="password"
            required={!editingId}
            value={form.apiKey}
            onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
            placeholder={editingId ? t.admin.aiKeyKeep : 'sk-...'}
            dir="ltr"
            autoComplete="off"
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={busy} className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white">
            {busy ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Check className="me-2 h-4 w-4" />}
            {editingId ? t.admin.aiUpdate : t.admin.aiAddBtn}
          </Button>
          {editingId && (
            <Button type="button" variant="outline" onClick={() => { setEditingId(''); setForm({ name: '', baseUrl: '', apiKey: '', model: '' }); }}>
              {t.admin.cancel}
            </Button>
          )}
        </div>
      </form>

      {providers.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          {t.admin.aiNoProviders}
        </p>
      ) : (
        <div className="divide-y divide-border rounded-xl border border-border">
          {providers.map((p) => (
            <div key={p.id} className="flex flex-wrap items-center gap-3 p-4" dir="ltr">
              <Bot className={`h-5 w-5 shrink-0 ${p.active ? 'text-emerald-600' : 'text-muted-foreground'}`} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{p.name}</span>
                  {p.active && (
                    <Badge variant="secondary" className="bg-emerald-600/15 text-emerald-600">
                      <BadgeCheck className="me-1 h-3 w-3" /> {t.admin.aiActive}
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">{p.model}</span>
                </div>
                <div className="mt-0.5 truncate text-xs text-muted-foreground">
                  {p.baseUrl} · {p.keyMasked}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs" disabled={testingId === p.id} onClick={() => test(p)}>
                  {testingId === p.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <PlayCircle className="h-3.5 w-3.5" />}
                  {testingId === p.id ? t.admin.aiTesting : t.admin.aiTest}
                </Button>
                {!p.active && (
                  <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs text-emerald-600 hover:text-emerald-700" onClick={() => toggleActive(p)}>
                    <Check className="h-3.5 w-3.5" /> {t.admin.aiActivate}
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(p)} title={t.admin.aiEdit}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => remove(p.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────── AI Conversations ───────────

function ChatsTab({ t, lang }: { t: T; lang: 'en' | 'fa' }) {
  const { toast } = useToast();
  const [sessions, setSessions] = useState<ChatListItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'lead' | 'contact' | 'unread'>('all');
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<ChatDetail | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetch(`/api/admin/chats?filter=${filter}&q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((d) => setSessions(d.sessions || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filter, q]);

  useEffect(() => {
    const timer = setTimeout(load, q ? 350 : 0); // small debounce while typing
    return () => clearTimeout(timer);
  }, [load, q]);

  async function openDetail(id: string) {
    const res = await fetch(`/api/admin/chats?id=${encodeURIComponent(id)}`);
    if (!res.ok) return;
    const d = await res.json();
    setDetail(d.session);
    if (!d.session.read) {
      await fetch('/api/admin/chats', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, read: true }),
      });
      setSessions((s) => s.map((x) => (x.id === id ? { ...x, read: true } : x)));
    }
  }

  async function toggleRead(s: ChatListItem) {
    await fetch('/api/admin/chats', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: s.id, read: !s.read }),
    });
    load();
  }

  async function remove(id: string) {
    if (!confirm(lang === 'fa' ? 'این گفتگو برای همیشه حذف شود؟' : 'Delete this conversation permanently?')) return;
    await fetch(`/api/admin/chats?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    setDetail(null);
    toast({ title: 'Deleted' });
    load();
  }

  return (
    <div>
      <p className="mb-4 text-sm text-muted-foreground">{t.admin.chatsHint}</p>

      <div className="mb-3 flex flex-wrap gap-2">
        {(
          [
            ['all', t.admin.chatsFilterAll],
            ['lead', t.admin.chatsFilterLeads],
            ['contact', t.admin.chatsFilterContacts],
            ['unread', t.admin.chatsFilterUnread],
          ] as const
        ).map(([key, label]) => (
          <Button key={key} variant={filter === key ? 'default' : 'outline'} size="sm" onClick={() => setFilter(key)}>
            {label}
          </Button>
        ))}
      </div>
      <Input placeholder={t.admin.chatsSearch} value={q} onChange={(e) => setQ(e.target.value)} className="mb-4 max-w-sm" dir="auto" />

      <ScrollArea className="h-[55vh] rounded-xl border border-border">
        <div className="divide-y divide-border">
          {loading && <div className="p-8 text-center text-sm text-muted-foreground">{t.common.loading}</div>}
          {!loading && sessions.length === 0 && <div className="p-8 text-center text-sm text-muted-foreground">{t.admin.chatsEmpty}</div>}
          {sessions.map((s) => (
            <button key={s.id} onClick={() => openDetail(s.id)} className={`block w-full p-4 text-start ${s.read ? '' : 'bg-violet-600/5'}`} dir="auto">
              <div className="flex flex-wrap items-center gap-2">
                {!s.read && <span className="h-2 w-2 shrink-0 rounded-full bg-violet-600" />}
                <span className="font-semibold">
                  {s.contactName || (lang === 'fa' ? 'بازدیدکننده' : 'Visitor')}
                </span>
                {s.lead && (
                  <Badge variant="secondary" className="bg-fuchsia-600/15 text-fuchsia-600">
                    <UserCheck className="me-1 h-3 w-3" />
                    {t.admin.chatsFilterLeads}
                  </Badge>
                )}
                {s.contactEmail && <span className="text-xs text-muted-foreground" dir="ltr">{s.contactEmail}</span>}
                {s.contactPhone && <span className="text-xs text-muted-foreground" dir="ltr"><Phone className="me-0.5 inline h-3 w-3" />{s.contactPhone}</span>}
                <span className="ms-auto text-xs text-muted-foreground">{formatDate('en', s.createdAt)}</span>
                <span className="text-xs text-muted-foreground">· {s.messageCount} {t.admin.chatsMessages}</span>
              </div>
              {s.firstUserMessage && (
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{t.admin.chatsFirstMsg}: </span>
                  {s.firstUserMessage}
                </p>
              )}
            </button>
          ))}
        </div>
      </ScrollArea>

      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-h-[80vh] max-w-xl overflow-y-auto" dir={lang === 'fa' ? 'rtl' : 'ltr'}>
          {detail && (
            <>
              <DialogHeader>
                <DialogTitle className="flex flex-wrap items-center gap-2">
                  {detail.contactName || t.admin.chatsAnonymous}
                  {detail.lead && (
                    <Badge variant="secondary" className="bg-fuchsia-600/15 text-fuchsia-600">
                      {t.admin.chatsFilterLeads}
                    </Badge>
                  )}
                </DialogTitle>
              </DialogHeader>

              {(detail.contactEmail || detail.contactPhone || detail.contactNote) && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3 text-sm">
                  <div className="mb-1 text-xs font-bold text-emerald-700 dark:text-emerald-400">{t.admin.chatsContact}</div>
                  {detail.contactEmail && (
                    <div dir="ltr" className="text-sm">
                      ✉ <a className="text-violet-600 underline dark:text-violet-400" href={`mailto:${detail.contactEmail}`}>{detail.contactEmail}</a>
                    </div>
                  )}
                  {detail.contactPhone && (
                    <div dir="ltr" className="text-sm">
                      <Phone className="me-1 inline h-3.5 w-3.5" />{detail.contactPhone}
                    </div>
                  )}
                  {detail.contactNote && (
                    <div className="mt-1 text-sm text-muted-foreground">
                      <span className="font-medium">{t.admin.chatsNote}: </span>{detail.contactNote}
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-col gap-2">
                {detail.messages.map((m) => (
                  <div
                    key={m.id}
                    className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                      m.role === 'user' ? 'self-end bg-violet-600/15' : 'self-start bg-muted'
                    }`}
                  >
                    {m.content}
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => toggleRead(detail)}>
                  {detail.read ? t.admin.chatsMarkUnread : t.admin.chatsMarkRead}
                </Button>
                <Button variant="destructive" size="sm" onClick={() => remove(detail.id)}>
                  <Trash2 className="me-1 h-3.5 w-3.5" /> {t.admin.delete}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
