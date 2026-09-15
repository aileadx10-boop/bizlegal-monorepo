import type { SupabaseClient } from '@supabase/supabase-js'
import { logEventAsync } from '@/lib/ops/log'
import { sendToTelegram } from '@/lib/agents/ea-runner'

/**
 * DEAL44 room-setup grant (plan v3 §B3). Wired into both payment webhooks
 * (nowpayments + paypal) right after grantSellerRadar; a no-op for every other
 * product.
 *
 * What a paid room is at this stage: a `deals` row owned by the buyer's email,
 * with `paid_order_id` and `activated_at` stamped. It carries **no parties, no
 * template and no anchors**, because checkout collects an email and nothing
 * else — and inventing a signing date, a jurisdiction pack or a party list from
 * a payment would put dates in front of a buyer that nobody gave us (deal44
 * invariant 3: never invent a date). The room is finished from the written
 * brief that follows, through the deal44 room API, which mints the per-party
 * links under `DEAL44_TOKEN_KEY` — a key the hub deliberately does not hold.
 *
 * Idempotency has two layers: a lookup on `paid_order_id` before writing, and
 * the partial unique index in `supabase/migrations/20260915_deal44_paid_room.sql`
 * for the case where two webhook deliveries race. A replayed IPN therefore
 * cannot leave a customer with two rooms and one payment.
 *
 * It never throws. A webhook that 500s is retried by the gateway, and a retry
 * re-runs every other grant in the chain.
 */

/** Only the one-time room SKUs. The broker subscription grants no single room. */
const ROOM_SETUP_PRODUCTS = new Set(['deal44_room_setup_ils', 'deal44_room_setup_usd'])

const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
const ROOM_REF_RE = new RegExp(`deal44_room:(${UUID_RE.source})`, 'i')

export interface Deal44OrderLike {
  readonly id?: string | number | null
  readonly product?: string | null
  readonly tier?: string | null
  readonly billing_interval?: string | null
  readonly user_email?: string | null
  readonly amount_cents?: number | null
  readonly currency?: string | null
  /** `/api/pay/start` writes `deal44_start`; a room-scoped order carries `deal44_room:<uuid>`. */
  readonly source?: string | null
  readonly metadata?: Record<string, unknown> | null
}

/** The room this order was raised against, when it was raised against one. */
function roomIdFrom(order: Deal44OrderLike): string | null {
  const fromMeta = order.metadata?.room_id
  if (typeof fromMeta === 'string' && UUID_RE.test(fromMeta)) return fromMeta
  const fromSource = (order.source ?? '').match(ROOM_REF_RE)
  return fromSource ? fromSource[1] : null
}

/**
 * The order's own id.
 *
 * The PayPal webhook selects a narrow column set that does not include `id`,
 * so on that rail the grant arrives without one. Without an id there is nothing
 * to stamp and nothing to dedupe on, so it is resolved back from the buyer's
 * latest active order for the same product rather than guessed at.
 */
async function resolveOrderId(
  supabase: SupabaseClient,
  order: Deal44OrderLike,
  email: string,
): Promise<{ id: string; source: string | null; metadata: Record<string, unknown> | null } | null> {
  if (order.id !== null && order.id !== undefined && String(order.id)) {
    return {
      id: String(order.id),
      source: order.source ?? null,
      metadata: order.metadata ?? null,
    }
  }
  const { data } = await supabase
    .from('payment_orders')
    .select('id, source, metadata')
    .ilike('user_email', email)
    .eq('product', order.product ?? '')
    .in('status', ['active', 'paid'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (!data?.id) return null
  return {
    id: String(data.id),
    source: typeof data.source === 'string' ? data.source : null,
    metadata: (data.metadata as Record<string, unknown> | null) ?? null,
  }
}

export async function grantDeal44Room(
  supabase: SupabaseClient,
  order: Deal44OrderLike,
): Promise<void> {
  const product = order.product ?? ''
  if (!ROOM_SETUP_PRODUCTS.has(product)) return

  const email = (order.user_email ?? '').trim().toLowerCase()
  if (!email) return

  try {
    const resolved = await resolveOrderId(supabase, order, email)
    if (!resolved) {
      console.warn('[deal44-grant] no order id for', email, product, '— room not stamped')
      await sendToTelegram(
        `*DEAL44* room paid but the order row could not be resolved\n${email} · ${product}\nOpen the room by hand and activate it against the order.`,
      )
      return
    }

    // Already granted (a replayed webhook, or the other rail's delivery).
    const { data: already } = await supabase
      .from('deals')
      .select('id')
      .eq('paid_order_id', resolved.id)
      .limit(1)
      .maybeSingle()
    if (already?.id) return

    const currency = (order.currency ?? (product.endsWith('_ils') ? 'ILS' : 'USD')).toUpperCase()
    const isIsrael = currency === 'ILS'
    const now = new Date().toISOString()

    const targetRoom = roomIdFrom({ ...order, source: resolved.source, metadata: resolved.metadata })
    let dealId = ''
    let attached = false

    if (targetRoom) {
      // Attach to the room the order was raised against. Guarded on
      // `paid_order_id is null` so a paid room is never re-pointed at a
      // different payment.
      const { data: updated } = await supabase
        .from('deals')
        .update({ paid_order_id: resolved.id, activated_at: now })
        .eq('id', targetRoom)
        .is('paid_order_id', null)
        .select('id')
        .maybeSingle()
      if (updated?.id) {
        dealId = String(updated.id)
        attached = true
      }
    }

    if (!dealId) {
      // No room referenced, or the referenced one was gone or already paid.
      // Create the empty paid room rather than drop the sale — an unmatched
      // room is fixable by hand; a payment with nothing behind it is not.
      const { data: created, error: insertErr } = await supabase
        .from('deals')
        .insert({
          // No title, no template, no anchors. All three come from the buyer.
          locale: isIsrael ? 'he-IL' : 'en-US',
          currency,
          jurisdiction: isIsrael ? 'IL' : 'US',
          deal_type: 'residential_purchase',
          template_id: null,
          anchors: {},
          email,
          status: 'open',
          created_by: 'checkout',
          paid_order_id: resolved.id,
          activated_at: now,
        })
        .select('id')
        .single()
      if (insertErr || !created) {
        console.warn('[deal44-grant] deals insert failed:', insertErr?.message)
        await sendToTelegram(
          `*DEAL44* room paid but NOT created\n${email} · ${product} · order ${resolved.id}\n${insertErr?.message ?? 'unknown error'}\nCreate the room by hand and activate it against this order.`,
        )
        return
      }
      dealId = String(created.id)
    }

    // The audit tape the room itself writes to. Best-effort: evidence, not a gate.
    await supabase
      .from('deal_events')
      .insert({
        deal_id: dealId,
        actor: 'checkout',
        type: attached ? 'room.activated' : 'room.created',
        payload: { order_id: resolved.id, product, currency, via: 'hub_webhook' },
      })
      .then(({ error }) => {
        if (error) console.warn('[deal44-grant] deal_events insert failed:', error.message)
      })

    // No `payment.confirmed` here — the webhook already fired one for this
    // order, and a second would double-count the sale on /ops. This records the
    // provisioning step only, on an existing event type (hard rule 3), with no
    // amount attached.
    logEventAsync({
      type: 'agent.checkout',
      source: 'deal44',
      ref_id: dealId,
      email,
      status: 'ok',
      metadata: {
        step: attached ? 'room_activated' : 'room_provisioned',
        product,
        currency,
        order_id: resolved.id,
      },
    })

    await sendToTelegram(
      `*DEAL44* room paid — ${product}\n${email} · order ${resolved.id}\nroom ${dealId} ${attached ? 'activated' : 'created (empty)'}\nNext: collect the signed agreement, the key dates and the parties, then add them in the room.`,
    )
  } catch (err) {
    console.warn('[deal44-grant] threw:', err instanceof Error ? err.message : err)
  }
}
