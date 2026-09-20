import { NextRequest, NextResponse } from 'next/server';
import { checkAdmin } from '@/lib/admin';
import { ensureAiArticleTable, pipelineGenerate, serializeArticle } from '@/lib/ai-articles';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

/**
 * Pipeline step 1 — the WRITER agent (AI 1).
 * Creates the piece and writes revision 1. Reviewers run in their own
 * endpoint so the UI can animate each agent and chain the steps itself.
 */
export async function POST(req: NextRequest) {
  const denied = checkAdmin(req);
  if (denied) return denied;
  try {
    await ensureAiArticleTable();
    const b = await req.json().catch(() => ({}));
    const topic = (b.topic || '').trim().slice(0, 300);
    const keyword = (b.keyword || '').trim().slice(0, 150) || undefined;
    const target = b.target === 'linkedin' ? 'linkedin' : 'website';
    const lang = b.lang === 'en' ? 'en' : 'fa';
    if (!topic) return NextResponse.json({ error: 'Topic required' }, { status: 400 });

    const id = await pipelineGenerate({ topic, keyword, target, lang });
    const row = await db.aiArticle.findUnique({ where: { id } });
    return NextResponse.json({ ok: true, article: row ? serializeArticle(row) : null });
  } catch (e) {
    console.error('ai-articles generate error:', e);
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Generation failed' }, { status: 500 });
  }
}
