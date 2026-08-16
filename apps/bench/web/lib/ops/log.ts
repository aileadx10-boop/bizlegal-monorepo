/**
 * Remote ops logger — POSTs an event to the hub's /api/ops/log endpoint
 * with HMAC signature. The hub writes to the shared ops_events table,
 * which the /ops dashboard consumes. Copied from apps/propsignal/web/lib/ops/log.ts
 * (local wrapper pattern — keeps the scaffold light on workspace deps).
 *
 * Failures are swallowed (telemetry must never break user flows).
 * Event types are a subset of the fleet union — NO new types (hard rule 3);
 * `legal.cite_audit` already exists for exactly this product's work.
 *
 * Required envs:
 *   OPS_LOG_URL (default: https://bizlegal-ai.com/api/ops/log)
 *   BIZLEGAL_INBOUND_SECRET (HMAC-SHA256 over body)
 */

import crypto from 'node:crypto'

export type OpsEventType =
  | 'payment.intent'
  | 'payment.confirmed'
  | 'payment.failed'
  | 'lead.inbound'
  | 'lead.qualified'
  | 'email.sent'
  | 'email.failed'
  | 'legal.cite_audit'
  | 'report.generated'
  | 'download.report'
  | 'agent.checkout'
  | 'webhook.received'
  | 'error'

export type OpsSource = 'bench'

export interface LogEventInput {
  type: OpsEventType
  source: OpsSource
  ref_id?: string
  email?: string
  amount_cents?: number
  status?: 'ok' | 'pending' | 'failed' | 'cancelled'
  metadata?: Record<string, unknown>
}

const DEFAULT_URL = 'https://bizlegal-ai.com/api/ops/log'

export async function logEvent(input: LogEventInput): Promise<void> {
  try {
    const url = process.env.OPS_LOG_URL ?? DEFAULT_URL
    const secret = process.env.BIZLEGAL_INBOUND_SECRET ?? ''
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

    const sig = crypto.createHmac('sha256', secret).update(body).digest('hex')

    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-bizlegal-signature': sig,
      },
      body,
    })
  } catch (err) {
    console.warn('[ops-log/bench]', err instanceof Error ? err.message : err)
  }
}

export function logEventAsync(input: LogEventInput): void {
  void logEvent(input).catch(() => {})
}
