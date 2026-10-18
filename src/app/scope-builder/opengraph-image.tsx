import { ImageResponse } from 'next/og';
import { ogFonts } from '@/lib/og-fonts';
import { OgCard } from '@/lib/og-cards';

export const alt = 'Free MVP Scope Builder — one-page scope in 3 minutes | Mehrdad';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  const fonts = await ogFonts();
  return new ImageResponse(
    (
      <OgCard
        kicker="MEHRDAD.IR — FREE TOOL"
        title="MVP Scope Builder"
        titleFa="ابزار رایگان — دامنه‌ی محصول در سه دقیقه"
        subtitle="Five honest questions → a one-page scope. No signup."
      />
    ),
    { ...size, fonts }
  );
}
