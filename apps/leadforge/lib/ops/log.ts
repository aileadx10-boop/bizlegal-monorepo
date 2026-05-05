/**
 * LeadForge → hub /api/ops/log telemetry.
 *
 * Phase AA Day 10. HMAC-SHA256-signed POST to the hub's shared
 * ops-events stream so /ops dashboard sees decision-tree captures
 * (and any future LeadForge events) alongside the rest of the fleet.
 *
 * Failures are swallowed — telemetry must never break user flows.
 *
 * Required envs:
 *   OPS_LOG_URL (default: https://bizlegal-ai.com/api/ops/log)
 *   BIZLEGAL_INBOUND_SECRET (HMAC-SHA256 over body)
 */

import crypto from 'node:crypto'

export type OpsEventType =
  | 'lead.inbound'
  | 'lead.qualified'
  | 'email.sent'
  | 'email.failed'
  | 'cron.fired'
  | 'cron.completed'
  | 'webhook.received'
  | 'error'

export interface LogEventInput {
  type: OpsEventType
  source: 'leadforge'
  ref_id?: string
  email?: string
  amount_cents?: number
  status?: 'ok' | 'pending' | 'failed' | 'cancelled'
  metadata?: Record<string, unknown>
}

const OPS_LOG_URL = process.env.OPS_LOG_URL ?? 'https://bizlegal-ai.com/api/ops/log'

export async function logEvent(input: LogEventInput): Promise<void> {
  const secret = process.env.BIZLEGAL_INBOUND_SECRET
  if (!secret) return
  const body = JSON.stringify({
    type: input.type,
    source: input.source,
    ref_id: input.ref_id,
    email: input.email,
    amount_cents: input.amount_cents,
    status: input.status,
    metadata: input.metadata,
  })
  const signature = crypto.createHmac('sha256', secret).update(body).digest('hex')
  try {
    const ctl = new AbortController()
    const timer = setTimeout(() => ctl.abort(), 5000)
    const res = await fetch(OPS_LOG_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-bizlegal-signature': signature,
      },
      body,
      signal: ctl.signal,
    })
    clearTimeout(timer)
    if (!res.ok) {
      console.warn(`[leadforge/ops] non-2xx ${res.status} for ${input.type}`)
    }
  } catch (err) {
    console.warn(`[leadforge/ops] post failed for ${input.type}:`, err)
  }
}

/** Fire-and-forget alias for callers that don't want to await. */
export function logEventAsync(input: LogEventInput): void {
  void logEvent(input)
}
