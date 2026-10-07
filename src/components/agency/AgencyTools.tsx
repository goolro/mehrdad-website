'use client';

/**
 * Tools tab (Task 56) — owner-facing catalog of the tools that were
 * evaluated from his 19-link list and actually installed in the sandbox,
 * plus (collapsed) the ones that were rejected and why. Data is bundled
 * at build time from src/data/tools-catalog.json via @/lib/agency/tools.
 */
import { useMemo, useState, type ReactNode } from 'react';
import {
  BookOpen,
  CheckCircle2,
  PackageOpen,
  Sparkles,
  Terminal,
  Wrench,
} from 'lucide-react';
import {
  agencyInstalledTools,
  agencyRejectedTools,
  type ToolGoal,
  type ToolKind,
} from '@/lib/agency/tools';

const GOAL_ORDER: ToolGoal[] = ['content', 'social', 'startup', 'funding', 'dev'];

const GOAL_FA: Record<ToolGoal, string> = {
  startup: 'استارتاپ',
  funding: 'سرمایه',
  content: 'محتوا',
  social: 'سوشال',
  dev: 'توسعه',
};

const GOAL_TINT: Record<ToolGoal, string> = {
  startup: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  funding: 'border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-300',
  content: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  social: 'border-sky-500/30 bg-sky-500/10 text-sky-300',
  dev: 'border-zinc-600/60 bg-zinc-800/60 text-zinc-300',
};

const KIND_META: Record<ToolKind, { fa: string; tint: string; icon: typeof Sparkles }> = {
  skills: { fa: 'بسته مهارت', tint: 'text-emerald-400 bg-emerald-500/10', icon: Sparkles },
  cli: { fa: 'خط فرمان', tint: 'text-sky-300 bg-sky-500/10', icon: Terminal },
  reference: { fa: 'مرجع', tint: 'text-amber-300 bg-amber-500/10', icon: BookOpen },
};

const FA_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
const toFa = (n: number): string => String(n).replace(/\d/g, (d) => FA_DIGITS[Number(d)]);

export function AgencyTools() {
  const installed = useMemo(() => agencyInstalledTools(), []);
  const rejected = useMemo(() => agencyRejectedTools(), []);
  const [goal, setGoal] = useState<ToolGoal | 'all'>('all');

  const visible = goal === 'all' ? installed : installed.filter((t) => t.goals.includes(goal));

  return (
    <div className="mx-auto max-w-6xl space-y-5 p-4 sm:p-6">
      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-bold">
            <Wrench className="h-4 w-4 text-emerald-400" aria-hidden /> جعبه‌ابزار
          </h2>
          <p className="mt-1 text-[11px] leading-5 text-zinc-500">
            ابزارهای بررسی‌شده و نصب‌شده روی سرور — برای برنامه‌ریزی استارتاپ، جذب سرمایه، تولید
            محتوا و شبکه‌های اجتماعی.
          </p>
        </div>
        <p className="rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-[11px] text-zinc-400">
          {toFa(installed.length)} نصب‌شده · {toFa(rejected.length)} بررسی و رد شده
        </p>
      </div>

      {/* goal filters */}
      <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="فیلتر بر اساس هدف">
        <FilterChip active={goal === 'all'} onClick={() => setGoal('all')}>
          همه
        </FilterChip>
        {GOAL_ORDER.map((g) => (
          <FilterChip key={g} active={goal === g} onClick={() => setGoal(g)}>
            {GOAL_FA[g]}
          </FilterChip>
        ))}
      </div>

      {/* tool cards */}
      {visible.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-800 p-6 text-center text-xs text-zinc-500">
          ابزاری برای این هدف ثبت نشده است.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3" role="list">
          {visible.map((t) => (
            <ToolCard key={t.id} tool={t} />
          ))}
        </div>
      )}

      {/* rejected — collapsed for transparency */}
      <details className="group rounded-2xl border border-zinc-800 bg-zinc-900/40">
        <summary className="flex cursor-pointer list-none items-center gap-2 p-4 text-xs font-medium text-zinc-400 transition-colors hover:text-zinc-200">
          <PackageOpen className="h-4 w-4 text-zinc-500" aria-hidden />
          بررسی شده ولی نصب نشده ({toFa(rejected.length)})
          <span className="ms-auto text-[10px] text-zinc-600 group-open:hidden">نمایش</span>
        </summary>
        <ul className="space-y-2 px-4 pb-4" role="list">
          {rejected.map((r) => (
            <li
              key={r.id}
              role="listitem"
              className="flex items-start gap-2 rounded-xl border border-zinc-800/70 bg-zinc-900/50 p-3"
            >
              <CheckCircle2
                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-600"
                aria-hidden
              />
              <div className="min-w-0">
                <p dir="ltr" className="text-start text-[11px] font-bold text-zinc-300">
                  {r.name}
                </p>
                <p className="mt-0.5 text-[11px] leading-5 text-zinc-500">{r.faReason}</p>
              </div>
            </li>
          ))}
        </ul>
      </details>

      <p className="pb-2 text-center text-[10px] leading-5 text-zinc-600">
        ارزیابی و نصب: {new Date(catalogDate).toLocaleDateString('fa-IR')} — مهارت‌ها داخل
        <span dir="ltr"> /home/z/agency-tools/ </span>و ابزارهای خط فرمان سراسری نصب شده‌اند.
      </p>
    </div>
  );
}

const catalogDate = '2026-10-08';

/** One installed tool card. */
function ToolCard({ tool }: { tool: ReturnType<typeof agencyInstalledTools>[number] }) {
  const kind = KIND_META[tool.kind];
  const KindIcon = kind.icon;

  return (
    <article
      role="listitem"
      className="flex min-w-0 flex-col gap-2.5 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 transition-colors hover:border-emerald-500/40"
    >
      <div className="flex items-center gap-2.5">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${kind.tint}`}>
          <KindIcon className="h-4.5 w-4.5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h3 dir="ltr" className="truncate text-start text-xs font-black text-zinc-100">
            {tool.name}
          </h3>
          <p className="truncate text-[10px] text-zinc-500">{kind.fa}</p>
        </div>
        {tool.count ? (
          <span className="shrink-0 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
            {toFa(tool.count)} مهارت
          </span>
        ) : tool.version ? (
          <span dir="ltr" className="shrink-0 rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400">
            v{tool.version}
          </span>
        ) : null}
      </div>

      <p className="text-[11px] leading-5 text-zinc-400">{tool.faDescription}</p>

      {tool.highlights.length > 0 && (
        <div className="flex flex-wrap gap-1" aria-label="نکات کلیدی">
          {tool.highlights.slice(0, 4).map((h) => (
            <span
              key={h}
              dir="ltr"
              className="rounded-md bg-zinc-800/80 px-1.5 py-0.5 text-[9px] text-zinc-400"
            >
              {h}
            </span>
          ))}
        </div>
      )}

      <code
        dir="ltr"
        className="block truncate rounded-lg border border-zinc-800 bg-zinc-950/80 px-2.5 py-1.5 text-start text-[10px] leading-4 text-emerald-200/90"
      >
        {tool.usage[0]}
      </code>

      <div className="mt-auto flex items-center justify-between gap-2 border-t border-zinc-800/70 pt-2.5">
        <div className="flex flex-wrap gap-1" aria-label="اهداف">
          {tool.goals.map((g) => (
            <span key={g} className={`rounded-full border px-2 py-0.5 text-[9px] ${GOAL_TINT[g]}`}>
              {GOAL_FA[g]}
            </span>
          ))}
        </div>
        {tool.license && (
          <span dir="ltr" className="shrink-0 text-[9px] text-zinc-600">
            {tool.license}
          </span>
        )}
      </div>
    </article>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`h-8 rounded-full border px-3 text-[11px] font-medium transition-colors ${
        active
          ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
          : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200'
      }`}
    >
      {children}
    </button>
  );
}
