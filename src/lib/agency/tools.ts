/**
 * Agency tool catalog (Task 56) — the owner handed over a list of 19
 * tools/repos to evaluate for his four goals (startup planning,
 * fundraising, content production, social media). The ones worth
 * installing are actually installed in the sandbox; this module is the
 * typed, build-time-bundled catalog the panel renders.
 *
 * Data is statically imported (NOT runtime fs reads) — same tracing
 * lesson as agency-library.json: dynamic fs reads explode Vercel's
 * output-file tracing, static imports are bundled safely.
 */
import raw from '@/data/tools-catalog.json';

export type ToolKind = 'skills' | 'cli' | 'reference';

export type ToolGoal = 'startup' | 'funding' | 'content' | 'social' | 'dev';

export interface AgencyTool {
  id: string;
  name: string;
  source: string;
  kind: ToolKind;
  goals: ToolGoal[];
  count?: number;
  version?: string;
  license: string | null;
  faDescription: string;
  location: string;
  usage: string[];
  highlights: string[];
}

export interface RejectedTool {
  id: string;
  name: string;
  faReason: string;
}

export interface ToolsCatalog {
  generatedAt: string;
  installed: AgencyTool[];
  rejected: RejectedTool[];
}

export const TOOLS_CATALOG: ToolsCatalog = raw as ToolsCatalog;

export function agencyInstalledTools(): AgencyTool[] {
  return TOOLS_CATALOG.installed;
}

export function agencyRejectedTools(): RejectedTool[] {
  return TOOLS_CATALOG.rejected;
}
