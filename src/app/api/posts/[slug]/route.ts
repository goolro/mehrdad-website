import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getPostDetail } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await ctx.params;
    const detail = await getPostDetail(slug);
    if (!detail) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    const commentCount = await db.comment.count({
      where: { postId: detail.post.id, approved: true },
    });
    return NextResponse.json({ ...detail, commentCount });
  } catch (e) {
    console.error('post detail api error:', e);
    return NextResponse.json({ error: 'Failed to load post' }, { status: 500 });
  }
}
