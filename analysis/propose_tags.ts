import { PrismaClient } from '@prisma/client';
import ZAI from 'z-ai-web-dev-sdk';

const db = new PrismaClient();

const posts = await db.post.findMany({
  where: { published: true },
  select: { titleFa: true, titleEn: true, excerptFa: true, categories: { select: { nameEn: true } } },
});
const lines = posts.map((p, i) => {
  const t = (p.titleEn || p.titleFa || '').slice(0, 90);
  const cats = p.categories.map((c) => c.nameEn).join(',');
  return `${i + 1}. [${cats}] ${t}`;
});

const zai = await ZAI.create();
const completion = await zai.chat.completions.create({
  messages: [
    {
      role: 'assistant',
      content: `You are a taxonomy curator for a Persian/English product-builder blog. Below are ${posts.length} article titles with categories. Propose a curated tag taxonomy: 30-45 tags MAX, each bilingual (nameEn, nameFa, slug in English lowercase-kebab). Tags must be TOPIC-based (what the article is about: domains like smart-city, startup, ai, investment, rail-transport, waste-management, marketing, product-design, entrepreneurship, iran-economy, technology, business-model...) — NOT categories duplicates, NOT generic (no "business", no "news", no "article"). Return ONLY a JSON array like [{"slug":"smart-city","nameEn":"Smart City","nameFa":"شهر هوشمند"}] — no fences, no explanation.`,
    },
    { role: 'user', content: lines.join('\n') },
  ],
  thinking: { type: 'disabled' },
});
let raw = completion.choices[0]?.message?.content || '[]';
raw = raw.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/i, '').trim();
const tags = JSON.parse(raw);
console.log('proposed tags:', tags.length);
writeFileSync('analysis/curated_tags_proposed.json', JSON.stringify(tags, null, 2), 'utf8');
console.log(tags.map((t: { slug: string }) => t.slug).join(', '));
await db.$disconnect();
import { writeFileSync } from 'fs';
