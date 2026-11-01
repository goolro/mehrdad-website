import Link from 'next/link';
import { Button } from '@/components/ui/button';

/**
 * Shared 404 content (2026-11-01 route-group split).
 *
 * Rendered by TWO hosts:
 *  - (site)/not-found.tsx — notFound() calls from pages inside the (site)
 *    group (e.g. an unknown /blog/<slug>);
 *  - app/global-not-found.tsx — URLs that match NO route at all (the
 *    multiple-root-layouts split removed the shared root layout, so the
 *    old top-level app/not-found.tsx lost its <html> host; the
 *    global-not-found convention took over that job).
 *
 * EN-purity rule (owner 2026-10-01): this static page has no language
 * context — the Persian sentence that used to render here unconditionally
 * was removed so the EN environment carries no Persian text.
 */
export function NotFoundContent() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <div className="text-6xl">☼</div>
      <h1 className="mt-6 text-3xl font-extrabold sm:text-4xl">Page not found</h1>
      <p className="mt-3 text-muted-foreground">
        The page you are looking for does not exist — the link may be outdated.
      </p>
      <Button asChild className="mt-8 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-700 hover:to-fuchsia-700">
        <Link href="/">Back to home</Link>
      </Button>
    </div>
  );
}
