import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkAdmin } from '@/lib/admin';
import { notifyIndexNow } from '@/lib/indexnow';
import { PROJECT_STATUSES, PROJECT_SECTIONS, isProjectStatus } from '@/lib/project-status';

export const dynamic = 'force-dynamic';

const BASE = (process.env.SITE_ORIGIN || 'https://mehrdad.ir').replace(/\/+$/, '');

function pingProject(slug: string, section: string) {
  // notifyIndexNow is fire-and-forget by design (never throws) — no .catch
  const urls = [`${BASE}/work/${slug}`, `${BASE}/work`, `${BASE}/`];
  if (section === 'lab') urls.splice(1, 0, `${BASE}/lab`);
  notifyIndexNow(urls);
}

async function fireDeployHook() {
  if (process.env.VERCEL_DEPLOY_HOOK_URL) {
    await fetch(process.env.VERCEL_DEPLOY_HOOK_URL, { method: 'POST' }).catch(() => {});
  }
}

type ProjectPayload = {
  slug?: string;
  titleEn?: string;
  titleFa?: string;
  summaryEn?: string;
  summaryFa?: string;
  cover?: string | null;
  section?: string;
  status?: string;
  progress?: number;
  featured?: boolean;
  fundingAsk?: string | null;
  order?: number;
};

function buildData(body: ProjectPayload): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  if (body.slug !== undefined) {
    const slug = body.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    if (!slug) throw new Error('slug cannot be empty');
    data.slug = slug;
  }
  if (body.titleEn !== undefined) data.titleEn = body.titleEn.trim();
  if (body.titleFa !== undefined) data.titleFa = body.titleFa.trim();
  if (body.summaryEn !== undefined) data.summaryEn = body.summaryEn.trim();
  if (body.summaryFa !== undefined) data.summaryFa = body.summaryFa.trim();
  if (body.cover !== undefined) data.cover = body.cover ? String(body.cover).trim() || null : null;
  if (body.section !== undefined) {
    if (!PROJECT_SECTIONS.includes(body.section as never)) throw new Error('invalid section');
    data.section = body.section;
  }
  if (body.status !== undefined) {
    if (!isProjectStatus(body.status)) throw new Error('invalid status');
    data.status = body.status;
  }
  if (body.progress !== undefined) data.progress = Math.min(100, Math.max(0, Math.trunc(Number(body.progress) || 0)));
  if (body.featured !== undefined) data.featured = Boolean(body.featured);
  // optional by design — empty string means "no funding ask", never a default
  if (body.fundingAsk !== undefined) data.fundingAsk = body.fundingAsk === '' || body.fundingAsk == null ? null : String(body.fundingAsk).trim() || null;
  if (body.order !== undefined) data.order = Math.trunc(Number(body.order) || 0);
  return data;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = checkAdmin(req);
  if (denied) return denied;
  try {
    const { id } = await params;
    const body = (await req.json()) as ProjectPayload;
    const data = buildData(body);
    const before = await db.project.findUnique({ where: { id } });
    if (!before) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    const project = await db.project.update({ where: { id }, data });
    pingProject(before.slug, before.section);
    if (project.slug !== before.slug) pingProject(project.slug, project.section);
    await fireDeployHook();
    return NextResponse.json({ project });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed to update project' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = checkAdmin(req);
  if (denied) return denied;
  try {
    const { id } = await params;
    const gone = await db.project.delete({ where: { id } });
    pingProject(gone.slug, gone.section);
    await fireDeployHook();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 400 });
  }
}
