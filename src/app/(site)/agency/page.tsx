import type { Metadata } from 'next';
import { AgencyPanel } from '@/components/agency/AgencyPanel';

// the agency panel is private — keep it out of search indexes (same policy
// as /admin; robots.ts also disallows the path for well-behaved crawlers)
export const metadata: Metadata = {
  title: { absolute: 'Agency | Mehrdad' },
  robots: { index: false, follow: false, nocache: true },
};

export default function AgencyPage() {
  return (
    <>
      {/* 2026-11-02 (audit §5 D3): the panel is a client component that
          renders null until mounted, so the SSR HTML had ZERO headings —
          screen readers (and crawlers) saw a headingless document. A
          visually-hidden h1 gives the document a proper title without
          touching the panel's full-screen login design. */}
      <h1 className="sr-only">Agency panel — Mehrdad</h1>
      <AgencyPanel />
    </>
  );
}
