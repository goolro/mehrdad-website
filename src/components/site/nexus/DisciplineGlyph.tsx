/**
 * NEXUS — stroke-based SVG glyphs, one per discipline.
 * Same drawing language for all six: 48×48, 2px round strokes, thin gold-family
 * light. Each glyph has a hover behaviour that *means* something:
 *   engineering → the gear turns        math → the solid rotates
 *   physics     → ripples breathe       chemistry → the atom pulses
 *   digital     → edges light up        design → the curve draws itself
 */

export function DisciplineGlyph({ k }: { k: string }) {
  switch (k) {
    case 'engineering':
      return (
        <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          <g className="nx-gear">
            <circle cx="24" cy="24" r="9" />
            <circle cx="24" cy="24" r="3" />
            <line x1="35" y1="24" x2="39.5" y2="24" />
            <line x1="31.8" y1="31.8" x2="35" y2="35" />
            <line x1="24" y1="35" x2="24" y2="39.5" />
            <line x1="16.2" y1="31.8" x2="13" y2="35" />
            <line x1="13" y1="24" x2="8.5" y2="24" />
            <line x1="16.2" y1="16.2" x2="13" y2="13" />
            <line x1="24" y1="13" x2="24" y2="8.5" />
            <line x1="31.8" y1="16.2" x2="35" y2="13" />
          </g>
        </svg>
      );
    case 'math':
      return (
        <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <g className="nx-solid">
            <path d="M24 8 L40 34 L8 34 Z" />
            <path d="M24 27 L24 8 M24 27 L8 34 M24 27 L40 34" opacity="0.75" />
            <circle cx="24" cy="27" r="1.6" fill="currentColor" stroke="none" />
          </g>
        </svg>
      );
    case 'physics':
      return (
        <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          <circle cx="24" cy="25" r="2.4" fill="currentColor" stroke="none" />
          <g className="nx-ripple">
            <circle cx="24" cy="25" r="7.5" strokeDasharray="3 5" opacity="0.8" />
            <circle cx="24" cy="25" r="13" strokeDasharray="3 6" opacity="0.5" />
          </g>
          <ellipse className="nx-orbit" cx="24" cy="25" rx="17" ry="6.5" transform="rotate(-22 24 25)" opacity="0.85" />
        </svg>
      );
    case 'chemistry':
      return (
        <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M20 15 L28.7 20 L28.7 30 L20 35 L11.3 30 L11.3 20 Z" />
          <circle cx="20" cy="25" r="4.5" opacity="0.6" />
          <g className="nx-atom">
            <line x1="28.7" y1="20" x2="37" y2="14.5" />
            <circle cx="39" cy="13.2" r="2.6" fill="currentColor" stroke="none" />
          </g>
        </svg>
      );
    case 'digital':
      return (
        <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          <g className="nx-net">
            <line x1="24" y1="25" x2="11" y2="35" opacity="0.7" />
            <line x1="24" y1="25" x2="22" y2="11" opacity="0.7" />
            <line x1="24" y1="25" x2="37" y2="31" opacity="0.7" />
            <line x1="22" y1="11" x2="38" y2="14" opacity="0.5" strokeDasharray="2 3" />
          </g>
          <circle cx="24" cy="25" r="2.6" fill="currentColor" stroke="none" />
          <circle cx="11" cy="35" r="2.2" fill="currentColor" stroke="none" />
          <circle cx="22" cy="11" r="2.2" fill="currentColor" stroke="none" />
          <circle cx="37" cy="31" r="2.2" fill="currentColor" stroke="none" />
          <circle cx="38" cy="14" r="1.8" fill="currentColor" stroke="none" opacity="0.8" />
        </svg>
      );
    default: // design
      return (
        <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          <path className="nx-bezier" d="M9 37 C 18 12, 32 45, 41 17" pathLength="1" />
          <line x1="9" y1="37" x2="18" y2="12" strokeDasharray="2 3" opacity="0.45" strokeWidth="1.5" />
          <line x1="41" y1="17" x2="32" y2="45" strokeDasharray="2 3" opacity="0.45" strokeWidth="1.5" />
          <rect x="5.5" y="34" width="6" height="6" rx="1" />
          <rect x="38.5" y="11" width="6" height="6" rx="1" />
        </svg>
      );
  }
}
