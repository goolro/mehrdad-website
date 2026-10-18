import { ImageResponse } from 'next/og';
import { ogFonts } from '@/lib/og-fonts';
import { OgCard } from '@/lib/og-cards';

export const alt = 'Case Study: Quiz of Koko — from idea to a live product | Mehrdad';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  const fonts = await ogFonts();
  return new ImageResponse(
    (
      <OgCard
        kicker="MEHRDAD.IR — CASE STUDY"
        title="Quiz of Koko"
        titleFa="از ایده تا محصول زنده — تمام داستان ساخت"
        subtitle="Live in browser & Android · every decision published"
      />
    ),
    { ...size, fonts }
  );
}
