import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkAdmin } from '@/lib/admin';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const denied = checkAdmin(req);
  if (denied) return denied;
  const messages = await db.contactMessage.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
  return NextResponse.json({ messages });
}

export async function PATCH(req: NextRequest) {
  const denied = checkAdmin(req);
  if (denied) return denied;
  const { id, read } = await req.json();
  await db.contactMessage.update({ where: { id }, data: { read: Boolean(read) } });
  return NextResponse.json({ ok: true });
}
