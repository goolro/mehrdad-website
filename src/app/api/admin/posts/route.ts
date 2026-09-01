import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkAdmin } from '@/lib/admin';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const denied = checkAdmin(req);
  if (denied) return denied;
  const posts = await db.post.findMany({
    orderBy: { date: 'desc' },
    select: {
      id: true,
      slug: true,
      titleEn: true,
      titleFa: true,
      date: true,
      published: true,
      source: true,
      cover: true,
      contentEn: true,
      categories: { select: { nameEn: true, nameFa: true } },
    },
  });
  return NextResponse.json({ posts });
}

export async function POST(req: NextRequest) {
  const denied = checkAdmin(req);
  if (denied) return denied;
  try {
    const b = await req.json();
    const slug = (b.slug || '')
      .trim()
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 90);
    if (!slug) return NextResponse.json({ error: 'Slug required' }, { status: 400 });

    const exists = await db.post.findUnique({ where: { slug } });
    if (exists) return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });

    const post = await db.post.create({
      data: {
        slug,
        titleEn: b.titleEn || null,
        titleFa: b.titleFa || null,
        excerptEn: b.excerptEn || null,
        excerptFa: b.excerptFa || null,
        contentEn: b.contentEn || null,
        contentFa: b.contentFa || null,
        cover: b.cover || null,
        published: b.published !== false,
        source: 'ai',
        date: new Date(),
        ...(b.categoryId ? { categories: { connect: [{ id: b.categoryId }] } } : {}),
      },
    });

    // add to knowledge base
    const { addPostToKb } = await import('@/lib/kb');
    await addPostToKb(post.id);

    return NextResponse.json({ ok: true, post });
  } catch (e) {
    console.error('admin create post error:', e);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
