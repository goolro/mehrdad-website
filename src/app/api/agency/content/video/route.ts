import { NextResponse, type NextRequest } from 'next/server';
import { checkAdmin } from '@/lib/admin';
import { listIdeaVideos, pendingVideosOfIdea, pollVideo, submitVideoForIdea } from '@/lib/agency/content';

export const dynamic = 'force-dynamic';

/**
 * POST { ideaId, duration? } — submit one AI video task (CogVideoX, 9:16).
 * The provider rate-limits hard, so the UI submits one video at a time.
 */
export async function POST(req: NextRequest) {
  const denied = checkAdmin(req);
  if (denied) return denied;

  let body: { ideaId?: string; duration?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'بدنه درخواست نامعتبر است' }, { status: 400 });
  }
  if (!body.ideaId) return NextResponse.json({ error: 'ideaId لازم است' }, { status: 400 });

  const duration = body.duration === 5 ? 5 : 10;
  const result = await submitVideoForIdea(body.ideaId, duration);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 429 });

  return NextResponse.json({ ok: true, video: result.video });
}

/**
 * GET ?ideaId= — list an idea's videos; pending ones are polled against the
 * provider and synced first so the UI just renders current state.
 */
export async function GET(req: NextRequest) {
  const denied = checkAdmin(req);
  if (denied) return denied;

  const ideaId = req.nextUrl.searchParams.get('ideaId');
  if (!ideaId) return NextResponse.json({ error: 'ideaId لازم است' }, { status: 400 });

  const pending = await pendingVideosOfIdea(ideaId);
  for (const video of pending) {
    try {
      await pollVideo(video.id);
    } catch {
      // keep polling resilient — a single bad task must not break the list
    }
  }

  const videos = await listIdeaVideos(ideaId);
  return NextResponse.json({ videos });
}
