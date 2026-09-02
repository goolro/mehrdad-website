// Throwaway unit test for the alt rewrite logic (mirrors fix_alts.ts exactly)
const IMG_RE = /<img\b[^>]*>/gi;
const SRC_RE = /\bsrc\s*=\s*"([^"]+)"/i;
const ALT_RE = /\balt\s*=\s*"([^"]*)"/i;
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function rewriteTag(tag: string, altText: string): string {
  if (/\balt\s*=/i.test(tag)) return tag.replace(ALT_RE, `alt="${esc(altText)}"`);
  return tag.replace(/\/?>$/, ` alt="${esc(altText)}"$&`);
}
function rewriteHtml(html: string, name: string, altText: string): { html: string; count: number } {
  let count = 0;
  const out = html.replace(IMG_RE, (tag) => {
    const src = (tag.match(SRC_RE) || [])[1];
    if (!src?.startsWith('/media/')) return tag;
    let decoded = src.slice('/media/'.length);
    try { decoded = decodeURIComponent(decoded); } catch {}
    if (decoded !== name) return tag;
    count++;
    return rewriteTag(tag, altText);
  });
  return { html: out, count };
}

// real shapes from DB
const enTag = `<img src="/media/mehrdad-startup-1-r57-238x300.png" alt="Image" loading="lazy" />`;
const faTag = `<img src="/media/mehrdad-startup-1-77-ب-238x300.png" alt="تصویر" loading="lazy" />`;
const noAltTag = `<img src="/media/foo.png" loading="lazy" />`;
const html = `<p>متن</p>${faTag}<p>بین</p>${enTag}${noAltTag}`;

let pass = 0, fail = 0;
const check = (label: string, cond: boolean) => {
  if (cond) pass++;
  else { fail++; console.log('FAIL:', label); }
};

// 1. EN alt replace
const r1 = rewriteHtml(html, 'mehrdad-startup-1-r57-238x300.png', 'A startup planning diagram with sticky notes');
check('en matched 1', r1.count === 1);
check('en alt replaced', r1.html.includes('alt="A startup planning diagram with sticky notes"'));
check('en junk gone', !r1.html.includes('alt="Image"'));
check('en lazy kept', r1.html.includes('loading="lazy"'));

// 2. FA alt replace (raw Persian src vs decoded key)
const r2 = rewriteHtml(html, 'mehrdad-startup-1-77-ب-238x300.png', 'نمودار برنامه‌ریزی استارتاپ با یادداشت');
check('fa matched 1', r2.count === 1);
check('fa alt replaced', r2.html.includes('alt="نمودار برنامه‌ریزی استارتاپ با یادداشت"'));
check('fa junk gone', !r2.html.includes('alt="تصویر"'));

// 3. percent-encoded src matches decoded key
const encHtml = `<img src="/media/mehrdad-startup-1-77-%D8%A8-238x300.png" alt="تصویر" />`;
const r3 = rewriteHtml(encHtml, 'mehrdad-startup-1-77-ب-238x300.png', 'تست');
check('encoded matched', r3.count === 1 && r3.html.includes('alt="تست"'));

// 4. no-alt tag → single insertion before closing bracket
const r4 = rewriteHtml(noAltTag, 'foo.png', 'x "quoted" <b>');
check('noalt matched', r4.count === 1);
check('noalt single insert', (r4.html.match(/alt=/g) || []).length === 1);
check('noalt escaped', r4.html.includes('alt="x &quot;quoted&quot; &lt;b&gt;"'));
check('noalt self-close kept', r4.html.trimEnd().endsWith('/>'));

// 5. non-matching name untouched
const r5 = rewriteHtml(html, 'other.png', 'zzz');
check('non-match count 0', r5.count === 0 && r5.html === html);

// 6. other-img untouched (different image, junk alt stays for this rewrite call)
const r6 = rewriteHtml(html, 'foo.png', 'bar desc');
check('foo only', r6.count === 1 && r6.html.includes('alt="bar desc"') && r6.html.includes('alt="Image"'));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
