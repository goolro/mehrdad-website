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
 *
 * QUALITY CONTRACT (added after the 2026-10-12 owner audit — drafts were
 * saved in English under a `fa` label, hallucinated publishing context,
 * and posts were generated from hidden articles):
 *   1. Source body is chosen to MATCH the target language (Persian post →
 *      Persian source when one exists), so the model never drifts into
 *      translating the wrong direction.
 *   2. Every generated post passes a language-ratio assertion before it is
 *      returned; a wrong-language output is retried once with an escalated
 *      instruction, then reported as a failure — never saved mislabeled.
 *   3. Facts policy: the model may only use facts from the source material
 *      (owner law #9 — no invented numbers/events).
 *   4. Posts from sources with too little text (< MIN_SOURCE_CHARS) fail
 *      with a clear message instead of producing generic filler.
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
Voice: confident but not boastful, practical, forward-looking, concrete examples over vague hype. He shares lessons, not ads.

FACTS POLICY (hard rules — violations get the output rejected):
- Use ONLY facts, numbers and events that appear in the SOURCE material. Never invent metrics, dates, partnerships, product names, or publishing events.
- The post must stand alone: no references to other posts ("the previous post"), no "published today", no "in collaboration with", no pointers to pages other than mehrdad.ir.
- Never mention the writing process, SEO tests, or that the post is AI-generated.
- Mehrdad's name in Persian is «مهرداد» — never spell it «مهراد».`;

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

/** Sources with less text than this cannot ground a real post — fail loudly. */
const MIN_SOURCE_CHARS = 300;
/** Persian letters ÷ all letters. A genuine Persian post scores ~0.9+. */
const FA_RATIO_MIN = 0.6;

/**
 * Persian-letter ratio over all letters (0..1). Returns -1 when the text is
 * too short to judge (URLs / hashtag-only snippets), which counts as a pass
 * so extremely short CTA-only strings are not misjudged.
 */
export function persianLetterRatio(text: string): number {
  const letters = text.match(/\p{L}/gu) || [];
  if (letters.length < 20) return -1;
  const fa = text.match(/[\u0600-\u06FF]/g) || [];
  return fa.length / letters.length;
}

/** Reject output written in the wrong language BEFORE it can be saved mislabeled. */
function assertLanguage(content: string, lang: 'fa' | 'en'): void {
  const ratio = persianLetterRatio(content);
  if (ratio < 0) return; // too short to judge
  if (lang === 'fa' && ratio < FA_RATIO_MIN) {
    throw new Error(`language check failed — Persian letter ratio ${(ratio).toFixed(2)} < ${FA_RATIO_MIN} (output is probably English)`);
  }
  if (lang === 'en' && ratio > 0.25) {
    throw new Error(`language check failed — Persian letter ratio ${(ratio).toFixed(2)} > 0.25 (output is probably Persian)`);
  }
}

/**
 * Deterministic anti-hallucination check for UNGROUNDED topics (topic mode
 * with an empty knowledge base — production KbChunk was 0 rows on 2026-10-12).
 * A prompt-only facts policy did NOT stop the model from inventing statistics
 * («تا 40٪ کاهش زمان انتظار», «تا 30% کاهش مصرف انرژی») for a generic topic,
 * so the ban is enforced mechanically: with no source material, the post may
 * contain NO numerals at all (Latin or Persian digits). URLs and nothing else
 * are exempted. Violation → one escalated retry → hard fail; a fabricated
 * statistic is worse than a failed run.
 */
export function assertNoNumerals(content: string): void {
  const withoutUrls = content.replace(/https?:\/\/\S+/g, ' ');
  const m = withoutUrls.match(/[\d\u06F0-\u06F9]/);
  if (m) {
    const idx = m.index ?? 0;
    const around = withoutUrls.slice(Math.max(0, idx - 40), idx + 40).replace(/\s+/g, ' ').trim();
    throw new Error(`quantitative-claim check failed — ungrounded topic posts must contain no numerals, found "${m[0]}" near: …${around}…`);
  }
}

/** Deterministic fix for the one misspelling the model actually produced («مهراد»). */
function fixNameTypos(text: string): string {
  // «مهرداد» never contains «مهراد» as a substring (م‌ه‌ر‌د‌ا‌د vs م‌ه‌ر‌ا‌د),
  // so a plain replace cannot corrupt a correct name.
  return text.replace(/مهراد/g, 'مهرداد');
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

/** Build the source block for one target language, matching body language to it.
 * `grounded: false` means no real source material exists (topic mode with an
 * empty knowledge base) — the caller then enforces the no-numerals contract. */
async function buildSourceBlock(opts: SocialGenerateOptions, lang: 'fa' | 'en'): Promise<{ block: string; note: string; grounded: boolean }> {
  if (opts.source === 'topic') {
    const chunks = await retrieveContext(opts.topic || '', 4);
    const context = buildContextBlock(chunks);
    // Ungrounded-topic guard (2026-10-12 self-test): with an empty knowledge
    // base (production KbChunk = 0 rows on 2026-10-12) the model received no
    // grounding at all and, despite the facts policy in the voice prompt,
    // still invented a statistic («تا 40٪ کاهش زمان انتظار») for a generic
    // smart-city topic. When no site knowledge exists, the topic text becomes
    // the ONLY source and every quantitative claim is banned outright — the
    // post must stay qualitative. (Blog-post mode is unaffected: its body IS
    // the grounding.)
    const ungroundedNote =
      'NO site knowledge was found for this topic in the site knowledge base. The topic description above is your ONLY source. Do NOT invent or cite any specific statistics, percentages, survey results, prices, dates of events, or named studies — keep every claim qualitative. If the topic cannot be written about without such specifics, write about the underlying principle instead.';
    return {
      block: `TOPIC:\n${opts.topic}\n\nExisting site knowledge (may inform the post, never copy verbatim):\n${context || '(none)'}`,
      note: context ? '' : ungroundedNote,
      grounded: Boolean(context),
    };
  }

  const post = await db.post.findUnique({ where: { slug: opts.slug } });
  if (!post) throw new Error('Post not found');
  const fa = htmlToText(post.contentFa || '');
  const en = htmlToText(post.contentEn || '');

  let body = '';
  let note = '';
  if (lang === 'fa') {
    if (fa.length >= MIN_SOURCE_CHARS) {
      body = fa;
    } else if (en.length >= MIN_SOURCE_CHARS) {
      // Persian source missing/too short → fall back to English but tell the
      // model explicitly to ADAPT into Persian (this pair caused the
      // English-under-fa-label drafts before the check existed).
      body = en;
      note = 'The source post is only available in English. Write the social post in natural Persian — translate and adapt the substance; do NOT copy English sentences into the post.';
    }
  } else {
    if (en.length >= MIN_SOURCE_CHARS) {
      body = en;
    } else if (fa.length >= MIN_SOURCE_CHARS) {
      body = fa;
      note = 'The source post is only available in Persian. Write the social post in natural English — translate and adapt the substance; do NOT copy Persian sentences into the post.';
    }
  }

  if (!body) {
    throw new Error(`source post has too little text (< ${MIN_SOURCE_CHARS} chars) to ground a social post`);
  }

  const title = (post.titleFa || post.titleEn || '').trim();
  return {
    block: `SOURCE BLOG POST (already published on mehrdad.ir):\nTitle: ${title}\nURL: https://mehrdad.ir/blog/${post.slug}\nContent:\n${clampText(body, 2200)}\n\nTurn THIS post into social content — do not invent a different subject.`,
    note,
    grounded: true,
  };
}

function buildSystemPrompt(spec: { label: string; style: string }, lang: 'fa' | 'en'): string {
  const langLine =
    lang === 'fa'
      ? 'Write the ENTIRE post in fluent natural Persian (Farsi) — hook, body and hashtags all in Persian. Latin text is only allowed for unavoidable tech/product terms (e.g. MVP, AI) and URLs. Do NOT include an English version.'
      : 'Write the ENTIRE post in natural English — hook, body and hashtags all in English.';
  return `${SOCIAL_VOICE}

PLATFORM: ${spec.label}
FORMAT RULES:
${spec.style}

${langLine}Return ONLY valid JSON (no markdown fences) in this exact shape:
{"posts":[{"lang":"${lang}","hook":"first line / hook","content":"full post text"}]}
"content" must include the hook as its first line. The "lang" field must be exactly "${lang}".`;
}

/**
 * Parser-proof last resort (2026-10-13 self-test): telegram/en failed TWICE in
 * a row on malformed JSON from the model (SyntaxError at positions 1223 and
 * 1430 — an unescaped quote inside the content string), killing an otherwise
 * good auto-pilot run. The third attempt switches to plain text between
 * markers — there is no syntax left to break. Extracted fields are then held
 * to the exact same language/facts contract as the JSON path.
 */
export function extractMarkedPost(text: string): { hook: string; content: string } | null {
  const H = '===HOOK===';
  const P = '===POST===';
  const h = text.indexOf(H);
  const p = text.indexOf(P);
  // ===POST=== is mandatory; ===HOOK=== is optional (finish() falls back to
  // the post's first line when the hook marker is missing).
  if (p === -1) return null;
  const hook = h !== -1 && p > h ? text.slice(h + H.length, p).trim() : '';
  const content = text.slice(p + P.length).trim();
  if (!content) return null;
  return { hook, content };
}

async function generateOne(
  spec: { label: string; style: string; limit: number },
  platform: string,
  lang: 'fa' | 'en',
  sourceBlock: string,
  translationNote: string,
  opts: { banNumerals?: boolean } = {}
): Promise<SocialPostResult> {
  const sys = buildSystemPrompt(spec, lang);
  const user = `${sourceBlock}${translationNote ? `\n\n${translationNote}` : ''}`;
  const langLine =
    lang === 'fa'
      ? 'Write the ENTIRE post in fluent natural Persian (Farsi) — hook, body and hashtags all in Persian. Latin text is only allowed for unavoidable tech/product terms (e.g. MVP, AI) and URLs. Do NOT include an English version.'
      : 'Write the ENTIRE post in natural English — hook, body and hashtags all in English.';
  /** Attempt-3 format: plain text between markers — no JSON syntax to break. */
  const markerSys = `${SOCIAL_VOICE}

PLATFORM: ${spec.label}
FORMAT RULES:
${spec.style}

${langLine}
OUTPUT FORMAT (STRICT): reply with PLAIN TEXT only — NO JSON, no markdown fences, no commentary — in exactly this shape:
===HOOK===
<one-line hook>
===POST===
<the full post text>`;
  /** Kind-aware retry instruction — the model must know WHY it was rejected. */
  const escalationFor = (kind: 'language' | 'quantitative' | 'json'): string => {
    if (kind === 'quantitative') {
      return 'Your previous answer was REJECTED: it contained numerals/statistics, but NO source material exists for this topic, so every number would be invented. Rewrite the full post with ZERO numerals (no percentages, no figures, no years, no counts) — qualitative statements only. Return ONLY the JSON.';
    }
    if (kind === 'json') {
      return `Your previous answer was REJECTED: it was NOT valid JSON (SyntaxError). Return ONLY valid JSON — no markdown fences, no trailing commas, no raw newlines inside strings, escape every double quote — in this exact shape: {"posts":[{"lang":"${lang}","hook":"first line / hook","content":"full post text"}]}`;
    }
    return lang === 'fa'
      ? 'Your previous answer was REJECTED: it was not written in Persian. Try again and return ONLY the JSON — the full post (hook, body, hashtags) written entirely in fluent natural Persian.'
      : 'Your previous answer was REJECTED: it was not written in English. Try again and return ONLY the JSON — the full post (hook, body, hashtags) written entirely in natural English.';
  };

  /** Shared validation + shaping so every attempt is held to the same contract. */
  const finish = (rawHook: string, rawContent: string): SocialPostResult => {
    const content = fixNameTypos(rawContent.trim());
    if (content.length < 80) throw new Error(`suspiciously short output (${content.length} chars)`);
    assertLanguage(content, lang);
    if (opts.banNumerals) assertNoNumerals(content);
    return {
      platform,
      lang,
      hook: (rawHook.trim() || content.split('\n')[0] || '').slice(0, 200),
      content: platform === 'x' ? content.slice(0, 280) : content,
      limit: spec.limit,
    };
  };

  let lastError: unknown = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      if (attempt === 3) {
        const text = await generateWithFallback([
          { role: 'system' as const, content: markerSys },
          { role: 'user' as const, content: user },
        ]);
        const m = extractMarkedPost(text.replace(/```[a-z]*\n?/gi, ''));
        if (!m) throw new Error('marker-mode output missing ===POST=== section');
        return finish(m.hook, m.content);
      }
      const kind =
        attempt === 1
          ? null
          : lastError instanceof Error && lastError.message.startsWith('quantitative-claim')
            ? ('quantitative' as const)
            : lastError instanceof Error && lastError.message.includes('JSON')
              ? ('json' as const)
              : ('language' as const);
      const messages =
        attempt === 1
          ? [
              { role: 'system' as const, content: sys },
              { role: 'user' as const, content: user },
            ]
          : [
              { role: 'system' as const, content: sys },
              { role: 'user' as const, content: user },
              { role: 'user' as const, content: escalationFor(kind!) },
            ];
      const text = await generateWithFallback(messages);
      let clean = text.replace(/```json|```/g, '').trim();
      const s = clean.indexOf('{');
      const e = clean.lastIndexOf('}');
      if (s === -1 || e === -1) throw new Error('AI did not return JSON');
      const parsed = JSON.parse(clean.slice(s, e + 1)) as {
        posts?: { lang?: string; hook?: string; content?: string }[];
      };
      const first = (parsed.posts || []).find((p) => (p.content || '').trim());
      if (!first) throw new Error('empty generation result');
      return finish(first.hook || '', first.content || '');
    } catch (err) {
      lastError = err;
      console.error(`social generate: ${platform}/${lang} attempt ${attempt} failed:`, err);
    }
  }
  throw lastError instanceof Error ? lastError : new Error('generation failed after retry');
}

/**
 * Generate platform-tailored posts from a blog post or a topic.
 * Each (platform, lang) pair is generated and language-validated
 * independently, so one wrong-language output can never poison the others.
 * Throws on total failure; returns per-platform results otherwise.
 */
export async function generateSocialPosts(opts: SocialGenerateOptions): Promise<SocialPostResult[]> {
  const langs = opts.lang === 'both' ? (['fa', 'en'] as const) : ([opts.lang] as const);
  const results: SocialPostResult[] = [];

  for (const platform of opts.platforms) {
    const spec = PLATFORM_SPECS[platform];
    if (!spec) throw new Error(`Unknown platform: ${platform}`);
    for (const lang of langs) {
      const { block, note, grounded } = await buildSourceBlock(opts, lang);
      results.push(await generateOne(spec, platform, lang, block, note, { banNumerals: !grounded }));
    }
  }

  if (!results.length) throw new Error('Empty generation result');
  return results;
}
