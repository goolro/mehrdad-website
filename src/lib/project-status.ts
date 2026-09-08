/**
 * Project lifecycle + section vocabulary — Work/Lab restructure (2026-09-07,
 * see DECISIONS.md). Canonical statuses are the honest, non-venture set;
 * legacy values that may still sit in existing rows are normalized so old
 * data keeps rendering correctly until the content migration script runs.
 *
 * Content-authenticity rule (BRAND_STRATEGY.md): unfinished projects are
 * labeled unfinished; no "Seeking partners" or funding language may be
 * attached to a project by default.
 */

export const PROJECT_STATUSES = [
  'idea',
  'concept',
  'building',
  'testing',
  'live',
  'paused',
  'archived',
] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const PROJECT_SECTIONS = ['work', 'lab'] as const;
export type ProjectSection = (typeof PROJECT_SECTIONS)[number];

/** legacy status values → canonical (kept until the content migration runs) */
const LEGACY_STATUS: Record<string, ProjectStatus> = {
  'under-construction': 'building',
  seeking: 'idea',
  'coming-soon': 'concept',
};

export function normalizeStatus(raw: string): ProjectStatus {
  const s = (raw || '').toLowerCase().trim();
  if ((PROJECT_STATUSES as readonly string[]).includes(s)) return s as ProjectStatus;
  return LEGACY_STATUS[s] || 'idea';
}

export function isProjectStatus(raw: string): boolean {
  return (PROJECT_STATUSES as readonly string[]).includes((raw || '').toLowerCase().trim());
}

export function normalizeSection(raw: string): ProjectSection {
  return raw === 'lab' ? 'lab' : 'work';
}

/**
 * Statuses shown under the DEFAULT "Work" tab of /work. Ideas and archived
 * items require an explicit tab change (content-authenticity: old venture
 * entries must never lead the Work view).
 */
export function isActiveStatus(s: ProjectStatus): boolean {
  return s !== 'idea' && s !== 'archived';
}

/** statuses that show a build-progress bar (honest build-in-progress states) */
export function showsProgress(s: ProjectStatus): boolean {
  return s === 'building' || s === 'testing';
}

/**
 * Bilingual status labels — single source of truth for server contexts that
 * cannot reach the client i18n module (OG image routes, emails, ...).
 * Kept verbatim in sync with ui.en/.fa.projects in components/site/i18n.ts.
 */
export const STATUS_LABELS: Record<ProjectStatus, { en: string; fa: string }> = {
  idea: { en: 'Idea', fa: 'ایده' },
  concept: { en: 'Concept', fa: 'مفهوم' },
  building: { en: 'Building', fa: 'در حال ساخت' },
  testing: { en: 'Testing', fa: 'در حال تست' },
  live: { en: 'Live', fa: 'فعال' },
  paused: { en: 'Paused', fa: 'متوقف‌شده' },
  archived: { en: 'Archived', fa: 'بایگانی' },
};
