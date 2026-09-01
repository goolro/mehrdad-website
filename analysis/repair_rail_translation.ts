/**
 * Task 16b — repair pass for contentEn chunks that stayed Persian because
 * of 429 rate-limits during translate_remaining2.ts (graceful degrade kept
 * the FA text). Finds Persian-dominant blocks, re-translates only those,
 * with a long cool-down between calls.
 */
import ZAI from 'z-ai-web-dev-sdk';
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();
const SLUG = 'the-second-phases-of-the-iranian-revolutionary';
const COOLDOWN_MS = 12000;

const SYS = `You are a professional translator (Persian to English) for a product builder's blog about infrastructure and rail corridors. Rules:
1. Preserve ALL HTML tags exactly as given — translate ONLY the visible text inside them.
2. Keep brand names, numbers, URLs as-is.
3. Natural, concise business English.
4. Return ONLY the translated HTML fragment, no fences, no commentary.`;

function isPersianDominant(s: string): boolean {
  const fa = (s.match(/[\u0600-\u06FF]/g) || []).length;
  const letters = (s.match(/[A-Za-z\u0600-\u06FF]/g) || []).length;
  return letters > 40 && fa / letters > 0.3;
}

function splitBlocks(html: string): string[] {
  const parts = html.split(/(?=<(?:p|h2|h3|h4|li|blockquote|tr|td)[ >])|(?<=<\/(?:p|h2|h3|h4|li|blockquote|table|tr)>)/);
  // merge tiny fragments into their successor to keep chunk count low
  const blocks: string[] = [];
  for (const p of parts) {
    if (p.trim().length < 80 && blocks.length) blocks[blocks.length - 1] += p;
    else blocks.push(p);
  }
  return blocks;
}

async function main() {
  const post = await db.post.findFirst({ where: { slug: SLUG } });
  if (!post) throw new Error('post not found');
  const blocks = splitBlocks(post.contentEn || '');
  const targets = blocks.map((b, i) => ({ b, i })).filter(({ b }) => isPersianDominant(b));
  console.log(`blocks: ${blocks.length}, persian-dominant: ${targets.length}`);
  if (!targets.length) { console.log('nothing to repair'); return; }

  const zai = await ZAI.create();
  let fixed = 0, failed = 0;
  for (let k = 0; k < targets.length; k++) {
    const { b, i } = targets[k];
    let ok = false;
    for (let attempt = 1; attempt <= 4 && !ok; attempt++) {
      try {
        const c = await zai.chat.completions.create({
          messages: [
            { role: 'assistant', content: SYS },
            { role: 'user', content: b.slice(0, 3500) },
          ],
          thinking: { type: 'disabled' },
        });
        let text = (c.choices[0]?.message?.content || '').trim().replace(/^```(?:html)?|```$/g, '').trim();
        if (text && text.length > 20 && !isPersianDominant(text)) {
          blocks[i] = text;
          ok = true;
          fixed++;
        } else throw new Error('bad translation result');
      } catch (e: any) {
        console.log(`  block ${k + 1}/${targets.length} attempt ${attempt}: ${String(e?.message || e).slice(0, 90)}`);
        if (attempt === 4) failed++;
        else await new Promise((r) => setTimeout(r, COOLDOWN_MS * attempt));
      }
    }
    // save progressively so partial success is never lost
    if (k % 3 === 2 || k === targets.length - 1) {
      await db.post.update({ where: { id: post.id }, data: { contentEn: blocks.join('\n') } });
      console.log(`  💾 saved (${k + 1}/${targets.length})`);
    }
    await new Promise((r) => setTimeout(r, 4000));
  }
  await db.post.update({ where: { id: post.id }, data: { contentEn: blocks.join('\n') } });
  console.log(`done — fixed: ${fixed}, still-FA: ${failed}`);
}

main()
  .catch((e) => { console.error('FATAL', e); process.exitCode = 1; })
  .finally(() => db.$disconnect());
