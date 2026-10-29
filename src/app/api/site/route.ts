import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { visibleProjects } from '@/lib/project-visibility';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest) {
  try {
    const [services, projects, categories, tags, postCount, themeRow] = await Promise.all([
      db.service.findMany({ orderBy: { order: 'asc' } }),
      // display kill-switch (project-visibility.ts): hidden projects stay out
      // of the public site JSON (admin uses /api/admin/projects — unfiltered)
      visibleProjects(await db.project.findMany({ orderBy: { order: 'asc' } })),
      db.category.findMany({
        // phase-2 SEO fix: count only PUBLISHED posts. `posts: { some: {} }`
        // passed categories holding nothing but drafts, so a duplicate
        // "Business" chip (EN-slug + FA-slug rows) rendered on the blog —
        // the FA-slug row's posts are all unpublished. Mirrors the tags
        // query below, which already filtered by published status.
        where: { posts: { some: { published: true } } },
        orderBy: { nameEn: 'asc' },
        include: { _count: { select: { posts: { where: { published: true } } } } },
      }),
      db.tag.findMany({
        where: { posts: { some: { post: { published: true } } } },
        orderBy: { nameEn: 'asc' },
        include: { _count: { select: { posts: { where: { post: { published: true } } } } } },
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
      tags: tags.map((t) => ({
        id: t.id,
        slug: t.slug,
        nameEn: t.nameEn,
        nameFa: t.nameFa,
        count: t._count.posts,
      })),
      stats: { posts: postCount, services: services.length, projects: projects.length },
      theme: themeRow?.value || 'default',
    });
  } catch (e) {
    console.error('site api error:', e);
    return NextResponse.json({ error: 'Failed to load site data' }, { status: 500 });
  }
}
