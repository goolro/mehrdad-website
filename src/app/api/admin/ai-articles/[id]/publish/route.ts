import { NextRequest, NextResponse } from 'next/server';
import { checkAdmin } from '@/lib/admin';
import { ensureAiArticleTable, pipelinePublish } from '@/lib/ai-articles';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

/**
 * The human gate — publishing only ever happens from this endpoint:
 *   website  → live Post on the blog (+ KB, deploy hook, IndexNow)
 *   linkedin → Social Studio queue (its own direct-publish flow takes over)
 */
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const denied = checkAdmin(req);
  if (denied) return denied;
  const { id } = await ctx.params;
  try {
    await ensureAiArticleTable();
    const b = await req.json().catch(() => ({}));
    const result = await pipelinePublish(id, {
      cover: typeof b.cover === 'string' && b.cover ? b.cover : null,
      categoryId: typeof b.categoryId === 'string' && b.categoryId ? b.categoryId : null,
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    console.error(`ai-articles publish ${id} error:`, e);
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Publish failed' }, { status: 500 });
  }
}
