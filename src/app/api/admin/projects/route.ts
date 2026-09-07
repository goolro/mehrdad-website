import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkAdmin } from '@/lib/admin';
import { notifyIndexNow } from '@/lib/indexnow';
import { PROJECT_SECTIONS, isProjectStatus } from '@/lib/project-status';

export const dynamic = 'force-dynamic';

const BASE = (process.env.SITE_ORIGIN || 'https://mehrdad.ir').replace(/\/+$/, '');

function pingProject(slug: string, section: string) {
  // static pages that render this project — IndexNow nudges search engines;
  // the full rebuild fires through the deploy hook below
  const urls = [`${BASE}/work/${slug}`, `${BASE}/work`, `${BASE}/`];
  if (section === 'lab') urls.splice(1, 0, `${BASE}/lab`);
  notifyIndexNow(urls).catch(() => {});
}

async function fireDeployHook() {
  // VERCEL_DEPLOY_HOOK_URL is optional — without it, changes publish on
  // the next deploy (same pattern as the posts admin)
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

/** validate + normalize an incoming create payload (write-side guard) */
function validateCreate(body: ProjectPayload): { data: Record<string, unknown>; error?: never } | { data?: never; error: string } {
  const slug = (body.slug || '').trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  if (!slug) return { error: 'slug is required' };
  const titleEn = (body.titleEn || '').trim();
  const titleFa = (body.titleFa || '').trim();
  const summaryEn = (body.summaryEn || '').trim();
  const summaryFa = (body.summaryFa || '').trim();
  if (!titleEn || !titleFa || !summaryEn || !summaryFa) {
    return { error: 'titles and summaries (EN/FA) are required' };
  }
  return {
    data: {
      slug,
      titleEn,
      titleFa,
      summaryEn,
      summaryFa,
      cover: body.cover ? String(body.cover).trim() || null : null,
      section: PROJECT_SECTIONS.includes(body.section as never) ? body.section : 'work',
      status: isProjectStatus(body.status || '') ? (body.status as string) : 'idea',
      progress: Math.min(100, Math.max(0, Math.trunc(Number(body.progress) || 0))),
      featured: Boolean(body.featured),
      // optional by design — empty means "none"; the UI must never imply one
      fundingAsk: body.fundingAsk == null || body.fundingAsk === '' ? null : String(body.fundingAsk).trim() || null,
      order: Math.trunc(Number(body.order) || 0),
    },
  };
}

export async function GET(req: NextRequest) {
  const denied = checkAdmin(req);
  if (denied) return denied;
  const projects = await db.project.findMany({ orderBy: { order: 'asc' } });
  return NextResponse.json({ projects });
}

export async function POST(req: NextRequest) {
  const denied = checkAdmin(req);
  if (denied) return denied;
  try {
    const body = (await req.json()) as ProjectPayload;
    const result = validateCreate(body);
    if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
    const exists = await db.project.findUnique({ where: { slug: result.data.slug as string } });
    if (exists) return NextResponse.json({ error: 'A project with this slug already exists' }, { status: 409 });
    const project = await db.project.create({ data: result.data });
    pingProject(project.slug, project.section);
    await fireDeployHook();
    return NextResponse.json({ project });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed to create project' }, { status: 500 });
  }
}
