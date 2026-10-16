// Language toggle for the Health & Wellness landing — NAV BADGE slot.
// Owner order 2026-10-16 (supersedes the D-037 floating pill placement):
// «WORKING TITLE … من دکمه تغییر زبان را ندیدم جای این متن بالا با فاصله کمی
// از اسم برند بزار --- فونت کوچک باشد» — i.e. the toggle lives exactly where
// the "WORKING TITLE" / «عنوان موقت» badge sat: inside .logo, right after the
// brand name, with the SAME small badge look (10px font, muted pill).
//
// Mechanism: each route handler deterministically replaces the ONE badge
// element (asserted unique) with ONE anchor + a tiny #lang-fab style block.
// landing-en.ts / landing-fa.ts stay byte-frozen; removing the anchor and
// restoring the badge returns the EXACT uploaded bytes (machine-proven).
// The .logo container is display:flex;gap:10px — the 1:1 swap keeps the
// owner-requested small gap from the brand name automatically.

// Exact badge strings inside the two landing files (each asserted unique).
export const BADGE_EN =
  '<small style="font:500 10px Inter;color:var(--mu);border:1px solid var(--line);border-radius:999px;padding:2px 8px;letter-spacing:.06em">WORKING TITLE</small>';
export const BADGE_FA =
  '<small style="font:500 10px Vazirmatn;color:var(--mu);border:1px solid var(--line);border-radius:999px;padding:2px 8px">عنوان موقت</small>';

export function navLangToggle(opts: {
  label: 'FA' | 'EN';
  href: string;
  ariaLabel: string;
  title: string;
  fontFamily: 'Inter' | 'Vazirmatn';
  letterSpacing?: boolean;
}): string {
  const ls = opts.letterSpacing ? 'letter-spacing:.06em;' : '';
  return (
    '<style>#lang-fab{display:inline-block;font:500 10px ' +
    opts.fontFamily +
    ';color:var(--mu);border:1px solid var(--line);border-radius:999px;padding:2px 8px;' +
    ls +
    'text-decoration:none;transition:color .2s ease,border-color .2s ease}#lang-fab:hover{color:var(--tx);border-color:rgba(255,255,255,.3)}#lang-fab:focus-visible{outline:2px solid var(--b,#19e3c1);outline-offset:2px}</style>' +
    '<a id="lang-fab" href="' +
    opts.href +
    '" aria-label="' +
    opts.ariaLabel +
    '" title="' +
    opts.title +
    '">' +
    opts.label +
    '</a>'
  );
}
