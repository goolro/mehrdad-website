import type { Metadata } from 'next';
import { AgencyPanel } from '@/components/agency/AgencyPanel';

// the agency panel is private — keep it out of search indexes (same policy
// as /admin; robots.ts also disallows the path for well-behaved crawlers)
export const metadata: Metadata = {
  title: { absolute: 'Agency | Mehrdad' },
  robots: { index: false, follow: false, nocache: true },
};

export default function AgencyPage() {
  return <AgencyPanel />;
}
