import type { Metadata } from 'next';
import { ScopeBuilderView } from '@/components/site/ScopeBuilderView';

// Static shell — the tool is a pure client island; nothing is sent to any
// server, so force-static keeps the build-time CSP meta path unchanged.
export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: { absolute: 'Free MVP Scope Builder — your one-page scope in 3 minutes | Mehrdad' },
  description:
    'Answer five honest scoping questions and get a one-page MVP scope you can act on — free, no signup, nothing sent to a server. The same first step of the AI MVP Sprint.',
  alternates: {
    canonical: '/scope-builder',
    languages: { en: '/scope-builder', 'x-default': '/scope-builder' },
  },
  openGraph: {
    title: 'Free MVP Scope Builder — one-page scope in 3 minutes',
    description:
      'Who hurts, what is the problem, what do they do today, what would working mean — answer, download your scope, take it to a free scope call.',
    url: '/scope-builder',
  },
};

export default function ScopeBuilderPage() {
  return <ScopeBuilderView />;
}
