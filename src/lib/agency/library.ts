/**
 * Agency panel library (Task 54) — SERVER ONLY.
 *
 * Serves the bundled agent library generated from
 * https://github.com/msitarzewski/agency-agents ("The Agency", MIT) by
 * scripts/build-agency-library.mjs into src/data/agency-library.json.
 *
 * The bundle is read via fs at runtime (not imported) so the 4MB JSON never
 * inflates the TypeScript graph or the client bundle; next.config.ts ships
 * the file inside the serverless bundle via outputFileTracingIncludes.
 * Parsed once per process and cached on globalThis (survives HMR).
 */
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

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

interface AgencyBundle {
  generatedAt: string;
  source: string;
  divisions: AgencyDivision[];
  agents: AgencyAgent[];
  runbooks: AgencyRunbook[];
}

const LIB_PATH =
  process.env.AGENCY_LIBRARY_PATH ?? join(process.cwd(), 'src', 'data', 'agency-library.json');

const globalForAgency = globalThis as unknown as {
  __agencyBundle?: AgencyBundle;
  __agencySlim?: AgencyAgentSlim[];
};

function loadBundle(): AgencyBundle {
  if (globalForAgency.__agencyBundle) return globalForAgency.__agencyBundle;
  if (!existsSync(LIB_PATH)) {
    // fail soft with an empty library: the panel renders a clear empty state
    // instead of crashing the route (e.g. a build where the bundle step was
    // skipped). Regenerate with: node scripts/build-agency-library.mjs
    console.error(`[agency] library bundle missing at ${LIB_PATH} — run scripts/build-agency-library.mjs`);
    const empty: AgencyBundle = { generatedAt: '', source: '', divisions: [], agents: [], runbooks: [] };
    globalForAgency.__agencyBundle = empty;
    return empty;
  }
  const parsed = JSON.parse(readFileSync(LIB_PATH, 'utf8')) as AgencyBundle;
  globalForAgency.__agencyBundle = parsed;
  return parsed;
}

/** All agents WITH persona bodies — never send to the client in bulk. */
export function agencyAgents(): AgencyAgent[] {
  return loadBundle().agents;
}

/** Slim roster (no persona bodies) — safe for the roster API response. */
export function agencySlimAgents(): AgencyAgentSlim[] {
  if (!globalForAgency.__agencySlim) {
    globalForAgency.__agencySlim = agencyAgents().map(({ id, division, name, description }) => ({
      id,
      division,
      name,
      description,
    }));
  }
  return globalForAgency.__agencySlim;
}

export function agencyAgentById(id: string): AgencyAgent | null {
  const found = agencyAgents().find((a) => a.id === id);
  return found ?? null;
}

export function agencyDivisions(): AgencyDivision[] {
  return loadBundle().divisions;
}

export function agencyDivisionLabel(id: string): string {
  return loadBundle().divisions.find((d) => d.id === id)?.label ?? id;
}

export function agencyRunbooks(): AgencyRunbook[] {
  return loadBundle().runbooks;
}

export function agencyStats(): AgencyStats {
  const b = loadBundle();
  return {
    agentCount: b.agents.length,
    divisionCount: b.divisions.length,
    runbookCount: b.runbooks.length,
    generatedAt: b.generatedAt,
    source: b.source,
  };
}

/**
 * The full roster payload for GET /api/agency/roster — slim agents,
 * divisions, runbooks and stats in one response.
 */
export function agencyRosterPayload() {
  return {
    stats: agencyStats(),
    divisions: agencyDivisions(),
    agents: agencySlimAgents(),
    runbooks: agencyRunbooks(),
  };
}
