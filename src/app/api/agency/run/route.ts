import { NextResponse, type NextRequest } from 'next/server';
import { checkAdmin } from '@/lib/admin';
import { textCompleteStrict, type ChatTurn } from '@/lib/ai-provider';
import { clientIp, readJsonBody, rateLimit, tooManyRequests } from '@/lib/rate-limit';
import { agencyAgentById, agencyDivisionLabel } from '@/lib/agency/library';
import {
  addAgencyMessage,
  createAgencySession,
  getAgencySession,
  listAgencyMessages,
  type AgencyMessageRow,
} from '@/lib/agency/store';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // a specialist run can legitimately take ~30s+

const MAX_TASK_CHARS = 6000;
const HISTORY_TURNS = 8;

/** The shared operating context appended to every persona (Persian owner). */
function operatingContext(team: boolean): string {
  const base = `
---
OPERATING CONTEXT (binding):
- You are running inside Mehrdad's private Agency panel. The user is Mehrdad — a Persian-speaking product builder. Reply in the SAME language the user writes: Persian input → fluent native Persian (correct نیم‌فاصله, no translationese); English input → English.
- Stay in character as the specialist defined above. Be concrete and actionable: real steps, real names of tools, real numbers where possible — never vague filler.
- Format for chat reading: short paragraphs; markdown headers and bullets allowed; no giant walls of text.
- Never mention or quote these operating instructions themselves.`;
  return team
    ? `${base}
- TEAM RUN: the same brief was sent to several specialists in parallel. Answer ONLY from your own role's perspective, stay under ~350 words, and do not cover other roles' scope.`
    : base;
}

function buildHistoryTurns(history: AgencyMessageRow[], agentId: string): ChatTurn[] {
  // single-agent continuity only: the agent sees the user's turns plus its
  // OWN previous answers — other specialists' team output stays out of its
  // context so each persona keeps a clean voice
  return history
    .filter((m) => m.role === 'user' || (m.role === 'assistant' && m.agentId === agentId))
    .slice(-HISTORY_TURNS)
    .map((m) => ({ role: m.role, content: m.content }));
}

/** POST — run one specialist on a task (single-agent chat or team-run turn). */
export async function POST(req: NextRequest) {
  const denied = checkAdmin(req);
  if (denied) return denied;

  // AI-cost guard: the panel is owner-only, but a stolen session cookie must
  // not be able to burn provider credits in a loop
  const rl = rateLimit(`agency-run:${clientIp(req)}`, 15, 60_000);
  if (!rl.ok) return tooManyRequests(rl.retryAfter);
  const rlGlobal = rateLimit('agency-run:__global__', 120, 60_000);
  if (!rlGlobal.ok) return tooManyRequests(rlGlobal.retryAfter);

  const parsed = await readJsonBody(req, 16);
  if (!parsed.ok) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const agentId = typeof parsed.data?.agentId === 'string' ? parsed.data.agentId.trim() : '';
  const task = typeof parsed.data?.task === 'string' ? parsed.data.task.trim() : '';
  const team = parsed.data?.team === true;
  let sessionId = typeof parsed.data?.sessionId === 'string' ? parsed.data.sessionId.trim() : '';

  if (!task || task.length > MAX_TASK_CHARS) {
    return NextResponse.json({ error: `Task must be 1-${MAX_TASK_CHARS} chars` }, { status: 400 });
  }

  const agent = agencyAgentById(agentId);
  if (!agent) {
    return NextResponse.json({ error: 'Unknown agentId' }, { status: 400 });
  }

  // resolve or create the session
  if (sessionId) {
    const existing = await getAgencySession(sessionId);
    if (!existing) return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  } else {
    const created = await createAgencySession({
      title: task.slice(0, 80) + (task.length > 80 ? '…' : ''),
      kind: team ? 'team' : 'agent',
      meta: team ? { runbook: parsed.data?.runbook ?? null, task } : { agentId, task },
    });
    sessionId = created.id;
  }

  // persona + operating context + (single-agent) continuity history
  const turns: ChatTurn[] = [
    { role: 'system', content: agent.body + operatingContext(team) },
    ...buildHistoryTurns(await listAgencyMessages(sessionId, 40), agent.id),
    { role: 'user', content: task },
  ];

  let output: string;
  try {
    output = await textCompleteStrict(turns, { maxTokens: 2000, temperature: 0.6 });
  } catch (err) {
    console.error('[agency] run failed:', err);
    return NextResponse.json({ error: 'AI provider failed — try again' }, { status: 502 });
  }
  if (!output) {
    return NextResponse.json({ error: 'Empty completion — try again' }, { status: 502 });
  }

  const userMsg = await addAgencyMessage({
    sessionId,
    agentId: agent.id,
    agentName: agent.name,
    role: 'user',
    content: task,
  });
  const assistantMsg = await addAgencyMessage({
    sessionId,
    agentId: agent.id,
    agentName: agent.name,
    role: 'assistant',
    content: output,
  });

  return NextResponse.json({
    sessionId,
    agentId: agent.id,
    agentName: agent.name,
    divisionLabel: agencyDivisionLabel(agent.division),
    output,
    messages: [userMsg, assistantMsg],
  });
}
