import { ImageResponse } from 'next/og';
import { ogFonts, OG } from '@/lib/og-fonts';

/**
 * OG card (1200×630) for the static Persian homepage /fa — VISIBILITY-AUDIT
 * FIX (2026-11-01).
 *
 * Why: the (site) group has its file-convention opengraph-image.tsx, but the
 * (fa) group had none — so the Persian homepage (the hreflang=fa target)
 * shared on WhatsApp/Telegram/LinkedIn with NO image at all (verified live:
 og:image + twitter:image absent from /fa HTML). This file-convention image
 * auto-injects og:image + twitter:image into /fa metadata without touching
 * the page-level openGraph block (same mechanism the EN home already uses).
 *
 * Same branded banner as the EN default (it is bilingual by design), with
 * the alt text flipped Persian-first to match the page language.
 */
export const alt = 'مهرداد — سازنده محصول | Mehrdad — Product Builder';
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

        {/* middle: name + tagline — Persian-first on the /fa card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div style={{ display: 'flex', fontSize: 96, fontWeight: 700, color: OG.text }}>
            مهرداد
          </div>
          <div style={{ display: 'flex', fontSize: 44, fontWeight: 700, color: OG.violetSoft }}>
            سازنده مستقل محصول&nbsp;&nbsp;·&nbsp;&nbsp;Product Builder
          </div>
          <div style={{ display: 'flex', fontSize: 30, color: OG.muted }}>
            طراحی کسب‌وکار و ساخت سریع محصول با هوش مصنوعی
          </div>
          <div style={{ display: 'flex', fontSize: 30, color: OG.muted }}>
            Real projects, honest status, lessons from real work.
          </div>
        </div>

        {/* bottom row: domain + accent */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', fontSize: 30, color: OG.dim }}>mehrdad.ir/fa</div>
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
