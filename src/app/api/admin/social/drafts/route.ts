import { NextRequest, NextResponse } from 'next/server';
import { checkAdmin } from '@/lib/admin';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

/** Saved social posts (drafts). GET list · POST save · DELETE remove. */

export async function GET(req: NextRequest) {
  const denied = checkAdmin(req);
  if (denied) return denied;
  const drafts = await db.socialDraft.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
  return NextResponse.json({ ok: true, drafts });
}

export async function POST(req: NextRequest) {
  const denied = checkAdmin(req);
  if (denied) return denied;
  try {
    const b = await req.json();
    const platform = typeof b.platform === 'string' ? b.platform : '';
    const lang = b.lang === 'en' ? 'en' : 'fa';
    const content = (typeof b.content === 'string' ? b.content : '').trim();
    if (!platform || !content) {
      return NextResponse.json({ error: 'platform and content required' }, { status: 400 });
    }
    const draft = await db.socialDraft.create({
      data: {
        platform: platform.slice(0, 40),
        lang,
        topic: typeof b.topic === 'string' ? b.topic.slice(0, 500) || null : null,
        sourceSlug: typeof b.sourceSlug === 'string' ? b.sourceSlug.slice(0, 200) || null : null,
        content,
      },
    });
    return NextResponse.json({ ok: true, draft });
  } catch (e) {
    console.error('social draft save error:', e);
    return NextResponse.json({ error: 'Save failed' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const denied = checkAdmin(req);
  if (denied) return denied;
  const id = req.nextUrl.searchParams.get('id') || '';
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  await db.socialDraft.deleteMany({ where: { id } });
  return NextResponse.json({ ok: true });
}
