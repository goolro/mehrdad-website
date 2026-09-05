import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { slugCandidates } from '@/lib/slug-lookup';
import { clientIp, bodyTooLarge, payloadTooLarge, rateLimit, tooManyRequests } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

// یافتن پست با همه شکل‌های ممکن اسلاگ (encoded / decoded)
async function findPostIdBySlug(slug: string): Promise<{ id: string } | null> {
  for (const candidate of slugCandidates(slug)) {
    const post = await db.post.findUnique({ where: { slug: candidate }, select: { id: true } });
    if (post) return post;
  }
  return null;
}

// GET /api/posts/[slug]/comments — approved comments for a post
export async function GET(_req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await ctx.params;
    const post = await findPostIdBySlug(slug);
    if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });

    const comments = await db.comment.findMany({
      where: { postId: post.id, approved: true },
      orderBy: { date: 'asc' },
      select: {
        id: true,
        wpId: true,
        parentWpId: true,
        parentLocalId: true,
        author: true,
        content: true,
        date: true,
      },
    });

    return NextResponse.json({ comments });
  } catch (e) {
    console.error('comments GET error:', e);
    return NextResponse.json({ error: 'Failed to load comments' }, { status: 500 });
  }
}

// POST /api/posts/[slug]/comments — submit a new comment (goes to moderation queue)
export async function POST(req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  try {
    // spam guard: 5 comments per IP per 10 minutes (moderation still applies)
    const rl = rateLimit(`comment:${clientIp(req)}`, 5, 10 * 60 * 1000);
    if (!rl.ok) return tooManyRequests(rl.retryAfter);

    // memory guard on the shared host: real comments are ≤ 2 KB
    if (bodyTooLarge(req)) return payloadTooLarge();

    const { slug } = await ctx.params;
    const body = await req.json();
    const author = String(body.author || '').trim().slice(0, 80);
    const content = String(body.content || '').trim().slice(0, 2000);
    const parentId = typeof body.parentId === 'string' && body.parentId ? body.parentId : null;
    const website = String(body.website || ''); // honeypot — real users leave it empty

    if (website) return NextResponse.json({ ok: true }); // silently drop bots
    if (!author || !content) {
      return NextResponse.json({ error: 'Name and comment are required' }, { status: 400 });
    }
    if (content.length < 2) {
      return NextResponse.json({ error: 'Comment is too short' }, { status: 400 });
    }

    const post = await findPostIdBySlug(slug);
    if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });

    // basic anti-flood: max 50 pending comments per post
    const pending = await db.comment.count({ where: { postId: post.id, approved: false } });
    if (pending > 50) {
      return NextResponse.json({ error: 'Too many pending comments' }, { status: 429 });
    }

    let parentWpId: number | null = null;
    if (parentId) {
      const parent = await db.comment.findFirst({
        where: { id: parentId, postId: post.id, approved: true },
        select: { id: true, wpId: true },
      });
      if (!parent) return NextResponse.json({ error: 'Parent comment not found' }, { status: 400 });
      parentWpId = parent.wpId ?? null;
    }

    await db.comment.create({
      data: {
        postId: post.id,
        parentWpId,
        parentLocalId: parentId,
        author,
        content,
        approved: false, // awaits moderation
      },
    });

    return NextResponse.json({ ok: true, pending: true });
  } catch (e) {
    console.error('comments POST error:', e);
    return NextResponse.json({ error: 'Failed to submit comment' }, { status: 500 });
  }
}
