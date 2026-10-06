'use client';

/**
 * Agency panel — the private standalone workspace (Task 54).
 *
 * Owner-only overlay at /agency: browse the 267-agent library from
 * msitarzewski/agency-agents, chat with any specialist, run team runbooks,
 * and revisit history. Auth reuses the site's admin session (same
 * ADMIN_PASSWORD + HMAC cookie) — no separate account system.
 */
import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import {
  Bot,
  Building2,
  Compass,
  History,
  Home,
  KeyRound,
  LayoutDashboard,
  Loader2,
  LogOut,
  Sparkles,
  Star,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { AgencyAgents } from '@/components/agency/AgencyAgents';
import { AgencyDivisions } from '@/components/agency/AgencyDivisions';
import { AgencyTeam } from '@/components/agency/AgencyTeam';
import { AgencyHistory } from '@/components/agency/AgencyHistory';
import { AgencyGuide } from '@/components/agency/AgencyGuide';
import { DIVISION_ICONS } from '@/components/agency/division-icons';
import {
  agencyFetch,
  readFavorites,
  relativeFa,
  type RosterPayload,
  type SessionSummary,
} from '@/components/agency/agency-client';

type Tab = 'divisions' | 'dashboard' | 'agents' | 'team' | 'history' | 'guide';

const TABS: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'divisions', label: 'دپارتمان‌ها', icon: Building2 },
  { id: 'dashboard', label: 'داشبورد', icon: LayoutDashboard },
  { id: 'agents', label: 'ایجنت‌ها', icon: Bot },
  { id: 'team', label: 'اجرای تیمی', icon: Users },
  { id: 'history', label: 'تاریخچه', icon: History },
  { id: 'guide', label: 'راهنما', icon: Compass },
];

export function AgencyPanel() {
  const router = useRouter();
  const { toast } = useToast();
  // portal target: the root layout wraps page content in a z-indexed wrapper
  // (footer is a z-10 sibling), which would trap a fixed overlay inside its
  // stacking context — mounting through document.body escapes that entirely
  // false during SSR/hydration, true on every client render afterwards —
  // replaces the old setState-in-effect mount flag (lint: cascading renders)
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const [authState, setAuthState] = useState<'checking' | 'login' | 'ready' | 'unconfigured'>('checking');
  const [password, setPassword] = useState('');
  const [loginBusy, setLoginBusy] = useState(false);
  const [loginError, setLoginError] = useState('');

  const [roster, setRoster] = useState<RosterPayload | null>(null);
  const [tab, setTab] = useState<Tab>('divisions');
  const [divisionSel, setDivisionSel] = useState<string | null>(null);
  const [sessions, setSessions] = useState<SessionSummary[]>([]);

  // ── auth ────────────────────────────────────────────────────────────────
  useEffect(() => {
    agencyFetch<{ ok: boolean }>('/api/admin/auth')
      .then(() => setAuthState('ready'))
      .catch((e: Error) => setAuthState(e.message === 'UNAUTHORIZED' ? 'login' : 'unconfigured'));
  }, []);

  const loadRoster = useCallback(() => {
    agencyFetch<RosterPayload>('/api/agency/roster')
      .then(setRoster)
      .catch((e: Error) => {
        if (e.message === 'UNAUTHORIZED') setAuthState('login');
        else toast({ title: 'خطا در دریافت فهرست ایجنت‌ها', description: e.message, variant: 'destructive' });
      });
  }, [toast]);

  const loadSessions = useCallback(() => {
    agencyFetch<{ sessions: SessionSummary[] }>('/api/agency/sessions')
      .then((d) => setSessions(d.sessions))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (authState !== 'ready') return;
    loadRoster();
    loadSessions();
  }, [authState, loadRoster, loadSessions]);

  const login = async () => {
    if (!password || loginBusy) return;
    setLoginBusy(true);
    setLoginError('');
    try {
      await agencyFetch<{ ok: boolean }>('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      setPassword('');
      setAuthState('ready');
    } catch (e) {
      setLoginError(e instanceof Error && e.message !== 'UNAUTHORIZED' ? e.message : 'رمز اشتباه است');
    } finally {
      setLoginBusy(false);
    }
  };

  const logout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE', credentials: 'same-origin' }).catch(() => {});
    setAuthState('login');
    setRoster(null);
  };

  // ── login screen ────────────────────────────────────────────────────────
  if (!mounted) return null;
  if (authState !== 'ready') {
    return createPortal(
      <div
        dir="rtl"
        className="fixed inset-0 z-[90] flex items-center justify-center bg-zinc-950 text-zinc-100"
        style={{ fontFamily: 'var(--font-vazirmatn), sans-serif' }}
      >
        <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 shadow-2xl">
          <div className="mb-5 flex flex-col items-center gap-3 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 ring-1 ring-emerald-500/30">
              <Bot className="h-7 w-7 text-emerald-400" aria-hidden />
            </div>
            <div>
              <h1 className="text-lg font-bold">پنل آژانس</h1>
              <p className="mt-1 text-xs text-zinc-400">
                دسترسی خصوصی — همان رمز پنل مدیریت سایت
              </p>
            </div>
          </div>

          {authState === 'checking' && (
            <div className="flex items-center justify-center gap-2 py-6 text-sm text-zinc-400">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> در حال بررسی دسترسی…
            </div>
          )}

          {authState === 'unconfigured' && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-center text-xs leading-5 text-amber-300">
              احراز هویت روی این سرور تنظیم نشده است (متغیر محیطی ADMIN_PASSWORD خالی است).
            </div>
          )}

          {authState === 'login' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                login();
              }}
              className="space-y-3"
            >
              <div className="relative">
                <KeyRound
                  className="absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
                  aria-hidden
                />
                <Input
                  type="password"
                  dir="ltr"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  aria-label="رمز ورود"
                  className="h-11 border-zinc-700 bg-zinc-800/60 pe-10 text-start"
                />
              </div>
              {loginError && <p className="text-xs text-red-400">{loginError}</p>}
              <Button
                type="submit"
                disabled={!password || loginBusy}
                className="h-11 w-full bg-emerald-600 text-white hover:bg-emerald-500"
              >
                {loginBusy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : 'ورود به پنل'}
              </Button>
            </form>
          )}

          <button
            onClick={() => router.push('/')}
            className="mt-4 flex w-full items-center justify-center gap-1 text-xs text-zinc-500 transition-colors hover:text-zinc-300"
          >
            <Home className="h-3.5 w-3.5" aria-hidden /> بازگشت به سایت
          </button>
        </div>
      </div>,
      document.body
    );
  }

  // ── main panel ──────────────────────────────────────────────────────────
  return createPortal(
    <div
      dir="rtl"
      className="fixed inset-0 z-[90] flex flex-col overflow-hidden bg-zinc-950 text-zinc-100"
      style={{ fontFamily: 'var(--font-vazirmatn), sans-serif' }}
    >
      {/* header */}
      <header className="flex items-center gap-3 border-b border-zinc-800 bg-zinc-900/60 px-4 py-3 backdrop-blur">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 ring-1 ring-emerald-500/30">
          <Bot className="h-5 w-5 text-emerald-400" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-sm font-bold leading-5">پنل آژانس</h1>
          <p className="truncate text-[11px] text-zinc-500">
            {roster
              ? `${toFa(roster.stats.agentCount)} ایجنت تخصصی از ${roster.stats.source}`
              : 'در حال بارگذاری کتابخانه…'}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/')}
          aria-label="بازگشت به سایت"
          className="h-9 w-9 text-zinc-400 hover:text-zinc-100"
        >
          <Home className="h-4 w-4" aria-hidden />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={logout}
          aria-label="خروج"
          className="h-9 w-9 text-zinc-400 hover:text-zinc-100"
        >
          <LogOut className="h-4 w-4" aria-hidden />
        </Button>
      </header>

      {/* tabs */}
      <nav
        aria-label="بخش‌های پنل"
        className="flex items-center gap-1 overflow-x-auto border-b border-zinc-800 bg-zinc-900/40 px-3 py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => {
                // the divisions tab is the boxes grid — a fresh click must
                // not re-open the last-visited division page (Task 55 QA)
                if (t.id === 'divisions') setDivisionSel(null);
                setTab(t.id);
              }}
              aria-current={active ? 'page' : undefined}
              className={`flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-3 text-xs font-medium transition-colors ${
                active
                  ? 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30'
                  : 'text-zinc-400 hover:bg-zinc-800/70 hover:text-zinc-200'
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden />
              {t.label}
            </button>
          );
        })}
      </nav>

      {/* body */}
      <main className="min-h-0 flex-1 overflow-y-auto">
        {!roster ? (
          <div className="mx-auto grid max-w-4xl gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl bg-zinc-800/60" />
            ))}
          </div>
        ) : tab === 'divisions' ? (
          <AgencyDivisions
            roster={roster}
            onRan={loadSessions}
            selected={divisionSel}
            onSelect={setDivisionSel}
          />
        ) : tab === 'dashboard' ? (
          <Dashboard
            roster={roster}
            sessions={sessions}
            onGoTab={setTab}
            onOpenDivision={(id) => {
              setDivisionSel(id);
              setTab('divisions');
            }}
            onOpenSession={(s) => {
              setTab('history');
            }}
          />
        ) : tab === 'agents' ? (
          <AgencyAgents roster={roster} onRan={loadSessions} />
        ) : tab === 'team' ? (
          <AgencyTeam roster={roster} onRan={loadSessions} />
        ) : tab === 'history' ? (
          <AgencyHistory sessions={sessions} onChanged={loadSessions} />
        ) : (
          <AgencyGuide roster={roster} />
        )}
      </main>
    </div>,
    document.body
  );
}

function Dashboard({
  roster,
  sessions,
  onGoTab,
  onOpenDivision,
}: {
  roster: RosterPayload;
  sessions: SessionSummary[];
  onGoTab: (t: Tab) => void;
  onOpenDivision: (divisionId: string) => void;
  onOpenSession: (s: SessionSummary) => void;
}) {
  const favs = readFavorites();
  const favAgents = roster.agents.filter((a) => favs.includes(a.id));
  const topDivisions = [...roster.divisions].sort((a, b) => b.count - a.count).slice(0, 8);

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      {/* stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={Bot} label="ایجنت تخصصی" value={toFa(roster.stats.agentCount)} tint="text-emerald-400" />
        <StatCard icon={Building2} label="دپارتمان" value={toFa(roster.stats.divisionCount)} tint="text-sky-300" />
        <StatCard icon={Users} label="ران‌بوک تیمی" value={toFa(roster.stats.runbookCount)} tint="text-amber-300" />
        <StatCard
          icon={History}
          label="گفتگوی من"
          value={toFa(sessions.length)}
          tint="text-fuchsia-300"
          onClick={() => onGoTab('history')}
        />
      </div>

      {/* favorites */}
      <section aria-label="ایجنت‌های منتخب">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-bold">
          <Star className="h-4 w-4 text-amber-300" aria-hidden /> منتخب‌های من
        </h2>
        {favAgents.length === 0 ? (
          <p className="rounded-xl border border-dashed border-zinc-800 p-4 text-xs leading-5 text-zinc-500">
            هنوز ایجنتی را منتخب نکرده‌اید. در بخش «ایجنت‌ها» روی ستارهٔ هر ایجنت بزنید تا اینجا
            میان‌بر بسازد.
          </p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {favAgents.slice(0, 6).map((a) => (
              <button
                key={a.id}
                onClick={() => onGoTab('agents')}
                className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 text-start transition-colors hover:border-emerald-500/40"
              >
                <p className="text-xs font-bold">{a.name}</p>
                <p className="mt-1 line-clamp-1 text-[11px] text-zinc-500">{a.description}</p>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* divisions overview — mini boxes open the dedicated division page */}
      <section aria-label="دپارتمان‌ها">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-bold">
          <Sparkles className="h-4 w-4 text-emerald-400" aria-hidden /> دپارتمان‌های پرتعداد
        </h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {topDivisions.map((d) => {
            const Icon = (d.icon && DIVISION_ICONS[d.icon]) || Bot;
            const color = d.color ?? '#34d399';
            return (
              <button
                key={d.id}
                onClick={() => onOpenDivision(d.id)}
                className="flex items-center gap-2.5 rounded-xl border bg-zinc-900/60 p-3 text-start transition-colors hover:-translate-y-0.5"
                style={{ borderColor: `${color}45` }}
              >
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${color}1f` }}
                >
                  <Icon className="h-5 w-5" style={{ color }} aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[11px] font-bold">{d.label}</span>
                  <span className="block text-[10px] text-zinc-500">
                    {d.count.toLocaleString('fa-IR')} ایجنت
                  </span>
                </span>
              </button>
            );
          })}
        </div>
        <button
          onClick={() => onGoTab('divisions')}
          className="mt-2 text-[11px] font-medium text-emerald-400 transition-colors hover:text-emerald-300"
        >
          مشاهده همه دپارتمان‌ها ←
        </button>
      </section>

      {/* recent sessions */}
      {sessions.length > 0 && (
        <section aria-label="آخرین گفتگوها">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold">
            <History className="h-4 w-4 text-fuchsia-300" aria-hidden /> آخرین کارها
          </h2>
          <div className="space-y-2">
            {sessions.slice(0, 4).map((s) => (
              <button
                key={s.id}
                onClick={() => onGoTab('history')}
                className="flex w-full items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 text-start transition-colors hover:border-emerald-500/40"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold">{s.title}</p>
                  <p className="mt-0.5 truncate text-[11px] text-zinc-500">{s.preview}</p>
                </div>
                <span className="shrink-0 text-[10px] text-zinc-600">{relativeFa(s.updatedAt)}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      <p className="pb-4 text-center text-[10px] leading-5 text-zinc-600">
        کتابخانهٔ ایجنت‌ها از پروژهٔ متن‌باز The Agency (msitarzewski/agency-agents، مجوز MIT) —
        آخرین به‌روزرسانی:{' '}
        {roster.stats.generatedAt ? new Date(roster.stats.generatedAt).toLocaleDateString('fa-IR') : '—'}
      </p>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  tint,
  onClick,
}: {
  icon: typeof Bot;
  label: string;
  value: string;
  tint: string;
  onClick?: () => void;
}) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      onClick={onClick}
      className={`flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 text-start ${
        onClick ? 'transition-colors hover:border-emerald-500/40' : ''
      }`}
    >
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-800/80`}>
        <Icon className={`h-5 w-5 ${tint}`} aria-hidden />
      </div>
      <div className="min-w-0">
        <p className="text-lg font-black leading-6">{value}</p>
        <p className="truncate text-[11px] text-zinc-500">{label}</p>
      </div>
    </Tag>
  );
}

const FA_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
function toFa(n: number): string {
  return String(n).replace(/\d/g, (d) => FA_DIGITS[Number(d)]);
}
