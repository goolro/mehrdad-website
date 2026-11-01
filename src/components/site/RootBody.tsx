import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/react";
import { PwaClient } from "@/components/site/PwaClient";
import { SiteChrome } from "@/components/site/SiteChrome";
import PostHogProvider from "@/components/site/PostHogProvider";
import { bootScript } from "@/app/site-shared";

/**
 * Shared <body> payload for the (site) and (fa) group root layouts.
 *
 * Extracted from the former single app/layout.tsx (2026-11-01 route-group
 * split): both root layouts render the same body chrome, so it lives here
 * once. Server component — the client components below are imported the
 * same way the old root layout imported them.
 */
export function RootBody({ children }: { children: React.ReactNode }) {
  return (
    <body className="antialiased bg-background text-foreground">
      <script
        id="theme-boot"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: bootScript }}
      />
      <PostHogProvider>
        <SiteChrome>{children}</SiteChrome>
      </PostHogProvider>
      <Toaster />
      <PwaClient />
      <Analytics />
    </body>
  );
}
