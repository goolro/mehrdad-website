'use client';

import { useState } from 'react';
import { Send, Link2, Share2, Twitter, Linkedin, MessageCircle, Check } from 'lucide-react';

/**
 * Share row for posts / services / projects.
 *
 * Brand links are computed on click (never during render) so the server
 * HTML and the client hydration always agree. When `url` is omitted the
 * current page address is used. Uses the native share sheet on supporting
 * mobile browsers, with Telegram/WhatsApp/X/LinkedIn/copy fallbacks.
 */
export function ShareBar({ url, title, label }: { url?: string; title: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const pageUrl = () => url || (typeof window !== 'undefined' ? window.location.href : '');
  const encodedUrl = () => encodeURIComponent(pageUrl());
  const encodedTitle = () => encodeURIComponent(title);

  async function copy() {
    try {
      await navigator.clipboard.writeText(pageUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable (http contexts) — ignore */
    }
  }

  async function nativeShare() {
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({ title, url: pageUrl() });
        return true;
      } catch {
        /* user dismissed the sheet */
      }
    }
    return false;
  }

  const btn =
    'flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-violet-500/60 hover:text-violet-600 dark:hover:text-violet-400';

  return (
    <div className="flex flex-wrap items-center gap-2" aria-label={label}>
      <span className="text-xs font-semibold text-muted-foreground">
        <Share2 className="me-1.5 inline h-3.5 w-3.5" />
        {label}
      </span>
      <button
        type="button"
        onClick={() => nativeShare()}
        className={btn}
        aria-label="Share"
        title="Share"
      >
        <Share2 className="h-4 w-4" />
      </button>
      <a
        href={`https://t.me/share/url?url=${encodedUrl()}&text=${encodedTitle()}`}
        target="_blank"
        rel="noopener noreferrer"
        className={btn}
        aria-label="Telegram"
        title="Telegram"
      >
        <Send className="h-4 w-4" />
      </a>
      <a
        href={`https://wa.me/?text=${encodedTitle()}%20${encodedUrl()}`}
        target="_blank"
        rel="noopener noreferrer"
        className={btn}
        aria-label="WhatsApp"
        title="WhatsApp"
      >
        <MessageCircle className="h-4 w-4" />
      </a>
      <a
        href={`https://twitter.com/intent/tweet?url=${encodedUrl()}&text=${encodedTitle()}`}
        target="_blank"
        rel="noopener noreferrer"
        className={btn}
        aria-label="X (Twitter)"
        title="X (Twitter)"
      >
        <Twitter className="h-4 w-4" />
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl()}`}
        target="_blank"
        rel="noopener noreferrer"
        className={btn}
        aria-label="LinkedIn"
        title="LinkedIn"
      >
        <Linkedin className="h-4 w-4" />
      </a>
      <button
        type="button"
        onClick={copy}
        className={btn}
        aria-label={copied ? 'Copied' : 'Copy link'}
        title={copied ? 'Copied ✓' : 'Copy link'}
      >
        {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Link2 className="h-4 w-4" />}
      </button>
    </div>
  );
}
