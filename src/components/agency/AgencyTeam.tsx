'use client';

/**
 * Team tab — run one brief through a squad of specialists (a repo runbook
 * like startup-mvp, or a hand-picked team). Runs go one-by-one through
 * /api/agency/run (team:true) into a single 'team' session so the whole
 * briefing lands in history and can be exported as Markdown.
 */
import { useMemo, useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  Download,
  Loader2,
  Play,
  Search,
  Users,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import {
  agencyFetch,
  downloadMarkdown,
  type ClientAgent,
  type RosterPayload,
} from '@/components/agency/agency-client';

const MAX_TEAM = 8;

type RunState = 'pending' | 'running' | 'done' | 'error';

interface SquadItem {
  agent: ClientAgent;
  state: RunState;
  output?: string;
}

export function AgencyTeam({ roster, onRan }: { roster: RosterPayload; onRan: () => void }) {
  const { toast } = useToast();
  const [runbookSlug, setRunbookSlug] = useState<string | null>(null);
  const [activeGroup, setActiveGroup] = useState<number>(0);
  const [customPicks, setCustomPicks] = useState<ClientAgent[]>([]);
  const [pickQuery, setPickQuery] = useState('');
  const [task, setTask] = useState('');
  const [items, setItems] = useState<SquadItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [runTitle, setRunTitle] = useState('');

  const runbook = roster.runbooks.find((r) => r.slug === runbookSlug) ?? null;

  const squad: ClientAgent[] = useMemo(() => {
    if (runbook) {
      const ids = runbook.groups[activeGroup]?.agents ?? [];
      return ids
        .map((id) => roster.agents.find((a) => a.id === id))
        .filter((a): a is ClientAgent => !!a)
        .slice(0, MAX_TEAM);
    }
    return customPicks;
  }, [runbook, activeGroup, customPicks, roster.agents]);

  const pickResults = useMemo(() => {
    const q = pickQuery.trim().toLowerCase();
    if (!q) return [];
    return roster.agents
      .filter(
        (a) =>
          !customPicks.some((p) => p.id === a.id) &&
          (a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q))
      )
      .slice(0, 6);
  }, [pickQuery, roster.agents, customPicks]);

  const selectRunbook = (slug: string | null) => {
    setRunbookSlug(slug);
    setActiveGroup(0);
    setItems([]);
    setSessionId(null);
  };

  const run = async () => {
    const brief = task.trim();
    if (!brief || busy || squad.length === 0) return;
    setBusy(true);
    setRunTitle(brief.slice(0, 80) + (brief.length > 80 ? '…' : ''));
    setItems(squad.map((a) => ({ agent: a, state: 'pending' })));
    let sid = sessionId;

    for (let i = 0; i < squad.length; i++) {
      setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, state: 'running' } : it)));
      try {
        const res = await agencyFetch<{ sessionId: string; output: string }>('/api/agency/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: sid,
            agentId: squad[i].id,
            task: brief,
            team: true,
            runbook: runbook?.slug ?? null,
          }),
        });
        sid = res.sessionId;
        setSessionId(sid);
        setItems((prev) =>
          prev.map((it, idx) => (idx === i ? { ...it, state: 'done', output: res.output } : it))
        );
      } catch (e) {
        setItems((prev) =>
          prev.map((it, idx) =>
            idx === i
              ? { ...it, state: 'error', output: e instanceof Error ? e.message : String(e) }
              : it
          )
        );
      }
    }

    setBusy(false);
    onRan();
    toast({ title: 'اجرای تیمی تمام شد', description: 'نتیجه‌ها همین‌جاست و در تاریخچه ذخیره شد' });
  };

  const exportRun = () => {
    const md =
      `# اجرای تیمی — ${runbook?.title ?? 'تیم دستی'}\n\n**تسک:** ${runTitle}\n\n` +
      items
        .map(
          (it) =>
            `## ${it.agent.name} (${it.agent.id})\n\n${
              it.state === 'error' ? `⚠️ خطا: ${it.output}` : it.output
            }`
        )
        .join('\n\n---\n\n');
    downloadMarkdown(`team-${runbook?.slug ?? 'custom'}.md`, md);
  };

  return (
    <div className="mx-auto grid h-full max-w-6xl gap-4 overflow-y-auto p-4 sm:p-6 lg:grid-cols-[320px_1fr]">
      {/* left: squad config */}
      <div className="space-y-4">
        <section aria-label="روش انتخاب تیم">
          <h2 className="mb-2 flex items-center gap-2 text-sm font-bold">
            <Users className="h-4 w-4 text-amber-300" aria-hidden /> انتخاب تیم
          </h2>
          <div className="space-y-2">
            {roster.runbooks.map((r) => (
              <button
                key={r.slug}
                onClick={() => selectRunbook(r.slug)}
                aria-pressed={runbookSlug === r.slug}
                className={`w-full rounded-xl border p-3 text-start transition-colors ${
                  runbookSlug === r.slug
                    ? 'border-amber-500/50 bg-amber-500/10'
                    : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
                }`}
              >
                <p className="text-xs font-bold">{r.title}</p>
                <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-zinc-500">{r.summary}</p>
                <p className="mt-1.5 text-[10px] text-zinc-600">
                  {r.mode ?? ''} {r.duration ? `· ${r.duration}` : ''}
                </p>
              </button>
            ))}
            <button
              onClick={() => selectRunbook(null)}
              aria-pressed={runbookSlug === null}
              className={`w-full rounded-xl border p-3 text-start text-xs font-bold transition-colors ${
                runbookSlug === null
                  ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300'
                  : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
              }`}
            >
              انتخاب دستی ایجنت‌ها
            </button>
          </div>
        </section>

        {/* runbook groups */}
        {runbook && (
          <section aria-label="گروه‌های ران‌بوک">
            <p className="mb-2 text-[11px] text-zinc-500">گروه اجرایی:</p>
            <div className="space-y-1.5">
              {runbook.groups.map((g, gi) => (
                <button
                  key={g.group}
                  onClick={() => setActiveGroup(gi)}
                  aria-pressed={activeGroup === gi}
                  className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-[11px] transition-colors ${
                    activeGroup === gi
                      ? 'border-amber-500/40 bg-amber-500/10 text-amber-200'
                      : 'border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <span>{g.group}</span>
                  <span className="text-zinc-600">
                    {g.agents.length.toLocaleString('fa-IR')} ایجنت
                    {g.activation ? ` · ${g.activation}` : ''}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* custom picks */}
        {!runbook && (
          <section aria-label="انتخاب دستی">
            <div className="relative">
              <Search className="absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" aria-hidden />
              <input
                value={pickQuery}
                onChange={(e) => setPickQuery(e.target.value)}
                placeholder="افزودن ایجنت به تیم…"
                aria-label="جستجوی ایجنت برای افزودن"
                className="h-10 w-full rounded-md border border-zinc-800 bg-zinc-900/70 pe-10 ps-3 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
              />
            </div>
            {pickResults.length > 0 && (
              <div className="mt-2 space-y-1 rounded-lg border border-zinc-800 bg-zinc-900 p-1.5">
                {pickResults.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => {
                      if (customPicks.length >= MAX_TEAM) {
                        toast({ title: `حداکثر ${MAX_TEAM} ایجنت`, variant: 'destructive' });
                        return;
                      }
                      setCustomPicks((p) => [...p, a]);
                      setPickQuery('');
                    }}
                    className="block w-full rounded-md px-2 py-1.5 text-start text-[11px] transition-colors hover:bg-zinc-800"
                  >
                    <span className="font-bold">{a.name}</span>
                    <span className="ms-2 text-zinc-600">{a.id}</span>
                  </button>
                ))}
              </div>
            )}
            {customPicks.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {customPicks.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setCustomPicks((prev) => prev.filter((x) => x.id !== p.id))}
                    className="flex items-center gap-1 rounded-full bg-emerald-500/10 py-1 pe-1 ps-3 text-[11px] text-emerald-300 ring-1 ring-emerald-500/30"
                  >
                    {p.name}
                    <XCircle className="h-3.5 w-3.5" aria-hidden />
                  </button>
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      {/* right: brief + results */}
      <div className="flex min-h-0 flex-col gap-3">
        <section aria-label="تسک تیم">
          <Textarea
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="تسک یا چالش را برای تیم توضیح بده — هر ایجنت از دید تخصص خودش جواب می‌دهد…"
            aria-label="تسک تیم"
            rows={4}
            className="resize-none border-zinc-800 bg-zinc-900/70 text-xs"
          />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Button
              onClick={run}
              disabled={!task.trim() || busy || squad.length === 0}
              className="h-10 gap-2 bg-emerald-600 text-white hover:bg-emerald-500"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Play className="h-4 w-4" aria-hidden />}
              اجرای تیمی
              <Badge variant="outline" className="border-emerald-400/30 px-1.5 text-[10px] text-emerald-200">
                {squad.length.toLocaleString('fa-IR')} ایجنت
              </Badge>
            </Button>
            {items.length > 0 && !busy && (
              <Button
                variant="outline"
                onClick={exportRun}
                className="h-10 gap-1.5 border-zinc-700 bg-transparent text-xs text-zinc-300 hover:bg-zinc-800"
              >
                <Download className="h-4 w-4" aria-hidden /> خروجی Markdown
              </Button>
            )}
          </div>
        </section>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-800 p-8 text-center">
            <Users className="h-8 w-8 text-zinc-700" aria-hidden />
            <p className="max-w-sm text-xs leading-5 text-zinc-500">
              یک ران‌بوک (مثل «Startup MVP Build») یا تیم دلخواه انتخاب کن، تسک را بنویس و اجرای
              تیمی را بزن — جواب هر متخصص اینجا پشت‌سرهم ظاهر می‌شود.
            </p>
          </div>
        ) : (
          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
            {items.map((it, i) => (
              <RunRow key={it.agent.id} index={i} item={it} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function RunRow({ index, item }: { index: number; item: SquadItem }) {
  const [open, setOpen] = useState(false);
  const done = item.state === 'done';
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/80">
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={!item.output}
        aria-expanded={open}
        className="flex w-full items-center gap-2.5 p-3 text-start disabled:cursor-default"
      >
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-[10px] text-zinc-400">
          {(index + 1).toLocaleString('fa-IR', { useGrouping: false })}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-xs font-bold">{item.agent.name}</span>
          <span className="block truncate text-[10px] text-zinc-600">{item.agent.id}</span>
        </span>
        {item.state === 'running' && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-emerald-400" aria-hidden />}
        {item.state === 'pending' && <span className="h-2 w-2 shrink-0 rounded-full bg-zinc-700" aria-hidden />}
        {done && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden />}
        {item.state === 'error' && <XCircle className="h-4 w-4 shrink-0 text-red-400" aria-hidden />}
        {item.output && (
          <ChevronDown className={`h-4 w-4 shrink-0 text-zinc-600 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden />
        )}
      </button>
      {open && item.output && (
        <ScrollArea className="max-h-72 border-t border-zinc-800">
          <div className="whitespace-pre-wrap break-words p-3 text-[11px] leading-5 text-zinc-300">
            {item.output}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
