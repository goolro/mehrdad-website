import { db } from '@/lib/db';
import { textCompleteStrict, type ChatTurn } from '@/lib/ai-provider';
import { BRAND, HUMAN_STYLE_RULES, GEO_CITABILITY_RULES } from '@/lib/ai-articles';
import { sanitizePostHtml, sanitizePlainText } from '@/lib/sanitize';
import { randomDayCount, tehranDay, isDailyCategory } from '@/lib/daily';

/**
 * The automatic daily-article generator (owner flow 2026-09-30:
 * «یه تعداد مطلب بساز بعد من تایید کنم بره روی سایت»).
 *
 * Every morning (Vercel cron → /api/cron/daily-generate) the queue for the
 * day is filled with RANDOM 2..5 ORIGINAL bilingual editorials — same
 * format as the hand-written ones (summary + full article + expert
 * verdict) and the same voice rules as the blog pipeline (human-voice
 * algorithm + GEO citability + zero Persian commas). Nothing goes live by
 * itself: every piece lands with `published: false` in the owner's
 * approval queue (Daily Articles studio). Only the owner's Approve button
 * assigns it a free random slot (08:00–22:00 Tehran) — reject deletes it.
 *
 * One AI call per article; the cron chains itself so each serverless
 * invocation only carries a single generation inside its own time budget.
 */

const PLAN_KEY = 'dailyGenPlan';
const LANES = ['product', 'ai', 'startup'] as const;
type Lane = (typeof LANES)[number];

/** safety valve — the approval queue must never pile up unbounded */
const MAX_PENDING_QUEUE = 8;

/** persisted per-day quota: { day, count, built } */
interface GenPlan {
  day: string;
  count: number;
  built: number;
}

async function loadPlan(): Promise<GenPlan> {
  const row = await db.siteSetting.findUnique({ where: { key: PLAN_KEY } });
  const today = tehranDay(new Date());
  if (row) {
    try {
      const parsed = JSON.parse(row.value) as GenPlan;
      if (parsed && parsed.day === today && typeof parsed.count === 'number' && typeof parsed.built === 'number') {
        return parsed;
      }
    } catch {
      /* fall through — rebuild the plan */
    }
  }
  // a new Tehran day (or first run): roll today's random quota 2..5
  const fresh: GenPlan = { day: today, count: randomDayCount(), built: 0 };
  await savePlan(fresh);
  return fresh;
}

async function savePlan(plan: GenPlan) {
  await db.siteSetting.upsert({
    where: { key: PLAN_KEY },
    create: { key: PLAN_KEY, value: JSON.stringify(plan) },
    update: { value: JSON.stringify(plan) },
  });
}

/** complete unpublished pieces waiting for the owner — the review queue */
export function pendingReviewCount(): Promise<number> {
  return db.dailyArticle.count({ where: { published: false } });
}

// ───────────────────────── topic picking ─────────────────────────

/**
 * Topic source 1 — an unused brief from the Brief Builder (the owner's own
 * competitor research). Topic source 2 — the model proposes one fresh topic
 * for the lane, steering away from everything already published.
 */
async function pickTopic(
  lane: Lane,
  recentTitles: string[]
): Promise<{ topic: string; keyword?: string; briefMd?: string; fromBrief: boolean }> {
  const brief = await db.brief.findFirst({
    where: { status: 'ready', category: lane },
    orderBy: { createdAt: 'desc' },
  });
  if (brief?.topic) {
    return { topic: brief.topic, briefMd: brief.briefMd || undefined, fromBrief: true };
  }

  const messages: ChatTurn[] = [
    {
      role: 'system',
      content:
        'You propose fresh, specific article topics for an independent product builder\'s editorial blog. Answer with STRICT JSON only: {"topic": "...", "keyword": "..."}.',
    },
    {
      role: 'user',
      content: `Propose ONE fresh article topic for the "${lane}" lane (lane meanings: product = product design & product-led businesses, ai = applied AI tools & workflows, startup = bootstrapped/startup practice).
Rules: specific enough for a 600-word editorial (a named tool trend, a concrete decision, a sharp trade-off) — never generic ("AI in 2026" is banned). Evergreen, not news-dependent. Must NOT overlap with these recent titles: ${recentTitles.slice(0, 25).join(' | ') || '(none)'}.
JSON only.`,
    },
  ];
  const raw = await textCompleteStrict(messages, { timeoutMs: 60_000, maxTokens: 300, temperature: 0.9 });
  const parsed = extractJson<{ topic?: string; keyword?: string }>(raw);
  const topic = (parsed?.topic || '').trim();
  if (!topic) throw new Error('topic proposal came back empty');
  return { topic, keyword: parsed?.keyword?.trim() || undefined, fromBrief: false };
}

// ───────────────────────── the writer call ─────────────────────────

interface DailyDraft {
  slugIdea?: string;
  titleEn?: string;
  titleFa?: string;
  summaryEn?: string;
  summaryFa?: string;
  bodyEn?: string;
  bodyFa?: string;
  verdictEn?: string;
  verdictFa?: string;
  tagsEn?: string[];
  tagsFa?: string[];
}

const ALLOWED_LINKS = ['/work', '/services', '/fde', '/blog', '/about'];

function writerMessages(topic: string, keyword: string | undefined, briefMd: string | undefined): ChatTurn[] {
  const briefBlock = briefMd
    ? `\nTHE OWNER'S CONTENT BRIEF (from live competitor research — follow its H2/H3 structure, must-cover topics and FAQ questions; do not copy any competitor text):\n${briefMd.slice(0, 6000)}\n`
    : '';
  return [
    {
      role: 'system',
      content: `${BRAND}

You write the site's DAILY editorials: original bilingual (English + Persian) product/AI/startup analyses. Both languages are written natively — never a translation of each other, same analysis though. Output STRICT JSON only, no markdown fences:
{"slugIdea":"kebab-case","titleEn":"","titleFa":"","summaryEn":"","summaryFa":"","bodyEn":"<h2>…</h2>…","bodyFa":"…","verdictEn":"","verdictFa":"","tagsEn":["",""],"tagsFa":["",""]}`,
    },
    {
      role: 'user',
      content: `Write today's editorial.
TOPIC: ${topic}
${keyword ? `FOCUS KEYWORD: ${keyword}\n` : ''}${briefBlock}
FORMAT (both languages):
- summary: 40-60 words, plain text — doubles as the meta description.
- body: 450-650 words of HTML per language — <h2> sections (2-3 of them), short paragraphs, at most ONE small list. Include a final <h2>FAQ</h2> with 3 <h3> questions answered in 2-3 sentences each. Keep total output compact — the whole JSON answer must stay well under the output limit.
- verdict: 60-100 words — the owner's own expert take, opinionated, first person.
- tags: 2-4 short tags per language.
VOICE & QUALITY RULES (mandatory):
${HUMAN_STYLE_RULES}
GEO RULES (mandatory):
${GEO_CITABILITY_RULES}
ORIGINALITY: pure original analysis — never lift sentences from any source. No fake statistics; numbers only as first-person rough experience.
PERSIAN HARD RULES: the Persian text must contain ZERO Persian commas (،) — restructure sentences instead. Use نیم‌فاصله and Persian digits. The English text stays pure English.
INTERNAL LINKS: at most 2, and ONLY from this allow-list — ${ALLOWED_LINKS.join(', ')} — as <a href="…">descriptive anchor</a>. Never invent another URL.`,
    },
  ];
}

// ───────────────────────── tolerant JSON ─────────────────────────

function extractJson<T>(raw: string): T | null {
  let s = raw.trim();
  s = s.replace(/^```(?:json)?/i, '').replace(/```\s*$/, '').trim();
  const a = s.indexOf('{');
  const b = s.lastIndexOf('}');
  if (a === -1 || b === -1 || b <= a) return null;
  s = s.slice(a, b + 1);
  try {
    return JSON.parse(s) as T;
  } catch {
    try {
      return JSON.parse(s.replace(/,\s*([}\]])/g, '$1')) as T;
    } catch {
      return null;
    }
  }
}

// ───────────────────────── slug + persistence ─────────────────────────

async function uniqueSlug(idea: string): Promise<string> {
  let base =
    String(idea || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'daily-note';
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(base)) base = base.replace(/-+$/, '').slice(0, 40) || 'daily-note';
  let slug = base;
  let n = 2;
  while (await db.dailyArticle.findUnique({ where: { slug } })) {
    slug = `${base}-${n++}`;
    if (n > 50) return `${base}-${Date.now().toString(36)}`;
  }
  return slug;
}

function strTags(v: unknown): string | null {
  if (!Array.isArray(v)) return null;
  const list = v.map((t) => String(t || '').trim()).filter(Boolean).slice(0, 6);
  return list.length ? JSON.stringify(list) : null;
}

/**
 * HARD EDITORIAL RULE (owner): Persian text carries NO Persian comma (،).
 * The model still slips one in occasionally — drop it deterministically on
 * every FA field after generation instead of trusting the prompt alone.
 */
function stripFaCommas(s: string): string {
  return s.replace(/،\s*/g, ' ').replace(/ {2,}/g, ' ');
}

// ───────────────────────── the step ─────────────────────────

export interface GenStepResult {
  done: boolean; // today's plan is fully built
  built: number;
  count: number;
  remaining: number;
  topic?: string;
  category?: Lane;
  fromBrief?: boolean;
  skipped?: string; // why nothing was generated this step
}

/**
 * Generate AT MOST ONE article per call — the cron chains itself when
 * more are owed. Any failure leaves the quota untouched and does NOT
 * chain: the next morning's run simply tries again.
 */
export async function dailyGenerateStep(): Promise<GenStepResult> {
  const plan = await loadPlan();
  const remainingBase = plan.count - plan.built;
  if (remainingBase <= 0) {
    return { done: true, built: plan.built, count: plan.count, remaining: 0, skipped: 'quota already filled' };
  }
  const pending = await pendingReviewCount();
  if (pending >= MAX_PENDING_QUEUE) {
    return {
      done: true,
      built: plan.built,
      count: plan.count,
      remaining: remainingBase,
      skipped: `approval queue is full (${pending} waiting) — build paused`,
    };
  }

  const lane: Lane = LANES[plan.built % LANES.length];
  const recent = await db.dailyArticle.findMany({
    orderBy: { createdAt: 'desc' },
    take: 30,
    select: { titleEn: true, titleFa: true },
  });
  const recentTitles = recent.flatMap((r) => [r.titleEn, r.titleFa]).filter(Boolean) as string[];

  const picked = await pickTopic(lane, recentTitles);

  let draft: DailyDraft | null = null;
  let lastErr: unknown = null;
  for (let attempt = 0; attempt < 2 && !draft; attempt++) {
    try {
      const raw = await textCompleteStrict(writerMessages(picked.topic, picked.keyword, attempt === 0 ? picked.briefMd : undefined), {
        timeoutMs: 170_000,
        maxTokens: 12000,
        temperature: 0.85,
      });
      draft = extractJson<DailyDraft>(raw);
      if (!draft) lastErr = new Error('writer JSON unparseable');
    } catch (e) {
      lastErr = e;
    }
  }
  if (!draft || !draft.titleEn || !draft.titleFa || !draft.bodyEn || !draft.bodyFa || !draft.summaryEn || !draft.summaryFa) {
    console.error('daily-generator step failed:', lastErr instanceof Error ? lastErr.message : lastErr);
    return {
      done: false,
      built: plan.built,
      count: plan.count,
      remaining: remainingBase,
      topic: picked.topic,
      category: lane,
      fromBrief: picked.fromBrief,
      skipped: 'writer output incomplete — nothing chained, retries next run',
    };
  }

  const slug = await uniqueSlug(draft.slugIdea || draft.titleEn);
  const today = tehranDay(new Date());
  const tagsFa = strTags(draft.tagsFa);
  await db.dailyArticle.create({
    data: {
      slug,
      day: today,
      category: isDailyCategory(lane) ? lane : 'product',
      titleEn: sanitizePlainText(draft.titleEn, 200),
      titleFa: stripFaCommas(sanitizePlainText(draft.titleFa, 200)),
      summaryEn: sanitizePlainText(draft.summaryEn, 400),
      summaryFa: stripFaCommas(sanitizePlainText(draft.summaryFa, 400)),
      bodyEn: sanitizePostHtml(draft.bodyEn),
      bodyFa: stripFaCommas(sanitizePostHtml(draft.bodyFa)),
      verdictEn: sanitizePostHtml(draft.verdictEn || ''),
      verdictFa: stripFaCommas(sanitizePostHtml(draft.verdictFa || '')),
      tagsEn: strTags(draft.tagsEn),
      tagsFa: tagsFa ? stripFaCommas(tagsFa) : null,
      published: false, // waits for the owner's Approve in the studio
      publishAt: null,
    },
  });

  // a brief consumed its purpose — mark it so it is not proposed again
  if (picked.fromBrief) {
    const used = await db.brief.findFirst({ where: { status: 'ready', topic: picked.topic }, select: { id: true } });
    if (used) {
      await db.brief.update({ where: { id: used.id }, data: { status: 'used' } }).catch(() => {});
    }
  }

  const built = plan.built + 1;
  await savePlan({ ...plan, built });
  return {
    done: built >= plan.count,
    built,
    count: plan.count,
    remaining: Math.max(0, plan.count - built),
    topic: draft.titleFa || draft.titleEn,
    category: lane,
    fromBrief: picked.fromBrief,
  };
}
