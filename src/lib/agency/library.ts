/**
 * Agency panel library (Task 54) — SERVER ONLY.
 *
 * Serves the bundled agent library generated from
 * https://github.com/msitarzewski/agency-agents ("The Agency", MIT) by
 * scripts/build-agency-library.mjs into src/data/agency-library.json.
 *
 * The bundle is REQUIRED (not fs-read) so the bundler inlines the JSON into
 * the server chunk at build time. A dynamic fs read (readFileSync on a
 * variable path) made the output-file tracer fall back to tracing the WHOLE
 * project ("Dynamic filesystem access causes tracing of the whole project")
 * which blew up the Vercel build; a static `import` of a 4MB JSON would also
 * force TypeScript to infer its full literal type. `require` + cast gives
 * bundling without fs and without tsc type inference. Parsed once per
 * process at module scope (no per-request work).
 */
import type {
  AgencyDivision,
  AgencyAgent,
  AgencyAgentSlim,
  AgencyRunbook,
  AgencyRunbookGroup,
  AgencyStats,
} from './types';

interface AgencyBundle {
  generatedAt: string;
  source: string;
  divisions: AgencyDivision[];
  agents: AgencyAgent[];
  runbooks: AgencyRunbook[];
}

// eslint-disable-next-line @typescript-eslint/no-require-imports
const REQUIRED_BUNDLE = require('../../data/agency-library.json') as AgencyBundle;

const globalForAgency = globalThis as unknown as {
  __agencyBundle?: AgencyBundle;
  __agencySlim?: AgencyAgentSlim[];
};

function loadBundle(): AgencyBundle {
  if (globalForAgency.__agencyBundle) return globalForAgency.__agencyBundle;
  if (!REQUIRED_BUNDLE || !Array.isArray(REQUIRED_BUNDLE.agents)) {
    // fail soft with an empty library: the panel renders a clear empty state
    // instead of crashing the route (e.g. a build where the bundle step was
    // skipped). Regenerate with: node scripts/build-agency-library.mjs
    console.error('[agency] library bundle missing/invalid — run scripts/build-agency-library.mjs');
    const empty: AgencyBundle = { generatedAt: '', source: '', divisions: [], agents: [], runbooks: [] };
    globalForAgency.__agencyBundle = empty;
    return empty;
  }
  globalForAgency.__agencyBundle = REQUIRED_BUNDLE;
  return REQUIRED_BUNDLE;
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

export type { AgencyDivision, AgencyAgent, AgencyAgentSlim, AgencyRunbook, AgencyRunbookGroup, AgencyStats };
