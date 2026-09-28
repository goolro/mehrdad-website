import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkAdmin } from '@/lib/admin';
import {
  ensureBriefTables,
  isBriefCategory,
  scanSources,
  aiFilterHeadings,
  aiGenerateBrief,
  renderBriefMarkdown,
} from '@/lib/brief';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

/** list saved briefs (newest first) */
export async function GET(req: NextRequest) {
  const denied = checkAdmin(req);
  if (denied) return denied;
  await ensureBriefTables();
  const items = await db.brief.findMany({ orderBy: { createdAt: 'desc' }, take: 60 });
  return NextResponse.json({
    items: items.map((b) => ({
      id: b.id,
      topic: b.topic,
      category: b.category,
      status: b.status,
      sourceCount: b.sourceCount,
      h2Count: (JSON.parse(b.structure || '{}') as { h2?: unknown[] }).h2?.length ?? 0,
      createdAt: b.createdAt,
    })),
  });
}

/**
 * Stages 3 + 4 — AI filter of the cached scans, then the owner's
 * «نیازمندی محتوا» prompt produces the structured brief. Saved as a Brief row
 * and returned fully rendered (structure JSON + markdown).
 */
export async function POST(req: NextRequest) {
  const denied = checkAdmin(req);
  if (denied) return denied;
  try {
    await ensureBriefTables();
    const b = await req.json();
    const topic = String(b.topic || '').trim().slice(0, 200);
    const category = isBriefCategory(b.category) ? b.category : 'product';
    if (!topic) return NextResponse.json({ error: 'topic is required' }, { status: 400 });

    const scans = await scanSources({ category });
    const usable = scans.filter((s) => s.ok && s.headings.length > 0);
    if (!usable.length) {
      return NextResponse.json(
        { error: 'هیچ منبع فعالی قابل اسکن نبود — اول اسکن را بررسی کنید یا منابع فعال‌تر اضافه کنید' },
        { status: 502 }
      );
    }

    const filter = await aiFilterHeadings(topic, category, scans);
    const structure = await aiGenerateBrief(topic, category, filter, scans);
    const briefMd = renderBriefMarkdown(topic, category, structure, filter, scans);

    const row = await db.brief.create({
      data: {
        topic,
        category,
        filtered: JSON.stringify(filter),
        structure: JSON.stringify(structure),
        briefMd,
        sourceCount: usable.length,
      },
    });

    return NextResponse.json({
      ok: true,
      brief: {
        id: row.id,
        topic,
        category,
        structure,
        filtered: filter,
        briefMd,
        sourceCount: usable.length,
        scanned: scans.length,
        failedSources: scans.filter((s) => !s.ok).map((s) => ({ name: s.name, error: s.error })),
      },
    });
  } catch (e) {
    console.error('brief generate error:', e);
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Brief generation failed' }, { status: 500 });
  }
}
