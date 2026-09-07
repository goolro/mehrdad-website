import { ImageResponse } from 'next/og';
import { ogFonts, OG } from '@/lib/og-fonts';

/**
 * Default OG card (1200×630) for every route without a more specific image —
 * home, services, work, about, contact, blog index (SEO-growth, 2026-09-08).
 *
 * Why: layout.tsx used a 512×512 icon as the social-share card — WhatsApp/
 * Telegram/LinkedIn showed a tiny square instead of a proper brand banner.
 * This file-convention image is generated once at build and auto-injected
 * into every page's metadata.
 */
export const alt = 'Mehrdad — Product Builder | مهرداد — سازنده محصول';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
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
          backgroundImage: `radial-gradient(circle at 12% 8%, rgba(124,58,237,0.45) 0%, rgba(124,58,237,0) 42%), radial-gradient(circle at 92% 96%, rgba(16,185,129,0.22) 0%, rgba(16,185,129,0) 40%)`,
          fontFamily: 'Vazirmatn',
        }}
      >
        {/* top row: brand pill */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '12px 28px',
              borderRadius: 999,
              border: `1px solid ${OG.border}`,
              background: OG.card,
              color: OG.violetSoft,
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: 2,
            }}
          >
            ☼ MEHRDAD.IR
          </div>
        </div>

        {/* middle: name + tagline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div style={{ display: 'flex', fontSize: 96, fontWeight: 700, color: OG.text }}>
            Mehrdad
          </div>
          <div style={{ display: 'flex', fontSize: 44, fontWeight: 700, color: OG.violetSoft }}>
            Product Builder&nbsp;&nbsp;·&nbsp;&nbsp;سازنده محصول
          </div>
          <div style={{ display: 'flex', fontSize: 30, color: OG.muted }}>
            Real projects, honest status, lessons from real work.
          </div>
          <div style={{ display: 'flex', fontSize: 30, color: OG.muted }}>
            طراحی کسب‌وکار و ساخت سریع محصول با هوش مصنوعی
          </div>
        </div>

        {/* bottom row: domain + accent */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', fontSize: 30, color: OG.dim }}>mehrdad.ir</div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ width: 90, height: 8, borderRadius: 999, background: OG.violet }} />
            <div style={{ width: 34, height: 8, borderRadius: 999, background: OG.emerald }} />
          </div>
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
