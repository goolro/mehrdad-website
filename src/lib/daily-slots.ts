import { db } from '@/lib/db';
import { randomDayCount, randomDaySlots, planDayToUtc, tehranDay } from '@/lib/daily';

/**
 * Shared random-slot machinery (staggered publishing). Extracted from the
 * schedule route so the owner's per-article Approve button can use the
 * exact same persisted plan — one source of truth for the publish grid:
 * hours random inside 08:00–22:00 Tehran, 2..5 slots per day, ≥3h apart,
 * each day's plan generated once and persisted (SiteSetting
 * 'dailyPublishPlan') so re-runs never reshuffle history.
 */

export const PLAN_KEY = 'dailyPublishPlan';
export const MAX_DAYS_AHEAD = 30;
export const MIN_LEAD_MINUTES = 45; // never slot an article less than 45 min from now

/** persisted day plan: { 'YYYY-MM-DD': ['HH:MM', …] } */
export type DayPlan = Record<string, string[]>;

export async function loadPlan(): Promise<{ plan: DayPlan; isNew: boolean }> {
  const row = await db.siteSetting.findUnique({ where: { key: PLAN_KEY } });
  if (!row) return { plan: {}, isNew: true };
  try {
    const parsed = JSON.parse(row.value);
    return parsed && typeof parsed === 'object' ? { plan: parsed as DayPlan, isNew: false } : { plan: {}, isNew: true };
  } catch {
    return { plan: {}, isNew: true };
  }
}

export async function savePlan(plan: DayPlan) {
  // keep the record bounded — drop days older than yesterday
  const cutoff = tehranDay(new Date(Date.now() - 2 * 86_400_000));
  for (const day of Object.keys(plan)) {
    if (day < cutoff) delete plan[day];
  }
  const value = JSON.stringify(plan);
  await db.siteSetting.upsert({ where: { key: PLAN_KEY }, create: { key: PLAN_KEY, value }, update: { value } });
}

/** already-booked future slots as minute-precision keys */
export async function takenSlotKeys(): Promise<Set<number>> {
  const rows = await db.dailyArticle.findMany({
    where: { publishAt: { gte: new Date() } },
    select: { publishAt: true },
  });
  return new Set(rows.filter((r) => r.publishAt).map((r) => Math.floor(r.publishAt!.getTime() / 60_000)));
}

/**
 * The next free random slot (≥ MIN_LEAD from now) for ONE article —
 * flips it to published:true with its publishAt. Returns the moment or
 * null when the 30-day window has no free slot (caller decides what to
 * tell the owner).
 */
export async function assignNextFreeSlot(
  articleId: string,
  taken?: Set<number>
): Promise<Date | null> {
  const takenKeys = taken ?? (await takenSlotKeys());
  const { plan } = await loadPlan();
  const notBefore = Date.now() + MIN_LEAD_MINUTES * 60_000;

  for (let offset = 0; offset <= MAX_DAYS_AHEAD; offset++) {
    const day = tehranDay(new Date(Date.now() + offset * 86_400_000));
    if (!plan[day]) plan[day] = randomDaySlots(randomDayCount());
    for (const moment of planDayToUtc(day, plan[day], notBefore)) {
      const key = Math.floor(moment.getTime() / 60_000);
      if (takenKeys.has(key)) continue;
      takenKeys.add(key);
      await savePlan(plan);
      await db.dailyArticle.update({
        where: { id: articleId },
        data: { published: true, publishAt: moment, day },
      });
      return moment;
    }
  }
  return null;
}
