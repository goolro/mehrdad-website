/**
 * Route-change feedback store (owner request 2026-09-29: «وقتی من یک صفحه
 * را می‌زنم وب‌سایت هیچ واکنشی نشان نمی‌دهد… باید یک انیمیشن کوچک یه گوشه‌ای
 * نشون بدهیم»).
 *
 * A tiny module-level pub/sub — NOT part of the zustand store — so nav
 * state changes never re-render the page tree, only the RouteIndicator.
 *
 * Triggers wired in RouteIndicator.tsx / SiteChrome.tsx:
 *   - document-level capture clicks on internal <a> (covers next/link)
 *   - the store ⇄ router bridge (registerNavigate → routeNavStart)
 *   - popstate (back/forward)
 *
 * Timing rules that keep it calm:
 *   - appear only after 150ms of REAL pending (prefetched RSC navigations
 *     finish faster and never flash the indicator)
 *   - once shown, stay visible ≥450ms (no 1-frame blink)
 *   - a URL poll while pending catches query-only navigations that
 *     usePathname can't see (?lang=fa links), and an 8s failsafe clears
 *     the state even if a navigation errors out
 */

type Listener = () => void;

const listeners = new Set<Listener>();
let pending = false;
let shownAt = 0;
let showTimer: ReturnType<typeof setTimeout> | null = null;
let hideTimer: ReturnType<typeof setTimeout> | null = null;
let pollTimer: ReturnType<typeof setInterval> | null = null;
let failTimer: ReturnType<typeof setTimeout> | null = null;
let startHref = '';

function notify() {
  listeners.forEach((l) => l());
}

export function subscribeRouteIndicator(l: Listener): () => void {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function isRouteNavPending(): boolean {
  return pending;
}

function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}

export function routeNavStart(): void {
  if (typeof window === 'undefined') return;
  startHref = location.href;
  // a navigation already in flight → just extend its failsafe window
  if (pending || showTimer) {
    if (failTimer) clearTimeout(failTimer);
    failTimer = setTimeout(() => routeNavEnd(), 8000);
    return;
  }
  showTimer = setTimeout(() => {
    showTimer = null;
    pending = true;
    shownAt = Date.now();
    notify();
    // arrival detector: works for search-param-only changes too
    stopPolling();
    pollTimer = setInterval(() => {
      if (location.href !== startHref) routeNavEnd();
    }, 120);
    // hard failsafe: never leave the indicator stuck (e.g. aborted RSC fetch)
    failTimer = setTimeout(() => routeNavEnd(), 8000);
  }, 150);
}

export function routeNavEnd(): void {
  if (showTimer) {
    clearTimeout(showTimer);
    showTimer = null;
  }
  stopPolling();
  if (failTimer) {
    clearTimeout(failTimer);
    failTimer = null;
  }
  if (!pending) return;
  const wait = Math.max(0, 450 - (Date.now() - shownAt));
  if (hideTimer) clearTimeout(hideTimer);
  hideTimer = setTimeout(() => {
    hideTimer = null;
    pending = false;
    notify();
  }, wait);
}
