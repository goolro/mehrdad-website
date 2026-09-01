import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';

const DATA = JSON.parse(fs.readFileSync('/home/z/my-project/analysis/migration_data.json', 'utf-8'));
const OUT = '/home/z/my-project/analysis/translations.json';

let translations = {};
if (fs.existsSync(OUT)) {
  translations = JSON.parse(fs.readFileSync(OUT, 'utf-8'));
}

function save() {
  fs.writeFileSync(OUT, JSON.stringify(translations, null, 1), 'utf-8');
}

const TITLES_SYS = 'You are a professional translator specializing in Persian (Farsi) to English translation for business/tech content. Return ONLY valid JSON, no markdown fences, no explanations.';

async function translateMeta(zai, posts) {
  // batch translate titles + excerpts
  const items = posts.map((p, i) => ({
    i,
    title: p.title_fa,
    excerpt: (p.excerpt_fa || '').slice(0, 300),
  }));
  const prompt = `Translate each Persian title and excerpt to natural English (business/tech tone). Brand names (BIZPAL, KLIKA, Mehrdad, Iran, B2B, SaaS) stay as-is. Respond with a JSON array of objects: [{"i": <index>, "title": "...", "excerpt": "..."}]. Items:\n${JSON.stringify(items)}`;
  const completion = await zai.chat.completions.create({
    messages: [
      { role: 'assistant', content: TITLES_SYS },
      { role: 'user', content: prompt },
    ],
    thinking: { type: 'disabled' },
  });
  let text = completion.choices[0]?.message?.content || '';
  text = text.replace(/```json|```/g, '').trim();
  const start = text.indexOf('[');
  const end = text.lastIndexOf(']');
  if (start === -1 || end === -1) throw new Error('no JSON array found');
  return JSON.parse(text.slice(start, end + 1));
}

function chunkHtml(html, maxLen = 7000) {
  if (html.length <= maxLen) return [html];
  // split on block boundaries
  const parts = html.split(/(?=<(?:p|h2|h3|h4|li|blockquote)[ >])|(?<=<\/(?:p|h2|h3|h4|li|blockquote|table)>)/);
  const chunks = [];
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

const CONTENT_SYS = `You are a professional translator (Persian to English) for a designer/researcher's blog about startups, smart cities, AI, and investment. Rules:
1. Preserve ALL HTML tags exactly as given (only translate visible text inside them).
2. Keep brand names unchanged: BIZPAL, KLIKA, Mehrdad, Iran, SaaS, IoT, AI, B2B, MVP.
3. Numbers may stay in either script but prefer Western digits.
4. Return ONLY the translated HTML. No explanations, no markdown fences.`;

async function chatWithRetry(zai, messages, retries = 8) {
  for (let a = 1; a <= retries; a++) {
    try {
      const completion = await zai.chat.completions.create({ messages, thinking: { type: 'disabled' } });
      return completion;
    } catch (e) {
      const is429 = String(e?.message || '').includes('429');
      if (a === retries) throw e;
      const wait = is429 ? 45000 * Math.min(a, 3) : 6000 * a;
      console.log(`  retry ${a} (wait ${wait / 1000}s): ${String(e?.message).slice(0, 80)}`);
      await new Promise((r) => setTimeout(r, wait));
    }
  }
}

async function translateContent(zai, html) {
  const chunks = chunkHtml(html);
  const out = [];
  for (const c of chunks) {
    const completion = await chatWithRetry(zai, [
      { role: 'assistant', content: CONTENT_SYS },
      { role: 'user', content: c },
    ]);
    out.push((completion.choices[0]?.message?.content || '').trim());
    await new Promise((r) => setTimeout(r, 14000));
  }
  return out.join('');
}

async function processPost(zai, p) {
  const id = String(p.wp_id);
  if (translations[id]?.content_en && translations[id]?.title_en) {
    console.log(`skip ${id} (done)`);
    return;
  }
  console.log(`translating ${id}: ${p.title_fa.slice(0, 40)}...`);
  try {
    if (!translations[id]) translations[id] = {};
    // meta (skip if already translated)
    if (!translations[id].title_en) {
      const metas = await chatWithRetry(zai, [
        { role: 'assistant', content: TITLES_SYS },
        {
          role: 'user',
          content: `Translate each Persian title and excerpt to natural English (business/tech tone). Brand names (BIZPAL, KLIKA, Mehrdad, Iran, B2B, SaaS) stay as-is. Respond with a JSON array of objects: [{"i": <index>, "title": "...", "excerpt": "..."}]. Items:\n${JSON.stringify([{ i: 0, title: p.title_fa, excerpt: (p.excerpt_fa || '').slice(0, 300) }])}`,
        },
      ]);
      let text = (metas.choices[0]?.message?.content || '').replace(/```json|```/g, '').trim();
      try {
        const s2 = text.indexOf('[');
        const e2 = text.lastIndexOf(']');
        const arr = JSON.parse(text.slice(s2, e2 + 1));
        if (arr[0]) {
          translations[id].title_en = arr[0].title;
          translations[id].excerpt_en = arr[0].excerpt;
        }
      } catch {
        translations[id].title_en = p.title_fa; // fallback keep fa
      }
      save();
    }
    // content
    if (p.content_fa_html && p.content_fa_html.length > 200 && !translations[id].content_en) {
      translations[id].content_en = await translateContent(zai, p.content_fa_html);
    }
    save();
    console.log(`done ${id}`);
  } catch (e) {
    console.error(`FAIL ${id}:`, e.message?.slice(0, 200));
  }
}

async function main() {
  const CHUNK = parseInt(process.env.CHUNK || '0', 10);
  const zai = await ZAI.create();
  const posts = DATA.posts; // already newest-first
  // pass 1: meta for all posts (batches of 10)
  const needMeta = posts.filter((p) => !translations[String(p.wp_id)]?.title_en);
  console.log(`meta batch pass: ${needMeta.length} posts`);
  for (let i = 0; i < needMeta.length; i += 10) {
    const batch = needMeta.slice(i, i + 10);
    try {
      const metas = await translateMeta(zai, batch);
      for (const m of metas) {
        const p = batch[m.i];
        if (!p) continue;
        const id = String(p.wp_id);
        if (!translations[id]) translations[id] = {};
        translations[id].title_en = m.title;
        translations[id].excerpt_en = m.excerpt;
      }
      save();
      console.log(`meta batch ${i / 10 + 1}/${Math.ceil(needMeta.length / 10)} ok`);
    } catch (e) {
      console.error('meta batch fail:', e.message?.slice(0, 150));
      // fallback: translate one by one
      for (const p of batch) await processPost(zai, p);
    }
    if (CHUNK > 0 && i >= 10) break; // meta only, chunked
  }
  if (CHUNK > 0) {
    // chunk mode: translate full content for up to CHUNK posts without content (sequential, rate-limit friendly)
    const needContent = posts.filter((p) => !translations[String(p.wp_id)]?.content_en).slice(0, CHUNK);
    console.log(`content chunk: ${needContent.length} posts`);
    for (const p of needContent) {
      await processPost(zai, p);
      await new Promise((r) => setTimeout(r, 12000));
    }
    save();
    const done = Object.values(translations).filter((v) => v.content_en).length;
    console.log(`CHUNK DONE. total with content: ${done}`);
    return;
  }
  // pass 2: full content, newest first — sequential (rate-limit friendly)
  console.log('content pass...');
  for (const p of posts) {
    await processPost(zai, p);
    await new Promise((r) => setTimeout(r, 12000));
  }
  save();
  console.log('ALL DONE. translated:', Object.keys(translations).length);
}

// supervisor: never die on rate-limit storms — wait and restart the pass
async function supervisor() {
  for (let round = 1; ; round++) {
    try {
      await main();
      console.log('PASS COMPLETE');
      return;
    } catch (e) {
      console.error(`round ${round} failed, cooling down 3min:`, String(e?.message).slice(0, 120));
      await new Promise((r) => setTimeout(r, 180000));
    }
  }
}
supervisor();
