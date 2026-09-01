import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { slugCandidates } from '@/lib/slug-lookup';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await ctx.params;
    // اسلاگ‌های فارسی در DB به شکل percent-encoded ذخیره شده‌اند؛ Next آن‌ها را decode می‌کند
    let post = null;
    for (const candidate of slugCandidates(slug)) {
      post = await db.post.findUnique({
        where: { slug: candidate },
        include: {
          categories: { select: { id: true, slug: true, nameEn: true, nameFa: true } },
          tags: { select: { tag: { select: { id: true, slug: true, nameEn: true, nameFa: true } } } },
        },
      });
      if (post) break;
    }
    if (!post || !post.published) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    const tags = post.tags.map((pt) => pt.tag);

    const catIds = post.categories.map((c) => c.id);
    const commentCount = await db.comment.count({ where: { postId: post.id, approved: true } });
    const related = await db.post.findMany({
      where: {
        published: true,
        id: { not: post.id },
        ...(catIds.length > 0 ? { categories: { some: { id: { in: catIds } } } } : {}),
      },
      orderBy: { date: 'desc' },
      take: 3,
      select: {
        slug: true,
        titleEn: true,
        titleFa: true,
        cover: true,
        date: true,
        excerptEn: true,
        excerptFa: true,
      },
    });

    return NextResponse.json({
      post: { ...post, tags },
      related,
      commentCount,
    });
  } catch (e) {
    console.error('post detail api error:', e);
    return NextResponse.json({ error: 'Failed to load post' }, { status: 500 });
  }
}
