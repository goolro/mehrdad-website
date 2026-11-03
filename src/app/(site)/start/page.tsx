import type { Metadata } from 'next';
import { StartView } from '@/components/site/StartView';

// Fully static (same pattern as /pricing). Survey fix #2 (2026-11): 5 of
// 14 tested personas found the site cluttered and two asked for "one
// simple page in plain language for non-technical visitors" — this is it.
export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: { absolute: 'Simple Start — no jargon, three steps | Mehrdad — Product Builder' },
  description:
    'Not technical? Start here. Free 15-minute call → one fixed quote → something real delivered. Three plain steps, four honest answers, published prices.',
  alternates: {
    types: { 'application/rss+xml': '/feed.xml' },
    canonical: '/start',
    // hreflang triple (same pattern as /pricing): Persian twin /fa/start
    languages: { en: '/start', fa: '/fa/start', 'x-default': '/start' },
  },
};

export default function StartPage() {
  return <StartView />;
}
