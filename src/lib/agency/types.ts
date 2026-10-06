/**
 * Agency panel type definitions (Task 54) — shared between library.ts and
 * the API/UI layers. Plain interfaces only; no runtime exports here.
 */

export interface AgencyDivision {
  id: string;
  label: string;
  icon: string | null;
  color: string | null;
  count: number;
}

export interface AgencyAgent {
  id: string;
  division: string;
  name: string;
  description: string;
  body: string;
}

export type AgencyAgentSlim = Omit<AgencyAgent, 'body'>;

export interface AgencyRunbookGroup {
  group: string;
  activation: string | null;
  agents: string[];
}

export interface AgencyRunbook {
  slug: string;
  title: string;
  mode: string | null;
  duration: string | null;
  summary: string;
  groups: AgencyRunbookGroup[];
}

export interface AgencyStats {
  agentCount: number;
  divisionCount: number;
  runbookCount: number;
  generatedAt: string;
  source: string;
}
