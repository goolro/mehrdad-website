import { NextResponse, type NextRequest } from 'next/server';
import { checkAdmin } from '@/lib/admin';
import {
  clearSampleIdeas,
  createIdea,
  deleteIdeaTree,
  generateIdeasForSample,
  resolveSampleRef,
} from '@/lib/agency/content';

export const dynamic = 'force-dynamic';
// Vercel default 10s killed studio calls (2026-10-08 incident) — 60s = Hobby max.
export const maxDuration = 60;

/**
 * POST { sampleId } — generate 5 similar-not-copied ideas for one reference
 * reel (hook + script + video prompt + Persian caption + hashtags). Existing
 * ideas for the sample are replaced so «ساخت مجدد» stays predictable.
 */
export async function POST(req: NextRequest) {
  const denied = checkAdmin(req);
  if (denied) return denied;

  let body: { sampleId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'بدنه درخواست نامعتبر است' }, { status: 400 });
  }
  if (!body.sampleId) return NextResponse.json({ error: 'sampleId لازم است' }, { status: 400 });
  const sampleId = body.sampleId;

  try {
    // static fallback ids (`static:<reelId>`, served when DB reads degrade)
    // must be resolved to a real ContentSample row BEFORE any write, or the
    // ideas would be orphaned under an id the sample include never matches
    const realSampleId = await resolveSampleRef(sampleId);
    const ideas = await generateIdeasForSample(realSampleId);

    // regenerate = clean slate for this sample (owner asked «یکی یکی»)
    await clearSampleIdeas(realSampleId);
    const created = await Promise.all(
      ideas.map((idea) =>
        createIdea({
          sampleId: realSampleId,
          idx: idea.idx,
          title: idea.title,
          hook: idea.hook,
          script: idea.script,
          videoPrompt: idea.videoPrompt,
          caption: idea.caption,
          hashtags: JSON.stringify(idea.hashtags),
        })
      )
    );

    return NextResponse.json({ ok: true, ideas: created });
  } catch (e) {
    return NextResponse.json(
      { error: `تولید ایده ناموفق بود: ${String((e as Error).message ?? e).slice(0, 200)}` },
      { status: 500 }
    );
  }
}

/** DELETE ?id= — drop one idea (and its videos). */
export async function DELETE(req: NextRequest) {
  const denied = checkAdmin(req);
  if (denied) return denied;

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id لازم است' }, { status: 400 });

  await deleteIdeaTree(id);
  return NextResponse.json({ ok: true });
}
