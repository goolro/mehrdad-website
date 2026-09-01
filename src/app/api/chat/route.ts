import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import ZAI from 'z-ai-web-dev-sdk';
import { retrieveContext, buildContextBlock } from '@/lib/rag';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = (body.message || '').trim().slice(0, 2000);
    const lang: 'en' | 'fa' = body.lang === 'fa' ? 'fa' : 'en';
    let sessionId = (body.sessionId || '').trim();

    if (!message) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }

    // session
    if (sessionId) {
      const exists = await db.chatSession.findUnique({ where: { id: sessionId } });
      if (!exists) sessionId = '';
    }
    if (!sessionId) {
      const s = await db.chatSession.create({ data: {} });
      sessionId = s.id;
    }

    // history (last 8 messages)
    const history = await db.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
      take: 8,
    });

    await db.chatMessage.create({
      data: { sessionId, role: 'user', content: message, lang },
    });

    // RAG retrieval
    const chunks = await retrieveContext(message, 6);
    const context = buildContextBlock(chunks);

    const sysEn = `You are "Mehrdad AI", the official AI assistant on Mehrdad's personal website (mehrdad.ir). Mehrdad is an independent product builder: he designs businesses and products with care, and builds them fast with AI. His work: BUILD (AI-powered products, software, tools, experiments — e.g. BIZPAL, KLIKA, smart city & rail corridor research, smart waste startup), HELP (businesses using AI for measurable value: sales, marketing, product design, invention commercialization), SHARE (83+ articles of real research, decisions and lessons).

Use ONLY the following site knowledge to answer. If the answer is not in the knowledge, say you don't have that info and suggest using the contact form or email admin@mehrdad.ir.

Be helpful, professional and concise (max ~180 words). Use markdown sparingly. Answer in English.

SITE KNOWLEDGE:
${context || '(no specific knowledge found — rely only on the general info above)'}`;

    const sysFa = `تو «هوش مصنوعی مهرداد» هستی، دستیار رسمی وب‌سایت شخصی مهرداد (mehrdad.ir). مهرداد سازنده مستقل محصول است: کسب‌وکارها و محصولات را با دقت طراحی می‌کند و با هوش مصنوعی سریع می‌سازد. کار او: ساخت (محصولات و ابزارهای AI مثل BIZPAL، کلیکا، پژوهش شهر هوشمند و کریدور ریلی، استارتاپ مدیریت زباله هوشمند)، همراهی (به‌کارگیری AI با نتیجه قابل اندازه‌گیری: فروش، بازاریابی، طراحی محصول، تجاری‌سازی اختراع)، و به‌اشتراک‌گذاری (بیش از ۸۳ مقاله از پژوهش‌ها و درس‌های واقعی).

فقط از دانش سایت زیر برای پاسخ استفاده کن. اگر پاسخ در دانش موجود نبود، بگو اطلاعاتی نداری و فرم تماس یا ایمیل admin@mehrdad.ir را پیشنهاد بده.

مفید، حرفه‌ای و مختصر پاسخ بده (حداکثر ~۱۸۰ کلمه). به فارسی روان پاسخ بده.

دانش سایت:
${context || '(دانش خاصی یافت نشد — فقط از اطلاعات کلی بالا استفاده کن)'}`;

    const completion = await ZAI.create().then((zai) =>
      zai.chat.completions.create({
        messages: [
          { role: 'assistant', content: lang === 'fa' ? sysFa : sysEn },
          ...history.map((h) => ({ role: h.role as 'user' | 'assistant', content: h.content })),
          { role: 'user', content: message },
        ],
        thinking: { type: 'disabled' },
      })
    );

    const reply = completion.choices[0]?.message?.content || '';

    await db.chatMessage.create({
      data: { sessionId, role: 'assistant', content: reply, lang },
    });

    const sources = [...new Set(chunks.map((c) => c.refSlug).filter(Boolean))].slice(0, 4);

    return NextResponse.json({ reply, sessionId, sources });
  } catch (e) {
    console.error('chat api error:', e);
    return NextResponse.json({ error: 'Chat failed' }, { status: 500 });
  }
}
