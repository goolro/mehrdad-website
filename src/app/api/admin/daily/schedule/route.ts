import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkAdmin } from '@/lib/admin';
import {
  randomDayCount,
  randomDaySlots,
  planDayToUtc,
  tehranDay,
} from '@/lib/daily';

export const dynamic = 'force-dynamic';

/**
 * AUTO-SCHEDULE — the staggered publishing mechanism the owner asked for
 * (never dump N ready articles at once). Complete drafts (all required
 * fields filled — the same set the create endpoint demands) are queued
 * into RANDOM publish slots.
 *
 * 2026-09-29 owner revision — the old fixed 10:00/18:00 grid is gone:
 *
 *   - HOURS are random, minute precision, inside 08:00–22:00 Tehran
 *   - the ARTICLE COUNT per day is random too — 2..5 (never more than 5)
 *     so one day carries two pieces and another four or five
 *   - slots on the same day stay at least 3 hours apart
 *   - each day's plan is generated once and persisted in SiteSetting
 *     ('dailyPublishPlan') so re-running the scheduler never reshuffles
 *     already-planned days and the cadence stays human-irregular
 *
 * Each queued draft gets publishAt = its slot and flips to published —
 * it stays HIDDEN until the slot passes (visibility is gated by
 * isArticleLive on the public pages) and then goes live by itself via
 * ISR. Slots already occupied by another article are skipped.
 */

const PLAN_KEY = 'dailyPublishPlan';
const MAX_DAYS_AHEAD = 30;
const MIN_LEAD_MINUTES = 45; // never slot an article less than 45 min from now

/** persisted day plan: { 'YYYY-MM-DD': ['HH:MM', …] } */
type DayPlan = Record<string, string[]>;

async function loadPlan(): Promise<{ plan: DayPlan; isNew: boolean }> {
  const row = await db.siteSetting.findUnique({ where: { key: PLAN_KEY } });
  if (!row) return { plan: {}, isNew: true };
  try {
    const parsed = JSON.parse(row.value);
    return parsed && typeof parsed === 'object' ? { plan: parsed as DayPlan, isNew: false } : { plan: {}, isNew: true };
  } catch {
    return { plan: {}, isNew: true };
  }
}

async function savePlan(plan: DayPlan) {
  // keep the record bounded — drop days older than yesterday
  const cutoff = tehranDay(new Date(Date.now() - 2 * 86_400_000));
  for (const day of Object.keys(plan)) {
    if (day < cutoff) delete plan[day];
  }
  const value = JSON.stringify(plan);
  await db.siteSetting.upsert({ where: { key: PLAN_KEY }, create: { key: PLAN_KEY, value }, update: { value } });
}

export async function POST(req: NextRequest) {
  const denied = checkAdmin(req);
  if (denied) return denied;
  try {
    // 1) ready drafts — complete content only; half-written pieces stay drafts
    const drafts = await db.dailyArticle.findMany({
      where: { published: false },
      orderBy: { createdAt: 'asc' },
      take: 100,
    });
    const ready = drafts.filter(
      (d) => d.titleEn && d.titleFa && d.summaryEn && d.summaryFa && d.bodyEn && d.bodyFa
    );
    if (ready.length === 0) {
      return NextResponse.json({ ok: true, scheduled: 0, note: 'no complete drafts to queue' });
    }

    // 2) already-taken future slots (minute-precision keys)
    const takenRows = await db.dailyArticle.findMany({
      where: { publishAt: { gte: new Date() } },
      select: { publishAt: true },
    });
    const taken = new Set(
      takenRows.filter((r) => r.publishAt).map((r) => Math.floor(r.publishAt!.getTime() / 60_000))
    );

    // 3) load (or lazily generate) the random plan per day
    const { plan } = await loadPlan();
    const notBefore = Date.now() + MIN_LEAD_MINUTES * 60_000;
    const assignments: { id: string; slug: string; publishAt: Date; day: string }[] = [];

    for (let offset = 0; offset <= MAX_DAYS_AHEAD && assignments.length < ready.length; offset++) {
      const day = tehranDay(new Date(Date.now() + offset * 86_400_000));
      if (!plan[day]) {
        plan[day] = randomDaySlots(randomDayCount()); // random count 2..5 + random hours
      }
      const moments = planDayToUtc(day, plan[day], notBefore);
      for (const moment of moments) {
        if (assignments.length >= ready.length) break;
        if (taken.has(Math.floor(moment.getTime() / 60_000))) continue; // slot occupied by another article
        const draft = ready[assignments.length];
        taken.add(Math.floor(moment.getTime() / 60_000)); // no double-booking within this pass
        assignments.push({ id: draft.id, slug: draft.slug, publishAt: moment, day });
      }
    }

    if (assignments.length === 0) {
      return NextResponse.json({
        ok: true,
        scheduled: 0,
        note: 'no free random slots in the window — try again later',
      });
    }

    // 4) persist plan + assignments — one update per queued article
    await savePlan(plan);
    for (const a of assignments) {
      await db.dailyArticle.update({
        where: { id: a.id },
        data: { published: true, publishAt: a.publishAt, day: a.day },
      });
    }

    // 5) rebuild the static pages once (queued items stay hidden until their
    //    slot regardless — ISR picks each one up as its slot passes)
    if (process.env.VERCEL_DEPLOY_HOOK_URL) {
      await fetch(process.env.VERCEL_DEPLOY_HOOK_URL, { method: 'POST' }).catch(() => {});
    }

    return NextResponse.json({
      ok: true,
      scheduled: assignments.length,
      slots: assignments.map((a) => ({ slug: a.slug, publishAt: a.publishAt.toISOString() })),
    });
  } catch (e) {
    console.error('admin daily schedule error:', e);
    return NextResponse.json({ error: 'Failed to schedule drafts' }, { status: 500 });
  }
}
