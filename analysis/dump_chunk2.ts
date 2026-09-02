import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();
const post = await db.post.findUnique({ where: { slug: 'the-second-phases-of-the-iranian-revolutionary' }, select: { contentFa: true } });
const html = post!.contentFa || '';
function chunkHtml(h: string, maxLen: number): string[] {
  if (h.length <= maxLen) return [h];
  const parts = h.split(/(?=<(?:p|h2|h3|h4|li|blockquote)[ >])|(?<=<\/(?:p|h2|h3|h4|li|blockquote|table)>)/);
  const chunks: string[] = []; let cur = '';
  for (const part of parts) { if ((cur + part).length > maxLen && cur) { chunks.push(cur); cur = part; } else { cur += part; } }
  if (cur) chunks.push(cur);
  return chunks;
}
const chunks = chunkHtml(html, 2500);
console.log('=== CHUNK 2 (content-filtered) ===');
console.log(chunks[1]);
await db.$disconnect();
