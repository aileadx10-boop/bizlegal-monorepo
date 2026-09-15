import type { SupabaseClient } from '@supabase/supabase-js'
import { sendEmail } from '@bizlegal/email'
import { logEventAsync } from '@/lib/ops/log'

/**
 * LeaseParse paid-gate grant (plan v3 §B4). Wired into both payment webhooks
 * (nowpayments + paypal) right after grantSellerRadar.
 *
 * A hub apex checkout for product_family 'leaseparse' knows the buyer's email
 * but not their lease PDF — there is no upload field on the checkout page. So
 * the grant records the paid order as an *unclaimed credit*, and the LeaseParse
 * subdomain refuses to issue an upload URL or run an extraction without one
 * (apps/leaseparse/web/lib/payments/credits.ts). That is the whole paid gate:
 * before this existed, /api/leases/{upload-url,ingest} handed out the $59
 * deliverable to anyone who asked.
 *
 * Idempotent: leaseparse_credits.order_id is unique and this upserts on it, so
 * a replayed IPN cannot grant a second abstract. `ignoreDuplicates: true` keeps
 * a replay from resetting an already-claimed/consumed credit back to unclaimed.
 *
 * Never throws into the webhook flow — a failed grant is logged, not raised.
 */

const PRODUCT_ID = 'leaseparse_abstract_59'

export async function grantLeaseParse(
  supabase: SupabaseClient,
  order: {
    id?: string | number | null
    product?: string | null
    tier?: string | null
    billing_interval?: string | null
    user_email?: string | null
    amount_cents?: number | null
  },
): Promise<void> {
  if (order.product !== 'leaseparse') return

  const email = (order.user_email ?? '').trim().toLowerCase()
  const orderId = order.id === null || order.id === undefined ? '' : String(order.id)
  if (!email || !orderId) {
    console.warn('[leaseparse-grant] missing email or order id — cannot grant')
    return
  }

  try {
    const { error } = await supabase
      .from('leaseparse_credits')
      .upsert(
        {
          email,
          order_id: orderId,
          product_id: PRODUCT_ID,
          amount_cents: typeof order.amount_cents === 'number' ? order.amount_cents : null,
          status: 'unclaimed',
        },
        { onConflict: 'order_id', ignoreDuplicates: true },
      )

    if (error) {
      console.warn('[leaseparse-grant] credit upsert failed:', error.message)
      return
    }

    const claimUrl = 'https://leaseparse.bizlegal-ai.com/?order=' + encodeURIComponent(orderId)

    logEventAsync({
      type: 'payment.confirmed',
      source: 'hub',
      ref_id: orderId,
      email,
      amount_cents: typeof order.amount_cents === 'number' ? order.amount_cents : 5900,
      status: 'ok',
      metadata: {
        product: 'leaseparse',
        product_id: PRODUCT_ID,
        grant: 'leaseparse_credit_unclaimed',
        next_step: claimUrl,
      },
    })

    // The credit is useless if the buyer does not know where to redeem it.
    // Transactional: the buyer just paid; suppression still applies inside the
    // package. Best-effort — the credit row above is the source of truth and
    // the generic payment-confirmation mail still goes out from the webhook.
    const sent = await sendEmail({
      kind: 'transactional',
      to: email,
      subject: 'Your LeaseParse abstract is ready to run',
      text: [
        'Thanks — your $59 lease abstract credit is on file.',
        '',
        'Upload the lease here to run it:',
        claimUrl,
        '',
        'One credit = one lease. The abstract is decision support for your own review; it is not legal advice and does not replace reading the lease.',
        '',
        `Order reference: ${orderId}`,
        '— BizLegal AI',
      ].join('\n'),
      idempotencyKey: `leaseparse-credit-${orderId}`,
    })
    if (!sent.ok) console.warn('[leaseparse-grant] claim email not sent:', sent.error)
  } catch (err) {
    console.warn('[leaseparse-grant] threw:', err instanceof Error ? err.message : err)
  }
}
