import { NextRequest, NextResponse } from 'next/server';
import { checkAdmin } from '@/lib/admin';
import { db } from '@/lib/db';
import { ensureAiArticleTable, pipelineReview, serializeArticle } from '@/lib/ai-articles';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

/**
 * Pipeline steps 2 + 3 — the SEO AUDITOR (AI 2) and the EDITOR-IN-CHIEF
 * (AI 3) review the piece in parallel, double-blind. Their combined verdict
 * flips the status to `approved` or `needs_revision`.
 */
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const denied = checkAdmin(req);
  if (denied) return denied;
  const { id } = await ctx.params;
  try {
    await ensureAiArticleTable();
    const result = await pipelineReview(id);
    const row = await db.aiArticle.findUnique({ where: { id } });
    return NextResponse.json({ ok: true, result, article: row ? serializeArticle(row) : null });
  } catch (e) {
    console.error(`ai-articles review ${id} error:`, e);
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Review failed' }, { status: 500 });
  }
}
