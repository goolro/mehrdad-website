import { ImageResponse } from 'next/og';
import { ogFonts } from '@/lib/og-fonts';
import { OgCard } from '@/lib/og-cards';

export const alt = 'MVP Sprint — fixed scope, fixed price | Mehrdad';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  const fonts = await ogFonts();
  return new ImageResponse(
    (
      <OgCard
        kicker="MEHRDAD.IR — MVP SPRINT"
        title="MVP Sprint"
        titleFa="اسپرینت محصول — دامنه‌ی مشخص، قیمت مشخص"
        subtitle="Fixed scope · Fixed price · From problem to a live product"
      />
    ),
    { ...size, fonts }
  );
}
