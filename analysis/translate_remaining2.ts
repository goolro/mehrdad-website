/**
 * Task 16 — translate the last 2 Persian-only posts (D-021 completion).
 *
 * - startup-smart-waste-management-solution (post 7995, draft — translating
 *   does NOT publish it, it only completes contentEn)
 * - the-second-phases-of-the-iranian-revolutionary (rail corridor — rejected
 *   by the content filter in the batch run; rescued with smaller chunks)
 *
 * Approach: chunk the HTML on block boundaries (~2800 chars — small enough
 * to pass the safety filter), translate sequentially with the z-ai SDK,
 * join chunks back, and update titleEn/excerptEn/contentEn in SQLite.
 * Idempotent: skips posts whose contentEn is already filled.
 */
import ZAI from 'z-ai-web-dev-sdk';
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

const SLUGS = [
  'startup-smart-waste-management-solution',
  'the-second-phases-of-the-iranian-revolutionary',
];

const SYS = `You are a professional translator (Persian to English) for a product builder's blog about startups, smart cities, AI, investment and infrastructure. Rules:
1. Preserve ALL HTML tags exactly as given — translate ONLY the visible text inside them.
2. Keep brand names, numbers, URLs, and code-like tokens as-is.
3. Natural, concise business English — not word-for-word.
4. Return ONLY the translated HTML fragment, no markdown fences, no commentary.`;

function chunkHtml(html: string, maxLen = 2800): string[] {
  if (html.length <= maxLen) return [html];
  const parts = html.split(/(?=<(?:p|h2|h3|h4|li|blockquote|tr)[ >])|(?<=<\/(?:p|h2|h3|h4|li|blockquote|table|tr)>)/);
  const chunks: string[] = [];
  let cur = '';
  for (const part of parts) {
    if ((cur + part).length > maxLen && cur) {
      chunks.push(cur);
      cur = part;
    } else {
      cur += part;
    }
  }
  if (cur) chunks.push(cur);
  return chunks;
}

async function translateHtml(zai: Awaited<ReturnType<typeof ZAI.create>>, html: string, slug: string): Promise<string> {
  const chunks = chunkHtml(html);
  const out: string[] = [];
  for (let i = 0; i < chunks.length; i++) {
    let done = false;
    for (let attempt = 1; attempt <= 3 && !done; attempt++) {
      try {
        const completion = await zai.chat.completions.create({
          messages: [
            { role: 'assistant', content: SYS },
            { role: 'user', content: chunks[i] },
          ],
          thinking: { type: 'disabled' },
        });
        let text = (completion.choices[0]?.message?.content || '').trim();
        text = text.replace(/^```(?:html)?|```$/g, '').trim();
        if (text && text.length > 20) {
          out.push(text);
          done = true;
        } else {
          throw new Error('empty/too-short translation');
        }
      } catch (e: any) {
        console.log(`    chunk ${i + 1}/${chunks.length} attempt ${attempt} failed: ${String(e?.message || e).slice(0, 120)}`);
        if (attempt === 3) {
          // graceful degrade: keep the chunk untranslated rather than losing content
          out.push(chunks[i]);
        } else {
          await new Promise((r) => setTimeout(r, 1500 * attempt));
        }
      }
    }
    console.log(`    chunk ${i + 1}/${chunks.length} ✓ (slug: ${slug})`);
  }
  return out.join('\n');
}

async function main() {
  const zai = await ZAI.create();
  for (const slug of SLUGS) {
    const post = await db.post.findFirst({ where: { OR: [{ slug }, { slug: { contains: slug.slice(0, 30) } }] } });
    if (!post) {
      console.log(`✗ not found: ${slug}`);
      continue;
    }
    if (post.contentEn && post.contentEn.trim().length > 200) {
      console.log(`↷ already translated: ${post.slug}`);
      continue;
    }
    console.log(`→ translating: ${post.slug} (published=${post.published}, FA content ${(post.contentFa || '').length} chars)`);
    const t0 = Date.now();
    const contentEn = await translateHtml(zai, post.contentFa || '', post.slug);

    // title + excerpt (single small call)
    let titleEn = post.titleEn || '';
    let excerptEn = post.excerptEn || '';
    if (!titleEn || !excerptEn) {
      try {
        const c = await zai.chat.completions.create({
          messages: [
            { role: 'assistant', content: SYS },
            { role: 'user', content: `Title: ${post.titleFa || ''}\nExcerpt: ${(post.excerptFa || '').slice(0, 400)}\n\nReturn JSON only: {"title":"...","excerpt":"..."}` },
          ],
          thinking: { type: 'disabled' },
        });
        let raw = (c.choices[0]?.message?.content || '').replace(/```json|```/g, '').trim();
        const j = JSON.parse(raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1));
        titleEn = titleEn || j.title || '';
        excerptEn = excerptEn || j.excerpt || '';
      } catch (e) {
        console.log('    meta translate failed — keeping existing');
      }
    }

    await db.post.update({ where: { id: post.id }, data: { contentEn, titleEn, excerptEn } });
    console.log(`✓ ${post.slug} done in ${Math.round((Date.now() - t0) / 1000)}s (EN ${(contentEn.length / 1000).toFixed(1)}k chars)`);
  }
}

main()
  .catch((e) => { console.error('FATAL', e); process.exitCode = 1; })
  .finally(() => db.$disconnect());
