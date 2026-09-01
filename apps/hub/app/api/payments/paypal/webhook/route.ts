import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logEventAsync } from '@/lib/ops/log'
import { markNurturePaid } from '@/lib/nurture-state'
import { claimWebhookEvent } from '@/lib/payments/webhook-idempotency'
import { captureHubPayPalOrder } from '@/lib/payments/paypal-capture'
import { grantConductorTier } from '@/lib/payments/conductor-grant'
import { grantCaspBundle } from '@/lib/payments/casp-bundle-grant'
import { grantAiPolicy } from '@/lib/payments/ai-policy-grant'
import { grantOfacWatch } from '@/lib/payments/ofac-watch-grant'
import { sendPaymentConfirmationEmail } from '@/lib/resend'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

// Terminal states — once we've moved to one of these, a stale earlier
// event (e.g. out-of-order ACTIVATED arriving after CANCELLED) must NOT
// rewind state. Closes CODE-REVIEW-W5 H-01 second half. See lookup in
// the switch below.
const TERMINAL_STATES = new Set(['cancelled', 'expired', 'refunded'])

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase env not configured')
  return createClient(url, key)
}

function paypalBase(): string {
  return process.env.PAYPAL_ENV === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com'
}

interface PayPalEvent {
  id: string
  event_type: string
  resource: Record<string, unknown> & {
    custom_id?: string
    id?: string
    status?: string
    // Present on CAPTURE.* events — the captured amount.
    amount?: { currency_code?: string; value?: string }
    // Present on CHECKOUT.ORDER.* events — hub-created orders carry the
    // internal order id here (reference_id/custom_id on the purchase unit).
    purchase_units?: Array<{ custom_id?: string; reference_id?: string }>
  }
}

// Verify webhook via PayPal's verify-webhook-signature endpoint.
// Requires PAYPAL_WEBHOOK_ID env var.
//
// D10 SECURITY-V3 H-3 fix: previously this function returned `true`
// in any non-production env when PAYPAL_WEBHOOK_ID was unset, which
// meant a Vercel preview deployment effectively accepted UNSIGNED
// PayPal webhooks. Closed: missing env var now always rejects (return
// false). Use a real test webhook ID in preview/staging if you need
// to exercise this code path.
async function verifyPayPalWebhook(req: NextRequest, rawBody: string): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID
  if (!webhookId) {
    console.warn('[paypal/webhook] PAYPAL_WEBHOOK_ID missing — rejecting')
    return false
  }

  const id = process.env.PAYPAL_CLIENT_ID
  const secret = process.env.PAYPAL_CLIENT_SECRET
  if (!id || !secret) return false

  const auth = Buffer.from(`${id}:${secret}`).toString('base64')
  const tokenRes = await fetch(`${paypalBase()}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })
  if (!tokenRes.ok) return false
  const { access_token } = (await tokenRes.json()) as { access_token: string }

  const verifyRes = await fetch(`${paypalBase()}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      auth_algo: req.headers.get('paypal-auth-algo'),
      cert_url: req.headers.get('paypal-cert-url'),
      transmission_id: req.headers.get('paypal-transmission-id'),
      transmission_sig: req.headers.get('paypal-transmission-sig'),
      transmission_time: req.headers.get('paypal-transmission-time'),
      webhook_id: webhookId,
      webhook_event: JSON.parse(rawBody),
    }),
  })
  if (!verifyRes.ok) return false
  const out = (await verifyRes.json()) as { verification_status: string }
  return out.verification_status === 'SUCCESS'
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    const verified = await verifyPayPalWebhook(req, rawBody)
    if (!verified) {
      return NextResponse.json({ error: 'webhook_verification_failed' }, { status: 401 })
    }

    const event = JSON.parse(rawBody) as PayPalEvent & { create_time?: string }
    const supabase = getSupabase()

    // 2026-05-11 idempotency claim (CODE-REVIEW-W5 H-01 + SECURITY-W5 S-C1):
    // PayPal re-delivers any event for up to 25h. Without this claim,
    // a replayed ACTIVATED arriving after CANCELLED revives a cancelled
    // sub. Claim before processing; duplicates 200-fast.
    const claim = await claimWebhookEvent({
      gateway: 'paypal',
      eventId: event.id,
      eventType: event.event_type,
      eventReceivedAt: event.create_time ?? null,
    })
    if (claim === 'duplicate') {
      return NextResponse.json({ ok: true, deduped: true })
    }
    if (claim === 'error') {
      // Storage layer down → 500 so PayPal retries with backoff.
      return NextResponse.json(
        { error: 'idempotency_storage_failed' },
        { status: 500 },
      )
    }

    // custom_id we set during start() ties back to our order.id.
    // Orders API events (CHECKOUT.ORDER.*) carry it on the purchase unit;
    // CAPTURE.* events echo it at resource top level. Reference_id is the
    // fallback for hub-created orders that predate custom_id on the unit.
    const orderId =
      event.resource.custom_id ??
      event.resource.purchase_units?.[0]?.custom_id ??
      event.resource.purchase_units?.[0]?.reference_id

    if (!orderId) {
      console.warn('[paypal/webhook] no custom_id on event', event.event_type)
      return NextResponse.json({ ok: true, ignored: true })
    }

    // Terminal-state guard: read the row's current status BEFORE applying
    // the transition. If we've already moved to cancelled/expired/refunded,
    // a stale earlier event must not rewind state. Closes CODE-REVIEW-W5
    // H-01 second half (out-of-order delivery). metadata + amount_cents are
    // read here too: metadata for merge-on-write + grant idempotency,
    // amount_cents for the capture-amount cross-check.
    const { data: currentRow } = await supabase
      .from('payment_orders')
      .select('status, metadata, amount_cents')
      .eq('id', orderId)
      .maybeSingle()
    const currentStatus = typeof currentRow?.status === 'string' ? currentRow.status : null
    const isTerminal = currentStatus !== null && TERMINAL_STATES.has(currentStatus)
    const existingMeta =
      currentRow?.metadata && typeof currentRow.metadata === 'object'
        ? (currentRow.metadata as Record<string, unknown>)
        : {}

    // Merge into existing metadata — a wholesale overwrite used to clobber
    // capture ids and reconcile markers written by other flows.
    const updates: Record<string, unknown> = {
      metadata: { ...existingMeta, last_event: event },
    }

    // Map PayPal event_type → our status.
    //
    // F1 fix (2026-09-01): CHECKOUT.ORDER.APPROVED is NOT a paid event —
    // with intent=CAPTURE no money has moved until the order is captured.
    // Treating it as paid granted product access + sent "payment confirmed"
    // emails on $0 orders. The paid signal is PAYMENT.CAPTURE.COMPLETED.
    let skipGrants = false
    switch (event.event_type) {
      case 'CHECKOUT.ORDER.APPROVED': {
        // Defensive capture: the return URL (/payment/paypal/return) is the
        // primary capture path, but buyers sometimes close the tab before
        // the redirect. captureHubPayPalOrder reads the order status first,
        // so this is a no-op when the return page already captured.
        if (isTerminal) break
        const capture = await captureHubPayPalOrder({
          orderId,
          paypalOrderId: event.resource.id,
          source: 'webhook',
          supabase,
        })
        updates.metadata = {
          ...(updates.metadata as Record<string, unknown>),
          approved_capture_attempt: capture.outcome,
          ...(capture.error ? { approved_capture_error: capture.error } : {}),
        }
        if (capture.outcome === 'failed') {
          console.warn('[paypal/webhook] defensive capture failed', orderId, capture.error)
        }
        break
      }
      case 'PAYMENT.CAPTURE.COMPLETED': {
        // Cross-check the captured amount against the order row before
        // granting anything — a mismatch means tampering or a stale row,
        // so we flag it and leave the order pending for manual review.
        const capturedCents = Math.round(Number(event.resource.amount?.value ?? NaN) * 100)
        if (
          typeof currentRow?.amount_cents === 'number' &&
          Number.isFinite(capturedCents) &&
          capturedCents !== currentRow.amount_cents
        ) {
          console.error(
            `[paypal/webhook] capture amount mismatch order=${orderId} expected=${currentRow.amount_cents} captured=${capturedCents}`,
          )
          updates.metadata = {
            ...(updates.metadata as Record<string, unknown>),
            amount_mismatch: { expected_cents: currentRow.amount_cents, captured_cents: capturedCents },
          }
          skipGrants = true
          break
        }
        // Grant idempotency: if this capture id already fired grants (e.g.
        // manual event replay with a fresh event id), record the event but
        // don't re-grant or re-email.
        const captureId = typeof event.resource.id === 'string' ? event.resource.id : null
        if (captureId && existingMeta.granted_capture_id === captureId) {
          skipGrants = true
        }
        updates.status = 'active'
        updates.activated_at = new Date().toISOString()
        updates.last_charge_at = new Date().toISOString()
        if (captureId) {
          updates.metadata = {
            ...(updates.metadata as Record<string, unknown>),
            paypal_capture_id: captureId,
          }
        }
        break
      }
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
        updates.status = 'active'
        updates.activated_at = new Date().toISOString()
        updates.last_charge_at = new Date().toISOString()
        break
      case 'BILLING.SUBSCRIPTION.RENEWED':
        updates.last_charge_at = new Date().toISOString()
        break
      case 'BILLING.SUBSCRIPTION.PAYMENT.FAILED':
        updates.status = 'past_due'
        break
      case 'BILLING.SUBSCRIPTION.CANCELLED':
      case 'BILLING.SUBSCRIPTION.SUSPENDED':
        updates.status = 'cancelled'
        updates.cancelled_at = new Date().toISOString()
        break
      case 'BILLING.SUBSCRIPTION.EXPIRED':
        updates.status = 'expired'
        break
      case 'PAYMENT.CAPTURE.REFUNDED':
        updates.status = 'refunded'
        updates.refunded_at = new Date().toISOString()
        break
      default:
        console.log('[paypal/webhook] ignored event', event.event_type)
        return NextResponse.json({ ok: true, ignored: true })
    }

    // Terminal-state guard: if the row is already cancelled/expired/refunded,
    // ONLY allow updates that don't transition status back. Refunds are
    // allowed to overwrite cancelled (a cancelled-then-refunded path is real).
    if (isTerminal && typeof updates.status === 'string') {
      const incoming = updates.status as string
      const allowedFromTerminal: Record<string, ReadonlyArray<string>> = {
        cancelled: ['refunded'],
        expired: ['refunded'],
        refunded: [],  // refunded is final
      }
      const permitted = currentStatus ? allowedFromTerminal[currentStatus] ?? [] : []
      if (!permitted.includes(incoming)) {
        console.warn(
          `[paypal/webhook] refused stale transition order=${orderId} current=${currentStatus} incoming=${incoming} event=${event.event_type}`,
        )
        return NextResponse.json({ ok: true, refused_stale_transition: true })
      }
    }

    const { error: updateErr } = await supabase
      .from('payment_orders')
      .update(updates)
      .eq('id', orderId)

    if (updateErr) {
      console.error('[paypal/webhook] update failed', updateErr.message)
      return NextResponse.json({ error: 'update_failed' }, { status: 500 })
    }

    if (typeof updates.status === 'string') {
      const opsType =
        updates.status === 'active'
          ? 'payment.confirmed'
          : updates.status === 'refunded'
            ? 'payment.refunded'
            : updates.status === 'cancelled' || updates.status === 'expired'
              ? 'subscription.cancelled'
              : updates.status === 'past_due'
                ? 'payment.failed'
                : null
      if (opsType) {
        // Look up order for amount + email metadata (best-effort)
        const { data: orderRow } = await supabase
          .from('payment_orders')
          .select('user_email, amount_cents, product, tier, billing_interval, source')
          .eq('id', orderId)
          .maybeSingle()
        logEventAsync({
          type: opsType,
          source: 'hub',
          ref_id: String(orderId),
          email: orderRow?.user_email ?? undefined,
          amount_cents: orderRow?.amount_cents ?? undefined,
          status: updates.status === 'active' ? 'ok' : 'failed',
          metadata: {
            gateway: 'paypal',
            event_type: event.event_type,
            product: orderRow?.product,
            tier: orderRow?.tier,
            interval: orderRow?.billing_interval,
            order_source: orderRow?.source,
          },
        })

        // Phase AA V3 — stop nurture cadence on confirmed payment.
        // skipGrants: capture amount mismatch (manual review) or this
        // capture id already granted — record the transition, don't
        // re-grant / re-email.
        if (opsType === 'payment.confirmed' && orderRow?.user_email && !skipGrants) {
          void markNurturePaid(orderRow.user_email).catch((err) =>
            console.warn('[paypal/webhook] mark-paid failed:', err),
          )
          // Conductor entitlement write-through (no-op for other products).
          await grantConductorTier(supabase, orderRow)
          await grantCaspBundle(supabase, orderRow)
          await grantAiPolicy(supabase, orderRow)
          await grantOfacWatch(supabase, orderRow)
          // Send payment confirmation email to customer (non-blocking).
          void sendPaymentConfirmationEmail(
            orderRow.user_email,
            orderRow.product ?? 'your product',
            orderRow.amount_cents ?? 0,
            orderRow.billing_interval ?? null,
          ).catch((err) =>
            console.warn('[paypal/webhook] confirmation email failed:', err),
          )
          // Mark this capture id as granted so a replayed event can't
          // re-fire the grants above.
          if (event.event_type === 'PAYMENT.CAPTURE.COMPLETED' && event.resource.id) {
            await supabase
              .from('payment_orders')
              .update({
                metadata: {
                  ...(updates.metadata as Record<string, unknown>),
                  granted_capture_id: event.resource.id,
                },
              })
              .eq('id', orderId)
          }
        }
      }
    }

    return NextResponse.json({ ok: true, status: updates.status })
  } catch (err) {
    // H-02 fix: opaque code to client; full detail stays server-side
    console.error('[paypal/webhook]', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'webhook_processing_failed' }, { status: 500 })
  }
}
