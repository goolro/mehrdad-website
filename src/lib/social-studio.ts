import { db } from '@/lib/db';
import { chatCompletion, getProviderChain, textCompleteStrict } from '@/lib/ai-provider';
import { retrieveContext, buildContextBlock } from '@/lib/rag';

/**
 * Social Media Studio — shared generation core.
 *
 * Inspired by the open-source "social-media-skills" content system
 * (voice → platform formats → hook first) and wired directly into the
 * site's own content: blog posts and the RAG knowledge base feed the
 * prompt so every post speaks in Mehrdad's real voice.
 *
 * Used by both /api/admin/social/generate (single-shot) and
 * /api/admin/social/autopilot (batch fill) — one source of truth for
 * voice + platform formats.
 */

export const PLATFORM_SPECS: Record<string, { limit: number; label: string; style: string }> = {
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

export const SOCIAL_VOICE = `You write social media posts for Mehrdad — an independent product builder & engineer.
His world: startups, smart city technology, AI, inventions, product design, digital marketing.
Site: https://mehrdad.ir — his portfolio, services and blog live there.
Voice: confident but not boastful, practical, forward-looking, concrete examples over vague hype. He shares lessons, not ads.`;

export function htmlToText(html: string): string {
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

export interface SocialPostResult {
  platform: string;
  lang: string;
  hook: string;
  content: string;
  limit: number;
}

export interface SocialGenerateOptions {
  source: 'post' | 'topic';
  slug?: string;
  topic?: string;
  platforms: string[];
  lang: 'fa' | 'en' | 'both';
}

/**
 * Generate platform-tailored posts from a blog post or a topic.
 * Throws on total failure; returns per-platform results otherwise.
 */
export async function generateSocialPosts(opts: SocialGenerateOptions): Promise<SocialPostResult[]> {
  let sourceBlock = '';
  if (opts.source === 'post') {
    const post = await db.post.findUnique({ where: { slug: opts.slug } });
    if (!post) throw new Error('Post not found');
    const fa = htmlToText(post.contentFa || '');
    const en = htmlToText(post.contentEn || '');
    const body = clampText(fa.length >= en.length ? fa : en, 2200);
    const title = (post.titleFa || post.titleEn || '').trim();
    sourceBlock = `SOURCE BLOG POST (already published on mehrdad.ir):\nTitle: ${title}\nURL: https://mehrdad.ir/blog/${post.slug}\nContent:\n${body}\n\nTurn THIS post into social content — do not invent a different subject.`;
  } else {
    const chunks = await retrieveContext(opts.topic || '', 4);
    const context = buildContextBlock(chunks);
    sourceBlock = `TOPIC:\n${opts.topic}\n\nExisting site knowledge (may inform the post, never copy verbatim):\n${context || '(none)'}`;
  }

  const langs = opts.lang === 'both' ? ['fa', 'en'] : [opts.lang];
  const results: SocialPostResult[] = [];

  for (const platform of opts.platforms) {
    const spec = PLATFORM_SPECS[platform];
    if (!spec) throw new Error(`Unknown platform: ${platform}`);
    const langLine =
      opts.lang === 'both'
        ? 'Write the post TWICE: first in Persian (Farsi, fluent natural Persian — not machine translation), then in English. '
        : opts.lang === 'fa'
          ? 'Write in fluent natural Persian (Farsi). '
          : 'Write in English. ';
    const sys = `${SOCIAL_VOICE}

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
  return results;
}
