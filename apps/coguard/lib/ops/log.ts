import crypto from 'node:crypto'

export type OpsEventType =
  | 'payment.intent'
  | 'payment.confirmed'
  | 'payment.failed'
  | 'payment.refunded'
  | 'subscription.created'
  | 'subscription.cancelled'
  | 'lead.inbound'
  | 'email.sent'
  | 'email.failed'
  | 'coguard.message.received'
  | 'coguard.message.sent'
  | 'coguard.draft.classified'
  | 'coguard.binder.requested'
  | 'coguard.binder.generated'
  | 'coguard.subscriber.provisioned'
  | 'coguard.attorney.access'
  | 'error'

export interface LogEventInput {
  type: OpsEventType
  source: 'coguard'
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
      headers: {
        'Content-Type': 'application/json',
        'x-bizlegal-signature': sig,
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
