import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkAdmin } from '@/lib/admin';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const denied = checkAdmin(req);
  if (denied) return denied;
  try {
    const [posts, translated, kbChunks, messages, unread] = await Promise.all([
      db.post.count(),
      db.post.count({ where: { contentEn: { not: null } } }),
      db.kbChunk.count(),
      db.contactMessage.count(),
      db.contactMessage.count({ where: { read: false } }),
    ]);
    return NextResponse.json({ posts, translated, kbChunks, messages, unread });
  } catch (e) {
    console.error('admin stats error:', e);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
