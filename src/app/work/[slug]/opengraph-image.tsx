import { ImageResponse } from 'next/og';
import { ogFonts, OG } from '@/lib/og-fonts';
import { getProjectBySlug } from '@/lib/queries';
import { normalizeStatus, showsProgress, STATUS_LABELS } from '@/lib/project-status';

/**
 * Per-project OG card (2026-09-09): every project link shared on
 * LinkedIn / WhatsApp / Telegram renders a branded card carrying the two
 * off-site signals the owner wants — the honest status (Building · در حال
 * ساخت) and the build-progress bar. No LinkedIn API is involved: platforms
 * scrape this image themselves at share time, and the admin deploy hook
 * (VERCEL_DEPLOY_HOOK_URL) regenerates cards whenever progress changes.
 *
 * Mirrors blog/[slug]/opengraph-image.tsx: a DB failure degrades to a
 * generic branded card (never a broken share); a cover photo becomes the
 * card background behind a dark overlay.
 */
export const alt = 'Project — Mehrdad';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

type Props = { params: Promise<{ slug: string }> };

/** status → accent color + progress-bar gradient (satori inline CSS) */
const ACCENT: Record<string, { text: string; bar: string }> = {
  building: { text: '#fbbf24', bar: 'linear-gradient(90deg, #f59e0b, #f97316)' },
  testing: { text: '#2dd4bf', bar: 'linear-gradient(90deg, #14b8a6, #10b981)' },
  live: { text: '#34d399', bar: 'linear-gradient(90deg, #10b981, #14b8a6)' },
  idea: { text: '#a78bfa', bar: 'linear-gradient(90deg, #7c3aed, #d946ef)' },
  concept: { text: '#94a3b8', bar: 'linear-gradient(90deg, #94a3b8, #64748b)' },
  paused: { text: '#fb923c', bar: 'linear-gradient(90deg, #f97316, #f59e0b)' },
  archived: { text: '#a1a1aa', bar: 'linear-gradient(90deg, #a1a1aa, #71717a)' },
};

/** fetch the cover and inline it as a data URI (3.5s cap — never slow a share) */
async function coverDataUri(cover: string): Promise<string | null> {
  try {
    const origin = (process.env.SITE_ORIGIN || 'https://mehrdad.ir').replace(/\/+$/, '');
    const url = /^https?:\/\//i.test(cover) ? cover : `${origin}/${cover.replace(/^\/+/, '')}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(3500) });
    if (!res.ok) return null;
    const type = res.headers.get('content-type') || '';
    if (!type.startsWith('image/')) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 1024 || buf.length > 8 * 1024 * 1024) return null; // sanity
    return `data:${type};base64,${buf.toString('base64')}`;
  } catch {
    return null;
  }
}

export default async function Image({ params }: Props) {
  const { slug } = await params;

  let titleEn = 'Project | Mehrdad';
  let titleFa = '';
  let section: 'work' | 'lab' = 'work';
  let status = 'idea';
  let progress = 0;
  let cover: string | null = null;
  let found = false;
  try {
    const project = await getProjectBySlug(slug);
    if (project) {
      found = true;
      titleEn = project.titleEn || titleEn;
      titleFa = project.titleFa || '';
      section = project.section === 'lab' ? 'lab' : 'work';
      status = project.status;
      progress = project.progress;
      cover = project.cover;
    }
  } catch {
    // DB hiccup → generic branded card below
  }

  const st = normalizeStatus(status);
  const accent = ACCENT[st] || ACCENT.idea;
  const labels = STATUS_LABELS[st];
  const withProgress = found && showsProgress(st);
  const sectionChip = section === 'lab' ? 'LAB · آزمایشگاه' : 'WORK · پروژه';

  const displayEn = titleEn.length > 90 ? `${titleEn.slice(0, 87).trimEnd()}…` : titleEn;
  const enSize = titleEn.length > 60 ? 56 : titleEn.length > 30 ? 68 : 84;

  const bg = cover ? await coverDataUri(cover) : null;

  const fonts = await ogFonts();
  return new ImageResponse(
    (
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          background: OG.bg,
          backgroundImage: bg
            ? undefined
            : `radial-gradient(circle at 88% 6%, rgba(124,58,237,0.4) 0%, rgba(124,58,237,0) 45%), radial-gradient(circle at 6% 96%, rgba(16,185,129,0.2) 0%, rgba(16,185,129,0) 38%)`,
          fontFamily: 'Vazirmatn',
        }}
      >
        {bg && (
          <img
            src={bg}
            alt=""
            width={size.width}
            height={size.height}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        )}
        {bg && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              background:
                'linear-gradient(180deg, rgba(14,10,24,0.55) 0%, rgba(14,10,24,0.88) 62%, rgba(14,10,24,0.96) 100%)',
            }}
          />
        )}

        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: '100%',
            height: '100%',
            padding: 64,
          }}
        >
          {/* top row — section chip + status pill */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div
              style={{
                display: 'flex',
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
              {sectionChip}
            </div>
            {/* status pill only for real projects — a fallback card must
                not imply a lifecycle state that does not exist */}
            {found && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '10px 26px',
                  borderRadius: 999,
                  border: `1px solid ${accent.text}`,
                  background: 'rgba(255,255,255,0.08)',
                  color: accent.text,
                  fontSize: 26,
                  fontWeight: 700,
                }}
              >
                {labels.en} · {labels.fa}
              </div>
            )}
          </div>

          {/* title block */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div
              style={{
                display: 'flex',
                fontSize: enSize,
                fontWeight: 700,
                color: OG.text,
                lineHeight: 1.25,
                direction: 'ltr',
                textAlign: 'left',
              }}
            >
              {displayEn}
            </div>
            {titleFa && (
              <div
                style={{
                  display: 'flex',
                  fontSize: 38,
                  color: OG.muted,
                  direction: 'rtl',
                  textAlign: 'left',
                }}
              >
                {titleFa}
              </div>
            )}

            {/* build progress — the signal this card exists for */}
            {withProgress && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 18 }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                  }}
                >
                  <div style={{ display: 'flex', fontSize: 30, color: accent.text, fontWeight: 700 }}>
                    Build progress · پیشرفت ساخت
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      fontSize: 56,
                      fontWeight: 700,
                      color: accent.text,
                      lineHeight: 1,
                    }}
                  >
                    {Math.min(100, Math.max(0, progress))}%
                  </div>
                </div>
                <div
                  style={{
                    display: 'flex',
                    width: '100%',
                    height: 26,
                    borderRadius: 999,
                    background: 'rgba(255,255,255,0.14)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      width: `${Math.min(100, Math.max(0, progress))}%`,
                      height: '100%',
                      borderRadius: 999,
                      backgroundImage: accent.bar,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* footer */}
          <div
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          >
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
            <div style={{ display: 'flex', fontSize: 28, color: OG.violetSoft }}>
              mehrdad.ir/work
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
