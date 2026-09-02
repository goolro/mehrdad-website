import { PrismaClient } from '@prisma/client';
import ZAI from 'z-ai-web-dev-sdk';

const db = new PrismaClient();
const post = await db.post.findUnique({
  where: { slug: 'the-second-phases-of-the-iranian-revolutionary' },
  select: { contentFa: true },
});
const html = post!.contentFa || '';

function chunkHtml(html: string, maxLen = 2500): string[] {
  if (html.length <= maxLen) return [html];
  const parts = html.split(/(?=<(?:p|h2|h3|h4|li|blockquote)[ >])|(?<=<\/(?:p|h2|h3|h4|li|blockquote|table)>)/);
  const chunks: string[] = [];
  let cur = '';
  for (const part of parts) {
    if ((cur + part).length > maxLen && cur) { chunks.push(cur); cur = part; } else { cur += part; }
  }
  if (cur) chunks.push(cur);
  return chunks;
}

const chunks = chunkHtml(html);
console.log('total chunks:', chunks.length);
const zai = await ZAI.create();
for (let i = 0; i < chunks.length; i++) {
  try {
    const c = await zai.chat.completions.create({
      messages: [
        { role: 'assistant', content: 'Translate Persian to English. Preserve HTML. Return ONLY the translation.' },
        { role: 'user', content: chunks[i] },
      ],
      thinking: { type: 'disabled' },
    });
    console.log(`chunk ${i + 1}/${chunks.length}: OK (${(c.choices[0]?.message?.content || '').length} chars)`);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.log(`chunk ${i + 1}/${chunks.length}: ✗ ${msg.includes('1301') ? 'CONTENT-FILTER' : msg.slice(0, 60)}`);
  }
  await new Promise((r) => setTimeout(r, 800));
}
await db.$disconnect();
