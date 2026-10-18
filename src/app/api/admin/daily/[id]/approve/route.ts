import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkAdmin } from '@/lib/admin';
import { assignNextFreeSlot } from '@/lib/daily-slots';

export const dynamic = 'force-dynamic';

/**
 * The owner's APPROVE button (2026-09-30 flow: «یه تعداد مطلب بساز بعد من
 * تایید کنم بره روی سایت»). Takes ONE complete unpublished article from
 * the review queue and hands it the next free random slot from the shared
 * persisted plan (08:00–22:00 Tehran, ≥3h apart, never before +45min).
 * The piece stays hidden until its slot passes (isArticleLive gating) and
 * then goes live by itself via ISR — no bulk dumps, ever.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = checkAdmin(req);
  if (denied) return denied;
  try {
    const { id } = await params;
    const a = await db.dailyArticle.findUnique({ where: { id } });
    if (!a) return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    if (a.published && (!a.publishAt || a.publishAt.getTime() <= Date.now())) {
      return NextResponse.json({ error: 'Article is already live' }, { status: 400 });
    }
    const complete = a.titleEn && a.titleFa && a.summaryEn && a.summaryFa && a.bodyEn && a.bodyFa;
    if (!complete) {
      return NextResponse.json({ error: 'Article is incomplete — fill EN + FA fields first' }, { status: 400 });
    }

    const slot = await assignNextFreeSlot(a.id);
    if (!slot) {
      return NextResponse.json({ error: 'No free random slot in the next 30 days' }, { status: 409 });
    }

    // rebuild the static pages — the article is in the data now and ISR
    // reveals it the moment its slot passes
    if (process.env.VERCEL_DEPLOY_HOOK_URL) {
      await fetch(process.env.VERCEL_DEPLOY_HOOK_URL, { method: 'POST' }).catch(() => {});
    }
    // IndexNow deliberately NOT pinged here: the URL is not live yet and
    // must never be pushed before its slot (same rule as the index cron).

    return NextResponse.json({ ok: true, publishAt: slot.toISOString() });
  } catch (e) {
    console.error('admin daily approve error:', e);
    return NextResponse.json({ error: 'Failed to approve article' }, { status: 500 });
  }
}
