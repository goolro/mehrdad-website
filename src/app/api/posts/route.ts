import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const page = Math.max(1, parseInt(sp.get('page') || '1', 10));
    const perPage = Math.min(48, Math.max(1, parseInt(sp.get('perPage') || '12', 10)));
    const category = sp.get('category') || '';
    const tag = sp.get('tag') || '';
    const search = (sp.get('search') || '').trim();
    const featured = sp.get('featured') === '1';

    const where: Record<string, unknown> = { published: true };
    if (featured) where.featured = true;
    if (category) {
      where.categories = { some: { slug: category } };
    }
    if (tag) {
      where.tags = { some: { tag: { slug: tag } } };
    }
    if (search) {
      where.OR = [
        { titleEn: { contains: search } },
        { titleFa: { contains: search } },
        { excerptEn: { contains: search } },
        { excerptFa: { contains: search } },
      ];
    }

    const [total, posts] = await Promise.all([
      db.post.count({ where }),
      db.post.findMany({
        where,
        orderBy: { date: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage,
        select: {
          id: true,
          slug: true,
          titleEn: true,
          titleFa: true,
          excerptEn: true,
          excerptFa: true,
          cover: true,
          date: true,
          contentEn: true,
          featured: true,
          _count: { select: { comments: { where: { approved: true } } } },
          categories: { select: { id: true, slug: true, nameEn: true, nameFa: true } },
          tags: { select: { tag: { select: { id: true, slug: true, nameEn: true, nameFa: true } } } },
        },
      }),
    ]);

    return NextResponse.json({
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
      posts: posts.map((p) => ({
        ...p,
        hasEn: Boolean(p.contentEn),
        commentCount: p._count.comments,
        tags: p.tags.map((pt) => pt.tag),
        readMinutes: Math.max(
          1,
          Math.ceil(((p.contentEn || p.excerptFa || p.excerptEn || '').length / 4) / 220)
        ),
      })),
    });
  } catch (e) {
    console.error('posts api error:', e);
    return NextResponse.json({ error: 'Failed to load posts' }, { status: 500 });
  }
}
