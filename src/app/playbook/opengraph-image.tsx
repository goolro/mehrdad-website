import { ImageResponse } from 'next/og';
import { ogFonts } from '@/lib/og-fonts';
import { OgCard } from '@/lib/og-cards';

export const alt = 'The FDE Playbook — from idea to a live product | Mehrdad';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  const fonts = await ogFonts();
  return new ImageResponse(
    (
      <OgCard
        kicker="MEHRDAD.IR — THE FDE PLAYBOOK"
        title="From idea to live product"
        titleFa="پلی‌بوک FDE — از ایده تا محصول زنده"
        subtitle="Scope · Build · Launch · Measure"
      />
    ),
    { ...size, fonts }
  );
}
