/**
 * Webhook idempotency helper.
 *
 * Closes CODE-REVIEW-W5 H-01 + SECURITY-REVIEW-W5 S-C1 + SILENT-FAIL-W5 SF-C2.
 *
 * Every payment gateway re-delivers events on a 25-hour exponential
 * backoff if it doesn't see a 200 fast enough, and out-of-order delivery
 * is documented for at least PayPal and LemonSqueezy. Without dedup,
 * replayed events can:
 *   - Revive cancelled subscriptions (ACTIVATED arriving after CANCELLED)
 *   - Double-credit a payment.confirmed → double-fire nurture mark-paid
 *   - Confuse the /ops feed with N copies of the same event
 *
 * The pattern is:
 *
 *   const claim = await claimWebhookEvent({ gateway: 'paypal', event_id })
 *   if (claim === 'duplicate') {
 *     // Return 200 fast so the gateway stops retrying.
 *     return NextResponse.json({ ok: true, deduped: true })
 *   }
 *   if (claim === 'error') {
 *     // Storage failed; return 500 so the gateway retries.
 *     return NextResponse.json({ error: 'idempotency_storage_failed' }, { status: 500 })
 *   }
 *   // claim === 'claimed' — proceed to process the event exactly once.
 *
 * The table (processed_webhook_events) is created by
 * apps/hub/supabase/migrations/20260511_processed_webhook_events.sql
 * and gated by RLS to service-role only.
 *
 * Design notes:
 *   - INSERT-then-check pattern (not "SELECT first, INSERT later")
 *     because two webhooks racing on the same event_id would both pass
 *     the SELECT and both INSERT. The unique constraint is the only
 *     correct serialization point.
 *   - We do NOT fall through to "process anyway" when storage errors —
 *     better to 500 + retry than risk double-processing. The gateway
 *     retry budget covers transient Supabase outages.
 *   - `gateway` discriminator means a PayPal event_id and a Paddle
 *     event_id with the same string value will not collide.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export type WebhookGateway = 'paypal' | 'lemonsqueezy' | 'nowpayments' | 'paddle' | 'docai_nowpayments'

export type ClaimResult = 'claimed' | 'duplicate' | 'error'

let _client: SupabaseClient | null = null

function getServiceClient(): SupabaseClient | null {
  if (_client) return _client
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY
  if (!url || !key) return null
  _client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return _client
}

export interface ClaimWebhookEventInput {
  /** Gateway discriminator — must match one of the WebhookGateway values. */
  readonly gateway: WebhookGateway
  /** The gateway-issued unique event ID. PayPal: `event.id`. LemonSqueezy:
   *  the `X-Event-Name` + `event_id` from the body. NOWPayments: `payment_id`.
   *  Paddle: `event_id`. */
  readonly eventId: string
  /** Optional gateway event-type label for forensic queries. */
  readonly eventType?: string
  /** Optional gateway-stated send timestamp (ISO 8601) for out-of-order detection. */
  readonly eventReceivedAt?: string | null
}

/**
 * Attempt to claim a webhook event for processing. Returns:
 *   - 'claimed'   → first time we see this (gateway, event_id); proceed
 *   - 'duplicate' → already processed; the caller should 200 fast
 *   - 'error'     → storage layer failed; the caller should 500 so the
 *                   gateway retries with backoff
 */
export async function claimWebhookEvent(
  input: ClaimWebhookEventInput,
): Promise<ClaimResult> {
  const client = getServiceClient()
  if (!client) {
    // Hard fail: without a working storage layer we cannot guarantee
    // idempotency. 500 is correct; gateway will retry.
    // eslint-disable-next-line no-console
    console.error('[webhook-idempotency] Supabase service client unavailable')
    return 'error'
  }
  if (!input.eventId) {
    // Defensive — caller should always pass an event_id. If they don't,
    // we can't dedup, so treat as new and let the caller proceed.
    // eslint-disable-next-line no-console
    console.warn('[webhook-idempotency] empty eventId; processing as new')
    return 'claimed'
  }
  const { error } = await client.from('processed_webhook_events').insert({
    gateway: input.gateway,
    event_id: input.eventId,
    event_type: input.eventType ?? null,
    event_received_at: input.eventReceivedAt ?? null,
  })
  if (!error) return 'claimed'
  // PostgREST returns 23505 (Postgres unique_violation SQLSTATE) when
  // the primary key already has a row. supabase-js exposes the code
  // string at error.code.
  if (error.code === '23505') {
    return 'duplicate'
  }

  // Graceful degradation: if the migration hasn't been applied yet,
  // Postgres returns 42P01 (undefined_table). We don't want LIVE
  // webhooks to start 500ing the moment this code deploys but before
  // Moses runs the migration. Fall through with a warn so the webhook
  // processes normally (no dedup until table exists). PostgREST also
  // surfaces this as PGRST205 ("Could not find the table").
  if (error.code === '42P01' || error.code === 'PGRST205') {
    // eslint-disable-next-line no-console
    console.warn(
      '[webhook-idempotency] processed_webhook_events table missing — falling through. ' +
        'Apply apps/hub/supabase/migrations/20260511_processed_webhook_events.sql to enable dedup.',
    )
    return 'claimed'
  }

  // eslint-disable-next-line no-console
  console.error(
    `[webhook-idempotency] claim insert failed gateway=${input.gateway} event_id=${input.eventId} code=${error.code}`,
    error.message,
  )
  return 'error'
}
