/**
 * Remote ops logger — POSTs an event to the hub's /api/ops/log endpoint with
 * an HMAC signature. The hub writes to the shared ops_events table, which the
 * /ops dashboard consumes. Copied from apps/sellerradar/lib/ops/log.ts; the
 * only local change is `OpsSource = 'brainx'`.
 *
 * Root hard rule 3: no new event TYPES. Every type below already exists in
 * packages/ops-log/src/index.ts. Adding 'brainx' as a SOURCE is allowed and
 * mirrored in packages/ops-log + apps/hub/app/api/ops/log/route.ts.
 *
 * Failures are swallowed (telemetry must never break user flows).
 *
 * Required envs:
 *   OPS_LOG_URL (default: https://bizlegal-ai.com/api/ops/log)
 *   BIZLEGAL_INBOUND_SECRET (HMAC-SHA256 over body)
 */

import crypto from 'node:crypto'

export type OpsEventType =
  | 'agent.checkout'
  | 'payment.intent'
  | 'payment.confirmed'
  | 'payment.failed'
  | 'payment.refunded'
  | 'subscription.created'
  | 'subscription.renewed'
  | 'subscription.cancelled'
  | 'lead.inbound'
  | 'lead.qualified'
  | 'email.sent'
  | 'email.failed'
  | 'cron.fired'
  | 'cron.completed'
  | 'report.generated'
  | 'webhook.received'
  | 'error'

export type OpsSource = 'brainx'

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
        'user-agent': 'bizlegal-agent/1.0',
      },
      body,
    })
  } catch (err) {
    console.warn('[ops-log/remote]', err instanceof Error ? err.message : err)
  }
}

export function logEventAsync(input: LogEventInput): void {
  void logEvent(input).catch(() => {})
}
