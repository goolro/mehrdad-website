'use client';

/**
 * Agents tab — browse/search the library, inspect a persona, chat with the
 * specialist, or copy its prompt for external tools (Claude Code, Cursor…).
 */
import { useMemo, useRef, useState } from 'react';
import {
  Bot,
  Copy,
  Download,
  Loader2,
  MessageSquare,
  Search,
  Send,
  Sparkles,
  Star,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import {
  agencyFetch,
  downloadMarkdown,
  readFavorites,
  writeFavorites,
  type AgencyChatMessage,
  type ClientAgent,
  type RosterPayload,
} from '@/components/agency/agency-client';

interface FullAgent extends ClientAgent {
  body: string;
  divisionLabel: string;
}

export function AgencyAgents({
  roster,
  onRan,
  division: divisionProp,
  onDivisionChange,
}: {
  roster: RosterPayload;
  onRan: () => void;
  /** Controlled division (Task 55): when set, the list is scoped from the
   * division boxes tab. Passing `onDivisionChange` lets chip clicks bubble up
   * so the parent can swap the banner / return to the boxes grid on "همه". */
  division?: string | null;
  onDivisionChange?: (d: string | null) => void;
}) {
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [divisionState, setDivisionState] = useState<string>('all');
  const division = divisionProp ?? divisionState;
  const setDivision = (d: string) => {
    setDivisionState(d);
    onDivisionChange?.(d === 'all' ? null : d);
  };
  const [favOnly, setFavOnly] = useState(false);
  const [favs, setFavs] = useState<string[]>(() => readFavorites());
  const [detail, setDetail] = useState<FullAgent | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [chatAgent, setChatAgent] = useState<ClientAgent | null>(null);

  const divisionLabel = (id: string) => roster.divisions.find((d) => d.id === id)?.label ?? id;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return roster.agents.filter((a) => {
      if (division !== 'all' && a.division !== division) return false;
      if (favOnly && !favs.includes(a.id)) return false;
      if (!q) return true;
      return (
        a.name.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q)
      );
    });
  }, [roster.agents, query, division, favOnly, favs]);

  const toggleFav = (id: string) => {
    const next = favs.includes(id) ? favs.filter((f) => f !== id) : [...favs, id];
    setFavs(next);
    writeFavorites(next);
  };

  const openDetail = async (agent: ClientAgent) => {
    setDetailLoading(true);
    try {
      const full = await agencyFetch<FullAgent>(`/api/agency/agent?id=${encodeURIComponent(agent.id)}`);
      setDetail(full);
    } catch (e) {
      toast({ title: 'خطا در دریافت پرسونا', description: String(e instanceof Error ? e.message : e), variant: 'destructive' });
    } finally {
      setDetailLoading(false);
    }
  };

  const copyText = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: `${label} کپی شد`, description: 'برای استفاده در ابزارهای دیگر paste کنید' });
    } catch {
      toast({ title: 'کپی ناموفق بود', variant: 'destructive' });
    }
  };

  const copyPrompt = async (agent: FullAgent) => {
    await copyText(
      `${agent.body}\n\n---\nActivate this specialist, confirm your role in one line, and wait for my task.`,
      'پرامپت ایجنت'
    );
  };

  return (
    <div className="mx-auto flex h-full max-w-6xl flex-col gap-3 p-4 sm:p-6">
      {/* search + filters */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" aria-hidden />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جستجو در ایجنت‌ها… (نام، تخصص، نقش)"
            aria-label="جستجوی ایجنت"
            className="h-10 border-zinc-800 bg-zinc-900/70 pe-10"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            onClick={() => setFavOnly((v) => !v)}
            aria-pressed={favOnly}
            className={`flex h-8 shrink-0 items-center gap-1 rounded-full px-3 text-[11px] transition-colors ${
              favOnly
                ? 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/40'
                : 'border border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Star className="h-3.5 w-3.5" aria-hidden /> منتخب‌ها
          </button>
          <DivisionChip
            active={division === 'all'}
            label="همه"
            count={roster.agents.length}
            onClick={() => setDivision('all')}
          />
          {roster.divisions.map((d) => (
            <DivisionChip
              key={d.id}
              active={division === d.id}
              label={d.label}
              count={d.count}
              color={d.color}
              onClick={() => setDivision(d.id)}
            />
          ))}
        </div>
      </div>

      <p className="text-[11px] text-zinc-500">
        {filtered.length.toLocaleString('fa-IR')} ایجنت
      </p>

      {/* grid */}
      <div className="grid flex-1 content-start gap-2 sm:grid-cols-2 lg:grid-cols-3" role="list">
        {filtered.map((a) => (
          <div
            key={a.id}
            role="listitem"
            className="group relative rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 transition-colors hover:border-emerald-500/40"
          >
            <button
              onClick={() => toggleFav(a.id)}
              aria-label={favs.includes(a.id) ? 'حذف از منتخب‌ها' : 'افزودن به منتخب‌ها'}
              aria-pressed={favs.includes(a.id)}
              className="absolute end-2 top-2 rounded-md p-1 text-zinc-600 transition-colors hover:text-amber-300"
            >
              <Star className={`h-4 w-4 ${favs.includes(a.id) ? 'fill-amber-300 text-amber-300' : ''}`} aria-hidden />
            </button>
            <button onClick={() => openDetail(a)} className="block w-full pe-6 text-start">
              <p className="text-xs font-bold leading-5 text-zinc-100">{a.name}</p>
              <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-zinc-500">{a.description}</p>
              <Badge
                variant="outline"
                className="mt-2 border-zinc-700 bg-zinc-800/60 px-2 py-0 text-[10px] text-zinc-400"
              >
                {divisionLabel(a.division)}
              </Badge>
            </button>
            <div className="mt-2 flex items-center gap-1.5">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setChatAgent(a)}
                className="h-7 gap-1 bg-emerald-600/90 px-2.5 text-[11px] text-white hover:bg-emerald-500"
              >
                <MessageSquare className="h-3.5 w-3.5" aria-hidden /> گفتگو
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => openDetail(a)}
                className="h-7 px-2.5 text-[11px] text-zinc-400 hover:text-zinc-100"
              >
                جزئیات
              </Button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full rounded-xl border border-dashed border-zinc-800 p-6 text-center text-xs text-zinc-500">
            ایجنتی با این فیلترها پیدا نشد.
          </p>
        )}
      </div>

      {/* detail dialog */}
      <Dialog open={!!detail || detailLoading} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-hidden border-zinc-800 bg-zinc-900 p-0 text-zinc-100 [direction:rtl]">
          {detail ? (
            <div className="flex max-h-[85vh] flex-col">
              <DialogHeader className="border-b border-zinc-800 p-4 pe-11 text-start">
                <DialogTitle className="flex items-center gap-2 text-sm font-bold">
                  <Bot className="h-4 w-4 text-emerald-400" aria-hidden />
                  {detail.name}
                </DialogTitle>
                <DialogDescription className="mt-1 text-[11px] leading-4 text-zinc-400">
                  {detail.description}
                </DialogDescription>
                <Badge variant="outline" className="mt-2 w-fit border-zinc-700 px-2 text-[10px] text-zinc-400">
                  {detail.divisionLabel}
                </Badge>
              </DialogHeader>
              <ScrollArea className="min-h-0 flex-1 p-4">
                <div
                  dir="ltr"
                  className="whitespace-pre-wrap break-words text-start font-mono text-[11px] leading-5 text-zinc-300"
                >
                  {detail.body}
                </div>
              </ScrollArea>
              <div className="flex flex-wrap items-center gap-2 border-t border-zinc-800 p-3">
                <Button
                  size="sm"
                  onClick={() => {
                    setChatAgent(detail);
                    setDetail(null);
                  }}
                  className="h-8 gap-1 bg-emerald-600 text-white hover:bg-emerald-500"
                >
                  <MessageSquare className="h-3.5 w-3.5" aria-hidden /> گفتگو با این ایجنت
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyPrompt(detail)}
                  className="h-8 gap-1 border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800"
                >
                  <Copy className="h-3.5 w-3.5" aria-hidden /> کپی پرامپت
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyText(detail.body, 'متن پرسونا')}
                  className="h-8 gap-1 text-zinc-400 hover:text-zinc-100"
                >
                  <Download className="h-3.5 w-3.5" aria-hidden /> کپی پرسونا
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => toggleFav(detail.id)}
                  className="ms-auto h-8 gap-1 text-zinc-400 hover:text-amber-300"
                >
                  <Star className={`h-3.5 w-3.5 ${favs.includes(detail.id) ? 'fill-amber-300 text-amber-300' : ''}`} aria-hidden />
                  منتخب
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 p-12 text-sm text-zinc-400">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> در حال بارگذاری پرسونا…
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* chat dialog */}
      {chatAgent && (
        <AgentChat
          agent={chatAgent}
          divisionLabel={divisionLabel(chatAgent.division)}
          onClose={() => setChatAgent(null)}
          onRan={onRan}
        />
      )}
    </div>
  );
}

function DivisionChip({
  active,
  label,
  count,
  color,
  onClick,
}: {
  active: boolean;
  label: string;
  count: number;
  color?: string | null;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-[11px] transition-colors ${
        active ? 'text-zinc-950' : 'border border-zinc-800 text-zinc-400 hover:text-zinc-200'
      }`}
      style={active ? { backgroundColor: color ?? '#34d399' } : undefined}
    >
      {color && !active && (
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} aria-hidden />
      )}
      {label}
      <span className={active ? 'text-zinc-800' : 'text-zinc-600'}>{count.toLocaleString('fa-IR')}</span>
    </button>
  );
}

/** One-to-one chat with a single specialist (fresh conversation per open). */
function AgentChat({
  agent,
  divisionLabel,
  onClose,
  onRan,
}: {
  agent: ClientAgent;
  divisionLabel: string;
  onClose: () => void;
  onRan: () => void;
}) {
  const { toast } = useToast();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AgencyChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const send = async () => {
    const task = input.trim();
    if (!task || busy) return;
    setBusy(true);
    setInput('');
    try {
      const res = await agencyFetch<{
        sessionId: string;
        output: string;
        messages: AgencyChatMessage[];
      }>('/api/agency/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, agentId: agent.id, task }),
      });
      setSessionId(res.sessionId);
      setMessages((prev) => [...prev, ...res.messages]);
      onRan();
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
      });
    } catch (e) {
      toast({
        title: 'اجرا ناموفق بود',
        description: e instanceof Error ? e.message : String(e),
        variant: 'destructive',
      });
    } finally {
      setBusy(false);
    }
  };

  const exportChat = () => {
    const md =
      `# گفتگو با ${agent.name}\n\n` +
      messages
        .map((m) => `**${m.role === 'user' ? 'من' : m.agentName ?? agent.name}:**\n\n${m.content}\n`)
        .join('\n---\n\n');
    downloadMarkdown(`chat-${agent.id}.md`, md);
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="flex h-[85vh] max-w-2xl flex-col gap-0 overflow-hidden border-zinc-800 bg-zinc-900 p-0 text-zinc-100 [direction:rtl]">
        <DialogHeader className="border-b border-zinc-800 p-4 pe-11 text-start">
          <DialogTitle className="flex items-center gap-2 text-sm font-bold">
            <Sparkles className="h-4 w-4 text-emerald-400" aria-hidden />
            گفتگو با {agent.name}
          </DialogTitle>
          <DialogDescription className="text-[11px] text-zinc-500">{divisionLabel}</DialogDescription>
        </DialogHeader>

        <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto p-4">
          {messages.length === 0 && !busy && (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
              <Bot className="h-8 w-8 text-zinc-700" aria-hidden />
              <p className="max-w-xs text-xs leading-5 text-zinc-500">
                تسک یا سؤالت را بنویس — {agent.name} با پرسونای تخصصی خودش جواب می‌دهد.
              </p>
            </div>
          )}
          <div className="space-y-4">
            {messages.map((m) =>
              m.role === 'user' ? (
                <div key={m.id} className="flex justify-start">
                  <div className="max-w-[85%] rounded-2xl rounded-ss-md bg-emerald-600/90 px-3.5 py-2.5 text-xs leading-5 text-white">
                    {m.content}
                  </div>
                </div>
              ) : (
                <div key={m.id} className="flex justify-end">
                  <div className="max-w-[92%] rounded-2xl rounded-se-md border border-zinc-800 bg-zinc-800/60 px-3.5 py-2.5">
                    <p className="mb-1 text-[10px] font-bold text-emerald-400">{m.agentName ?? agent.name}</p>
                    <div className="whitespace-pre-wrap break-words text-xs leading-5 text-zinc-200">{m.content}</div>
                  </div>
                </div>
              )
            )}
            {busy && (
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                {agent.name} در حال فکر کردن است…
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-zinc-800 p-3">
          <div className="flex items-end gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) send();
              }}
              placeholder="تسک یا سؤال… (Ctrl+Enter برای ارسال)"
              aria-label="متن پیام"
              rows={2}
              className="min-h-[44px] resize-none border-zinc-700 bg-zinc-800/60 text-xs"
            />
            <Button
              onClick={send}
              disabled={!input.trim() || busy}
              size="icon"
              aria-label="ارسال"
              className="h-11 w-11 shrink-0 bg-emerald-600 text-white hover:bg-emerald-500"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Send className="h-4 w-4" aria-hidden />}
            </Button>
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-600">
            <span>هر گفتگو در «تاریخچه» ذخیره می‌شود</span>
            {messages.length > 0 && (
              <button onClick={exportChat} className="flex items-center gap-1 transition-colors hover:text-zinc-300">
                <Download className="h-3 w-3" aria-hidden /> خروجی Markdown
              </button>
            )}
          </div>
        </div>

        {/* a11y close (DialogContent's built-in X is visually positioned by shadcn) */}
        <button onClick={onClose} className="sr-only">
          <X /> بستن
        </button>
      </DialogContent>
    </Dialog>
  );
}
