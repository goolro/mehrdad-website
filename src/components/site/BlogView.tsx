'use client';

import { useCallback, useEffect, useState } from 'react';
import { useApp, pick, formatDate } from './store';
import { ui } from './i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CommentsSection } from './CommentsSection';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, FileText, ChevronLeft, ChevronRight, Clock, Info, MessageSquare } from 'lucide-react';

interface CategoryItem { id: string; slug: string; nameEn: string; nameFa: string; count: number }
interface PostItem {
  slug: string; titleEn: string; titleFa: string; excerptEn: string | null; excerptFa: string | null;
  cover: string | null; date: string; hasEn: boolean; readMinutes: number; commentCount?: number;
  categories: CategoryItem[];
}

export function BlogView() {
  const { lang } = useApp();
  const t = ui[lang];
  const [cats, setCats] = useState<CategoryItem[]>([]);
  const [activeCat, setActiveCat] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/site').then((r) => r.json()).then((d) => setCats(d.categories || [])).catch(() => {});
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), perPage: '12' });
    if (activeCat) params.set('category', activeCat);
    if (search.trim()) params.set('search', search.trim());
    fetch(`/api/posts?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setPosts(d.posts || []);
        setTotalPages(d.totalPages || 1);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, activeCat, search]);

  useEffect(() => {
    const timer = setTimeout(load, search ? 350 : 0);
    return () => clearTimeout(timer);
  }, [load, search]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-extrabold sm:text-4xl">{t.blog.title}</h1>
      <p className="mt-2 text-muted-foreground">{t.blog.sub}</p>

      {/* search + filters */}
      <div className="mt-8 flex flex-col gap-4">
        <div className="relative max-w-md">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder={t.blog.search}
            className="ps-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => { setActiveCat(''); setPage(1); }}>
            <Badge variant={activeCat === '' ? 'default' : 'outline'} className="cursor-pointer px-3 py-1.5">
              {t.blog.all}
            </Badge>
          </button>
          {cats.map((c) => (
            <button key={c.id} onClick={() => { setActiveCat(c.slug); setPage(1); }}>
              <Badge
                variant={activeCat === c.slug ? 'default' : 'outline'}
                className={`cursor-pointer px-3 py-1.5 ${activeCat === c.slug ? 'bg-violet-600 hover:bg-violet-700' : 'hover:border-violet-500/60'}`}
              >
                {pick(lang, c.nameEn, c.nameFa)} ({c.count})
              </Badge>
            </button>
          ))}
        </div>
      </div>

      {/* grid */}
      {loading ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-border">
              <Skeleton className="aspect-video w-full rounded-none" />
              <div className="space-y-2 p-4">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="mt-16 text-center text-muted-foreground">
          <FileText className="mx-auto h-12 w-12 opacity-30" />
          <p className="mt-3">{t.blog.noResults}</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <BlogCard key={p.slug} post={p} />
          ))}
        </div>
      )}

      {/* pagination */}
      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-2">
          <Button variant="outline" size="icon" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
          </Button>
          <span className="text-sm text-muted-foreground">
            {page} / {totalPages}
          </span>
          <Button variant="outline" size="icon" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            <ChevronRight className="h-4 w-4 rtl:rotate-180" />
          </Button>
        </div>
      )}
    </div>
  );
}

function BlogCard({ post }: { post: PostItem }) {
  const { lang, openPost } = useApp();
  return (
    <button
      onClick={() => openPost(post.slug)}
      className="group overflow-hidden rounded-2xl border border-border bg-card text-start transition-all hover:-translate-y-1 hover:border-violet-500/50 hover:shadow-lg"
    >
      <div className="aspect-video w-full overflow-hidden bg-muted">
        {post.cover ? (
           
          <img src={post.cover} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <FileText className="h-10 w-10 text-muted-foreground/40" />
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {formatDate(lang, post.date)}
          {post.categories[0] && (
            <>
              <span>·</span>
              <span className="text-violet-600 dark:text-violet-400">
                {pick(lang, post.categories[0].nameEn, post.categories[0].nameFa)}
              </span>
            </>
          )}
          <span className="ms-auto inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {post.readMinutes} {ui[lang].common.minRead}
          </span>
        </div>
        <h3 className="mt-2 line-clamp-2 font-bold leading-snug transition-colors group-hover:text-violet-600 dark:group-hover:text-violet-400">
          {pick(lang, post.titleEn, post.titleFa)}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{pick(lang, post.excerptEn, post.excerptFa)}</p>
        {!!post.commentCount && (
          <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
            <MessageSquare className="h-3.5 w-3.5" />
            {post.commentCount} {ui[lang].comments.count}
          </div>
        )}
      </div>
    </button>
  );
}

// ─────────────────── Post Detail ───────────────────

interface FullPost {
  slug: string; titleEn: string; titleFa: string;
  excerptEn: string | null; excerptFa: string | null;
  contentEn: string | null; contentFa: string | null;
  cover: string | null; date: string;
  categories: CategoryItem[];
}

export function PostDetail({ slug }: { slug: string }) {
  const { lang, closePost, openPost } = useApp();
  const t = ui[lang];
  const [post, setPost] = useState<FullPost | null>(null);
  const [related, setRelated] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      if (cancelled) return;
      setLoading(true);
      fetch(`/api/posts/${slug}`)
        .then((r) => r.json())
        .then((d) => {
          if (cancelled) return;
          setPost(d.post || null);
          setRelated(d.related || []);
        })
        .catch(() => {})
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
      window.scrollTo({ top: 0 });
    }, 0);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="mt-4 h-4 w-1/3" />
        <Skeleton className="mt-8 aspect-video w-full" />
        <Skeleton className="mt-6 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-2/3" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-20 text-center sm:px-6">
        <p className="text-muted-foreground">{t.blog.noResults}</p>
        <Button className="mt-4" variant="outline" onClick={closePost}>{t.blog.back}</Button>
      </div>
    );
  }

  const title = pick(lang, post.titleEn, post.titleFa);
  const isEnMissing = lang === 'en' && !post.contentEn;

  return (
    <article className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <Button variant="ghost" onClick={closePost} className="mb-6 -ms-2 text-violet-600 dark:text-violet-400">
        <ChevronLeft className="me-1 h-4 w-4 rtl:rotate-180" />
        {t.blog.back}
      </Button>

      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        {post.categories.map((c) => (
          <Badge key={c.id} variant="secondary" className="bg-violet-600/10 text-violet-600 dark:text-violet-400">
            {pick(lang, c.nameEn, c.nameFa)}
          </Badge>
        ))}
        <span>· {t.blog.published}: {formatDate(lang, post.date)}</span>
      </div>

      <h1 className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl">{title}</h1>

      {isEnMissing && (
        <div className="mt-5 flex items-start gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-400">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          {t.blog.aiNote}
        </div>
      )}

      {post.cover && (
         
        <img src={post.cover} alt={title} className="mt-7 w-full rounded-2xl object-cover shadow-lg" />
      )}

      <div
        className="prose-blog mt-8"
        dir={isEnMissing || lang === 'fa' ? 'rtl' : 'ltr'}
        dangerouslySetInnerHTML={{ __html: pick(lang, post.contentEn, post.contentFa) || `<p>${pick(lang, post.excerptEn, post.excerptFa)}</p>` }}
      />

      <CommentsSection slug={slug} />

      {related.length > 0 && (
        <div className="mt-14 border-t border-border pt-8">
          <h2 className="text-xl font-bold">{t.blog.relatedTitle}</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {related.map((r) => (
              <button
                key={r.slug}
                onClick={() => openPost(r.slug)}
                className="group rounded-xl border border-border bg-card p-3 text-start transition-colors hover:border-violet-500/50"
              >
                <div className="text-xs text-muted-foreground">{formatDate(lang, r.date)}</div>
                <div className="mt-1 line-clamp-2 text-sm font-semibold transition-colors group-hover:text-violet-600 dark:group-hover:text-violet-400">
                  {pick(lang, r.titleEn, r.titleFa)}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
