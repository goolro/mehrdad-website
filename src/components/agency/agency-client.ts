/**
 * Shared client-side types + helpers for the private Agency panel (Task 54).
 * Server data shapes mirror src/lib/agency/library.ts + store.ts.
 */

export interface ClientDivision {
  id: string;
  label: string;
  icon: string | null;
  color: string | null;
  count: number;
}

export interface ClientAgent {
  id: string;
  division: string;
  name: string;
  description: string;
}

export interface ClientRunbook {
  slug: string;
  title: string;
  mode: string | null;
  duration: string | null;
  summary: string;
  groups: { group: string; activation: string | null; agents: string[] }[];
}

export interface ClientStats {
  agentCount: number;
  divisionCount: number;
  runbookCount: number;
  generatedAt: string;
  source: string;
}

export interface RosterPayload {
  stats: ClientStats;
  divisions: ClientDivision[];
  agents: ClientAgent[];
  runbooks: ClientRunbook[];
}

export interface AgencyChatMessage {
  id: string;
  sessionId: string;
  agentId: string | null;
  agentName: string | null;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface SessionSummary {
  id: string;
  title: string;
  kind: 'agent' | 'team';
  meta: string | null;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  lastActivity: string;
  preview: string;
}

export interface SessionDetail {
  session: SessionSummary;
  messages: AgencyChatMessage[];
}

/** Wrapper so every panel fetch reads the same error contract. */
export async function agencyFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, credentials: 'same-origin' });
  if (res.status === 401) {
    throw new Error('UNAUTHORIZED');
  }
  if (!res.ok) {
    let msg = `خطا ${res.status}`;
    try {
      const data = (await res.json()) as { error?: string };
      if (data?.error) msg = data.error;
    } catch {
      /* keep the status-code message */
    }
    throw new Error(msg);
  }
  return (await res.json()) as T;
}

// ── favorites (per-browser, localStorage) ──────────────────────────────────

const FAV_KEY = 'agency-favorites';

export function readFavorites(): string[] {
  try {
    const raw = localStorage.getItem(FAV_KEY);
    const arr = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(arr) ? arr.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export function writeFavorites(ids: string[]): void {
  try {
    localStorage.setItem(FAV_KEY, JSON.stringify(ids));
  } catch {
    /* private-mode browsers — favorites just don't persist */
  }
}

/** Download a string as a .md file (conversation / team-run export). */
export function downloadMarkdown(filename: string, markdown: string): void {
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.replace(/[^\w\u0600-\u06FF.-]+/g, '-').slice(0, 80);
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

const FA_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

/** Compact Persian relative time for session rows. */
export function relativeFa(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const diff = Date.now() - then;
  const min = Math.round(diff / 60000);
  const num = (n: number) => String(n).replace(/\d/g, (d) => FA_DIGITS[Number(d)]);
  if (min < 1) return 'همین حالا';
  if (min < 60) return `${num(min)} دقیقه پیش`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${num(hr)} ساعت پیش`;
  const day = Math.round(hr / 24);
  if (day < 30) return `${num(day)} روز پیش`;
  return new Date(iso).toLocaleDateString('fa-IR');
}
