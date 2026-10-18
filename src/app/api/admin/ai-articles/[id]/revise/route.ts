import { NextRequest, NextResponse } from 'next/server';
import { checkAdmin } from '@/lib/admin';
import { db } from '@/lib/db';
import { ensureAiArticleTable, pipelineRevise, serializeArticle } from '@/lib/ai-articles';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

/**
 * Auto-revise — the WRITER agent rewrites the piece applying both
 * reviewers' must-fix lists (bounded loop; after MAX_REVISIONS a human
 * decides). Status returns to `draft` and the piece should be re-reviewed.
 */
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const denied = checkAdmin(req);
  if (denied) return denied;
  const { id } = await ctx.params;
  try {
    await ensureAiArticleTable();
    const result = await pipelineRevise(id);
    const row = await db.aiArticle.findUnique({ where: { id } });
    return NextResponse.json({ ok: true, result, article: row ? serializeArticle(row) : null });
  } catch (e) {
    console.error(`ai-articles revise ${id} error:`, e);
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Revision failed' }, { status: 500 });
  }
}
