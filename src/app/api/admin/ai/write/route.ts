import { NextRequest, NextResponse } from 'next/server';
import { checkAdmin } from '@/lib/admin';
import { retrieveContext, buildContextBlock } from '@/lib/rag';
import { textCompleteStrict } from '@/lib/ai-provider';
import { sanitizePostHtml } from '@/lib/sanitize';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const denied = checkAdmin(req);
  if (denied) return denied;
  try {
    const b = await req.json();
    const topic = (b.topic || '').trim().slice(0, 300);
    const keywords = (b.keywords || '').trim().slice(0, 300);
    if (!topic) return NextResponse.json({ error: 'Topic required' }, { status: 400 });

    // "Learning" step: retrieve existing site knowledge relevant to the topic
    // so the AI writes in the site's own voice and can cross-reference existing content.
    const chunks = await retrieveContext(`${topic} ${keywords}`, 5);
    const context = buildContextBlock(chunks);

    const sys = `You are the AI content writer for Mehrdad's website (independent product builder: startups, smart city, AI, inventions, product design, digital marketing).
Write an original, well-structured blog article about the given topic.
Style: professional yet engaging, practical insights, suitable for the site's audience (entrepreneurs, business owners, tech enthusiasts).
Structure: title, excerpt (2 sentences), then article body with HTML headings (<h2>, <h3>) and <p> paragraphs. No <html>/<body> wrapper.
You may reference and build upon the existing site knowledge below to stay consistent with Mehrdad's other content ("learning from existing content").

EXISTING SITE KNOWLEDGE:
${context || '(none)'}

Respond with ONLY valid JSON (no markdown fences) in this exact shape:
{"titleEn":"...","titleFa":"...","excerptEn":"...","excerptFa":"...","contentEn":"<h2>...</h2><p>...</p>...","contentFa":"..."}`;

    const text = await textCompleteStrict(
      [
        { role: 'system', content: sys },
        {
          role: 'user',
          content: `Topic: ${topic}${keywords ? `\nKeywords: ${keywords}` : ''}\n\nWrite the full article in BOTH English and Persian (Farsi). Length: ~600-900 words per language.`,
        },
      ],
      { timeoutMs: 110_000, maxTokens: 4000, temperature: 0.7 }
    );

    let clean = text.replace(/```json|```/g, '').trim();
    const s = clean.indexOf('{');
    const e = clean.lastIndexOf('}');
    if (s === -1 || e === -1) throw new Error('AI did not return JSON');
    const parsed = JSON.parse(clean.slice(s, e + 1));
    // XSS guard: AI output is rendered as HTML in the admin preview and blog
    parsed.contentEn = sanitizePostHtml(parsed.contentEn);
    parsed.contentFa = sanitizePostHtml(parsed.contentFa);

    return NextResponse.json({ ok: true, article: parsed });
  } catch (e) {
    console.error('ai write error:', e);
    // the raw provider/stack message stays in the server log (round-3 L2)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
  }
}
