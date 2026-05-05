import type { Env } from "./types";

/**
 * Cloudflare Worker → hub /api/ops/log telemetry.
 *
 * Fire-and-forget HMAC-SHA256-signed POST to the shared ops-events
 * stream so /ops dashboard sees every meaningful Worker action
 * (lead.inbound on /intake, lead.qualified after pipeline scoring,
 * error on DLQ paths).
 *
 * Reuses env.WEBHOOK_SHARED_SECRET — same secret the hub side reads
 * as BIZLEGAL_INBOUND_SECRET. Setting them both to the same hex
 * value is a Phase P deploy step.
 *
 * Failures are swallowed (logged, never thrown) — telemetry must
 * never break the lead pipeline.
 */

export type WorkerOpsEventType =
  | "lead.inbound"
  | "lead.qualified"
  | "snapshot.generated"
  | "cron.completed"
  | "nurture.email.sent"
  | "nurture.opt_out"
  | "error";

export interface OpsEventInput {
  readonly type: WorkerOpsEventType;
  readonly ref_id?: string;
  readonly email?: string;
  readonly amount_cents?: number;
  readonly status?: "ok" | "pending" | "failed" | "cancelled";
  readonly metadata?: Record<string, unknown>;
}

const DEFAULT_OPS_LOG_URL = "https://bizlegal-ai.com/api/ops/log";

async function hmacHex(secret: string, body: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function logEvent(env: Env, input: OpsEventInput): Promise<boolean> {
  if (!env.WEBHOOK_SHARED_SECRET) return false;

  const url = (env as Env & { OPS_LOG_URL?: string }).OPS_LOG_URL || DEFAULT_OPS_LOG_URL;
  const payload: Record<string, unknown> = {
    type: input.type,
    source: "worker",
  };
  if (input.ref_id !== undefined) payload.ref_id = input.ref_id;
  if (input.email !== undefined) payload.email = input.email;
  if (input.amount_cents !== undefined) payload.amount_cents = input.amount_cents;
  if (input.status !== undefined) payload.status = input.status;
  if (input.metadata !== undefined) payload.metadata = input.metadata;

  const body = JSON.stringify(payload);

  let signature: string;
  try {
    signature = await hmacHex(env.WEBHOOK_SHARED_SECRET, body);
  } catch (err) {
    console.warn("[ops-log] hmac sign failed:", err);
    return false;
  }

  // Per-call timeout — ops-log POST must never slow the Worker.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(url, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "content-type": "application/json",
        "x-bizlegal-signature": signature,
        "user-agent": "bizlegal-lead-intake-worker",
      },
      body,
    });
    clearTimeout(timer);
    if (!res.ok) {
      console.warn(`[ops-log] non-2xx ${res.status} for type=${input.type}`);
      return false;
    }
    return true;
  } catch (err) {
    clearTimeout(timer);
    console.warn(`[ops-log] post failed for type=${input.type}:`, err);
    return false;
  }
}
