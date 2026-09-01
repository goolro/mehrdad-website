'use client';

import { useMemo } from 'react';
import { getTheme } from '@/lib/themes';

/**
 * Fixed animated background layer, driven by the active site theme.
 * Pure CSS animations (GPU-friendly), respects prefers-reduced-motion.
 */
export function ThemeBackground({ themeId }: { themeId: string }) {
  const theme = getTheme(themeId);

  const particles = useMemo(() => {
    // deterministic pseudo-random layout (stable between renders)
    let seed = theme.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const rnd = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    switch (theme.effect) {
      case 'leaves':
        return Array.from({ length: 12 }, (_, i) => ({
          key: i,
          left: rnd() * 100,
          duration: 9 + rnd() * 9,
          delay: -rnd() * 14,
          size: 14 + rnd() * 16,
          char: ['🍂', '🍁', '🍃'][Math.floor(rnd() * 3)],
        }));
      case 'bubbles':
        return Array.from({ length: 14 }, (_, i) => ({
          key: i,
          left: rnd() * 100,
          duration: 10 + rnd() * 10,
          delay: -rnd() * 16,
          size: 6 + rnd() * 20,
        }));
      case 'fireflies':
        return Array.from({ length: 18 }, (_, i) => ({
          key: i,
          left: rnd() * 100,
          top: rnd() * 90,
          duration: 7 + rnd() * 9,
          delay: -rnd() * 10,
          size: 3 + rnd() * 4,
        }));
      case 'stars':
        return {
          stars: Array.from({ length: 70 }, (_, i) => ({
            key: i,
            left: rnd() * 100,
            top: rnd() * 100,
            size: 1 + rnd() * 2.2,
            duration: 2 + rnd() * 4,
            delay: -rnd() * 5,
          })),
          shooting: Array.from({ length: 2 }, (_, i) => ({
            key: i,
            left: 10 + rnd() * 60,
            top: rnd() * 40,
            delay: i * 5.5 - rnd() * 3,
          })),
        };
      default:
        return null;
    }
  }, [theme.id, theme.effect]);

  if (theme.effect === 'aurora') {
    return (
      <div className="theme-bg" aria-hidden="true">
        <div className="tb-grid" />
        <div
          className="tb-aurora-blob"
          style={{ top: '-12%', left: '8%', width: '42vw', height: '42vw', background: `${theme.swatch[0]}30` }}
        />
        <div
          className="tb-aurora-blob"
          style={{ top: '30%', right: '-10%', width: '38vw', height: '38vw', background: `${theme.swatch[2]}26`, animationDelay: '-9s' }}
        />
        <div
          className="tb-aurora-blob"
          style={{ bottom: '-18%', left: '28%', width: '34vw', height: '34vw', background: `${theme.swatch[1]}22`, animationDelay: '-17s' }}
        />
      </div>
    );
  }

  if (theme.effect === 'glow') {
    return (
      <div className="theme-bg" aria-hidden="true">
        <div
          className="tb-glow-band"
          style={{ top: '-14%', left: '5%', width: '55vw', height: '30vw', background: `${theme.swatch[0]}2e` }}
        />
        <div
          className="tb-glow-band"
          style={{ bottom: '-20%', right: '-8%', width: '48vw', height: '32vw', background: `${theme.swatch[2]}28`, animationDelay: '-6s' }}
        />
        <div
          className="tb-glow-band"
          style={{ top: '38%', left: '40%', width: '30vw', height: '22vw', background: `${theme.swatch[1]}1f`, animationDelay: '-3s' }}
        />
      </div>
    );
  }

  if (theme.effect === 'leaves') {
    return (
      <div className="theme-bg" aria-hidden="true">
        {particles?.map?.((p: { key: number; left: number; duration: number; delay: number; size: number; char: string }) => (
          <span
            key={p.key}
            className="tb-leaf"
            style={{
              left: `${p.left}%`,
              fontSize: p.size,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
            }}
          >
            {p.char}
          </span>
        ))}
      </div>
    );
  }

  if (theme.effect === 'bubbles') {
    return (
      <div className="theme-bg" aria-hidden="true">
        <div className="tb-wave" />
        {particles?.map?.((p: { key: number; left: number; duration: number; delay: number; size: number }) => (
          <span
            key={p.key}
            className="tb-bubble"
            style={{
              left: `${p.left}%`,
              width: p.size,
              height: p.size,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>
    );
  }

  if (theme.effect === 'fireflies') {
    return (
      <div className="theme-bg" aria-hidden="true">
        {particles?.map?.((p: { key: number; left: number; top: number; duration: number; delay: number; size: number }) => (
          <span
            key={p.key}
            className="tb-firefly"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: p.size,
              height: p.size,
              animationDuration: `${p.duration}s, 3.4s`,
              animationDelay: `${p.delay}s, ${p.delay / 2}s`,
            }}
          />
        ))}
      </div>
    );
  }

  // stars
  const stars = (particles as { stars?: Array<{ key: number; left: number; top: number; size: number; duration: number; delay: number }> })?.stars || [];
  const shooting = (particles as { shooting?: Array<{ key: number; left: number; top: number; delay: number }> })?.shooting || [];
  return (
    <div className="theme-bg" aria-hidden="true">
      {stars.map((s) => (
        <span
          key={s.key}
          className="tb-star"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            animationDuration: `${s.duration}s`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
      {shooting.map((s) => (
        <span
          key={s.key}
          className="tb-shooting"
          style={{ left: `${s.left}%`, top: `${s.top}%`, animationDelay: `${s.delay}s` }}
        />
      ))}
    </div>
  );
}
