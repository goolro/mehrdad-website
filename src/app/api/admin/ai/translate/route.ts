import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkAdmin } from '@/lib/admin';
import { addPostToKb } from '@/lib/kb';
import { textCompleteStrict } from '@/lib/ai-provider';
import { sanitizePostHtml } from '@/lib/sanitize';

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

async function translateHtml(html: string): Promise<string> {
  const chunks = chunkHtml(html);
  const out: string[] = [];
  for (const c of chunks) {
    const completion = await textCompleteStrict(
      [
        { role: 'system', content: SYS },
        { role: 'user', content: c },
      ],
      { timeoutMs: 110_000, maxTokens: 4000, temperature: 0.3 }
    );
    out.push(completion.trim());
  }
  return out.join('');
}

async function shortTranslate(text: string, to: 'en' | 'fa'): Promise<string> {
  const sys =
    to === 'en'
      ? 'Translate Persian to English. Return ONLY the translation.'
      : 'Translate English to Persian (Farsi). Return ONLY the translation.';
  return (
    await textCompleteStrict(
      [
        { role: 'system', content: sys },
        { role: 'user', content: text },
      ],
      { timeoutMs: 60_000, maxTokens: 500, temperature: 0.3 }
    )
  ).trim();
}

export async function POST(req: NextRequest) {
  const denied = checkAdmin(req);
  if (denied) return denied;
  try {
    const { postId } = await req.json();
    const post = await db.post.findUnique({ where: { id: postId } });
    if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });

    // translate TO English (from FA)
    if (post.contentFa && !post.contentEn) {
      const contentEn = post.contentFa.length > 200
        ? await translateHtml(post.contentFa)
        : await shortTranslate(post.contentFa, 'en');
      const titleEn = await shortTranslate(post.titleFa || '', 'en');
      const excerptEn = (await shortTranslate(post.excerptFa || titleFaSafe(post.titleFa), 'en')).slice(0, 500);

      await db.post.update({
        where: { id: post.id },
        data: { contentEn: sanitizePostHtml(contentEn), titleEn: titleEn || post.titleFa, excerptEn: excerptEn || null },
      });
      await addPostToKb(post.id);
      return NextResponse.json({ ok: true, translatedTo: 'en' });
    }

    // translate TO Persian (from EN)
    if (post.contentEn && !post.contentFa) {
      const contentFa = await translateHtml(post.contentEn);
      const titleFa = await shortTranslate(post.titleEn || '', 'fa');
      await db.post.update({
        where: { id: post.id },
        data: { contentFa: sanitizePostHtml(contentFa), titleFa: titleFa || post.titleEn },
      });
      await addPostToKb(post.id);
      return NextResponse.json({ ok: true, translatedTo: 'fa' });
    }

    return NextResponse.json({ ok: true, translatedTo: 'none', message: 'Both versions already exist' });
  } catch (e) {
    console.error('ai translate error:', e);
    // the raw provider/stack message stays in the server log (round-3 L2)
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
  }
}

function titleFaSafe(t: string | null): string {
  return t || 'خلاصه مقاله';
}
