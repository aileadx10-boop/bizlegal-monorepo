import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logEventAsync } from '@/lib/ops/log'
import {
  fetchUnreconciledAttributedSales,
  getAffiliate,
  calculateCommissionCents,
} from '@/lib/affiliate'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

/**
 * GET /api/cron/affiliate-reconcile
 *
 * Friday 10:30 UTC weekly reconciler. Sums attributed payments
 * (payment_orders.affiliate_code != null AND status IN ('active','paid')),
 * computes commission per (rate × interval × first-charge), credits the
 * affiliate's balance_cents, and fires referral.attributed per sale.
 *
 * Idempotency: we use `payment_orders.metadata.affiliate_reconciled_at`
 * to mark already-credited rows. Re-running the cron is safe.
 *
 * Auth: Bearer CRON_SECRET.
 */

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase env not configured')
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const authHeader = req.headers.get('authorization') ?? ''
  const provided = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : (new URL(req.url).searchParams.get('token') ?? '')
  const expected = process.env.CRON_SECRET ?? ''
  if (!expected || provided !== expected) {
    return NextResponse.json({ error: 'not found' }, { status: 404 })
  }

  const sinceIso = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
  const supabase = getSupabase()

  const sales = await fetchUnreconciledAttributedSales(sinceIso)

  // Pull each order's metadata so we can skip already-reconciled rows.
  // Cheaper: fetch in one batch keyed by created_at + affiliate_code.
  const orderIds = new Set<string>()
  for (const s of sales) orderIds.add(`${s.affiliate_code}:${s.created_at}`)

  const { data: orderRows } = await supabase
    .from('payment_orders')
    .select('id, affiliate_code, amount_cents, billing_interval, activated_at, metadata, status')
    .not('affiliate_code', 'is', null)
    .in('status', ['active', 'paid'])
    .gte('activated_at', sinceIso)
    .limit(500)

  let totalCommissionsCents = 0
  let creditedCount = 0
  let skippedCount = 0

  for (const order of orderRows ?? []) {
    const md = (order.metadata ?? {}) as { affiliate_reconciled_at?: string }
    if (md.affiliate_reconciled_at) {
      skippedCount += 1
      continue
    }
    const aff = await getAffiliate(order.affiliate_code as string)
    if (!aff || aff.status !== 'active') {
      skippedCount += 1
      continue
    }
    const sale = {
      affiliate_code: order.affiliate_code as string,
      product: '',
      tier: '',
      billing_interval: (order.billing_interval ?? 'one-time') as string,
      amount_cents: (order.amount_cents ?? 0) as number,
      created_at: (order.activated_at ?? '') as string,
      is_first_charge: true, // simplified: treat each activation as first-charge
    }
    const commissionCents = calculateCommissionCents(sale, aff)
    if (commissionCents <= 0) {
      skippedCount += 1
      continue
    }

    // Credit affiliate balance + mark order reconciled (atomic-enough; if
    // either fails the next run will retry the unmarked rows).
    const { error: balErr } = await supabase
      .from('affiliates')
      .update({
        balance_cents: aff.balance_cents + commissionCents,
        updated_at: new Date().toISOString(),
      })
      .eq('code', aff.code)
    if (balErr) {
      skippedCount += 1
      continue
    }
    await supabase
      .from('payment_orders')
      .update({
        metadata: {
          ...md,
          affiliate_reconciled_at: new Date().toISOString(),
          affiliate_commission_cents: commissionCents,
        },
      })
      .eq('id', order.id)

    logEventAsync({
      type: 'referral.attributed',
      source: 'hub',
      ref_id: aff.code,
      amount_cents: commissionCents,
      status: 'ok',
      metadata: {
        order_id: order.id,
        commission_pct_used: sale.billing_interval === 'one-time' ? aff.rate_pct_onetime : aff.rate_pct_first_mo,
        sale_amount_cents: sale.amount_cents,
        sale_interval: sale.billing_interval,
      },
    })

    totalCommissionsCents += commissionCents
    creditedCount += 1
  }

  logEventAsync({
    type: 'cron.completed',
    source: 'hub',
    ref_id: 'affiliate-reconcile',
    metadata: {
      cron: 'affiliate-reconcile',
      window_days: 14,
      sales_considered: orderRows?.length ?? 0,
      credited: creditedCount,
      skipped: skippedCount,
      total_commissions_cents: totalCommissionsCents,
    },
  })

  return NextResponse.json({
    ok: true,
    sales_considered: orderRows?.length ?? 0,
    credited: creditedCount,
    skipped: skippedCount,
    total_commissions_cents: totalCommissionsCents,
  })
}
