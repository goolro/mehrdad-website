'use client';

import { useMemo } from 'react';
import { getTheme, type ThemeEffect } from '@/lib/themes';

/**
 * Fixed animated background layer, driven by the active site theme.
 * Pure CSS animations (GPU-friendly), respects prefers-reduced-motion.
 *
 * Effects (Theme Engine, docs/THEME_ENGINE.md):
 * - aurora  → Default: soft drifting gradient blobs + faint grid
 * - leaves  → Autumn: falling, swaying leaves
 * - snow    → Winter: drifting snowflakes + soft dots
 * - matrix  → Digital: falling glyphs over the grid
 * - petals  → Nowruz: drifting spring petals
 *
 * All particle effects share one generic renderer; only `aurora` is
 * special (fixed blobs). Particle colors always come from the theme's
 * own CSS tokens, so Light/Dark keeps working for every effect.
 */

interface Particle {
  key: number;
  left: number;
  duration: number;
  delay: number;
  size: number;
  char?: string;
}

const FALL_CLASS: Record<Exclude<ThemeEffect, 'aurora'>, string> = {
  leaves: 'tb-leaf',
  snow: 'tb-snow',
  matrix: 'tb-matrix',
  petals: 'tb-petal',
};

/** snow dots render without a glyph — dedicated class per effect */
const DOT_CLASS: Partial<Record<Exclude<ThemeEffect, 'aurora'>, string>> = {
  snow: 'tb-snow-dot',
};

export function ThemeBackground({ themeId }: { themeId: string }) {
  const theme = getTheme(themeId);

  const particles = useMemo(() => {
    // deterministic pseudo-random layout (stable between renders)
    let seed = theme.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const rnd = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    const make = (n: number, fn: (i: number) => Particle): Particle[] =>
      Array.from({ length: n }, (_, i) => fn(i));

    switch (theme.effect) {
      case 'leaves':
        return make(12, (i) => ({
          key: i,
          left: rnd() * 100,
          duration: 9 + rnd() * 9,
          delay: -rnd() * 14,
          size: 14 + rnd() * 16,
          char: ['🍂', '🍁', '🍃'][Math.floor(rnd() * 3)],
        }));
      case 'snow':
        return [
          ...make(12, (i) => ({
            key: i,
            left: rnd() * 100,
            duration: 13 + rnd() * 11,
            delay: -rnd() * 20,
            size: 12 + rnd() * 12,
            char: ['❄', '❅', '❆'][Math.floor(rnd() * 3)],
          })),
          ...make(10, (i) => ({
            key: 100 + i,
            left: rnd() * 100,
            duration: 11 + rnd() * 9,
            delay: -rnd() * 18,
            size: 2 + rnd() * 3,
          })),
        ];
      case 'matrix':
        return make(22, (i) => ({
          key: i,
          left: rnd() * 100,
          duration: 7 + rnd() * 8,
          delay: -rnd() * 12,
          size: 11 + rnd() * 8,
          char: ['۰', '۱', '0', '1'][Math.floor(rnd() * 4)],
        }));
      case 'petals':
        return make(10, (i) => ({
          key: i,
          left: rnd() * 100,
          duration: 12 + rnd() * 9,
          delay: -rnd() * 16,
          size: 14 + rnd() * 12,
          char: ['🌸', '🌼', '🌷'][Math.floor(rnd() * 3)],
        }));
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

  const list = (particles as Particle[]) || [];
  const effect = theme.effect as Exclude<ThemeEffect, 'aurora'>;
  const charClass = FALL_CLASS[effect];
  const dotClass = DOT_CLASS[effect] || charClass;

  return (
    <div className="theme-bg" aria-hidden="true">
      {list.map((p) =>
        p.char ? (
          <span
            key={p.key}
            className={charClass}
            style={{
              left: `${p.left}%`,
              fontSize: p.size,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
            }}
          >
            {p.char}
          </span>
        ) : (
          <span
            key={p.key}
            className={dotClass}
            style={{
              left: `${p.left}%`,
              width: p.size,
              height: p.size,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
            }}
          />
        )
      )}
    </div>
  );
}
