import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { db } from '@/lib/db';
import { checkAdmin } from '@/lib/admin';
import { addPostToKb } from '@/lib/kb';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const SYS = `You are a professional translator between Persian (Farsi) and English for a designer/researcher blog about startups, smart cities, AI, and investment.
1. Preserve ALL HTML tags exactly as given (only translate visible text inside them).
2. Keep brand names unchanged: BIZPAL, KLIKA, Mehrdad, Iran, SaaS, IoT, AI, B2B, MVP.
3. Return ONLY the translated HTML. No explanations, no markdown fences.`;

function chunkHtml(html: string, maxLen = 7000): string[] {
  if (html.length <= maxLen) return [html];
  const parts = html.split(/(?=<(?:p|h2|h3|h4|li|blockquote)[ >])|(?<=<\/(?:p|h2|h3|h4|li|blockquote|table)>)/);
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

async function translateHtml(zai: Awaited<ReturnType<typeof ZAI.create>>, html: string): Promise<string> {
  const chunks = chunkHtml(html);
  const out: string[] = [];
  for (const c of chunks) {
    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'assistant', content: SYS },
        { role: 'user', content: c },
      ],
      thinking: { type: 'disabled' },
    });
    out.push((completion.choices[0]?.message?.content || '').trim());
  }
  return out.join('');
}

export async function POST(req: NextRequest) {
  const denied = checkAdmin(req);
  if (denied) return denied;
  try {
    const { postId } = await req.json();
    const post = await db.post.findUnique({ where: { id: postId } });
    if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });

    const zai = await ZAI.create();

    // translate TO English (from FA)
    if (post.contentFa && !post.contentEn) {
      let contentEn = '';
      if (post.contentFa.length > 200) {
        contentEn = await translateHtml(zai, post.contentFa);
      } else {
        const c = await zai.chat.completions.create({
          messages: [
            { role: 'assistant', content: SYS },
            { role: 'user', content: post.contentFa },
          ],
          thinking: { type: 'disabled' },
        });
        contentEn = c.choices[0]?.message?.content || '';
      }
      const c2 = await zai.chat.completions.create({
        messages: [
          { role: 'assistant', content: 'Translate Persian to English. Return ONLY the translation.' },
          { role: 'user', content: post.titleFa || '' },
        ],
        thinking: { type: 'disabled' },
      });
      const titleEn = (c2.choices[0]?.message?.content || '').trim();
      const c3 = await zai.chat.completions.create({
        messages: [
          { role: 'assistant', content: 'Translate Persian to English. Return ONLY the translation.' },
          { role: 'user', content: post.excerptFa || titleFaSafe(post.titleFa) },
        ],
        thinking: { type: 'disabled' },
      });
      const excerptEn = (c3.choices[0]?.message?.content || '').trim().slice(0, 500);

      await db.post.update({
        where: { id: post.id },
        data: { contentEn, titleEn: titleEn || post.titleFa, excerptEn: excerptEn || null },
      });
      await addPostToKb(post.id);
      return NextResponse.json({ ok: true, translatedTo: 'en' });
    }

    // translate TO Persian (from EN)
    if (post.contentEn && !post.contentFa) {
      const contentFa = await translateHtml(zai, post.contentEn);
      const c2 = await zai.chat.completions.create({
        messages: [
          { role: 'assistant', content: 'Translate English to Persian (Farsi). Return ONLY the translation.' },
          { role: 'user', content: post.titleEn || '' },
        ],
        thinking: { type: 'disabled' },
      });
      const titleFa = (c2.choices[0]?.message?.content || '').trim();
      await db.post.update({
        where: { id: post.id },
        data: { contentFa, titleFa: titleFa || post.titleEn },
      });
      await addPostToKb(post.id);
      return NextResponse.json({ ok: true, translatedTo: 'fa' });
    }

    return NextResponse.json({ ok: true, translatedTo: 'none', message: 'Both versions already exist' });
  } catch (e) {
    console.error('ai translate error:', e);
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Translation failed' }, { status: 500 });
  }
}

function titleFaSafe(t: string | null): string {
  return t || 'خلاصه مقاله';
}
