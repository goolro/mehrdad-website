import { NextRequest, NextResponse } from 'next/server';
import { checkAdmin } from '@/lib/admin';
import { db } from '@/lib/db';
import { ensureAiArticleTable, serializeArticle } from '@/lib/ai-articles';

export const dynamic = 'force-dynamic';

/** List every AI-pipeline piece, newest first (queue view of the studio). */
export async function GET(req: NextRequest) {
  const denied = checkAdmin(req);
  if (denied) return denied;
  try {
    await ensureAiArticleTable();
    const rows = await db.aiArticle.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return NextResponse.json({ ok: true, articles: rows.map(serializeArticle) });
  } catch (e) {
    console.error('ai-articles list error:', e);
    return NextResponse.json({ error: 'Failed to list AI articles' }, { status: 500 });
  }
}
