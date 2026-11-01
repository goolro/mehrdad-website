import { NotFoundContent } from '@/components/site/NotFoundContent';

/**
 * not-found boundary of the (site) group — fires when a page inside the
 * group calls notFound() (e.g. an unknown /blog/<slug>).
 *
 * For URLs that match NO route at all, the global-not-found convention
 * handles the response (app/global-not-found.tsx) — see that file for the
 * 2026-11-01 route-group-split rationale.
 */
export default function NotFound() {
  return <NotFoundContent />;
}
