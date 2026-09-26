'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sparkles, ChevronRight } from 'lucide-react';
import { useApp } from './store';
import { ui } from './i18n';

/**
 * Action CTA shown wherever a project / work item / idea is placed on the
 * site (owner rule, 2026-09-26): every placement must invite the next
 * step — «Want us to build one like this for you?» → /contact.
 *
 * Renders on project detail pages (work + ideas), at the bottom of the
 * /work list (both tabs) and as the copy of the homepage featured-work
 * closing card. The Lab *list* page deliberately does not use it — Lab is
 * framed as non-business curiosity (BRAND_STRATEGY.md); lab items still
 * carry this CTA on their detail pages, which route through ProjectDetail.
 */
export function BuildLikeCta({ className }: { className?: string }) {
  const { lang } = useApp();
  const t = ui[lang];
  const router = useRouter();
  return (
    <div
      className={`rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-600/10 to-fuchsia-600/10 p-5 sm:p-6 ${className ?? ''}`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-lg font-bold leading-snug">
            <Sparkles className="h-5 w-5 shrink-0 text-violet-500" aria-hidden />
            {t.projects.buildLikeTitle}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{t.projects.buildLikeSub}</p>
        </div>
        <Button
          size="lg"
          onClick={() => router.push('/contact')}
          className="w-full shrink-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-700 hover:to-fuchsia-700 sm:w-auto"
        >
          {t.projects.buildLikeBtn}
          <ChevronRight className="ms-2 h-4 w-4 rtl:rotate-180" />
        </Button>
      </div>
    </div>
  );
}
