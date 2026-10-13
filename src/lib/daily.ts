/**
 * Shared helpers for the /daily publication — the staggered-publishing
 * mechanics (owner rule: never dump N articles at once) and the single
 * visibility definition every reader of the table must respect.
 *
 * 2026-09-29 owner revision: publish slots are no longer a fixed grid.
 * Hours are RANDOM within the daily window and each day carries a RANDOM
 * article count (2..5, never more) — a steady but human-irregular cadence
 * that never looks like a bulk-publish spike to search engines.
 */

/** visible = published AND (no slot OR slot already passed) */
export function dailyVisibleWhere(now = new Date()) {
  return {
    published: true,
    OR: [{ publishAt: null }, { publishAt: { lte: now } }],
  };
}

/** an article row is publicly visible right now? */
export function isArticleLive(a: { published: boolean; publishAt: Date | null }, now = new Date()): boolean {
  if (!a.published) return false;
  return !a.publishAt || a.publishAt.getTime() <= now.getTime();
}

// ───────────────────────── Daily categories ─────────────────────────
// The owner's lanes for the daily section. The blog daily-box and
// the /daily index tabs link straight into these.
// 2026-10-13 owner order: «قسمت لینکدین مانند استارتاپ و محصول به ان اضافه کن»
// — 'linkedin' is the fourth lane; the auto-generator keeps its own
// separate LANES list (product | ai | startup) so nothing auto-writes
// into the LinkedIn lane — that lane is fed by the owner's own daily bank.

export const DAILY_CATEGORIES = ['product', 'ai', 'startup', 'linkedin'] as const;
export type DailyCategory = (typeof DAILY_CATEGORIES)[number];

export function isDailyCategory(v: unknown): v is DailyCategory {
  return typeof v === 'string' && (DAILY_CATEGORIES as readonly string[]).includes(v);
}

// ───────────────────────── Random publish planner ─────────────────────────
// Planning rules (owner decision 2026-09-29):
//   - hours: random minute-precision slots inside the Tehran window
//   - per-day article count: random 2..5 (weighted toward 2-4), capped at 5
//   - minimum gap between two slots on the same day: 3 hours
//   - a day's plan is generated ONCE and persisted (SiteSetting) so re-running
//     the scheduler keeps the same shape instead of reshuffling history

/** publish window in Tehran wall-clock hours */
export const WINDOW_START_HOUR = 8; // 08:00 Tehran
export const WINDOW_END_HOUR = 22; // last slot ends 22:00 Tehran
export const MIN_GAP_MINUTES = 180; // 3h between slots on the same day
export const MAX_PER_DAY = 5;

/** random per-day article count — 2..5, biased toward the low end (2:30% 3:30% 4:25% 5:15%) */
export function randomDayCount(): number {
  const r = Math.random();
  if (r < 0.3) return 2;
  if (r < 0.6) return 3;
  if (r < 0.85) return 4;
  return 5;
}

/**
 * Random distinct Tehran wall-clock minutes inside [start, end) with at
 * least MIN_GAP_MINUTES between every pair. Returns sorted 'HH:MM' strings
 * (never more than the window physically allows).
 */
export function randomDaySlots(count: number, startHour = WINDOW_START_HOUR, endHour = WINDOW_END_HOUR): string[] {
  const start = startHour * 60;
  const end = endHour * 60;
  const slots: number[] = [];
  let guard = 0;
  while (slots.length < count && guard < 200) {
    guard++;
    const m = start + Math.floor(Math.random() * (end - start));
    if (slots.every((s) => Math.abs(s - m) >= MIN_GAP_MINUTES)) slots.push(m);
  }
  return slots.sort((a, b) => a - b).map((m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`);
}

/**
 * Turn a persisted day plan (['HH:MM', …]) into concrete UTC moments for
 * a given Tehran calendar day, dropping anything at or before `notBefore`.
 */
export function planDayToUtc(day: string, slots: string[], notBefore: number): Date[] {
  const [y, mo, d] = day.split('-').map(Number);
  if (!y || !mo || !d) return [];
  const out: Date[] = [];
  for (const s of slots) {
    const [h, mi] = s.split(':').map(Number);
    if (h === undefined || mi === undefined) continue;
    // Tehran fixed offset +03:30 → subtract 210 minutes from wall clock
    const total = h * 60 + mi - 210;
    const utc = new Date(Date.UTC(y, mo - 1, d, Math.floor(total / 60), total % 60, 0, 0));
    if (utc.getTime() > notBefore) out.push(utc);
  }
  return out.sort((a, b) => a.getTime() - b.getTime());
}

/** Tehran calendar day 'YYYY-MM-DD' for a moment */
export function tehranDay(d: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tehran' }).format(d);
}

/**
 * Tehran fixed offset is +03:30 (DST abolished 2022). Convert a Tehran
 * wall-clock (h, m) on the Tehran calendar day of `base` + `dayOffset`
 * into the exact UTC instant. Returns null when the day arithmetic fails.
 * (Still exported for the admin manual-slot path.)
 */
export function tehranSlotToUtc(base: Date, dayOffset: number, hour: number, minute: number): Date | null {
  const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tehran' });
  const tehranDay = fmt.format(new Date(base.getTime() + dayOffset * 86_400_000)); // 'YYYY-MM-DD'
  const [y, mo, d] = tehranDay.split('-').map(Number);
  if (!y || !mo || !d) return null;
  const totalMinutes = hour * 60 + minute - 210; // Tehran = UTC + 3:30
  const utcHour = Math.floor(totalMinutes / 60);
  const utcMinute = totalMinutes % 60;
  return new Date(Date.UTC(y, mo - 1, d, utcHour, utcMinute, 0, 0));
}
