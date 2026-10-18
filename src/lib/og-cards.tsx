import { OG } from '@/lib/og-fonts';

/**
 * Shared branded OG card (1200×630) for money/credibility pages that define
 * their own metadata.openGraph — defining openGraph on a page drops the
 * root file-convention image, so each of these segments ships its own
 * opengraph-image.tsx rendering this component (LinkedIn/Twitter/WhatsApp
 * fix, 2026-10 — empty thumbnail on shared money-page links).
 *
 * satori constraints: every flex container needs explicit display:'flex',
 * spacing via gap/padding only, single Vazirmatn family (EN + FA glyphs).
 */

export type OgCardProps = {
  kicker: string;
  title: string;
  titleFa: string;
  subtitle: string;
  domain?: string;
};

export function OgCard({ kicker, title, titleFa, subtitle, domain = 'mehrdad.ir' }: OgCardProps) {
  return (
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
      {/* top: kicker pill */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '10px 26px',
            borderRadius: 999,
            border: `1px solid ${OG.border}`,
            background: OG.card,
            color: OG.violetSoft,
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: 2,
          }}
        >
          {kicker}
        </div>
      </div>

      {/* middle: title + FA line + subtitle */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', fontSize: 92, fontWeight: 700, color: OG.text }}>{title}</div>
        <div style={{ display: 'flex', fontSize: 38, fontWeight: 700, color: OG.violetSoft }}>
          {titleFa}
        </div>
        <div style={{ display: 'flex', fontSize: 30, color: OG.muted }}>{subtitle}</div>
      </div>

      {/* bottom: domain + accent bars */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', fontSize: 30, color: OG.dim }}>{domain}</div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ width: 90, height: 8, borderRadius: 999, background: OG.violet }} />
          <div style={{ width: 34, height: 8, borderRadius: 999, background: OG.emerald }} />
        </div>
      </div>
    </div>
  );
}
