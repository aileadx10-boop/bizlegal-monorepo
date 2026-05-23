import { NextRequest, NextResponse } from 'next/server'
import { logEventAsync } from '@bizlegal/ops-log'
import { serviceSupabase } from '@/lib/supabase'
import { paypalBase, captureOrder } from '@/lib/paypal'
import { buildAndUploadReport } from '@/lib/report'
import { extractionSchema } from '@/lib/ai/schema'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

interface PaypalEvent {
  id?: string
  event_type?: string
  resource?: {
    id?: string
    custom_id?: string
    supplementary_data?: { related_ids?: { order_id?: string } }
    amount?: { value?: string; currency_code?: string }
  }
}

/**
 * POST /api/payments/paypal/webhook
 *
 * Receives PayPal webhook events. Cares about:
 *   - CHECKOUT.ORDER.APPROVED  → capture the order, mark paid, generate PDF
 *   - PAYMENT.CAPTURE.COMPLETED → idempotent confirmation (already captured)
 *
 * Idempotency: any second webhook for the same paypal_order_id is a no-op
 * because we check status='paid' or 'full_report_ready' before re-running.
 *
 * Verification: in production, PayPal events should be verified via the
 * `verify-webhook-signature` API call (requires PAYPAL_WEBHOOK_ID). For
 * now we treat the event as advisory — the capture step itself is what
 * actually moves money.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  let event: PaypalEvent
  try {
    event = (await req.json()) as PaypalEvent
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid JSON' }, { status: 400 })
  }

  await verifyWebhookSignatureBestEffort(req, event)

  const eventType = event.event_type ?? ''
  if (!['CHECKOUT.ORDER.APPROVED', 'PAYMENT.CAPTURE.COMPLETED'].includes(eventType)) {
    return NextResponse.json({ ok: true, ignored: eventType })
  }

  const orderId =
    event.resource?.id ??
    event.resource?.supplementary_data?.related_ids?.order_id ??
    null
  if (!orderId) {
    return NextResponse.json({ ok: false, error: 'missing order id' }, { status: 400 })
  }

  const supabase = serviceSupabase()
  const { data: job } = await supabase
    .from('funnel_jobs')
    .select('id, user_email, status, amount_cents, doc_filename, extracted_json')
    .eq('paypal_order_id', orderId)
    .maybeSingle()

  if (!job) {
    return NextResponse.json({ ok: false, error: 'no matching job', orderId }, { status: 404 })
  }

  // Idempotency
  if (['paid', 'full_report_ready'].includes(job.status as string)) {
    return NextResponse.json({ ok: true, already: job.status })
  }

  // Capture (idempotent on PayPal side; second capture returns ORDER_ALREADY_CAPTURED)
  let captured
  try {
    captured = await captureOrder(orderId)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'capture failed'
    logEventAsync({
      type: 'payment.failed',
      source: 'hub',
      ref_id: job.id as string,
      email: job.user_email as string,
      status: 'failed',
      metadata: { surface: 'funnel-mvp', gateway: 'paypal', error: message, paypal_order_id: orderId },
    })
    return NextResponse.json({ ok: false, error: message }, { status: 502 })
  }

  await supabase
    .from('funnel_jobs')
    .update({ status: 'paid', paid_at: new Date().toISOString() })
    .eq('id', job.id)

  logEventAsync({
    type: 'payment.confirmed',
    source: 'hub',
    ref_id: job.id as string,
    email: job.user_email as string,
    amount_cents: captured.capturedAmountCents ?? (job.amount_cents as number),
    status: 'ok',
    metadata: {
      surface: 'funnel-mvp',
      gateway: 'paypal',
      paypal_order_id: orderId,
      paypal_capture_id: captured.captureId,
    },
  })

  // Generate the PDF report (extraction was already done at preview time)
  try {
    const extraction = extractionSchema.parse(job.extracted_json ?? {})
    const storageKey = await buildAndUploadReport({
      jobId: job.id as string,
      userEmail: job.user_email as string,
      filename: (job.doc_filename as string) ?? 'document',
      extraction,
    })
    await supabase
      .from('funnel_jobs')
      .update({
        status: 'full_report_ready',
        full_report_key: storageKey,
        completed_at: new Date().toISOString(),
      })
      .eq('id', job.id)
    logEventAsync({
      type: 'report.generated',
      source: 'hub',
      ref_id: job.id as string,
      email: job.user_email as string,
      status: 'ok',
      metadata: { surface: 'funnel-mvp', storage_key: storageKey },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'report build failed'
    await supabase
      .from('funnel_jobs')
      .update({ status: 'failed', error_message: `paid-but-report-failed: ${message}` })
      .eq('id', job.id)
    logEventAsync({
      type: 'error',
      source: 'hub',
      ref_id: job.id as string,
      email: job.user_email as string,
      status: 'failed',
      metadata: { surface: 'funnel-mvp', stage: 'report', error: message },
    })
  }

  return NextResponse.json({ ok: true })
}

async function verifyWebhookSignatureBestEffort(req: NextRequest, event: PaypalEvent): Promise<void> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID
  if (!webhookId) return // best-effort skip until configured
  try {
    const headers = req.headers
    const verifyBody = {
      auth_algo: headers.get('paypal-auth-algo'),
      cert_url: headers.get('paypal-cert-url'),
      transmission_id: headers.get('paypal-transmission-id'),
      transmission_sig: headers.get('paypal-transmission-sig'),
      transmission_time: headers.get('paypal-transmission-time'),
      webhook_id: webhookId,
      webhook_event: event,
    }
    // Token reuse from lib/paypal; deferred import to avoid circular
    const { getAccessToken } = await import('@/lib/paypal')
    const token = await getAccessToken()
    const res = await fetch(`${paypalBase()}/v1/notifications/verify-webhook-signature`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(verifyBody),
    })
    if (!res.ok) console.warn('[paypal/webhook] verify failed:', res.status)
  } catch (err) {
    console.warn('[paypal/webhook] verify threw:', err instanceof Error ? err.message : err)
  }
}
