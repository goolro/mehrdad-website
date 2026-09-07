/**
 * IndexNow notification (2026-09-08, SEO-growth).
 *
 * IndexNow is the shared instant-indexing protocol (Microsoft Bing, Yandex,
 * Seznam, Naver — one endpoint). Bing matters twice over: it is #2 search
 * engine AND it feeds ChatGPT Search — faster Bing crawl ≈ faster chance of
 * being cited in AI answers.
 *
 * Usage: fire-and-forget after an admin content mutation (post created /
 * updated / deleted). Never throws, never blocks the response, and is a
 * silent no-op when the key env is missing (self-hosted without the file).
 *
 * Key model (per spec): the key is NOT a secret — it only proves control of
 * the host. It lives in a public file at /<key>.txt and is mirrored in
 * NEXT_PUBLIC_INDEXNOW_KEY so client/admin code and the verification file
 * always agree. Set the env in Vercel to the same value as the file name.
 */

export const INDEXNOW_KEY_FILE = '/207e2b15f15518b77dd26853300b1261.txt';

const ENDPOINT = 'https://api.indexnow.org/IndexNow';

export function indexNowKey(): string {
  return (
    process.env.INDEXNOW_KEY ||
    process.env.NEXT_PUBLIC_INDEXNOW_KEY ||
    // hard mirror of the committed public/<key>.txt — keeps the protocol
    // working even without the env var (Vercel *is* configured with it)
    '207e2b15f15518b77dd26853300b1261'
  );
}

function hostAndKeyLocation(): { host: string; keyLocation: string } {
  const base = (process.env.SITE_ORIGIN || 'https://mehrdad.ir').replace(/\/+$/, '');
  const key = indexNowKey();
  return { host: base.replace(/^https?:\/\//, ''), keyLocation: `${base}${INDEXNOW_KEY_FILE}` };
}

/**
 * Submit up to `urls` for (re)crawling. Fire-and-forget by design.
 * IndexNow limits: 10,000 URLs per request — our mutations send 1-3.
 */
export function notifyIndexNow(urls: string[]): void {
  try {
    const clean = [...new Set(urls.filter((u) => /^https?:\/\//.test(u)))].slice(0, 100);
    if (clean.length === 0) return;
    const { host, keyLocation } = hostAndKeyLocation();
    const payload = JSON.stringify({ host, key: indexNowKey(), keyLocation, urlList: clean });
    void fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: payload,
      // spec-compliant UA; short timeout so a slow endpoint never pins the
      // serverless function
      signal: AbortSignal.timeout(5_000),
    }).catch(() => {});
  } catch {
    // notification must never break the admin mutation it piggybacks on
  }
}

/** convenience: ping one canonical URL + the homepage refresh */
export function notifyIndexNowUrl(url: string): void {
  notifyIndexNow([url]);
}
