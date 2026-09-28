import { db } from '@/lib/db';
import { textCompleteStrict, type ChatTurn } from '@/lib/ai-provider';

/**
 * SEO Brief Builder — the owner's NotebookLM workflow, natively:
 *
 *   1. competitor/reference URLs (BriefSource, seeded + admin-managed)
 *   2. live scan of every source page → raw H1–H4 outline (BriefScan)
 *   3. AI filter — drop nav/boilerplate/duplicates, keep the important
 *      headings, cluster them
 *   4. AI brief — the owner's exact "نیازمندی محتوایی" prompt produces the
 *      content structure: H2s, required H3/H4s, must-cover topics, missing
 *      headings, FAQ questions (questions only — per the owner's template)
 *
 * The brief is a human-readable markdown deliverable plus structured JSON so
 * the UI can render it and the article pipeline can consume it verbatim.
 *
 * JSON payloads live in TEXT columns (sqlite has no scalar lists — same
 * pattern as the rest of this schema). Runtime bootstrap follows
 * ensureAiArticleTable(): production Postgres gets the tables on first use.
 */

export const DAILY_CATEGORIES = ['product', 'ai', 'startup'] as const;
export type DailyCategory = (typeof DAILY_CATEGORIES)[number];

export function isBriefCategory(v: unknown): v is DailyCategory {
  return typeof v === 'string' && (DAILY_CATEGORIES as readonly string[]).includes(v);
}

// ───────────────────────── seeded competitor sources ─────────────────────────

export interface DefaultSource {
  name: string;
  url: string;
  lang: 'en' | 'fa';
  category: DailyCategory;
  active: boolean;
  note?: string;
}

/**
 * Researched 2026-09 for the brief builder (owner: «این رقبا را خودت پیدا کن
 * — انگلیسی و فارسی»). Fetchability was probed live from the server: sources
 * that hard-block server-side bots (403/429/challenge) are seeded INACTIVE
 * with a note — the owner can flip them on if their IPs get through.
 */
export const DEFAULT_SOURCES: DefaultSource[] = [
  // ── English · product discovery ──
  { name: 'The Verge', url: 'https://www.theverge.com/', lang: 'en', category: 'product', active: true },
  { name: 'Mashable', url: 'https://mashable.com/', lang: 'en', category: 'product', active: true },
  { name: 'Lifehacker', url: 'https://lifehacker.com/', lang: 'en', category: 'product', active: true },
  { name: 'Wired', url: 'https://www.wired.com/', lang: 'en', category: 'product', active: true },
  { name: 'Gizmodo', url: 'https://gizmodo.com/', lang: 'en', category: 'product', active: false, note: 'مسدود برای ربات (403)' },
  { name: 'Product Hunt', url: 'https://www.producthunt.com/', lang: 'en', category: 'product', active: false, note: 'مسدود برای ربات (403)' },
  // ── English · AI ──
  { name: 'FutureTools', url: 'https://www.futuretools.io/', lang: 'en', category: 'ai', active: true },
  { name: 'Unite.AI', url: 'https://www.unite.ai/', lang: 'en', category: 'ai', active: true },
  { name: 'There Is An AI For That', url: 'https://theresanaiforthat.com/', lang: 'en', category: 'ai', active: false, note: 'مسدود برای ربات (403)' },
  { name: 'Futurepedia', url: 'https://www.futurepedia.io/', lang: 'en', category: 'ai', active: false, note: 'مسدود برای ربات (403)' },
  { name: 'Toolify', url: 'https://toolify.ai/', lang: 'en', category: 'ai', active: false, note: 'مسدود برای ربات (403)' },
  { name: 'MarkTechPost', url: 'https://www.marktechpost.com/', lang: 'en', category: 'ai', active: false, note: 'چالش ربات (202)' },
  // ── English · startup ──
  { name: 'TechCrunch', url: 'https://techcrunch.com/', lang: 'en', category: 'startup', active: true },
  { name: 'VentureBeat', url: 'https://venturebeat.com/', lang: 'en', category: 'startup', active: false, note: 'محدودیت نرخ (429)' },
  { name: 'Indie Hackers', url: 'https://www.indiehackers.com/', lang: 'en', category: 'startup', active: true },
  { name: 'Y Combinator', url: 'https://www.ycombinator.com/', lang: 'en', category: 'startup', active: true },
  { name: 'HackerNoon', url: 'https://hackernoon.com/', lang: 'en', category: 'startup', active: true },
  // ── Persian · product ──
  { name: 'زومیت', url: 'https://www.zoomit.ir/', lang: 'fa', category: 'product', active: true },
  { name: 'دیجیاتو', url: 'https://digiato.com/', lang: 'fa', category: 'product', active: true },
  { name: 'گجت‌نیوز', url: 'https://gadgetnews.ir/', lang: 'fa', category: 'product', active: true },
  { name: 'دیجی‌کالا مگ', url: 'https://www.digikala.com/mag/', lang: 'fa', category: 'product', active: true },
  { name: 'آی‌تی‌رسان', url: 'https://itresan.com/', lang: 'fa', category: 'product', active: true },
  { name: 'نارنجی', url: 'https://narenji.ir/', lang: 'fa', category: 'product', active: false, note: 'خطای شبکه هنگام تست' },
  // ── Persian · AI / startup ──
  { name: 'تکنا', url: 'https://techna.news/', lang: 'fa', category: 'ai', active: true },
  { name: 'جارچی', url: 'https://jarchi.io/', lang: 'fa', category: 'ai', active: true },
];

// ───────────────────────── runtime table bootstrap ─────────────────────────

let ensured: Promise<void> | null = null;

export function ensureBriefTables(): Promise<void> {
  if (!ensured) {
    ensured = (async () => {
      await db.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "BriefSource" (
          "id" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "url" TEXT NOT NULL,
          "lang" TEXT NOT NULL DEFAULT 'en',
          "category" TEXT NOT NULL DEFAULT 'product',
          "active" BOOLEAN NOT NULL DEFAULT true,
          "note" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "BriefSource_pkey" PRIMARY KEY ("id")
        )
      `);
      await db.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "BriefScan" (
          "id" TEXT NOT NULL,
          "sourceId" TEXT NOT NULL,
          "ok" BOOLEAN NOT NULL DEFAULT true,
          "error" TEXT,
          "title" TEXT,
          "headings" TEXT NOT NULL DEFAULT '[]',
          "headingCount" INTEGER NOT NULL DEFAULT 0,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "BriefScan_pkey" PRIMARY KEY ("id")
        )
      `);
      await db.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Brief" (
          "id" TEXT NOT NULL,
          "topic" TEXT NOT NULL,
          "category" TEXT NOT NULL DEFAULT 'product',
          "status" TEXT NOT NULL DEFAULT 'ready',
          "filtered" TEXT NOT NULL DEFAULT '[]',
          "structure" TEXT,
          "briefMd" TEXT,
          "sourceCount" INTEGER NOT NULL DEFAULT 0,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "Brief_pkey" PRIMARY KEY ("id")
        )
      `);
      await db.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "BriefSource_url_key" ON "BriefSource"("url")`).catch(() => {});
      await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "BriefScan_sourceId_createdAt_idx" ON "BriefScan"("sourceId", "createdAt")`).catch(() => {});
      await db.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Brief_status_createdAt_idx" ON "Brief"("status", "createdAt")`).catch(() => {});

      // seed the researched sources exactly once
      const count = await db.briefSource.count();
      if (count === 0) {
        for (const s of DEFAULT_SOURCES) {
          await db.briefSource
            .create({
              data: {
                name: s.name,
                url: s.url,
                lang: s.lang,
                category: s.category,
                active: s.active,
                note: s.note || null,
              },
            })
            .catch(() => {}); // concurrent boot on two instances → unique url race
        }
      }
    })().catch((e) => {
      ensured = null; // allow retry on the next request
      throw e;
    });
  }
  return ensured;
}

// ───────────────────────── page fetch + heading extraction ─────────────────────────

const FETCH_TIMEOUT_MS = 12_000;
const MAX_HTML_CHARS = 600_000;
const MAX_HEADINGS_PER_SOURCE = 60;

const BROWSER_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

function decodeEntities(s: string): string {
  return s
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;|&apos;|&#x27;/gi, "'")
    .replace(/&hellip;/gi, '…')
    .replace(/&#(\d+);/g, (_, d: string) => {
      try {
        return String.fromCodePoint(parseInt(d, 10));
      } catch {
        return '';
      }
    })
    .replace(/&#x([0-9a-f]+);/gi, (_, h: string) => {
      try {
        return String.fromCodePoint(parseInt(h, 16));
      } catch {
        return '';
      }
    });
}

/** headings + title boilerplate that carries no topical value */
const JUNK_RE =
  /^(menu|more|search|sign in|sign up|log in|subscribe|newsletter|home|read more|see more|show more|all posts|latest|trending|popular|categories|tags|reviews|news|shop|about|contact|advertise|privacy|terms|jobs|careers|تمام اخبار|ادامه مطلب|مشاهده بیشتر|بیشتر|منو|جستجو|ورود|ثبت نام|عضویت|خانه|صفحه اصلی|درباره|تماس|تبلیغات|حریم خصوصی|آرشیو|دسته‌بندی|برچسب‌ها|محبوب|تازه‌ها|آخرین مطالب|مطالب مرتبط|نظرات)$/i;

export interface ExtractedHeading {
  tag: string; // h1 | h2 | h3 | h4
  text: string;
}

export interface Extraction {
  title: string | null;
  headings: ExtractedHeading[];
}

export function extractHeadings(html: string): Extraction {
  const body = html
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(script|style|noscript|svg|template)[\s\S]*?<\/\1>/gi, ' ');

  const titleMatch = body.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? decodeEntities(titleMatch[1]).replace(/\s+/g, ' ').trim().slice(0, 200) : null;

  const out: ExtractedHeading[] = [];
  const seen = new Set<string>();
  const re = /<h([1-4])(?:\s[^>]*)?>([\s\S]*?)<\/h\1>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body)) && out.length < MAX_HEADINGS_PER_SOURCE) {
    const text = decodeEntities(m[2].replace(/<[^>]+>/g, ' '))
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 160);
    if (text.length < 3 || text.length > 140) continue;
    if (JUNK_RE.test(text)) continue;
    const key = text.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ tag: `h${m[1]}`, text });
  }
  return { title, headings: out };
}

export interface ScanOutcome {
  sourceId: string;
  name: string;
  url: string;
  lang: string;
  category: string;
  ok: boolean;
  error?: string;
  title?: string | null;
  headings: ExtractedHeading[];
  cached?: boolean;
  scanId?: string;
}

async function fetchPage(url: string): Promise<string> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': BROWSER_UA,
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9,fa;q=0.8',
      },
      signal: ctrl.signal,
      redirect: 'follow',
    });
    const html = await res.text();
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return html.slice(0, MAX_HTML_CHARS);
  } finally {
    clearTimeout(timer);
  }
}

/** scans younger than this are reused unless the admin forces a refresh */
const SCAN_TTL_MS = 6 * 60 * 60 * 1000;

/**
 * Scan every active source (optionally one category lane). Recent scans are
 * reused (6h TTL) so generating several briefs in a row does not hammer the
 * competitor sites — force=true bypasses the cache.
 */
export async function scanSources(opts: { category?: DailyCategory; force?: boolean } = {}): Promise<ScanOutcome[]> {
  await ensureBriefTables();
  const sources = await db.briefSource.findMany({
    where: { active: true, ...(opts.category ? { category: opts.category } : {}) },
    orderBy: { createdAt: 'asc' },
  });
  if (!sources.length) return [];

  const since = new Date(Date.now() - SCAN_TTL_MS);
  const recent = await db.briefScan.findMany({
    where: { sourceId: { in: sources.map((s) => s.id) }, ok: true, createdAt: { gt: since } },
    orderBy: { createdAt: 'desc' },
  });
  const cachedBySource = new Map<string, (typeof recent)[number]>();
  for (const scan of recent) if (!cachedBySource.has(scan.sourceId)) cachedBySource.set(scan.sourceId, scan);

  const results = await Promise.all(
    sources.map(async (source): Promise<ScanOutcome> => {
      const cached = opts.force ? undefined : cachedBySource.get(source.id);
      if (cached) {
        return {
          sourceId: source.id,
          name: source.name,
          url: source.url,
          lang: source.lang,
          category: source.category,
          ok: true,
          title: cached.title,
          headings: JSON.parse(cached.headings || '[]') as ExtractedHeading[],
          cached: true,
          scanId: cached.id,
        };
      }
      try {
        const html = await fetchPage(source.url);
        const { title, headings } = extractHeadings(html);
        const row = await db.briefScan.create({
          data: {
            sourceId: source.id,
            ok: true,
            title,
            headings: JSON.stringify(headings),
            headingCount: headings.length,
          },
        });
        return {
          sourceId: source.id,
          name: source.name,
          url: source.url,
          lang: source.lang,
          category: source.category,
          ok: true,
          title,
          headings,
          scanId: row.id,
        };
      } catch (e) {
        const error = e instanceof Error ? (e.name === 'AbortError' ? 'timeout' : e.message) : 'fetch failed';
        await db.briefScan
          .create({
            data: { sourceId: source.id, ok: false, error: error.slice(0, 300), headings: '[]', headingCount: 0 },
          })
          .catch(() => {});
        return {
          sourceId: source.id,
          name: source.name,
          url: source.url,
          lang: source.lang,
          category: source.category,
          ok: false,
          error,
          headings: [],
        };
      }
    })
  );
  return results;
}

// ───────────────────────── AI stages ─────────────────────────

/** tolerant JSON extraction (same repair strategy as the article pipeline) */
function parseBriefJson<T>(raw: string): T {
  const clean = raw.replace(/```json|```/g, '').trim();
  const s = clean.indexOf('{');
  if (s === -1) throw new Error('AI did not return JSON');
  const body = clean.slice(s);
  const attempts = [body];
  const e = body.lastIndexOf('}');
  if (e !== -1) attempts.push(body.slice(0, e + 1));
  for (const attempt of attempts) {
    try {
      return JSON.parse(attempt) as T;
    } catch {
      /* next */
    }
    try {
      // trailing commas are the #2 model fingerprint after truncation
      return JSON.parse(attempt.replace(/,\s*([}\]])/g, '$1')) as T;
    } catch {
      /* next */
    }
  }
  // balance truncated JSON (string-aware delimiter repair)
  let inStr = false;
  let esc = false;
  const stack: string[] = [];
  for (const ch of body) {
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
  let out = body;
  if (inStr) out += '"';
  while (stack.length) out += stack.pop();
  return JSON.parse(out) as T;
}

async function aiJson<T>(messages: ChatTurn[], maxTokens: number): Promise<T> {
  const run = () => textCompleteStrict(messages, { maxTokens, temperature: 0.45, timeoutMs: 90_000 });
  try {
    return parseBriefJson<T>(await run());
  } catch {
    // one strict retry — the cheap fix for a model that prose-wraps its JSON
    const raw2 = await textCompleteStrict(
      [
        ...messages,
        {
          role: 'user',
          content:
            'Your previous reply was not parseable JSON. Answer again with ONLY the JSON object itself — no markdown fences, no explanations. Escape every double quote inside string values, or simply avoid double quotes in values.',
        },
      ],
      { maxTokens, temperature: 0.35, timeoutMs: 90_000 }
    );
    return parseBriefJson<T>(raw2);
  }
}

/**
 * Heading text goes into a JSON-shaped prompt and the model echoes it back
 * inside JSON strings — a raw double quote (or backslash) in a scraped
 * heading is enough to corrupt the reply. Strip the risky characters
 * upfront: they carry no SEO value anyway.
 */
function safeHeadingText(s: string): string {
  return s
    .replace(/["\\]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** models love echoing the [h2] tag or adding their own numbering — strip both */
function stripEchoedPrefixes(s: string): string {
  let out = s.trim();
  for (;;) {
    const next = out
      .replace(/^\[h[1-4]\]\s*/i, '')
      .replace(/^\d+\s*[\].):-]\s*/, '')
      .replace(/^[•\-–—]\s*/, '');
    if (next === out) break;
    out = next;
  }
  return out.trim();
}

export interface FilterResult {
  keep: string[]; // important headings, ordered, deduped
  clusters: string[]; // topic cluster names for context
}

const CAPS = { keep: 45, clusters: 8, h2: 12, h3: 24, topics: 12, missing: 8, faq: 15 };

/**
 * Stage 3 — the AI takes the raw outline of every scanned source and keeps
 * only the headings that matter for the target topic (owner: «هدینگ‌های
 * اضافی را حذف کنه و مهم‌ها را نگه داره»).
 */
export async function aiFilterHeadings(topic: string, category: string, scans: ScanOutcome[]): Promise<FilterResult> {
  const ok = scans.filter((s) => s.ok && s.headings.length > 0);
  if (!ok.length) throw new Error('هیچ منبعی هدینگ قابل استخراج نداشت — وضعیت اسکن را بررسی کنید');

  // compact payload: per source, tag-prefixed lines; trim if it gets huge
  // (headings are pre-sanitized — see safeHeadingText)
  let payload = ok
    .map((s) => {
      const lines = s.headings.slice(0, 40).map((h) => `[${h.tag}] ${safeHeadingText(h.text)}`);
      return `## ${safeHeadingText(s.name)} (${s.lang})\n${lines.join('\n')}`;
    })
    .join('\n\n');
  if (payload.length > 14_000) payload = payload.slice(0, 14_000) + '\n…(trimmed)';

  const messages: ChatTurn[] = [
    {
      role: 'system',
      content:
        'You are an SEO content strategist. You receive raw heading outlines scraped from competitor/reference sites. Respond with ONLY valid JSON — no markdown fences, no prose.',
    },
    {
      role: 'user',
      content: `Target page topic: "${topic}" (category: ${category})

Raw heading outlines from ${ok.length} sources:

${payload}

TASK: keep ONLY the headings that are relevant and valuable for building the content structure of the target page. Drop navigation junk, boilerplate, off-topic and pure-duplicate headings (near-duplicates in different languages may both stay — dedupe within a language). Order the kept headings from most to least important.

Respond with ONLY this JSON:
{"keep":["important heading 1","..."],"clusters":["topic cluster name","..."]}

Rules: keep at most 45 headings. Each string must be the BARE heading text — no numbering, no [h2] tag prefixes, no surrounding quotes, and no double quotes inside. clusters = 3-8 short names grouping what the sources cover (e.g. pricing, use cases, alternatives).`,
    },
  ];
  const out = await aiJson<Partial<FilterResult>>(messages, 1600);
  const keep = (out.keep || [])
    .map((t) => stripEchoedPrefixes(safeHeadingText(String(t || ''))))
    .filter(Boolean)
    .slice(0, CAPS.keep);
  const clusters = (out.clusters || [])
    .map((t) => stripEchoedPrefixes(safeHeadingText(String(t || ''))))
    .filter(Boolean)
    .slice(0, CAPS.clusters);
  if (!keep.length) throw new Error('فیلتر هوش مصنوعی هیچ هدینگ مهمی برنگرداند');
  return { keep, clusters };
}

export interface BriefStructure {
  h2: string[];
  h3: { text: string; under: string }[];
  topics: string[];
  missing: string[];
  faq: string[];
}

/**
 * Stage 4 — the owner's exact brief prompt («می‌خوام برای صفحه «…» نیازمندی
 * محتوایی تهیه کنم…»), parameterized by topic and fed the AI-filtered
 * headings. Output is structured JSON; the markdown rendering happens in
 * renderBriefMarkdown() so writers and the UI always see the same thing.
 */
export async function aiGenerateBrief(
  topic: string,
  category: string,
  filter: FilterResult,
  scans: ScanOutcome[]
): Promise<BriefStructure> {
  const sourcesList = scans
    .filter((s) => s.ok)
    .map((s) => `- ${s.name} (${s.lang}) ${s.url}`)
    .join('\n');

  const messages: ChatTurn[] = [
    {
      role: 'system',
      content:
        'You are a senior SEO content strategist who designs content briefs for writers. You design for Search Intent, full Topical Coverage, and the probability of appearing in Google AI Overview. Respond with ONLY valid JSON — no markdown fences, no prose.',
    },
    {
      role: 'user',
      content: `می‌خوام برای صفحه «${topic}» نیازمندی محتوایی تهیه کنم.
صفحات و منابع زیر را به‌صورت کامل تحلیل کن و بر اساس نیاز کاربر ساختار محتوای پیشنهادی این صفحه را ارائه بده.

منابع (رقبای تحلیل‌شده دسته ${category}):
${sourcesList}

هدینگ‌های مهم فیلترشده از منابع:
${filter.keep.map((h, i) => `${i + 1}. ${safeHeadingText(h)}`).join('\n')}

خوشه‌های موضوعی منابع: ${filter.clusters.join(' | ') || '—'}

موارد زیر را مشخص کن:
• تمامی هدینگ‌های اصلی (H2)
• تمامی ساب‌هدینگ‌های ضروری (H3 و H4)
• موضوعات و زیرموضوعاتی که حتماً باید در محتوا پوشش داده شوند
• هدینگ‌هایی که در منابع موجود نیستند اما برای کامل‌تر شدن محتوا لازم هستند
• سوالات متداول و سوالات مرتبط کاربران درباره این موضوع (فقط سوال — بدون پاسخ)

هدف این است که یک ساختار محتوایی کامل، جامع و مبتنی بر نیاز جستجوی کاربران برای نویسنده تهیه شود.
ساختار پیشنهادی را بر اساس Search Intent، پوشش موضوعی کامل (Topical Coverage) و احتمال حضور در نتایج AI Overview گوگل طراحی کن.

Respond with ONLY this JSON shape:
{"h2":["main heading",...],"h3":[{"text":"sub heading","under":"parent H2"}],"topics":["must-cover topic",...],"missing":["heading absent from sources but needed",...],"faq":["user question 1","..."]}

Caps: h2 ≤ 12, h3 ≤ 24, topics ≤ 12, missing ≤ 8, faq ≤ 15. If the target page is Persian-audience, write the structure in Persian; otherwise English.`,
    },
  ];
  const out = await aiJson<Partial<BriefStructure>>(messages, 2400);

  const str = (v: unknown) => stripEchoedPrefixes(safeHeadingText(String(v || '')));
  const structure: BriefStructure = {
    h2: (out.h2 || []).map(str).filter(Boolean).slice(0, CAPS.h2),
    h3: (out.h3 || [])
      .map((h) => ({ text: str((h as { text?: unknown })?.text), under: str((h as { under?: unknown })?.under) }))
      .filter((h) => h.text)
      .slice(0, CAPS.h3),
    topics: (out.topics || []).map(str).filter(Boolean).slice(0, CAPS.topics),
    missing: (out.missing || []).map(str).filter(Boolean).slice(0, CAPS.missing),
    faq: (out.faq || []).map(str).filter(Boolean).slice(0, CAPS.faq),
  };
  if (!structure.h2.length) throw new Error('هوش مصنوعی هیچ H2 در بریف برنگرداند');
  return structure;
}

/** deterministic markdown rendering of a brief — what the writer receives */
export function renderBriefMarkdown(topic: string, category: string, structure: BriefStructure, filter: FilterResult, scans: ScanOutcome[]): string {
  const ok = scans.filter((s) => s.ok);
  const L: string[] = [];
  L.push(`# نیازمندی محتوا — ${topic}`);
  L.push('');
  L.push(`دسته: ${category} · تاریخ: ${new Date().toISOString().slice(0, 10)}`);
  L.push(`منابع تحلیل‌شده (${ok.length}): ${ok.map((s) => s.name).join(' · ')}`);
  L.push('');
  if (filter.clusters.length) {
    L.push(`## خوشه‌های موضوعی منابع`);
    L.push(filter.clusters.map((c) => `- ${c}`).join('\n'));
    L.push('');
  }
  L.push('## هدینگ‌های اصلی (H2)');
  L.push(structure.h2.map((h) => `- ${h}`).join('\n'));
  L.push('');
  if (structure.h3.length) {
    L.push('## ساب‌هدینگ‌های ضروری (H3/H4)');
    L.push(structure.h3.map((h) => `- ${h.text}${h.under ? ` _(زیر ${h.under})_` : ''}`).join('\n'));
    L.push('');
  }
  L.push('## موضوعات الزامی پوشش');
  L.push(structure.topics.map((t) => `- ${t}`).join('\n'));
  L.push('');
  if (structure.missing.length) {
    L.push('## هدینگ‌های غایب در منابع (مزیت رقابتی)');
    L.push(structure.missing.map((t) => `- ${t}`).join('\n'));
    L.push('');
  }
  if (structure.faq.length) {
    L.push('## سوالات متداول (فقط سوال)');
    L.push(structure.faq.map((t) => `- ${t}`).join('\n'));
    L.push('');
  }
  L.push('## هدینگ‌های فیلترشده مهم از منابع');
  L.push(filter.keep.map((h) => `- ${h}`).join('\n'));
  return L.join('\n');
}
