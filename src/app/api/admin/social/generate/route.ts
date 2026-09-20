import { NextRequest, NextResponse } from 'next/server';
import { checkAdmin } from '@/lib/admin';
import { generateSocialPosts } from '@/lib/social-studio';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

/**
 * Social Media Studio — single-shot generation endpoint.
 * Voice + platform formats live in src/lib/social-studio.ts (shared with
 * the autopilot batch endpoint).
 *
 * Input : { source: 'post'|'topic', slug?, topic?, platforms: string[], lang: 'fa'|'en'|'both' }
 * Output: { ok, posts: [{ platform, lang, hook, content, limit }] }
 */

export async function POST(req: NextRequest) {
  const denied = checkAdmin(req);
  if (denied) return denied;
  try {
    const b = await req.json();
    const source = b.source === 'post' ? 'post' : 'topic';
    const slug = typeof b.slug === 'string' ? b.slug.slice(0, 200) : '';
    const topic = (typeof b.topic === 'string' ? b.topic : '').trim().slice(0, 500);
    const lang = b.lang === 'en' || b.lang === 'both' ? b.lang : 'fa';
    const platforms: string[] = Array.isArray(b.platforms)
      ? b.platforms.filter((p: unknown): p is string => typeof p === 'string' && !!p)
      : [];
    if (!platforms.length) return NextResponse.json({ error: 'No platform selected' }, { status: 400 });
    if (source === 'topic' && !topic) return NextResponse.json({ error: 'Topic required' }, { status: 400 });
    if (source === 'post' && !slug) return NextResponse.json({ error: 'Post required' }, { status: 400 });

    const posts = await generateSocialPosts({ source, slug, topic, platforms, lang });
    return NextResponse.json({ ok: true, posts });
  } catch (e) {
    console.error('social generate error:', e);
    const msg = e instanceof Error ? e.message : 'Generation failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
