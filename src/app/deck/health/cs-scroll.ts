// D-042 — owner order 2026-10-17: mobile fix for the deck pages.
// Owner: «نسخه موبایل این پیج دک درست نمایش داده نمیشه مثلا برای فارسی انگار
// باید صفحه را جابجا کنی». Investigation (worklog Task 6) proved:
//   • The 2026-10-17 revision's `.cs` sensitivity table is the ONLY table not
//     inside the file's own `.scroll{overflow-x:auto}` container.
//   • The file's global `table{width:100%;min-width:520px}` therefore pushes
//     the whole PAGE 180px past a phone viewport (scrollWidth 570 vs 390).
//     In FA (dir=rtl) the overflow lands on the LEFT edge — the page opens
//     with columns cut off and must be shifted; exactly the owner's symptom.
//   • Hiding `.cs` in the browser returns scrollWidth to exactly 390 on both
//     languages → fixing this one table fixes 100% of the horizontal shift.
// Fix (owner-approved by sending the deploy token): wrap that ONE table in a
// neutral container and add ONE CSS rule. The container carries NO borders,
// background, radius or margins — on viewports where the table fits (~>=568px)
// overflow-x:auto renders nothing, so desktop/tablet bytes AND pixels are
// unchanged; on phones the table scrolls internally like the file's own
// .scroll tables. All other bytes stay frozen; every insertion is asserted
// unique and round-trip-proven back to the exact original bytes.

const CS_TABLE_OPEN = '<table class="cs">';
const CS_TABLE_CLOSE = '</table>';
// The `.cs th` rule sits directly after the other .cs rules — the CSS rule is
// injected right there (asserted unique in BOTH landing files).
const CS_CSS_ANCHOR =
  '.cs th{color:var(--b);font-size:11px;letter-spacing:.1em;text-transform:uppercase}';
const CSS_RULE = '.cs-scroll{overflow-x:auto}';
const WRAP_OPEN = '<div class="cs-scroll">';
const WRAP_CLOSE = '</div>';

function assertUnique(haystack: string, needle: string, what: string): number {
  const first = haystack.indexOf(needle);
  if (first === -1) throw new Error(`cs-scroll: anchor not found: ${what}`);
  if (haystack.indexOf(needle, first + 1) !== -1) {
    throw new Error(`cs-scroll: anchor not unique: ${what}`);
  }
  return first;
}

export function mobileSafeCsTable(html: string): string {
  // 1) inject the single CSS rule right after the .cs rules it serves
  const cssAt = assertUnique(html, CS_CSS_ANCHOR, '.cs th rule');
  const cssPos = cssAt + CS_CSS_ANCHOR.length;
  const withCss =
    html.slice(0, cssPos) + CSS_RULE + html.slice(cssPos);

  // 2) wrap the (uniquely anchored) .cs table in the neutral scroll container
  const open = assertUnique(withCss, CS_TABLE_OPEN, '.cs table open');
  const closeRel = withCss.indexOf(CS_TABLE_CLOSE, open);
  if (closeRel === -1) throw new Error('cs-scroll: .cs table close not found');
  const nested = withCss.indexOf('<table', open + CS_TABLE_OPEN.length);
  if (nested !== -1 && nested < closeRel) {
    throw new Error('cs-scroll: nested table before the expected close');
  }
  const close = closeRel + CS_TABLE_CLOSE.length;
  const wrapped =
    withCss.slice(0, open) +
    WRAP_OPEN +
    withCss.slice(open, close) +
    WRAP_CLOSE +
    withCss.slice(close);

  // 3) notautological proof: exact positional inverse returns the ORIGINAL
  //    bytes (proves exactly two insertions and nothing else moved).
  //    Wrapped layout: html[0..cssPos) | CSS_RULE | html[cssPos..Hopen) |
  //    WRAP_OPEN | html[Hopen..Hclose) | WRAP_CLOSE | html[Hclose..) — where
  //    Hopen=open-RULE.len, Hclose=close-RULE.len (withCss→html shift).
  const unwrapped =
    wrapped.slice(0, cssPos) +
    wrapped.slice(cssPos + CSS_RULE.length, open) +
    wrapped.slice(open + WRAP_OPEN.length, close + WRAP_OPEN.length) +
    wrapped.slice(close + WRAP_OPEN.length + WRAP_CLOSE.length);
  if (unwrapped !== html) {
    throw new Error('cs-scroll: round-trip byte proof failed');
  }
  return wrapped;
}
