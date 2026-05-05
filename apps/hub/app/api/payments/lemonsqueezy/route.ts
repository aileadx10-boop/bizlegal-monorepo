import { NextRequest, NextResponse } from 'next/server'
import crypto from 'node:crypto'
import { supabaseAdmin } from '@/lib/supabase'
import { markNurturePaid } from '@/lib/nurture-state'

/**
 * LemonSqueezy webhook handler. Verifies HMAC-SHA256 signature, parses
 * the event, and persists subscription state to Supabase. Designed to
 * be Paddle-portable — switching MoR providers is a one-file change.
 *
 * Environment:
 *   LEMONSQUEEZY_WEBHOOK_SECRET  — set in LemonSqueezy dashboard +
 *                                  Vercel env. Used to HMAC-sign every
 *                                  payload LemonSqueezy POSTs here.
 *   SUPABASE_SERVICE_ROLE_KEY    — for writes to the subscriptions
 *                                  table.
 *
 * Required Supabase table (Moses creates once via migration):
 *
 *   create table public.subscriptions (
 *     id              text primary key,    -- LemonSqueezy subscription id
 *     user_email      text not null,
 *     status          text not null,       -- active | cancelled | expired | past_due | on_trial
 *     plan            text not null,       -- 'pro' | 'scale' | etc.
 *     order_id        text,
 *     customer_id     text,
 *     renews_at       timestamptz,
 *     ends_at         timestamptz,
 *     trial_ends_at   timestamptz,
 *     raw_event       jsonb,
 *     updated_at      timestamptz default now()
 *   );
 *   create index on public.subscriptions (user_email);
 *
 * Audit-log only — no plan-gated features yet rely on this table; the
 * point at this stage is to satisfy LemonSqueezy's MoR review (they
 * test that webhooks reach a verifiable endpoint).
 */

interface LSEvent {
  meta?: { event_name?: string; custom_data?: Record<string, unknown> }
  data?: {
    id?: string
    type?: string
    attributes?: Record<string, unknown>
  }
}

function timingSafeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8')
  const bufB = Buffer.from(b, 'utf8')
  if (bufA.length !== bufB.length) return false
  return crypto.timingSafeEqual(bufA, bufB)
}

function verifySignature(payload: string, signatureHeader: string | null, secret: string): boolean {
  if (!signatureHeader) return false
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex')
  return timingSafeEqual(expected, signatureHeader)
}

function planFromVariantName(variantName: unknown): string {
  if (typeof variantName !== 'string') return 'unknown'
  const lower = variantName.toLowerCase()
  if (lower.includes('pro')) return 'pro'
  if (lower.includes('scale') || lower.includes('enterprise')) return 'scale'
  if (lower.includes('scout')) return 'scout'
  if (lower.includes('operator')) return 'operator'
  return lower.split(/\s+/)[0] || 'unknown'
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 })
  }

  const rawBody = await req.text()
  const signature = req.headers.get('x-signature')
  if (!verifySignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let event: LSEvent
  try {
    event = JSON.parse(rawBody) as LSEvent
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const eventName = event.meta?.event_name
  const dataAttrs = event.data?.attributes ?? {}
  const subscriptionId = String(event.data?.id ?? '')
  const userEmail = String(dataAttrs.user_email ?? '').toLowerCase()
  const status = String(dataAttrs.status ?? 'unknown')
  const plan = planFromVariantName(dataAttrs.variant_name)
  const orderId = dataAttrs.order_id != null ? String(dataAttrs.order_id) : null
  const customerId = dataAttrs.customer_id != null ? String(dataAttrs.customer_id) : null
  const renewsAt = dataAttrs.renews_at ? String(dataAttrs.renews_at) : null
  const endsAt = dataAttrs.ends_at ? String(dataAttrs.ends_at) : null
  const trialEndsAt = dataAttrs.trial_ends_at ? String(dataAttrs.trial_ends_at) : null

  // Only process subscription/order events. Refunds and other events
  // are acknowledged with 200 but not persisted (MoR review only
  // requires the endpoint accept signed payloads).
  const isSubEvent =
    typeof eventName === 'string' &&
    (eventName.startsWith('subscription_') || eventName === 'order_created')

  if (!isSubEvent || !subscriptionId || !userEmail) {
    return NextResponse.json({ ok: true, ignored: true, event: eventName ?? null })
  }

  try {
    const { error } = await supabaseAdmin.from('subscriptions').upsert(
      {
        id: subscriptionId,
        user_email: userEmail,
        status,
        plan,
        order_id: orderId,
        customer_id: customerId,
        renews_at: renewsAt,
        ends_at: endsAt,
        trial_ends_at: trialEndsAt,
        raw_event: event,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    )
    if (error) {
      // We still 200 to LemonSqueezy so they don't retry storms; the
      // failure is logged for ops review. (If the table doesn't exist
      // yet, Moses runs the migration above before going live.)
      console.error('LemonSqueezy webhook DB write failed', { event: eventName, error: error.message })
    }
  } catch (err) {
    console.error('LemonSqueezy webhook handler exception', err)
  }

  // Phase AA D7 INTEGRATION-V3 B-3 fix: stop the nurture sequence on
  // active subscription / completed order. Mirrors the NowPayments +
  // PayPal webhooks. Fire-and-forget; failure is logged but cannot
  // break the LS webhook ack (LS retries hard on non-2xx).
  if (status === 'active' || eventName === 'order_created') {
    void markNurturePaid(userEmail).catch((err) => {
      console.warn('[lemonsqueezy] markNurturePaid failed:', err)
    })
  }

  return NextResponse.json({ ok: true, event: eventName, subscription_id: subscriptionId })
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    {
      ok: true,
      message: 'LemonSqueezy webhook endpoint. POST only.',
      configured: Boolean(process.env.LEMONSQUEEZY_WEBHOOK_SECRET),
    },
    { status: 200 }
  )
}
