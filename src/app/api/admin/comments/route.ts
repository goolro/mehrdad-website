import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkAdmin } from '@/lib/admin';

export const dynamic = 'force-dynamic';

// GET /api/admin/comments?status=pending|all — moderation queue
export async function GET(req: NextRequest) {
  const denied = checkAdmin(req);
  if (denied) return denied;
  const status = req.nextUrl.searchParams.get('status') || 'pending';

  const comments = await db.comment.findMany({
    where: status === 'pending' ? { approved: false } : {},
    orderBy: { date: 'desc' },
    take: 200,
    include: { post: { select: { slug: true, titleEn: true, titleFa: true } } },
  });

  const pendingCount = await db.comment.count({ where: { approved: false } });
  const totalCount = await db.comment.count();

  return NextResponse.json({ comments, pendingCount, totalCount });
}

// PATCH /api/admin/comments — approve / un-approve
export async function PATCH(req: NextRequest) {
  const denied = checkAdmin(req);
  if (denied) return denied;
  const { id, approved } = await req.json();
  await db.comment.update({ where: { id }, data: { approved: Boolean(approved) } });
  return NextResponse.json({ ok: true });
}

// DELETE /api/admin/comments
export async function DELETE(req: NextRequest) {
  const denied = checkAdmin(req);
  if (denied) return denied;
  const { id } = await req.json();
  await db.comment.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
