import { ImageResponse } from 'next/og';
import { ogFonts, OG } from '@/lib/og-fonts';
import { db } from '@/lib/db';

/**
 * Per-article OG card (SEO-growth, 2026-09-08): every shared article link on
 * WhatsApp/Telegram/LinkedIn gets a real banner with the article title —
 * the single highest-CTR improvement available for a site that spreads via
 * messaging apps. Persian titles render RTL with Vazirmatn; English ones LTR.
 *
 * Static slugs are baked at build; unknown slugs generate on demand. A DB
 * failure degrades to a generic branded card (never a broken share).
 */
export const alt = 'Article — Mehrdad';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

type Props = { params: Promise<{ slug: string }> };

export default async function Image({ params }: Props) {
  const { slug } = await params;

  let title = 'Article | مقاله';
  let date = '';
  let rtl = true;
  try {
    const post = await db.post.findUnique({
      where: { slug },
      select: { titleFa: true, titleEn: true, date: true },
    });
    if (post) {
      // Persian-first: the audience sharing these links is Persian-speaking
      const t = post.titleFa || post.titleEn || title;
      title = t;
      rtl = !post.titleFa && !!post.titleEn ? false : /[\u0600-\u06FF]/.test(t);
      date = new Date(post.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
  } catch {
    // DB hiccup → generic card below
  }

  // clamp: ~3 lines max on the card
  const display = title.length > 130 ? `${title.slice(0, 127).trimEnd()}…` : title;

  const fonts = await ogFonts();
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          background: OG.bg,
          backgroundImage: `radial-gradient(circle at 88% 6%, rgba(124,58,237,0.4) 0%, rgba(124,58,237,0) 45%), radial-gradient(circle at 6% 96%, rgba(16,185,129,0.2) 0%, rgba(16,185,129,0) 38%)`,
          fontFamily: 'Vazirmatn',
          direction: rtl ? 'rtl' : 'ltr',
        }}
      >
        {/* top row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div
            style={{
              display: 'flex',
              padding: '10px 26px',
              borderRadius: 999,
              border: `1px solid ${OG.border}`,
              background: OG.card,
              color: OG.emerald,
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: 2,
            }}
          >
            BLOG · وبلاگ
          </div>
          <div style={{ display: 'flex', fontSize: 26, color: OG.dim }}>{date}</div>
        </div>

        {/* title */}
        <div
          style={{
            display: 'flex',
            fontSize: title.length > 70 ? 52 : title.length > 38 ? 64 : 76,
            fontWeight: 700,
            color: OG.text,
            lineHeight: 1.35,
            textAlign: rtl ? 'right' : 'left',
          }}
        >
          {display}
        </div>

        {/* author footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 56,
                height: 56,
                borderRadius: 999,
                background: OG.violet,
                color: OG.text,
                fontSize: 30,
                fontWeight: 700,
              }}
            >
              M
            </div>
            <div style={{ display: 'flex', fontSize: 30, color: OG.muted }}>
              Mehrdad — Product Builder
            </div>
          </div>
          <div style={{ display: 'flex', fontSize: 28, color: OG.violetSoft }}>mehrdad.ir</div>
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
