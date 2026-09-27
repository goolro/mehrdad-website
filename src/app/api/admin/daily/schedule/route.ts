import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkAdmin } from '@/lib/admin';
import { tehranSlotToUtc } from '@/lib/daily';

export const dynamic = 'force-dynamic';

/**
 * AUTO-SCHEDULE — the staggered publishing mechanism the owner asked for
 * (never dump N ready articles at once). Complete drafts (all required
 * fields filled — the same set the create endpoint demands) are queued
 * into the next free PUBLICATION SLOTS:
 *
 *   Tehran 10:00 and 18:00, every day (2 slots/day — deliberately
 *   conservative so Google never sees a bulk-publish spike).
 *
 * Each queued draft gets publishAt = its slot and flips to published —
 * it stays HIDDEN until the slot passes (visibility is gated by
 * isArticleLive on the public pages) and then goes live by itself via
 * ISR. Slots already occupied by another article are skipped. The `day`
 * field is re-derived from the slot so the index groups it correctly.
 */

const SLOTS: { hour: number; minute: number }[] = [
  { hour: 10, minute: 0 }, // 10:00 Tehran = 06:30 UTC
  { hour: 18, minute: 0 }, // 18:00 Tehran = 14:30 UTC
];

const MAX_DAYS_AHEAD = 30;
const MIN_LEAD_MINUTES = 30; // never slot an article less than 30 min from now

/** Tehran calendar day 'YYYY-MM-DD' for a moment */
function tehranDay(d: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tehran' }).format(d);
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

    // 2) already-taken future slots (minute-precision keys)
    const takenRows = await db.dailyArticle.findMany({
      where: { publishAt: { gte: new Date() } },
      select: { publishAt: true },
    });
    const taken = new Set(
      takenRows.filter((r) => r.publishAt).map((r) => Math.floor(r.publishAt!.getTime() / 60_000))
    );

    // 3) walk the slot grid forward, skipping occupied slots
    const now = Date.now();
    const assignments: { id: string; slug: string; publishAt: Date; day: string }[] = [];
    for (let dayOffset = 0; dayOffset <= MAX_DAYS_AHEAD && assignments.length < ready.length; dayOffset++) {
      for (const s of SLOTS) {
        if (assignments.length >= ready.length) break;
        const slot = tehranSlotToUtc(new Date(now), dayOffset, s.hour, s.minute);
        if (!slot) continue;
        if (slot.getTime() < now + MIN_LEAD_MINUTES * 60_000) continue;
        if (taken.has(Math.floor(slot.getTime() / 60_000))) continue;
        const draft = ready[assignments.length];
        taken.add(Math.floor(slot.getTime() / 60_000)); // no double-booking within this pass
        assignments.push({ id: draft.id, slug: draft.slug, publishAt: slot, day: tehranDay(slot) });
      }
    }

    if (assignments.length === 0) {
      return NextResponse.json({
        ok: true,
        scheduled: 0,
        note: 'no complete drafts or no free slots in the window',
      });
    }

    // 4) persist — one update per queued article
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
