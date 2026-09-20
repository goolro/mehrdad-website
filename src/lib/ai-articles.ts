import { db } from '@/lib/db';
import {
  chatCompletion,
  getProviderChain,
  textCompleteStrict,
  type ChatTurn,
} from '@/lib/ai-provider';
import { retrieveContext, buildContextBlock } from '@/lib/rag';
import { sanitizePostHtml } from '@/lib/sanitize';
import { htmlToText } from '@/lib/social-studio';

/**
 * AI Content Pipeline — three independent AI agents work on every piece:
 *
 *   AI 1 · WRITER      — writes the content (website: fully SEO-optimized
 *                        HTML article with real internal links, or LinkedIn:
 *                        a platform-native post with hook + hashtags)
 *   AI 2 · SEO AUDITOR — independent strict SEO review → score + must-fix list
 *   AI 3 · EDITOR      — independent quality/voice review → score + must-fix list
 *
 * Reviewers run in PARALLEL and never see each other's output (honest
 * double-blind review). If they request changes, the writer revises with the
 * combined feedback and the piece goes back through review (bounded loop).
 * Nothing goes live without a human pressing Publish — the pipeline only
 * ever produces `approved` drafts.
 *
 * JSON payloads live in TEXT columns (sqlite provider has no scalar lists).
 * The Vercel build only runs `prisma generate` against the Postgres mirror,
 * so ensureAiArticleTable() bootstraps the table at runtime (same pattern
 * as ensureSocialDraftTable).
 */

export const APPROVE_THRESHOLD = 85;
export const MAX_REVISIONS = 2;

const BRAND = `Mehrdad — an independent product builder & engineer.
His world: startups, smart city technology, AI, inventions, product design, digital marketing.
Site: https://mehrdad.ir — portfolio, services and blog live there.
Voice: confident but not boastful, practical, forward-looking, concrete examples over vague hype.`;

// ───────────────────────── runtime table bootstrap ─────────────────────────

let ensured: Promise<void> | null = null;

export function ensureAiArticleTable(): Promise<void> {
  if (!ensured) {
    ensured = (async () => {
      await db.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "AiArticle" (
          "id" TEXT NOT NULL,
          "target" TEXT NOT NULL DEFAULT 'website',
          "lang" TEXT NOT NULL DEFAULT 'fa',
          "topic" TEXT NOT NULL,
          "keyword" TEXT,
          "status" TEXT NOT NULL DEFAULT 'draft',
          "titleFa" TEXT,
          "titleEn" TEXT,
          "slugIdea" TEXT,
          "excerptFa" TEXT,
          "excerptEn" TEXT,
          "metaTitle" TEXT,
          "metaDescription" TEXT,
          "keywords" TEXT,
          "internalLinks" TEXT,
          "hashtags" TEXT,
          "contentFa" TEXT,
          "contentEn" TEXT,
          "reviews" TEXT,
          "seoScore" INTEGER,
          "editorScore" INTEGER,
          "revision" INTEGER NOT NULL DEFAULT 1,
          "lastError" TEXT,
          "publishedSlug" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "AiArticle_pkey" PRIMARY KEY ("id")
        )
      `);
      await db
        .$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "AiArticle_status_createdAt_idx" ON "AiArticle"("status", "createdAt")`)
        .catch(() => {});
    })().catch((e) => {
      ensured = null; // allow retry on the next request
      throw e;
    });
  }
  return ensured;
}

// ───────────────────────── provider plumbing ─────────────────────────

async function agentComplete(
  messages: ChatTurn[],
  opts: { maxTokens?: number; temperature?: number; timeoutMs?: number } = {}
): Promise<string> {
  const chain = await getProviderChain();
  for (const provider of chain) {
    try {
      const out = await chatCompletion(provider, messages, {
        timeoutMs: opts.timeoutMs ?? 100_000,
        maxTokens: opts.maxTokens ?? 2000,
        temperature: opts.temperature ?? 0.7,
      });
      if (out) return out;
    } catch (e) {
      console.error(`pipeline agent: provider ${provider.name} failed:`, e);
    }
  }
  return textCompleteStrict(messages, {
    timeoutMs: opts.timeoutMs ?? 100_000,
    maxTokens: opts.maxTokens ?? 2000,
    temperature: opts.temperature ?? 0.7,
  });
}

function parseJson<T>(raw: string): T {
  const clean = raw.replace(/```json|```/g, '').trim();
  const s = clean.indexOf('{');
  if (s === -1) throw new Error('AI did not return JSON');
  const body = clean.slice(s);
  try {
    return JSON.parse(body) as T;
  } catch {
    /* fall through to targeted repairs */
  }
  // trailing prose after the JSON object → cut at the last '}'
  const e = body.lastIndexOf('}');
  if (e !== -1) {
    try {
      return JSON.parse(body.slice(0, e + 1)) as T;
    } catch {
      /* fall through */
    }
  }
  // truncated JSON (token budget burned mid-object) → balance the delimiters
  try {
    return JSON.parse(repairJson(body)) as T;
  } catch {
    throw new Error('AI did not return valid JSON');
  }
}

/** Close truncated JSON: track string state + delimiter depth, append the missing closers. */
function repairJson(src: string): string {
  let inStr = false;
  let esc = false;
  const stack: string[] = [];
  for (const ch of src) {
    if (esc) {
      esc = false;
      continue;
    }
    if (ch === '\\') {
      if (inStr) esc = true;
      continue;
    }
    if (ch === '"') {
      inStr = !inStr;
      continue;
    }
    if (inStr) continue;
    if (ch === '{') stack.push('}');
    else if (ch === '[') stack.push(']');
    else if (ch === '}' || ch === ']') stack.pop();
  }
  let out = src;
  if (inStr) out += '"';
  while (stack.length) out += stack.pop();
  return out;
}

interface AgentOpts {
  maxTokens?: number;
  temperature?: number;
  timeoutMs?: number;
}

/**
 * Agent call that must produce JSON: on a malformed first reply, retry once
 * with an explicit "ONLY the JSON object" instruction — the cheap fix for
 * thinking/truncated replies from weaker fallback models.
 */
async function completeJson<T>(messages: ChatTurn[], opts: AgentOpts): Promise<T> {
  const raw = await agentComplete(messages, opts);
  try {
    return parseJson<T>(raw);
  } catch {
    console.error('pipeline: first JSON attempt unparseable — retrying once');
    const raw2 = await agentComplete(
      [
        ...messages,
        { role: 'assistant', content: clamp(raw, 1500) },
        {
          role: 'user',
          content:
            'Your previous reply was not parseable JSON. Answer again with ONLY the JSON object itself — no explanations, no markdown fences, no text before or after. Do not truncate the JSON.',
        },
      ],
      { ...opts, temperature: 0.55 }
    );
    return parseJson<T>(raw2);
  }
}

function clamp(s: string, max: number): string {
  return s.length <= max ? s : `${s.slice(0, max - 1)}…`;
}

// ───────────────────────── shared prompt inputs ─────────────────────────

interface LinkPoolItem {
  slug: string;
  title: string;
}

async function getInternalLinkPool(): Promise<LinkPoolItem[]> {
  const posts = await db.post.findMany({
    where: { published: true },
    orderBy: { date: 'desc' },
    take: 40,
    select: { slug: true, titleEn: true, titleFa: true },
  });
  return posts.map((p) => ({
    slug: p.slug,
    title: (p.titleFa || p.titleEn || p.slug).trim(),
  }));
}

function renderLinkPool(pool: LinkPoolItem[]): string {
  return pool.map((p) => `- /blog/${p.slug} → ${p.title}`).join('\n');
}

/** Extract the internal links a writer actually used from its HTML. */
export function extractInternalLinks(html: string): { slug: string; anchor: string }[] {
  const out: { slug: string; anchor: string }[] = [];
  const seen = new Set<string>();
  const re = /<a\s[^>]*href="(\/blog\/[a-z0-9-]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const slug = m[1].replace('/blog/', '');
    if (seen.has(slug)) continue;
    seen.add(slug);
    out.push({ slug, anchor: m[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80) });
  }
  return out;
}

/** Related-post picks: keyword overlap with the topic first, pool order as tiebreak. */
function pickRelated(topic: string, keyword: string | undefined, pool: LinkPoolItem[], exclude: Set<string>, n: number): LinkPoolItem[] {
  const tokens = `${topic} ${keyword || ''}`
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((t) => t.length > 2);
  return pool
    .filter((p) => !exclude.has(p.slug))
    .map((p) => {
      const title = p.title.toLowerCase();
      const score = tokens.reduce((acc, t) => acc + (title.includes(t) ? 1 : 0), 0);
      return { p, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, n)
    .map((s) => s.p);
}

function relatedBlock(lang: 'fa' | 'en', picks: LinkPoolItem[]): string {
  const heading = lang === 'fa' ? 'مطالب مرتبط' : 'Related posts';
  const items = picks.map((p) => `<li><a href="/blog/${p.slug}">${p.title}</a></li>`).join('');
  return `<h2>${heading}</h2><ul>${items}</ul>`;
}

/**
 * SEO guarantee: internal linking must survive even when the writer model
 * ignores instructions. If fewer than 3 internal links exist in the article,
 * a "related posts" section built from the REAL published-post pool is
 * appended — deterministic, model-compliant links, zero hallucination.
 */
function ensureInternalLinks(
  input: PipelineInput,
  contentFa: string | undefined,
  contentEn: string | undefined,
  pool: LinkPoolItem[]
): { contentFa?: string; contentEn?: string; links: { slug: string; anchor: string }[] } {
  let fa = contentFa;
  let en = contentEn;
  if (input.target !== 'website') return { contentFa: fa, contentEn: en, links: [] };
  // per-language audit: the writer often concentrates links in one language,
  // so each version must independently reach the 3-link minimum
  const foundFa = extractInternalLinks(fa || '');
  const foundEn = extractInternalLinks(en || '');
  if ((foundFa.length < 3 || foundEn.length < 3) && pool.length > 0) {
    const exclude = new Set([...foundFa, ...foundEn].map((l) => l.slug));
    const picks = pickRelated(input.topic, input.keyword, pool, exclude, 3);
    if (picks.length) {
      if (fa && foundFa.length < 3) fa += relatedBlock('fa', picks);
      if (en && foundEn.length < 3) en += relatedBlock('en', picks);
    }
  }
  const merged: { slug: string; anchor: string }[] = [];
  const seen = new Set<string>();
  for (const l of [...extractInternalLinks(fa || ''), ...extractInternalLinks(en || '')]) {
    if (seen.has(l.slug)) continue;
    seen.add(l.slug);
    merged.push(l);
  }
  return { contentFa: fa, contentEn: en, links: merged };
}

// ───────────────────────── AI 1 · WRITER ─────────────────────────

export interface PipelineInput {
  topic: string;
  keyword?: string;
  target: 'website' | 'linkedin';
  lang: 'fa' | 'en';
}

interface WriterArticle {
  titleFa?: string;
  titleEn?: string;
  slug?: string;
  excerptFa?: string;
  excerptEn?: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  contentFa?: string;
  contentEn?: string;
  hashtags?: string[];
}

const WEBSITE_SEO_RULES = `SEO REQUIREMENTS (all mandatory):
- Focus keyword appears in: title, meta title, meta description, the first paragraph, and at least two H2 headings — naturally, never stuffed.
- <metaTitle> ≤ 60 chars. <metaDescription> ≤ 155 chars, written to earn the click.
- Body: 900-1300 words per language. Semantic structure with <h2> main sections and <h2>/<h3> sub-points. Paragraphs short (2-4 sentences).
- Include a "FAQ" section at the end: 3-4 <h3> questions each answered in 2-3 sentences (targets rich results and People-Also-Ask).
- INTERNAL LINKING: pick 3-6 truly relevant targets from the ALLOWED LIST below and weave them into the body as <a href="/blog/SLUG">descriptive anchor text</a>. Anchor text must describe the target page (never "click here"). NEVER invent a slug that is not on the list.
- Content must teach something concrete: steps, examples, numbers, real trade-offs. No fluff introductions like "in today's fast-paced world".
- End the body (before FAQ) with one short actionable takeaway paragraph.`;

async function writeArticle(input: PipelineInput, feedback?: string): Promise<WriterArticle> {
  const pool = await getInternalLinkPool();
  const chunks = await retrieveContext(`${input.topic} ${input.keyword || ''}`, 5);
  const context = buildContextBlock(chunks);
  const langLine =
    input.lang === 'fa'
      ? 'Write in fluent, natural Persian (Farsi) — prose a native editor would sign, not machine translation.'
      : 'Write in English.';

  let sys: string;
  let user: string;

  if (input.target === 'website') {
    sys = `You are AI WRITER (agent 1 of 3) in the content pipeline for ${BRAND}

TASK: write a complete, publication-ready, fully SEO-optimized blog article.

${WEBSITE_SEO_RULES}

ALLOWED INTERNAL LINKS (the ONLY slugs you may link to):
${renderLinkPool(pool)}

EXISTING SITE KNOWLEDGE (stay consistent with Mehrdad's other content, never copy verbatim):
${context || '(none)'}

${langLine}
Respond with ONLY valid JSON (no markdown fences) in this exact shape:
{"titleFa":"","titleEn":"","slug":"kebab-case-from-english-title","excerptFa":"","excerptEn":"","metaTitle":"","metaDescription":"","keywords":["","",""],"contentFa":"<h2>…</h2><p>…</p>…","contentEn":"<h2>…</h2><p>…</p>…"}
Both languages are always produced. The HTML must use only <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em>, <a> tags — no <html>/<body>/<h1>.`;
    user = `Topic: ${input.topic}${input.keyword ? `\nFocus keyword: ${input.keyword}` : ''}${
      feedback ? `\n\nREVISION REQUEST (${input.lang} version must be rewritten; keep the other language version as-is):\n${feedback}` : ''
    }\n\nWrite the full article now.`;
  } else {
    sys = `You are AI WRITER (agent 1 of 3) in the content pipeline for ${BRAND}

TASK: write a LinkedIn post that looks human, earns dwell time, and drives profile/blog visits.

FORMAT RULES:
- First 2 lines = the hook (they show before "...see more") — curiosity or a bold, specific insight
- Short paragraphs (1-2 sentences), blank line between them
- One practical insight or lesson the reader can use (steps, numbers, concrete examples)
- End with a soft CTA pointing to https://mehrdad.ir
- 3-5 relevant hashtags at the very end
- Length: 600-1300 characters — never exceed

EXISTING SITE KNOWLEDGE (may inform the post, never copy verbatim):
${context || '(none)'}

${langLine}
Respond with ONLY valid JSON (no markdown fences) in this exact shape:
{"titleFa":"","titleEn":"","contentFa":"","contentEn":"","hashtags":["","",""]}
Fill contentFa and contentEn both; hashtags apply to both versions.`;
    user = `Topic: ${input.topic}${input.keyword ? `\nAngle/keyword: ${input.keyword}` : ''}${
      feedback ? `\n\nREVISION REQUEST (rewrite the ${input.lang} version; keep the other as-is):\n${feedback}` : ''
    }\n\nWrite the post now.`;
  }

  const raw = await completeJson<WriterArticle>(
    [
      { role: 'system', content: sys },
      { role: 'user', content: user },
    ],
    { maxTokens: 6000, temperature: feedback ? 0.65 : 0.75, timeoutMs: 110_000 }
  );
  return raw;
}

// ───────────────────────── AI 2 · SEO AUDITOR + AI 3 · EDITOR ─────────────────────────

export interface ReviewVerdict {
  agent: 'seo' | 'editor';
  revision: number;
  score: number;
  verdict: 'approve' | 'revise';
  issues: string[];
  must_fix: string[];
  notes: string;
  at: string;
}

function reviewShapeLine(): string {
  return `Respond with ONLY valid JSON (no markdown fences):
{"score":0-100,"verdict":"approve"|"revise","issues":["…"],"must_fix":["…"],"notes":"one short paragraph"}
- score ≥ ${APPROVE_THRESHOLD} AND empty must_fix is required for "approve"
- must_fix = blocking problems only (empty array when you approve)
- issues = non-blocking improvement suggestions`;
}

/** Pull score/verdict out of a malformed reply — last-resort salvage. */
function salvageVerdict(raw: string): Partial<ReviewVerdict> | null {
  const score = raw.match(/"score"\s*:\s*(\d{1,3})/);
  if (!score) return null;
  const verdict = raw.match(/"verdict"\s*:\s*"(approve|revise)"/);
  return {
    score: Math.min(100, Number(score[1])),
    verdict: (verdict?.[1] as 'approve' | 'revise') || 'revise',
    issues: [],
    must_fix: [],
    notes: 'salvaged from a partial reply',
  };
}

/**
 * One reviewer round: strict JSON → one explicit retry → raw text + regex
 * salvage. A reviewer should only ever die when the model truly said
 * nothing parseable at all.
 */
async function reviewJson(agent: 'seo' | 'editor', messages: ChatTurn[], revision: number): Promise<Partial<ReviewVerdict>> {
  try {
    return await completeJson<Partial<ReviewVerdict>>(messages, {
      maxTokens: 1600,
      temperature: 0.4,
      timeoutMs: 90_000,
    });
  } catch (e) {
    console.error(`${agent} reviewer: JSON retry exhausted — salvaging raw reply`);
    const raw = await agentComplete(messages, { maxTokens: 1600, temperature: 0.3, timeoutMs: 90_000 });
    const salvaged = salvageVerdict(raw);
    if (salvaged) return salvaged;
    throw e;
  }
}

function normalizeVerdict(v: Partial<ReviewVerdict>, agent: 'seo' | 'editor', revision: number): ReviewVerdict {
  return {
    agent,
    revision,
    score: Math.max(0, Math.min(100, Math.round(Number(v.score) || 0))),
    verdict: v.verdict === 'approve' ? 'approve' : 'revise',
    issues: Array.isArray(v.issues) ? v.issues.map(String).slice(0, 8) : [],
    must_fix: Array.isArray(v.must_fix) ? v.must_fix.map(String).slice(0, 8) : [],
    notes: String(v.notes || '').slice(0, 600),
    at: new Date().toISOString(),
  };
}

async function seoReviewer(article: {
  target: string;
  lang: string;
  topic: string;
  keyword?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  contentFa?: string | null;
  contentEn?: string | null;
  internalLinks: { slug: string; anchor: string }[];
  linkPool: LinkPoolItem[];
  revision: number;
}): Promise<ReviewVerdict> {
  const content = article.lang === 'fa' ? article.contentFa : article.contentEn;
  const other = article.lang === 'fa' ? article.contentEn : article.contentFa;
  const poolSet = new Set(article.linkPool.map((p) => p.slug));
  const hallucinated = article.internalLinks.filter((l) => !poolSet.has(l.slug));

  const sys = `You are AI SEO AUDITOR (agent 2 of 3) — a ruthless but fair technical SEO reviewer for ${BRAND}
You review revision #${article.revision}. Target: ${article.target === 'linkedin' ? 'LinkedIn post' : 'blog article (website)'}.

CHECKLIST (score 0-100, be strict — a 90+ must deserve publication):
1. Focus keyword usage: title, first paragraph, headings — natural, not stuffed
2. Meta title ≤ 60 chars; meta description ≤ 155 chars and click-worthy (blog target only)
3. Heading hierarchy: semantic <h2>/<h3>, no keyword-stuffed headings
4. Internal links: 3-6 contextual links with descriptive anchors (blog target). LinkedIn: zero fake links
5. Content depth: concrete examples/steps, scannable paragraphs, ${article.target === 'website' ? '900-1300 words' : '600-1300 chars'}
6. FAQ section present (blog target only)
7. Link integrity: every internal link slug must exist in the ALLOWED LIST${hallucinated.length ? `\n\nDETECTED HALLUCINATED LINKS (automatic must_fix): ${hallucinated.map((l) => l.slug).join(', ')}` : ''}

ALLOWED INTERNAL LINK SLUGS:
${article.linkPool.map((p) => p.slug).join('\n') || '(none)'}

${reviewShapeLine()}`;

  const user = `Topic: ${article.topic}
Focus keyword: ${article.keyword || '(writer chose)'}
Meta title: ${article.metaTitle || '(missing)'}
Meta description: ${article.metaDescription || '(missing)'}
Internal links used: ${JSON.stringify(article.internalLinks)}
Review-language content:
${clamp(htmlToText(content || ''), 3500)}
(The other-language version exists but is not under review this round: ${other ? `${htmlToText(other).length} chars` : 'missing'})`;

  return normalizeVerdict(
    await reviewJson(
      'seo',
      [
        { role: 'system', content: sys },
        { role: 'user', content: user },
      ],
      article.revision
    ),
    'seo',
    article.revision
  );
}

async function editorReviewer(article: {
  target: string;
  lang: string;
  topic: string;
  contentFa?: string | null;
  contentEn?: string | null;
  revision: number;
}): Promise<ReviewVerdict> {
  const content = article.lang === 'fa' ? article.contentFa : article.contentEn;
  const sys = `You are AI EDITOR-IN-CHIEF (agent 3 of 3) — the quality gate for ${BRAND}
You review revision #${article.revision} INDEPENDENTLY (you cannot see the SEO auditor's opinion).

CHECKLIST (score 0-100, be strict):
1. Accuracy & honesty: no invented statistics, fake claims, or facts about Mehrdad that are not given. Flag anything that sounds fabricated
2. Voice: confident but not boastful, practical, concrete examples over hype. Reads like Mehrdad, not like a generic AI
3. Language quality: native-level ${article.lang === 'fa' ? 'Persian (no translationese)' : 'English'}
4. Structure & flow: logical progression, no repeated sentences, no filler phrases ("in today's fast-paced world", "unlock the power of")
5. Value: the reader finishes knowing something they can actually use
6. CTA: present and honest${article.target === 'linkedin' ? '; hook must work in the first 2 lines' : ''}

${reviewShapeLine()}`;

  const user = `Topic: ${article.topic}
Content under review:
${clamp(htmlToText(content || ''), 3500)}`;

  return normalizeVerdict(
    await reviewJson(
      'editor',
      [
        { role: 'system', content: sys },
        { role: 'user', content: user },
      ],
      article.revision
    ),
    'editor',
    article.revision
  );
}

// ───────────────────────── pipeline steps ─────────────────────────

function sanitizeWriterOutput(a: WriterArticle): WriterArticle {
  if (a.contentFa) a.contentFa = sanitizePostHtml(a.contentFa);
  if (a.contentEn) a.contentEn = sanitizePostHtml(a.contentEn);
  return a;
}

/** Step 1 — AI writer produces revision 1. Returns the created row id. */
export async function pipelineGenerate(input: PipelineInput): Promise<string> {
  await ensureAiArticleTable();
  const written = sanitizeWriterOutput(await writeArticle(input));
  const pool = await getInternalLinkPool();
  const patched = ensureInternalLinks(input, written.contentFa || undefined, written.contentEn || undefined, pool);
  const row = await db.aiArticle.create({
    data: {
      target: input.target,
      lang: input.lang,
      topic: input.topic,
      keyword: input.keyword || null,
      status: 'draft',
      titleFa: written.titleFa || null,
      titleEn: written.titleEn || null,
      slugIdea: written.slug || null,
      excerptFa: written.excerptFa || null,
      excerptEn: written.excerptEn || null,
      metaTitle: written.metaTitle || null,
      metaDescription: written.metaDescription || null,
      keywords: JSON.stringify(written.keywords || []),
      internalLinks: JSON.stringify(patched.links),
      hashtags: JSON.stringify(written.hashtags || []),
      contentFa: patched.contentFa || null,
      contentEn: patched.contentEn || null,
      revision: 1,
    },
  });
  return row.id;
}

/** Step 2 — AI 2 + AI 3 review in parallel, double-blind. */
export async function pipelineReview(id: string) {
  await ensureAiArticleTable();
  const a = await db.aiArticle.findUnique({ where: { id } });
  if (!a) throw new Error('Article not found');
  if (a.status === 'published') throw new Error('Article already published');

  const linkPool = await getInternalLinkPool();
  const payload = {
    target: a.target,
    lang: a.lang,
    topic: a.topic,
    keyword: a.keyword,
    metaTitle: a.metaTitle,
    metaDescription: a.metaDescription,
    contentFa: a.contentFa,
    contentEn: a.contentEn,
    internalLinks: JSON.parse(a.internalLinks || '[]') as { slug: string; anchor: string }[],
    linkPool,
    revision: a.revision,
  };

  const [seo, editor] = await Promise.all([
    seoReviewer(payload).catch((e) => {
      console.error('seo reviewer failed:', e);
      return null;
    }),
    editorReviewer(payload).catch((e) => {
      console.error('editor reviewer failed:', e);
      return null;
    }),
  ]);
  if (!seo && !editor) throw new Error('Both reviewers failed');

  const history = JSON.parse(a.reviews || '[]') as ReviewVerdict[];
  const fresh = [seo, editor].filter(Boolean) as ReviewVerdict[];
  history.push(...fresh);

  const seoScore = seo?.score ?? a.seoScore ?? undefined;
  const editorScore = editor?.score ?? a.editorScore ?? undefined;
  const mustFix = fresh.flatMap((r) => r.must_fix);
  const approved =
    fresh.length === 2 &&
    (seoScore ?? 0) >= APPROVE_THRESHOLD &&
    (editorScore ?? 0) >= APPROVE_THRESHOLD &&
    mustFix.length === 0 &&
    seo?.verdict === 'approve' &&
    editor?.verdict === 'approve';

  await db.aiArticle.update({
    where: { id },
    data: {
      status: approved ? 'approved' : 'needs_revision',
      seoScore: typeof seoScore === 'number' ? seoScore : null,
      editorScore: typeof editorScore === 'number' ? editorScore : null,
      reviews: JSON.stringify(history),
      lastError: null,
    },
  });

  return {
    id,
    status: approved ? 'approved' : 'needs_revision',
    seoScore,
    editorScore,
    reviews: fresh,
  };
}

/** Step 3 — writer applies the reviewers' feedback (bounded by MAX_REVISIONS). */
export async function pipelineRevise(id: string) {
  await ensureAiArticleTable();
  const a = await db.aiArticle.findUnique({ where: { id } });
  if (!a) throw new Error('Article not found');
  if (a.revision >= MAX_REVISIONS + 1) throw new Error('Revision limit reached — human decision required');

  const history = JSON.parse(a.reviews || '[]') as ReviewVerdict[];
  // legacy entries may miss `revision` — treat them as round 1
  const lastRound = history.filter((r) => (r.revision ?? 1) === a.revision);
  const mustFix = lastRound.flatMap((r) => r.must_fix.map((f) => `[${r.agent ?? 'reviewer'}] ${f}`));
  const issues = lastRound.flatMap((r) => r.issues.map((f) => `[${r.agent ?? 'reviewer'}] ${f}`));
  if (!mustFix.length && !issues.length) throw new Error('No feedback to apply — run a review first');

  const feedback = [
    mustFix.length ? `BLOCKING (must all be fixed):\n${mustFix.map((f) => `- ${f}`).join('\n')}` : '',
    issues.length ? `IMPROVEMENTS (apply what makes sense):\n${issues.map((f) => `- ${f}`).join('\n')}` : '',
    `Latest scores: SEO ${a.seoScore ?? '?'}/100, Editor ${a.editorScore ?? '?'}/100. Target: ${APPROVE_THRESHOLD}+ on both.`,
  ]
    .filter(Boolean)
    .join('\n\n');

  const written = sanitizeWriterOutput(
    await writeArticle(
      { topic: a.topic, keyword: a.keyword || undefined, target: a.target as 'website' | 'linkedin', lang: a.lang as 'fa' | 'en' },
      feedback
    )
  );
  const pool = await getInternalLinkPool();
  const patched = ensureInternalLinks(
    { topic: a.topic, keyword: a.keyword || undefined, target: a.target as 'website' | 'linkedin', lang: a.lang as 'fa' | 'en' },
    written.contentFa || a.contentFa || undefined,
    written.contentEn || a.contentEn || undefined,
    pool
  );

  await db.aiArticle.update({
    where: { id },
    data: {
      titleFa: written.titleFa || a.titleFa,
      titleEn: written.titleEn || a.titleEn,
      slugIdea: written.slug || a.slugIdea,
      excerptFa: written.excerptFa || a.excerptFa,
      excerptEn: written.excerptEn || a.excerptEn,
      metaTitle: written.metaTitle || a.metaTitle,
      metaDescription: written.metaDescription || a.metaDescription,
      keywords: JSON.stringify(written.keywords || []),
      internalLinks: JSON.stringify(patched.links),
      hashtags: JSON.stringify(written.hashtags || []),
      contentFa: patched.contentFa || a.contentFa,
      contentEn: patched.contentEn || a.contentEn,
      revision: a.revision + 1,
      status: 'draft',
      lastError: null,
    },
  });
  return { id, revision: a.revision + 1 };
}

// ───────────────────────── publish (human-gated) ─────────────────────────

async function uniquePostSlug(base: string): Promise<string> {
  const clean =
    base
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 90) || 'ai-article';
  let slug = clean;
  let i = 1;
  while (await db.post.findUnique({ where: { slug } })) {
    i += 1;
    slug = `${clean}-${i}`;
  }
  return slug;
}

/**
 * Human pressed Publish:
 *  - website  → Post row (+KB, deploy hook, IndexNow) — goes live on the blog
 *  - linkedin → SocialDraft in the Social Studio queue (existing publish flow)
 */
export async function pipelinePublish(id: string, opts: { cover?: string | null; categoryId?: string | null }) {
  const a = await db.aiArticle.findUnique({ where: { id } });
  if (!a) throw new Error('Article not found');
  if (a.status === 'published') throw new Error('Already published');

  if (a.target === 'website') {
    const base = a.slugIdea || a.titleEn || a.titleFa || a.topic;
    const slug = await uniquePostSlug(base);
    const post = await db.post.create({
      data: {
        slug,
        titleEn: a.titleEn || null,
        titleFa: a.titleFa || null,
        excerptEn: a.excerptEn || null,
        excerptFa: a.excerptFa || null,
        contentEn: sanitizePostHtml(a.contentEn || '') || null,
        contentFa: sanitizePostHtml(a.contentFa || '') || null,
        cover: opts.cover || null,
        published: true,
        featured: false,
        source: 'ai',
        date: new Date(),
        ...(opts.categoryId ? { categories: { connect: [{ id: opts.categoryId }] } } : {}),
      },
    });
    const { addPostToKb } = await import('@/lib/kb');
    await addPostToKb(post.id).catch((e) => console.error('pipeline publish: kb failed:', e));
    if (process.env.VERCEL_DEPLOY_HOOK_URL) {
      await fetch(process.env.VERCEL_DEPLOY_HOOK_URL, { method: 'POST' }).catch(() => {});
    }
    const { notifyIndexNow } = await import('@/lib/indexnow');
    const baseUrl = (process.env.SITE_ORIGIN || 'https://mehrdad.ir').replace(/\/+$/, '');
    notifyIndexNow([`${baseUrl}/blog/${encodeURIComponent(post.slug)}`, `${baseUrl}/blog`]);
    await db.aiArticle.update({ where: { id }, data: { status: 'published', publishedSlug: post.slug } });
    return { target: 'website' as const, slug: post.slug };
  }

  // linkedin → review queue of the existing Social Studio
  const lang = a.lang === 'en' ? 'en' : 'fa';
  const content = ((a.lang === 'en' ? a.contentEn : a.contentFa) || a.contentEn || a.contentFa || '').trim();
  if (!content) throw new Error('Empty LinkedIn content');
  const draft = await db.socialDraft.create({
    data: { platform: 'linkedin', lang, topic: a.titleFa || a.titleEn || a.topic, sourceSlug: a.publishedSlug || null, content },
  });
  await db.aiArticle.update({ where: { id }, data: { status: 'published' } });
  return { target: 'linkedin' as const, draftId: draft.id };
}

export function serializeArticle(a: {
  keywords: string | null;
  internalLinks: string | null;
  hashtags: string | null;
  reviews: string | null;
  [k: string]: unknown;
}) {
  return {
    ...a,
    keywords: JSON.parse(a.keywords || '[]'),
    internalLinks: JSON.parse(a.internalLinks || '[]'),
    hashtags: JSON.parse(a.hashtags || '[]'),
    reviews: JSON.parse(a.reviews || '[]'),
  };
}
