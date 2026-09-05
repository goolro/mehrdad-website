'use client';

import { useEffect, useRef, useState } from 'react';
import { useApp } from './store';
import { ui } from './i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Send, Sparkles, Trash2 } from 'lucide-react';

interface Msg {
  role: 'user' | 'assistant';
  content: string;
}

export function ChatWidget() {
  const { lang, chatOpen, setChatOpen, view } = useApp();
  const t = ui[lang];
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const sessionIdRef = useRef<string>('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // reset conversation when the UI language switches — deliberate one-shot
  // reset (new session per language), not an accidental cascading render
  useEffect(() => {
     
    setMessages([{ role: 'assistant', content: t.chat.welcome }]);
    sessionIdRef.current = '';
  }, [lang]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  async function send(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setInput('');
    setMessages((m) => [...m, { role: 'user', content: msg }]);
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, lang, sessionId: sessionIdRef.current, context: view === 'fde' ? 'fde' : undefined }),
      });
      const data = await res.json();
      if (res.status === 429) {
        setMessages((m) => [...m, { role: 'assistant', content: t.chat.tooFast }]);
        return;
      }
      if (data.sessionId) sessionIdRef.current = data.sessionId;
      setMessages((m) => [...m, { role: 'assistant', content: data.reply || t.common.error }]);
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: t.common.error }]);
    } finally {
      setLoading(false);
    }
  }

  const showSuggestions = chatOpen && view === 'fde' && !loading && !messages.some((m) => m.role === 'user');

  if (!chatOpen) {
    return (
      <button
        onClick={() => setChatOpen(true)}
        className="fixed bottom-5 end-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-xl shadow-violet-600/30 transition-transform hover:scale-105"
        aria-label={t.chat.title}
      >
        <Sparkles className="h-6 w-6" />
        <span className="absolute -top-1 -end-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold">
          AI
        </span>
      </button>
    );
  }

  return (
    <div
      className="fixed bottom-5 end-5 z-50 flex h-[32rem] w-[calc(100vw-2.5rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
      dir={lang === 'fa' ? 'rtl' : 'ltr'}
      role="dialog"
      aria-label={t.chat.title}
    >
      <div className="flex items-center justify-between border-b border-border bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-3 text-white">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          <div>
            <div className="text-sm font-bold">{t.chat.title}</div>
            <div className="text-[10px] opacity-80">
              {lang === 'fa' ? 'آنلاین · آموزش‌دیده روی محتوای سایت' : 'Online · Trained on site content'}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              // server-side deletion too — the conversation should not linger in the DB
              if (sessionIdRef.current) {
                fetch('/api/chat', {
                  method: 'DELETE',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ sessionId: sessionIdRef.current }),
                }).catch(() => {});
              }
              sessionIdRef.current = '';
              setMessages([{ role: 'assistant', content: t.chat.welcome }]);
            }}
            className="rounded-lg p-1.5 hover:bg-white/20"
            aria-label={t.chat.clear}
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button onClick={() => setChatOpen(false)} className="rounded-lg p-1.5 hover:bg-white/20" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-3" ref={scrollRef as never}>
        <div className="flex flex-col gap-3">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'self-end bg-violet-600 text-white'
                  : 'self-start bg-muted text-foreground'
              }`}
            >
              {m.content}
            </div>
          ))}
          {loading && (
            <div className="self-start rounded-2xl bg-muted px-4 py-2.5 text-sm text-muted-foreground">
              <span className="inline-flex gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-violet-500 [animation-delay:0ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-violet-500 [animation-delay:150ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-violet-500 [animation-delay:300ms]" />
              </span>
            </div>
          )}
        </div>
      </ScrollArea>

      {showSuggestions && (
        <div className="border-t border-border px-3 pt-2 pb-1" aria-label={lang === 'fa' ? 'پیشنهاد سوال' : 'Suggested questions'}>
          <div className="flex max-h-24 flex-wrap gap-1.5 overflow-y-auto">
            {t.fde.suggestions.map((q) => (
              <button
                key={q}
                onClick={() => send(q)}
                dir="auto"
                className="rounded-full border border-violet-500/40 bg-violet-600/5 px-2.5 py-1 text-xs text-violet-700 transition-colors hover:bg-violet-600/15 dark:text-violet-300"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      <p className="border-t border-border px-3 pt-2 pb-1 text-[10px] leading-relaxed text-muted-foreground" aria-label={lang === 'fa' ? 'نکتهٔ حریم خصوصی' : 'Privacy notice'}>
        {t.chat.privacy}
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="flex items-center gap-2 border-t border-border p-3"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t.chat.placeholder}
          className="flex-1"
          dir="auto"
        />
        <Button
          type="submit"
          size="icon"
          disabled={loading || !input.trim()}
          className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white"
        >
          <Send className="h-4 w-4 rtl:rotate-180" />
        </Button>
      </form>
    </div>
  );
}
