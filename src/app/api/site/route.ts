import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest) {
  try {
    const [services, projects, categories, postCount, themeRow] = await Promise.all([
      db.service.findMany({ orderBy: { order: 'asc' } }),
      db.project.findMany({ orderBy: { order: 'asc' } }),
      db.category.findMany({
        where: { posts: { some: {} } },
        orderBy: { nameEn: 'asc' },
        include: { _count: { select: { posts: true } } },
      }),
      db.post.count({ where: { published: true } }),
      db.siteSetting.findUnique({ where: { key: 'theme' } }),
    ]);

    return NextResponse.json({
      services,
      projects,
      categories: categories.map((c) => ({
        id: c.id,
        slug: c.slug,
        nameEn: c.nameEn,
        nameFa: c.nameFa,
        count: c._count.posts,
      })),
      stats: { posts: postCount, services: services.length, projects: projects.length },
      theme: themeRow?.value || 'default',
    });
  } catch (e) {
    console.error('site api error:', e);
    return NextResponse.json({ error: 'Failed to load site data' }, { status: 500 });
  }
}
