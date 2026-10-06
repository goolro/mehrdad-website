'use client';

/**
 * Divisions tab (Task 55) — the owner wanted every division as a BIG box
 * that opens its own dedicated page. Box grid (no selection) → division
 * page (selection): a colored banner + the full agents browser scoped to
 * that division (search, favorites, chat and detail dialogs all reused
 * from AgencyAgents via its controlled-division props).
 */
import { ArrowRight, Bot, Building2, Users } from 'lucide-react';
import { AgencyAgents } from '@/components/agency/AgencyAgents';
import { DIVISION_ICONS, divisionFa } from '@/components/agency/division-icons';
import type { ClientDivision, RosterPayload } from '@/components/agency/agency-client';

export function AgencyDivisions({
  roster,
  onRan,
  selected,
  onSelect,
}: {
  roster: RosterPayload;
  onRan: () => void;
  selected: string | null;
  onSelect: (divisionId: string | null) => void;
}) {
  const division =
    selected === null ? null : (roster.divisions.find((d) => d.id === selected) ?? null);

  if (division) {
    return (
      <div className="mx-auto flex h-full max-w-6xl flex-col gap-3 p-4 sm:p-6">
        <DivisionBanner division={division} onBack={() => onSelect(null)} />
        <AgencyAgents
          roster={roster}
          onRan={onRan}
          division={division.id}
          onDivisionChange={onSelect}
        />
      </div>
    );
  }

  const sorted = [...roster.divisions].sort((a, b) => b.count - a.count);

  return (
    <div className="mx-auto max-w-6xl space-y-5 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-bold">
            <Building2 className="h-4 w-4 text-emerald-400" aria-hidden /> دپارتمان‌ها
          </h2>
          <p className="mt-1 text-[11px] leading-5 text-zinc-500">
            روی هر باکس بزن تا صفحهٔ اختصاصی همان دپارتمان باز شود — ایجنت‌هایش، جستجو و گفتگو.
          </p>
        </div>
        <p className="rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-[11px] text-zinc-400">
          {sorted.length.toLocaleString('fa-IR')} دپارتمان ·{' '}
          {roster.agents.length.toLocaleString('fa-IR')} ایجنت
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" role="list">
        {sorted.map((d) => (
          <DivisionBox key={d.id} division={d} onOpen={() => onSelect(d.id)} />
        ))}
      </div>
    </div>
  );
}

/** The BIG clickable box — division color carries the accent. */
function DivisionBox({ division, onOpen }: { division: ClientDivision; onOpen: () => void }) {
  const Icon = (division.icon && DIVISION_ICONS[division.icon]) || Bot;
  const fa = divisionFa(division.id);
  const color = division.color ?? '#34d399';

  return (
    <button
      role="listitem"
      onClick={onOpen}
      aria-label={`ورود به دپارتمان ${division.label}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border bg-zinc-900/60 p-5 text-start transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60"
      style={{ borderColor: `${color}45` }}
      onMouseEnter={(e) => e.currentTarget.style.borderColor = `${color}99`}
      onMouseLeave={(e) => e.currentTarget.style.borderColor = `${color}45`}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -end-8 -top-8 h-24 w-24 rounded-full opacity-[0.07] transition-opacity group-hover:opacity-[0.16]"
        style={{ backgroundColor: color }}
      />
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-[3px]"
        style={{ backgroundColor: color, opacity: 0.55 }}
      />
      <div
        className="flex h-12 w-12 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${color}1f` }}
      >
        <Icon className="h-6 w-6" style={{ color }} aria-hidden />
      </div>
      <p className="mt-3 text-sm font-black leading-5 text-zinc-100">{division.label}</p>
      {fa && <p className="mt-0.5 text-[11px] leading-4 text-zinc-500">{fa}</p>}
      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="text-2xl font-black leading-6" style={{ color }}>
          {division.count.toLocaleString('fa-IR')}
        </span>
        <span className="text-[11px] text-zinc-500">ایجنت تخصصی</span>
      </div>
      <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-zinc-500 transition-colors group-hover:text-emerald-300">
        <Users className="h-3.5 w-3.5" aria-hidden /> ورود به دپارتمان
      </span>
    </button>
  );
}

/** Dedicated-page banner for the open division (back → boxes grid). */
function DivisionBanner({ division, onBack }: { division: ClientDivision; onBack: () => void }) {
  const Icon = (division.icon && DIVISION_ICONS[division.icon]) || Bot;
  const fa = divisionFa(division.id);
  const color = division.color ?? '#34d399';

  return (
    <div
      className="flex flex-wrap items-center gap-3 rounded-2xl border p-4"
      style={{ borderColor: `${color}45`, backgroundColor: `${color}0d` }}
    >
      <button
        onClick={onBack}
        aria-label="بازگشت به فهرست دپارتمان‌ها"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900/80 text-zinc-300 transition-colors hover:border-emerald-500/50 hover:text-emerald-300"
      >
        <ArrowRight className="h-5 w-5" aria-hidden />
      </button>
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${color}1f` }}
      >
        <Icon className="h-6 w-6" style={{ color }} aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="truncate text-sm font-black leading-5">{division.label}</h2>
        <p className="truncate text-[11px] text-zinc-500">
          {fa ? `${fa} · ` : ''}صفحهٔ اختصاصی دپارتمان — {division.count.toLocaleString('fa-IR')}{' '}
          ایجنت
        </p>
      </div>
      <button
        onClick={onBack}
        className="rounded-full border border-zinc-700 bg-zinc-900/60 px-3 py-1.5 text-[11px] text-zinc-400 transition-colors hover:text-zinc-100"
      >
        همه دپارتمان‌ها
      </button>
    </div>
  );
}
