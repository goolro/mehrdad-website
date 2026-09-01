import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { checkAdmin } from '@/lib/admin';
import { retrieveContext, buildContextBlock } from '@/lib/rag';

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

    const zai = await ZAI.create();

    const sys = `You are the AI content writer for Mehrdad's website (designer & researcher: startups, smart city, AI, investment, inventions, product design, digital marketing).
Write an original, well-structured blog article about the given topic.
Style: professional yet engaging, practical insights, suitable for the site's audience (entrepreneurs, investors, tech enthusiasts).
Structure: title, excerpt (2 sentences), then article body with HTML headings (<h2>, <h3>) and <p> paragraphs. No <html>/<body> wrapper.
You may reference and build upon the existing site knowledge below to stay consistent with Mehrdad's other content ("learning from existing content").

EXISTING SITE KNOWLEDGE:
${context || '(none)'}

Respond with ONLY valid JSON (no markdown fences) in this exact shape:
{"titleEn":"...","titleFa":"...","excerptEn":"...","excerptFa":"...","contentEn":"<h2>...</h2><p>...</p>...","contentFa":"..."}`;

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'assistant', content: sys },
        {
          role: 'user',
          content: `Topic: ${topic}${keywords ? `\nKeywords: ${keywords}` : ''}\n\nWrite the full article in BOTH English and Persian (Farsi). Length: ~600-900 words per language.`,
        },
      ],
      thinking: { type: 'disabled' },
    });

    let text = completion.choices[0]?.message?.content || '';
    text = text.replace(/```json|```/g, '').trim();
    const s = text.indexOf('{');
    const e = text.lastIndexOf('}');
    if (s === -1 || e === -1) throw new Error('AI did not return JSON');
    const parsed = JSON.parse(text.slice(s, e + 1));

    return NextResponse.json({ ok: true, article: parsed });
  } catch (e) {
    console.error('ai write error:', e);
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Generation failed' }, { status: 500 });
  }
}
