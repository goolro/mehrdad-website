'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useApp, formatDate } from './store';
import { ui } from './i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Loader2, CornerDownRight, Send } from 'lucide-react';

interface CommentItem {
  id: string;
  wpId: number | null;
  parentWpId: number | null;
  parentLocalId: string | null;
  author: string;
  content: string;
  date: string;
}

interface CommentNode extends CommentItem {
  children: CommentNode[];
}

function buildTree(flat: CommentItem[]): CommentNode[] {
  const byKey = new Map<string, CommentNode>();
  flat.forEach((c) => byKey.set(String(c.wpId ?? c.id), { ...c, children: [] }));

  const roots: CommentNode[] = [];
  flat.forEach((c) => {
    const node = byKey.get(String(c.wpId ?? c.id))!;
    if (c.parentWpId) {
      const parent = byKey.get(String(c.parentWpId));
      if (parent) parent.children.push(node);
      else roots.push(node);
    } else if (c.parentLocalId) {
      const parent = byKey.get(c.parentLocalId);
      if (parent) parent.children.push(node);
      else roots.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
}

export function CommentsSection({ slug }: { slug: string }) {
  const { lang } = useApp();
  const t = ui[lang];
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [website, setWebsite] = useState(''); // honeypot
  const [replyTo, setReplyTo] = useState<CommentItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<'pending' | 'error' | null>(null);

  const load = useCallback(() => {
    fetch(`/api/posts/${encodeURIComponent(slug)}/comments`)
      .then((r) => r.json())
      .then((d) => setComments(d.comments || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  // reset UI state when the post (slug) changes — render-time adjustment,
  // the React-sanctioned alternative to setState inside an effect
  const [prevSlug, setPrevSlug] = useState(slug);
  if (prevSlug !== slug) {
    setPrevSlug(slug);
    setComments([]);
    setLoading(true);
    setNotice(null);
    setReplyTo(null);
  }

  useEffect(() => {
    load();
  }, [load]);

  const tree = useMemo(() => buildTree(comments), [comments]);

  async function submit() {
    if (!author.trim() || !content.trim() || submitting) return;
    setSubmitting(true);
    setNotice(null);
    try {
      const res = await fetch(`/api/posts/${encodeURIComponent(slug)}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author, content, website, parentId: replyTo?.id || undefined }),
      });
      if (res.ok) {
        setContent('');
        setReplyTo(null);
        setNotice('pending');
      } else {
        setNotice('error');
      }
    } catch {
      setNotice('error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mt-14 border-t border-border pt-8" aria-label={t.comments.title}>
      <h2 className="flex items-center gap-2 text-xl font-bold">
        <MessageSquare className="h-5 w-5 text-violet-600 dark:text-violet-400" />
        {comments.length === 1 ? `1 ${t.comments.one}` : `${comments.length} ${t.comments.count}`}
      </h2>

      {/* list */}
      {loading ? (
        <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> {t.common.loading}
        </div>
      ) : comments.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">{t.comments.empty}</p>
      ) : (
        <div className="mt-6 space-y-4">
          {tree.map((node) => (
            <CommentBranch key={node.id} node={node} depth={0} onReply={setReplyTo} />
          ))}
        </div>
      )}

      {/* form */}
      <div className="mt-10 rounded-2xl border border-border bg-card p-5">
        <h3 className="font-semibold">
          {replyTo ? (
            <span className="flex flex-wrap items-center gap-2">
              <CornerDownRight className="h-4 w-4 text-violet-500" />
              {t.comments.replyTo} <span className="text-violet-600 dark:text-violet-400">{replyTo.author}</span>
              <button
                className="text-xs text-muted-foreground underline"
                onClick={() => setReplyTo(null)}
                type="button"
              >
                ✕
              </button>
            </span>
          ) : (
            t.comments.formTitle
          )}
        </h3>

        {notice === 'pending' && (
          <div className="mt-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-400">
            {t.comments.pendingNotice}
          </div>
        )}
        {notice === 'error' && (
          <div className="mt-3 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-400">
            {t.comments.error}
          </div>
        )}

        <div className="mt-4 space-y-3">
          {/* honeypot — hidden from real users */}
          <input
            type="text"
            name="website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
            className="hidden"
            aria-hidden="true"
          />
          <Input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder={t.comments.name}
            maxLength={80}
          />
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t.comments.comment}
            rows={4}
            maxLength={2000}
          />
          <Button
            onClick={submit}
            disabled={submitting || !author.trim() || !content.trim()}
            className="bg-violet-600 hover:bg-violet-700"
          >
            {submitting ? (
              <>
                <Loader2 className="me-2 h-4 w-4 animate-spin" /> {t.comments.submitting}
              </>
            ) : (
              <>
                <Send className="me-2 h-4 w-4" /> {t.comments.submit}
              </>
            )}
          </Button>
        </div>
      </div>
    </section>
  );
}

function CommentBranch({
  node,
  depth,
  onReply,
}: {
  node: CommentNode;
  depth: number;
  onReply: (c: CommentItem) => void;
}) {
  const { lang } = useApp();
  const t = ui[lang];
  const initials = node.author.trim().slice(0, 2).toUpperCase() || '?';

  return (
    <div className={depth > 0 ? 'ms-4 border-s-2 border-violet-500/20 ps-4 sm:ms-8' : ''}>
      <div className="rounded-2xl border border-border bg-card/60 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-600/15 text-xs font-bold text-violet-700 dark:text-violet-300">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">{node.author}</div>
            <div className="text-xs text-muted-foreground">{formatDate(lang, node.date)}</div>
          </div>
          <button
            type="button"
            onClick={() => onReply(node)}
            className="ms-auto flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-violet-600 dark:hover:text-violet-400"
          >
            <CornerDownRight className="h-3.5 w-3.5" />
            {t.comments.reply}
          </button>
        </div>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{node.content}</p>
      </div>
      {node.children.length > 0 && (
        <div className="mt-3 space-y-3">
          {node.children.map((child) => (
            <CommentBranch key={child.id} node={child} depth={depth + 1} onReply={onReply} />
          ))}
        </div>
      )}
    </div>
  );
}
