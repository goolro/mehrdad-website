import { NextRequest, NextResponse } from 'next/server';
import { checkAdmin } from '@/lib/admin';
import { db } from '@/lib/db';
import { chatCompletion, getProviderChain, textCompleteStrict } from '@/lib/ai-provider';
import { retrieveContext, buildContextBlock } from '@/lib/rag';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

/**
 * Social Media Studio — platform-tailored post generation.
 *
 * Inspired by the open-source "social-media-skills" content system
 * (voice → platform formats → hook first) and wired directly into the
 * site's own content: blog posts and the RAG knowledge base feed the
 * prompt so every post speaks in Mehrdad's real voice.
 *
 * Input : { source: 'post'|'topic', slug?, topic?, platforms: string[], lang: 'fa'|'en'|'both' }
 * Output: { ok, posts: [{ platform, lang, hook, content, limit }] }
 */

const PLATFORM_SPECS: Record<string, { limit: number; label: string; style: string }> = {
  linkedin: {
    limit: 3000,
    label: 'LinkedIn',
    style: `Professional storytelling post.
- First 2 lines = the hook (they show before "...see more"), must create curiosity or state a bold insight
- Short paragraphs (1-2 sentences), blank line between them
- 1 practical insight or lesson the reader can use
- End with a soft CTA pointing to https://mehrdad.ir
- 3-5 relevant hashtags at the very end
- Length: 600-1300 characters`,
  },
  instagram: {
    limit: 2200,
    label: 'Instagram',
    style: `Casual, energetic caption.
- First line = scroll-stopping hook
- Friendly, conversational, a few well-placed emojis (not one per word)
- Value in short scannable lines
- End with a CTA to follow + visit https://mehrdad.ir
- 8-12 hashtags at the very end (mix broad and niche)
- Length: 300-1500 characters`,
  },
  x: {
    limit: 280,
    label: 'X (Twitter)',
    style: `Punchy one-post tweet.
- One strong idea, no fluff, fits 280 characters STRICTLY
- 1-2 hashtags max, optional
- Mention https://mehrdad.ir only if it fits naturally
- Length: under 280 characters — this is a hard limit`,
  },
  telegram: {
    limit: 4096,
    label: 'Telegram',
    style: `Informative channel post.
- Bold headline line first
- 3-6 short paragraphs with substance (tips, facts, insights)
- End with a link line: https://mehrdad.ir
- Length: 500-2000 characters`,
  },
};

const VOICE = `You write social media posts for Mehrdad — an independent product builder & engineer.
His world: startups, smart city technology, AI, inventions, product design, digital marketing.
Site: https://mehrdad.ir — his portfolio, services and blog live there.
Voice: confident but not boastful, practical, forward-looking, concrete examples over vague hype. He shares lessons, not ads.`;

function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<\/(p|h2|h3|li|div)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function clampText(s: string, max: number): string {
  return s.length <= max ? s : `${s.slice(0, max - 1)}…`;
}

/** Generate with the provider failover chain (active → others), ZAI sandbox as the last resort. */
async function generateWithFallback(messages: { role: 'system' | 'user' | 'assistant'; content: string }[]): Promise<string> {
  const chain = await getProviderChain();
  for (const provider of chain) {
    try {
      const out = await chatCompletion(provider, messages, { timeoutMs: 100_000, maxTokens: 4000, temperature: 0.75 });
      if (out) return out;
    } catch (e) {
      console.error(`social generate: provider ${provider.name} failed:`, e);
    }
  }
  return textCompleteStrict(messages, { timeoutMs: 100_000, maxTokens: 4000, temperature: 0.75 });
}

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
      ? b.platforms.filter((p: unknown): p is string => typeof p === 'string' && !!PLATFORM_SPECS[p])
      : [];
    if (!platforms.length) return NextResponse.json({ error: 'No platform selected' }, { status: 400 });
    if (source === 'topic' && !topic) return NextResponse.json({ error: 'Topic required' }, { status: 400 });
    if (source === 'post' && !slug) return NextResponse.json({ error: 'Post required' }, { status: 400 });

    // ── source material ────────────────────────────────────────────────
    let sourceBlock = '';
    if (source === 'post') {
      const post = await db.post.findUnique({ where: { slug } });
      if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });
      const fa = htmlToText(post.contentFa || '');
      const en = htmlToText(post.contentEn || '');
      const body = clampText(fa.length >= en.length ? fa : en, 2200);
      const title = (post.titleFa || post.titleEn || '').trim();
      sourceBlock = `SOURCE BLOG POST (already published on mehrdad.ir):\nTitle: ${title}\nURL: https://mehrdad.ir/blog/${post.slug}\nContent:\n${body}\n\nTurn THIS post into social content — do not invent a different subject.`;
    } else {
      const chunks = await retrieveContext(topic, 4);
      const context = buildContextBlock(chunks);
      sourceBlock = `TOPIC:\n${topic}\n\nExisting site knowledge (may inform the post, never copy verbatim):\n${context || '(none)'}`;
    }

    // ── one prompt per platform keeps formats tight ────────────────────
    const langs = lang === 'both' ? ['fa', 'en'] : [lang];
    const results: { platform: string; lang: string; hook: string; content: string; limit: number }[] = [];

    for (const platform of platforms) {
      const spec = PLATFORM_SPECS[platform];
      const langLine =
        lang === 'both'
          ? 'Write the post TWICE: first in Persian (Farsi, fluent natural Persian — not machine translation), then in English. '
          : lang === 'fa'
            ? 'Write in fluent natural Persian (Farsi). '
            : 'Write in English. ';
      const sys = `${VOICE}

PLATFORM: ${spec.label}
FORMAT RULES:
${spec.style}

${langLine}Return ONLY valid JSON (no markdown fences) in this exact shape:
{"posts":[{"lang":"fa","hook":"first line / hook","content":"full post text"}]}
For "both" languages the array has two entries (lang "fa" and "en"). "content" must include the hook as its first line.`;

      const text = await generateWithFallback([
        { role: 'system', content: sys },
        { role: 'user', content: sourceBlock },
      ]);

      let clean = text.replace(/```json|```/g, '').trim();
      const s = clean.indexOf('{');
      const e = clean.lastIndexOf('}');
      if (s === -1 || e === -1) throw new Error('AI did not return JSON');
      const parsed = JSON.parse(clean.slice(s, e + 1)) as {
        posts?: { lang?: string; hook?: string; content?: string }[];
      };
      for (const p of parsed.posts || []) {
        const pLang = p.lang === 'en' ? 'en' : 'fa';
        if (!langs.includes(pLang)) continue;
        const content = (p.content || '').trim();
        if (!content) continue;
        results.push({
          platform,
          lang: pLang,
          hook: (p.hook || content.split('\n')[0] || '').slice(0, 200),
          content: platform === 'x' ? content.slice(0, 280) : content,
          limit: spec.limit,
        });
      }
    }

    if (!results.length) throw new Error('Empty generation result');
    return NextResponse.json({ ok: true, posts: results });
  } catch (e) {
    console.error('social generate error:', e);
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
  }
}
