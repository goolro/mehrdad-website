import { db } from '@/lib/db';

const STOPWORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'to', 'of', 'and', 'in', 'on', 'for', 'with',
  'what', 'who', 'how', 'why', 'when', 'where', 'can', 'you', 'i', 'me', 'my', 'we', 'our', 'it',
  'this', 'that', 'do', 'does', 'about', 'tell', 'more', 'please', 'want', 'know', 'have', 'has',
  'your', 'from', 'at', 'by', 'or', 'as', 'if', 'not', 'but', 'they', 'them', 'their', 'there',
  'his', 'her', 'him', 'she', 'he', 'will', 'would', 'should', 'could', 'get', 'got', 'also',
  'و', 'در', 'به', 'از', 'که', 'این', 'را', 'با', 'برای', 'است', 'هست', 'چه', 'کی', 'چرا', 'کجا',
  'چگونه', 'می', 'های', 'ها', 'یک', 'تا', 'هم', 'شما', 'من', 'ما', 'او', 'آن', 'بر', 'نیز', 'یا',
  'اما', 'اگر', 'پس', 'بود', 'شود', 'کرد', 'کند', 'درباره', 'بیشتر', 'لطفا', 'میخواهم', 'دارید',
]);

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

export interface Chunk {
  id: string;
  refType: string;
  refSlug: string | null;
  title: string;
  body: string;
}

/**
 * Lightweight BM25-style lexical retrieval over the knowledge base.
 * Works well for a site-sized corpus and avoids external embedding APIs.
 */
export async function retrieveContext(query: string, topK = 6): Promise<Chunk[]> {
  const terms = tokenize(query);
  if (terms.length === 0) return [];

  const chunks = await db.kbChunk.findMany({
    select: { id: true, refType: true, refSlug: true, title: true, body: true },
  });
  if (chunks.length === 0) return [];

  const avgLen = chunks.reduce((s, c) => s + c.body.length, 0) / chunks.length;
  const k1 = 1.4;
  const b = 0.72;

  const scored = chunks.map((c) => {
    const titleLower = c.title.toLowerCase();
    const bodyLower = c.body.toLowerCase();
    let score = 0;
    for (const term of terms) {
      const tf = bodyLower.split(term).length - 1;
      if (tf > 0) {
        const tfNorm = (tf * (k1 + 1)) / (tf + k1 * (1 - b + (b * c.body.length) / avgLen));
        score += tfNorm;
      }
      if (titleLower.includes(term)) score += 2.2;
    }
    // slight boost for services/projects/site meta
    if (c.refType !== 'post') score *= 1.15;
    return { ...c, score };
  });

  return scored
    .filter((c) => c.score > 0)
    .sort((a, b2) => b2.score - a.score)
    .slice(0, topK)
    .map(({ id, refType, refSlug, title, body }) => ({ id, refType, refSlug, title, body }));
}

export function buildContextBlock(chunks: Chunk[]): string {
  if (chunks.length === 0) return '';
  return chunks
    .map((c, i) => `[${i + 1}] (${c.refType}${c.refSlug ? `: ${c.refSlug}` : ''}) ${c.title}\n${c.body}`)
    .join('\n\n---\n\n');
}
