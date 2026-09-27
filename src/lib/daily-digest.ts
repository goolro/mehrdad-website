/**
 * Daily Product Hunt digest — shared backend helpers (2026-09-27).
 *
 * The owner wants a tiny daily publication: successful Product Hunt
 * launches distilled to ONE line — English + Persian — published every
 * day at /daily. This module owns the pipeline pieces shared by the
 * admin import button and the Vercel cron:
 *
 *   fetch the public Atom feed → filter + dedupe → create rows
 *   (url is the unique dedupe key) → best-effort FA translation.
 *
 * Persian editorial rule (project-wide): Persian text NEVER contains the
 * Persian comma (،) — the translator prompt enforces it and the admin can
 * always edit the line afterwards.
 */
import { db } from '@/lib/db';
import { textCompleteStrict } from '@/lib/ai-provider';

const PH_FEED = 'https://www.producthunt.com/feed';
const UA = 'Mozilla/5.0 (compatible; mehrdad.ir-daily/1.0; +https://mehrdad.ir)';

/** digest day for a moment — Tehran calendar, ISO 'YYYY-MM-DD' */
export function tehranDay(d: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tehran' }).format(d);
}

function decodeEntities(s: string): string {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&');
}

export interface PhFeedItem {
  name: string;
  url: string;
  tagline: string;
}

/**
 * Parse the public Product Hunt Atom feed (no XML dep — the shape is
 * stable and this stays fail-safe: a malformed entry is skipped, never
 * crashes the import).
 */
export async function fetchPhFeed(limit = 12): Promise<PhFeedItem[]> {
  const res = await fetch(PH_FEED, {
    headers: { 'user-agent': UA, accept: 'application/atom+xml, application/xml, text/xml' },
    signal: AbortSignal.timeout(12_000),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`PH feed responded ${res.status}`);
  const xml = await res.text();

  const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map((m) => m[1]);
  const items: PhFeedItem[] = [];
  const seen = new Set<string>();
  for (const e of entries) {
    const name = decodeEntities((e.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '').trim();
    const link = (e.match(/<link rel="alternate" type="text\/html" href="([^"]+)"/) || [])[1];
    const content = decodeEntities(
      (e.match(/<content type="html">([\s\S]*?)<\/content>/) || [])[1] || ''
    );
    // first <p> of the content is the launch one-liner (feed contract)
    const tagline = (content.match(/<p>\s*([\s\S]*?)\s*<\/p>/) || [])[1]
      ?.replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (!name || !link || !tagline) continue;
    const clean = link.split('?')[0];
    if (seen.has(clean)) continue;
    seen.add(clean);
    items.push({ name, url: clean, tagline });
    if (items.length >= limit) break;
  }
  return items;
}

const TRANSLATE_SYS = `You translate one-line product taglines from English to Persian (Farsi) for a tech digest.
Rules:
1. ONE short line (max ~12 words). Natural marketing Persian, not word-by-word.
2. Keep brand names, product names and latin acronyms as-is (ChatGPT, macOS, AI...).
3. NEVER use the Persian comma (،) — rewrite the sentence without it. No semicolons either.
4. Return ONLY the translation.`;

/** best-effort EN → FA one-liner; throws when no AI provider can serve */
export async function translateTaglineFa(taglineEn: string): Promise<string> {
  const out = await textCompleteStrict(
    [
      { role: 'system', content: TRANSLATE_SYS },
      { role: 'user', content: taglineEn },
    ],
    { timeoutMs: 60_000, maxTokens: 300, temperature: 0.3 }
  );
  return out
    .trim()
    .replace(/^["«]|["»]$/g, '')
    .replace(/،/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export interface ImportSummary {
  created: { name: string; url: string; day: string; translated: boolean }[];
  skipped: number;
  feedCount: number;
  error?: string;
}

/**
 * Pull the feed and store everything new. `days` spreads the imported
 * items across the digest: items land on TODAY (Tehran) — the digest day
 * is the publication day, not the launch day. Translation runs per item
 * and failure is non-fatal (the row keeps taglineFa=null so the admin can
 * fill it by hand — the public page renders EN-only rows gracefully).
 */
export async function importDailyFromFeed(limit = 8): Promise<ImportSummary> {
  const summary: ImportSummary = { created: [], skipped: 0, feedCount: 0 };
  const items = await fetchPhFeed(limit * 3); // headroom: some will be dupes
  summary.feedCount = items.length;
  const day = tehranDay();
  let orderBase = await db.dailyProduct.count({ where: { day } });

  for (const item of items) {
    if (summary.created.length >= limit) break;
    const exists = await db.dailyProduct.findUnique({ where: { url: item.url } });
    if (exists) {
      summary.skipped += 1;
      continue;
    }
    let taglineFa: string | null = null;
    try {
      taglineFa = await translateTaglineFa(item.tagline);
    } catch {
      taglineFa = null; // no provider / provider failed → EN-only row
    }
    const row = await db.dailyProduct.create({
      data: {
        day,
        name: item.name.slice(0, 120),
        taglineEn: item.tagline.slice(0, 240),
        taglineFa,
        url: item.url,
        order: orderBase++,
      },
    });
    summary.created.push({ name: row.name, url: row.url, day: row.day, translated: !!taglineFa });
  }
  return summary;
}
