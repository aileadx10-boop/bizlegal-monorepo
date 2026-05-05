// Supabase REST helpers for the lead-nurture state machine.
// We use raw fetch instead of @supabase/supabase-js to keep the
// Worker bundle small (no extra runtime cost on cold start).
//
// Schema: see apps/hub/supabase/migrations/20260505_lead_nurture_state.sql
//
// Hot path: every 5 minutes, the worker calls due() to fetch rows
// where next_send_at <= now() AND payment_status='none' AND
// opted_out=false AND next_step != 'done'. The partial index in the
// migration makes this O(1) on row count.

import type { Env } from "./types";

export type NurtureStep =
  | "welcome"
  | "education"
  | "comparison"
  | "last_call"
  | "done";

export type NurturePaymentStatus =
  | "none"
  | "intent"
  | "paid"
  | "refunded";

export type NurtureVertical =
  | "boi"
  | "brai"
  | "tracr"
  | "lexaudit"
  | "docai"
  | "forge"
  | "leadforge"
  | "realestate"
  | "generic";

export interface NurtureRow {
  readonly id: string;
  readonly lead_id: string;
  readonly email: string;
  readonly vertical: NurtureVertical;
  readonly source: string;
  readonly lead_classification: Record<string, unknown> | null;
  readonly captured_at: string;
  readonly payment_status: NurturePaymentStatus;
  readonly opted_out: boolean;
  readonly archived_at: string | null;
  readonly next_step: NurtureStep;
  readonly next_send_at: string;
  readonly last_sent_at: string | null;
  readonly emails_sent: number;
  readonly bounce_reason: string | null;
}

interface NurtureClientOpts {
  readonly env: Env;
}

// One-line guard — the worker only has Supabase creds when both
// secrets are configured. If absent, nurture is a no-op (better
// than crashing the cron handler).
export function nurtureConfigured(env: Env): boolean {
  return Boolean(env.SUPABASE_URL && env.SUPABASE_SECRET);
}

function baseHeaders(env: Env): Record<string, string> {
  return {
    apikey: env.SUPABASE_SECRET ?? "",
    Authorization: `Bearer ${env.SUPABASE_SECRET ?? ""}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };
}

// Fetch rows due for the next email. Capped to limit so a stale
// queue (e.g. Resend outage caught up later) doesn't blow the
// Worker's 30s CPU budget.
export async function due(opts: NurtureClientOpts, limit = 50): Promise<NurtureRow[]> {
  if (!nurtureConfigured(opts.env)) return [];
  const now = new Date().toISOString();
  const url = new URL(`${opts.env.SUPABASE_URL}/rest/v1/lead_nurture_state`);
  url.searchParams.set("select", "*");
  url.searchParams.set("payment_status", "eq.none");
  url.searchParams.set("opted_out", "eq.false");
  url.searchParams.set("next_step", "neq.done");
  url.searchParams.set("next_send_at", `lte.${now}`);
  url.searchParams.set("order", "next_send_at.asc");
  url.searchParams.set("limit", String(limit));
  const res = await fetch(url, { headers: baseHeaders(opts.env) });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`due() ${res.status}: ${detail.slice(0, 200)}`);
  }
  return (await res.json()) as NurtureRow[];
}

// Advance a row to the next step. Caller decides which step is next
// based on current state (welcome → education → comparison → last_call → done).
export async function advance(
  opts: NurtureClientOpts,
  rowId: string,
  patch: Partial<{
    next_step: NurtureStep;
    next_send_at: string;
    last_sent_at: string;
    emails_sent: number;
  }>,
): Promise<void> {
  if (!nurtureConfigured(opts.env)) return;
  const url = `${opts.env.SUPABASE_URL}/rest/v1/lead_nurture_state?id=eq.${rowId}`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: baseHeaders(opts.env),
    body: JSON.stringify(patch),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`advance(${rowId}) ${res.status}: ${detail.slice(0, 200)}`);
  }
}

// Mark a row terminally done (after last_call sent OR opt-out OR paid).
// Future cron passes skip it cheaply because of the partial index.
export async function archive(
  opts: NurtureClientOpts,
  rowId: string,
  reason: "completed" | "opted_out" | "paid" | "bounced" | "refunded",
  note?: string,
): Promise<void> {
  if (!nurtureConfigured(opts.env)) return;
  const url = `${opts.env.SUPABASE_URL}/rest/v1/lead_nurture_state?id=eq.${rowId}`;
  const patch: Record<string, unknown> = {
    next_step: "done",
    archived_at: new Date().toISOString(),
  };
  if (reason === "opted_out") patch.opted_out = true;
  if (reason === "paid" || reason === "refunded") patch.payment_status = reason;
  if (reason === "bounced" && note) patch.bounce_reason = note.slice(0, 500);
  const res = await fetch(url, {
    method: "PATCH",
    headers: baseHeaders(opts.env),
    body: JSON.stringify(patch),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`archive(${rowId}) ${res.status}: ${detail.slice(0, 200)}`);
  }
}

// Mark payment_status. Called by webhook handlers (in apps/hub) but
// exposed here so the worker can also flip on direct events.
export async function setPaymentStatus(
  opts: NurtureClientOpts,
  leadId: string,
  status: NurturePaymentStatus,
): Promise<void> {
  if (!nurtureConfigured(opts.env)) return;
  const url = `${opts.env.SUPABASE_URL}/rest/v1/lead_nurture_state?lead_id=eq.${encodeURIComponent(leadId)}`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: baseHeaders(opts.env),
    body: JSON.stringify({ payment_status: status }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`setPaymentStatus(${leadId}) ${res.status}: ${detail.slice(0, 200)}`);
  }
}

// Insert a new row. Called by lead-capture endpoints when they
// register a fresh lead. Idempotent on lead_id (unique index): a
// second call returns the existing row's state without resetting.
export async function enqueue(
  opts: NurtureClientOpts,
  args: {
    lead_id: string;
    email: string;
    vertical: NurtureVertical;
    source: string;
    lead_classification?: Record<string, unknown>;
    /** Override default 5-min welcome delay (e.g. immediate for hot leads). */
    welcome_delay_minutes?: number;
  },
): Promise<NurtureRow | null> {
  if (!nurtureConfigured(opts.env)) return null;
  const delay = args.welcome_delay_minutes ?? 5;
  const url = `${opts.env.SUPABASE_URL}/rest/v1/lead_nurture_state`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      ...baseHeaders(opts.env),
      Prefer: "return=representation,resolution=ignore-duplicates",
    },
    body: JSON.stringify({
      lead_id: args.lead_id,
      email: args.email,
      vertical: args.vertical,
      source: args.source,
      lead_classification: args.lead_classification ?? null,
      next_step: "welcome",
      next_send_at: new Date(Date.now() + delay * 60_000).toISOString(),
    }),
  });
  if (!res.ok && res.status !== 409) {
    const detail = await res.text().catch(() => "");
    throw new Error(`enqueue ${res.status}: ${detail.slice(0, 200)}`);
  }
  const rows = (await res.json().catch(() => [])) as NurtureRow[];
  return rows[0] ?? null;
}
