'use client';

import { useApp } from './store';
import { ui } from './i18n';
import { ShareBar } from './ShareBar';
import { WhatIDo } from './WhatIDo';

/**
 * /services — opens directly with the "What I Do" block (no duplicate
 * hero headline; the old DB-driven service card grid is gone — 2026-01).
 * FDE stays reachable via the slim pointer to its dedicated page below.
 */
export function ServicesView() {
  const { lang } = useApp();
  const t = ui[lang];

  return (
    <div className="flex w-full flex-col">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 md:py-14">
        <div className="mb-8 flex justify-end">
          <ShareBar title={t.whatIDo.title} label={t.common.shareService} />
        </div>

        <WhatIDo headingLevel="h1" />
      </div>
    </div>
  );
}
