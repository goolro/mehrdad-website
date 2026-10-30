import { ImageResponse } from 'next/og';
import { ogFonts } from '@/lib/og-fonts';
import { OgCard } from '@/lib/og-cards';

export const alt = 'Strategy Session — 45 min, $99, one-page memo | Mehrdad';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  const fonts = await ogFonts();
  return new ImageResponse(
    (
      <OgCard
        kicker="MEHRDAD.IR — STRATEGY SESSION"
        title="Strategy Session"
        titleFa="جلسه استراتژی — ۴۵ دقیقه، ۹۹ دلار"
        subtitle="One real problem in · ranked plan out · one-page memo in 24 h"
      />
    ),
    { ...size, fonts }
  );
}
