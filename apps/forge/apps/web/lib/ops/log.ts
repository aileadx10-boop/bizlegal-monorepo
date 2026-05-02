/**
 * Remote ops logger — POSTs an event to the hub's /api/ops/log endpoint
 * with HMAC signature. The hub writes to the shared ops_events table on
 * DB1, which the /ops dashboard consumes.
 *
 * Failures are swallowed (telemetry must never break user flows).
 *
 * Required envs:
 *   OPS_LOG_URL (default: https://bizlegal-ai.com/api/ops/log)
 *   BIZLEGAL_INBOUND_SECRET (HMAC-SHA256 over body)
 */

import crypto from "node:crypto"

export type OpsEventType =
  | "payment.intent"
  | "payment.confirmed"
  | "payment.failed"
  | "payment.refunded"
  | "subscription.created"
  | "subscription.renewed"
  | "subscription.cancelled"
  | "lead.inbound"
  | "lead.qualified"
  | "email.sent"
  | "email.failed"
  | "cron.fired"
  | "cron.completed"
  | "sqa.draft"
  | "dpa.negotiation"
  | "psp.audit"
  | "risk.analysis"
  | "risk.assessment"
  | "jurisdiction.compare"
  | "snapshot.generated"
  | "cert.released"
  | "kb.uploaded"
  | "framework.changed"
  | "boi.subscribed"
  | "boi.alert.sent"
  | "download.report"
  | "agent.checkout"
  | "webhook.received"
  | "error"

export type OpsSource = "hub" | "docai" | "lexaudit" | "tracr" | "brai" | "forge" | "leadforge" | "oci" | "worker"

export interface LogEventInput {
  type: OpsEventType
  source: OpsSource
  ref_id?: string
  email?: string
  amount_cents?: number
  status?: "ok" | "pending" | "failed" | "cancelled"
  metadata?: Record<string, unknown>
}

const DEFAULT_URL = "https://bizlegal-ai.com/api/ops/log"

export async function logEvent(input: LogEventInput): Promise<void> {
  try {
    const url = process.env.OPS_LOG_URL ?? DEFAULT_URL
    const secret = process.env.BIZLEGAL_INBOUND_SECRET ?? ""
    if (!secret) return // silently no-op when not configured

    const body = JSON.stringify({
      type: input.type,
      source: input.source,
      ref_id: input.ref_id,
      email: input.email,
      amount_cents: input.amount_cents,
      status: input.status,
      metadata: input.metadata ?? {},
    })

    const sig = crypto.createHmac("sha256", secret).update(body).digest("hex")

    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-bizlegal-signature": sig,
      },
      body,
    })
  } catch (err) {
    console.warn("[ops-log/remote]", err instanceof Error ? err.message : err)
  }
}

export function logEventAsync(input: LogEventInput): void {
  void logEvent(input).catch(() => {})
}
