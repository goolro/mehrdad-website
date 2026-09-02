/**
 * Rescue translation for the ONE content-filtered post (rail corridor).
 * Chunk-level resumable; blocked chunks split into 600-char pieces;
 * still-blocked pieces are dumped verbatim to
 * analysis/filter_blocked_pieces.json for manual translation.
 */
import { PrismaClient } from '@prisma/client';
import ZAI from 'z-ai-web-dev-sdk';
import { writeFileSync, readFileSync, existsSync } from 'fs';

const db = new PrismaClient();
const SLUG = 'the-second-phases-of-the-iranian-revolutionary';
const STATE = 'analysis/rescue_filtered_state.json';

type State = Record<string, string>; // key "i" or "sub-i-j" → translation

const post = await db.post.findUnique({ where: { slug: SLUG }, select: { contentFa: true } });
const html = post!.contentFa || '';

function chunkHtml(html: string, maxLen: number): string[] {
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

const state: State = existsSync(STATE) ? JSON.parse(readFileSync(STATE, 'utf8')) : {};
const save = () => writeFileSync(STATE, JSON.stringify(state, null, 2));
const blocked: { key: string; text: string }[] = existsSync('analysis/filter_blocked_pieces.json')
  ? JSON.parse(readFileSync('analysis/filter_blocked_pieces.json', 'utf8'))
  : [];

const zai = await ZAI.create();
const SYS = 'You are a professional Persian-to-English translator for a business/research blog. Preserve ALL HTML tags exactly (translate only visible text). Neutral, encyclopedic tone. Brand names unchanged. Return ONLY the translated HTML.';
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function t(text: string): Promise<string> {
  const waits = [30_000, 60_000, 120_000];
  for (let a = 0; ; a++) {
    try {
      const c = await zai.chat.completions.create({
        messages: [ { role: 'assistant', content: SYS }, { role: 'user', content: text } ],
        thinking: { type: 'disabled' },
      });
      return (c.choices[0]?.message?.content || '').replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/i, '').trim();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes('429') && a < waits.length) {
        console.log(`  429 — waiting ${waits[a] / 1000}s`);
        await sleep(waits[a]);
        continue;
      }
      throw e;
    }
  }
}

async function translateSmart(key: string, text: string): Promise<string> {
  try {
    const out = await t(text);
    state[key] = out;
    save();
    return out;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes('1301')) {
      // content filter — split into ~600-char sub-pieces
      console.log(`${key}: FILTERED → splitting (${text.length} chars)`);
      const pieces = [] as string[];
      let rest = text;
      while (rest.length > 0) {
        let cut = Math.min(600, rest.length);
        const brk = rest.lastIndexOf(' ', cut);
        if (brk > 200) cut = brk;
        pieces.push(rest.slice(0, cut));
        rest = rest.slice(cut);
      }
      const outs: string[] = [];
      for (let j = 0; j < pieces.length; j++) {
        const k = `${key}.s${j}`;
        if (state[k]) { outs.push(state[k]); continue; }
        try {
          const o = await t(pieces[j]);
          state[k] = o; save(); outs.push(o);
          console.log(`  ${k}: OK (${pieces[j].length}→${o.length})`);
        } catch (e2) {
          const m2 = e2 instanceof Error ? e2.message : String(e2);
          if (m2.includes('1301')) {
            console.log(`  ${k}: STILL FILTERED — dumped for manual translation (${pieces[j].length} chars)`);
            if (!blocked.find((b) => b.key === k)) blocked.push({ key: k, text: pieces[j] });
            writeFileSync('analysis/filter_blocked_pieces.json', JSON.stringify(blocked, null, 2), 'utf8');
            outs.push(`[[BLOCKED:${k}]]`);
          } else { throw e2; }
        }
        await sleep(900);
      }
      return outs.join(' ');
    }
    throw e;
  }
}

const chunks = chunkHtml(html, 2500);
const parts: string[] = [];
for (let i = 0; i < chunks.length; i++) {
  const key = `c${i}`;
  if (state[key]) { parts.push(state[key]); console.log(`${key}: cached`); continue; }
  parts.push(await translateSmart(key, chunks[i]));
  await sleep(1000);
}
save();

const joined = parts.join('');
writeFileSync('analysis/rescue_filtered_output.html', joined, 'utf8');
const manual = blocked.length;
console.log(`\nDONE. output: analysis/rescue_filtered_output.html (${joined.length} chars)`);
console.log(`blocked pieces needing manual translation: ${manual}`);
console.log(joined.includes('[[BLOCKED:') ? '⇒ resolve [[BLOCKED:key]] markers, then run the finalize step' : '⇒ clean translation, ready to save to DB');
await db.$disconnect();
