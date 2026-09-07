/**
 * Local HMAC wrapper for the hub ops tape, matching apps/coguard/lib/ops/log.ts.
 *
 * Local rather than the workspace package for the same reason CoGuard is: the
 * package pulls in supabase-js, and this must stay a bare fetch so it runs
 * anywhere. `'deal44'` is registered in BOTH `packages/ops-log/src/index.ts` and
 * `ALLOWED_SOURCES` in `apps/hub/app/api/ops/log/route.ts` — the hub rejects an
 * unknown source with a 400.
 *
 * NO NEW EVENT TYPES (root CLAUDE.md hard rule 3). The room maps onto existing
 * ones and puts the specifics in `metadata.step`, the same way LeaseParse does
 * for its checklist toggles.
 */

import crypto from 'node:crypto'

export type OpsEventType =
  | 'lead.inbound'
  | 'agent.checkout'
  | 'payment.intent'
  | 'payment.confirmed'
  | 'email.sent'
  | 'email.failed'
  | 'cron.fired'
  | 'cron.completed'
  | 'report.generated'
  | 'error'

export interface LogEventInput {
  type: OpsEventType
  source: 'deal44'
  ref_id?: string
  email?: string
  amount_cents?: number
  status?: 'ok' | 'pending' | 'failed' | 'cancelled'
  metadata?: Record<string, unknown>
}

const DEFAULT_URL = 'https://bizlegal-ai.com/api/ops/log'

async function logEvent(input: LogEventInput): Promise<void> {
  try {
    const url = process.env.OPS_LOG_URL ?? DEFAULT_URL
    const secret = process.env.BIZLEGAL_INBOUND_SECRET ?? ''
    if (!secret) return

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
      headers: { 'Content-Type': 'application/json', 'x-bizlegal-signature': sig },
      body,
    })
  } catch (err) {
    console.warn('[ops-log/deal44]', err instanceof Error ? err.message : err)
  }
}

export function logEventAsync(input: LogEventInput): void {
  void logEvent(input).catch(() => {})
}
