#!/usr/bin/env node
/**
 * Build the Agency library bundle for the private /agency panel (Task 54).
 *
 * Source: https://github.com/msitarzewski/agency-agents ("The Agency") — a
 * library of 282 specialized AI-agent personas across ~19 divisions.
 *
 * The panel runs on Vercel, so the library must live INSIDE this repo:
 * this script reads a local clone of the source repo, parses every agent's
 * frontmatter (name/description) + persona body, resolves the team runbooks,
 * and emits ONE static JSON bundle (src/data/agency-library.json) that the
 * server-only library module imports. Commit the generated file.
 *
 * Usage:
 *   node scripts/build-agency-library.mjs [sourceDir]
 *   (default sourceDir: ../agency-agents relative to this repo root, or
 *    $AGENCY_AGENTS_DIR)
 */
import { readFileSync, readdirSync, existsSync, statSync, writeFileSync, mkdirSync } from 'fs';
import { join, resolve, basename, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');
const srcDir = resolve(
  process.argv[2] || process.env.AGENCY_AGENTS_DIR || join(repoRoot, '..', 'agency-agents')
);
const outDir = join(repoRoot, 'src', 'data');
const outFile = join(outDir, 'agency-library.json');

if (!existsSync(srcDir)) {
  console.error(`[agency] source repo not found at ${srcDir}`);
  console.error(`[agency] clone it first: git clone https://github.com/msitarzewski/agency-agents`);
  process.exit(1);
}

// ── divisions (label/icon/color are the repo's own metadata) ────────────────
const divisionsPath = join(srcDir, 'divisions.json');
const divisionsRaw = JSON.parse(readFileSync(divisionsPath, 'utf8'));
const divisionsMeta = divisionsRaw.divisions || divisionsRaw; // {"divisions":{...}} wrapper
// union: metadata keys + directories on disk (future-proof for upstream adds);
// helper/dot/doc dirs are excluded, and empty dirs drop out naturally.
const SKIP_DIRS = new Set(['examples', 'integrations', 'scripts', 'strategy', 'node_modules']);
const divisionDirs = [
  ...new Set([
    ...Object.keys(divisionsMeta).filter((k) => !k.startsWith('_')),
    ...readdirSync(srcDir).filter(
      (d) =>
        !d.startsWith('.') &&
        !SKIP_DIRS.has(d) &&
        statSync(join(srcDir, d)).isDirectory() &&
        readdirSync(join(srcDir, d)).some((f) => f.endsWith('.md'))
    ),
  ]),
];

// ── frontmatter parsing ────────────────────────────────────────────────────
// The repo mixes styles: some agents use name: 'X' (quoted), others use
// unquoted plain scalars (academic/*) — handle both.
function unquote(v) {
  const t = v.trim();
  if ((t.startsWith("'") && t.endsWith("'")) || (t.startsWith('"') && t.endsWith('"'))) {
    return t.slice(1, -1).replace(/\\(['"])/g, '$1').trim();
  }
  return t;
}
function parseAgentMarkdown(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { name: null, description: null, body: raw.trim() };
  const [, fmBlock, body] = m;
  let name = null;
  let description = null;
  for (const line of fmBlock.split(/\r?\n/)) {
    const fm = line.match(/^(name|description):(.*)$/);
    if (!fm) continue;
    const value = unquote(fm[2]);
    if (fm[1] === 'name') name = value;
    else description = value;
  }
  return { name, description, body: body.trim() };
}

function titleCase(stem) {
  return stem
    .split('-')
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');
}

// ── agents ──────────────────────────────────────────────────────────────────
const agents = [];
const divisions = [];
for (const dir of divisionDirs) {
  const dirPath = join(srcDir, dir);
  if (!existsSync(dirPath) || !statSync(dirPath).isDirectory()) continue;
  const meta = divisionsMeta[dir] || {};
  let count = 0;
  for (const f of readdirSync(dirPath)) {
    if (!f.endsWith('.md')) continue;
    const raw = readFileSync(join(dirPath, f), 'utf8');
    const { name, description, body } = parseAgentMarkdown(raw);
    const stem = basename(f, '.md');
    // canonical id mirrors the converter's rule: a stem that already starts
    // with `${dir}-` keeps its name (engineering/engineering-frontend-developer.md
    // → "engineering-frontend-developer"); otherwise the division is prefixed.
    const id = stem.startsWith(`${dir}-`) ? stem : `${dir}-${stem}`;
    agents.push({
      id,
      division: dir,
      name: name || titleCase(stem),
      description: description || '',
      body,
    });
    count++;
  }
  divisions.push({
    id: dir,
    label: meta.label || titleCase(dir),
    icon: meta.icon || null,
    color: meta.color || null,
    count,
  });
}
agents.sort((a, b) => a.division.localeCompare(b.division) || a.name.localeCompare(b.name));

// ── team runbooks (resolve roster ids against the parsed agents) ────────────
let runbooks = [];
const runbooksPath = join(srcDir, 'strategy', 'runbooks.json');
if (existsSync(runbooksPath)) {
  const parsed = JSON.parse(readFileSync(runbooksPath, 'utf8'));
  // Roster ids use the converter's naming ("engineering-frontend-developer",
  // "agents-orchestrator", "design-ux-architect") which does not always equal
  // our canonical `${dir}-${stem}` id. Resolve each roster id against:
  //   1. exact canonical id   2. exact bare file stem   3. unique canonical prefix
  const byId = new Map(agents.map((a) => [a.id, a]));
  const byStem = new Map();
  for (const a of agents) byStem.set(a.id.slice(a.division.length + 1), a);
  const unresolved = [];
  const resolveRosterId = (id) => {
    if (byId.has(id)) return byId.get(id);
    if (byStem.has(id)) return byStem.get(id);
    const prefixed = agents.filter((a) => a.id.startsWith(id));
    if (prefixed.length === 1) return prefixed[0];
    unresolved.push(id);
    return null;
  };
  runbooks = (parsed.runbooks || []).map((rb) => ({
    slug: rb.slug,
    title: rb.title,
    mode: rb.mode || null,
    duration: rb.duration || null,
    summary: rb.summary || '',
    groups: (rb.roster || []).map((g) => ({
      group: g.group,
      activation: g.activation || null,
      agents: (g.agents || []).map(resolveRosterId).filter(Boolean).map((a) => a.id),
    })),
  }));
  if (unresolved.length) {
    console.warn(`[agency] WARNING — ${unresolved.length} runbook agent ids unresolved:`, unresolved);
  }
}

// ── source commit (traceability) ────────────────────────────────────────────
let sourceRef = 'msitarzewski/agency-agents';
const gitHead = join(srcDir, '.git', 'HEAD');
if (existsSync(gitHead)) {
  try {
    const head = readFileSync(gitHead, 'utf8').trim();
    const ref = head.startsWith('ref: ') ? head.slice(5) : null;
    if (ref && existsSync(join(srcDir, '.git', ref))) {
      sourceRef += '@' + readFileSync(join(srcDir, '.git', ref), 'utf8').trim().slice(0, 12);
    }
  } catch {
    /* best-effort only */
  }
}

const bundle = {
  generatedAt: new Date().toISOString(),
  source: sourceRef,
  divisions,
  agents,
  runbooks,
};

mkdirSync(outDir, { recursive: true });
writeFileSync(outFile, JSON.stringify(bundle));
const kb = Math.round(statSync(outFile).size / 1024);
console.log(
  `[agency] built ${outFile} — ${agents.length} agents, ${divisions.length} divisions, ${runbooks.length} runbooks (${kb} KB)`
);
