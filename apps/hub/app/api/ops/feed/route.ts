import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

/**
 * GET /api/ops/feed?token=...
 *
 * Aggregated live ops feed for the /ops dashboard. Returns:
 *   - summary: 24h counts for top event types + revenue
 *   - events: last 100 events from ops_events
 *   - subs: active subscription counts per product (from payment_orders)
 *   - frameworks: latest compliance_framework_index hashes (cross-domain)
 *
 * Token-gated by OPS_DASHBOARD_TOKEN env. Returns 404 to avoid leaking
 * the route's existence on token mismatch.
 */

interface OpsEvent {
  id: number
  event_type: string
  source: string
  ref_id: string | null
  ref_email: string | null
  amount_cents: number | null
  status: string | null
  metadata: Record<string, unknown>
  created_at: string
}

interface SummaryRow {
  label: string
  value: number
  amount_cents?: number
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase env not configured')
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

function timingSafeEq(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return diff === 0
}

export async function GET(req: NextRequest) {
  try {
    const expected = process.env.OPS_DASHBOARD_TOKEN ?? ''
    const url = new URL(req.url)
    const provided = url.searchParams.get('token') ?? url.searchParams.get('t') ?? ''
    const headerToken = req.headers.get('x-ops-token') ?? ''
    const tokenInput = provided || headerToken
    if (!expected || !tokenInput || !timingSafeEq(expected, tokenInput)) {
      return NextResponse.json({ error: 'not found' }, { status: 404 })
    }

    const supabase = getSupabase()
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

    // Optional source filter (drilldown). Accepts a single source or a
    // comma-separated list (e.g. `?source=brai,forge,docai` for the
    // /ops/subdomains dashboard). Validated against allowed sources so a
    // malicious value can't smuggle SQL — Supabase already param-escapes.
    const ALLOWED_SOURCE_FILTERS = new Set([
      'hub', 'docai', 'lexaudit', 'tracr', 'brai', 'forge', 'leadforge', 'blog',
      'oci', 'worker', 'curator', 'ea', 'gsc-bot',
    ])
    const sourceParam = url.searchParams.get('source') ?? ''
    const requestedSources = sourceParam
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && ALLOWED_SOURCE_FILTERS.has(s))

    let eventsQuery = supabase
      .from('ops_events')
      .select('id, event_type, source, ref_id, ref_email, amount_cents, status, metadata, created_at')
      .order('created_at', { ascending: false })
      .limit(100)
    if (requestedSources.length === 1) {
      eventsQuery = eventsQuery.eq('source', requestedSources[0]!)
    } else if (requestedSources.length > 1) {
      eventsQuery = eventsQuery.in('source', requestedSources)
    }

    const [
      eventsRes,
      eventsCountRes,
      paymentOrdersRes,
      paymentSummary24hRes,
      boiSubsRes,
      complianceFrameworkRes,
      referrals30dRes,
    ] = await Promise.all([
      eventsQuery,
      supabase
        .from('ops_events')
        .select('event_type, source, amount_cents, created_at')
        .gte('created_at', since24h),
      supabase
        .from('payment_orders')
        .select('id, user_email, product, tier, billing_interval, amount_cents, status, gateway, source, created_at')
        .order('created_at', { ascending: false })
        .limit(50),
      supabase
        .from('payment_orders')
        .select('product, tier, billing_interval, amount_cents, status, source')
        .gte('created_at', since24h),
      supabase
        .from('boi_subscriptions')
        .select('id, user_email, tier, status, entity_legal_name, created_at')
        .order('created_at', { ascending: false })
        .limit(20),
      supabase
        .from('compliance_framework_index')
        .select('framework_id, source_url, source_version, fetched_at, is_change')
        .order('fetched_at', { ascending: false })
        .limit(30),
      supabase
        .from('ops_events')
        .select('event_type, status, amount_cents, metadata, created_at')
        .like('event_type', 'referral.%')
        .gte('created_at', since30d)
        .order('created_at', { ascending: false })
        .limit(500),
    ])

    const events = (eventsRes.data ?? []) as OpsEvent[]
    const eventsRecent = (eventsCountRes.data ?? []) as Array<{
      event_type: string
      source: string
      amount_cents: number | null
      created_at: string
    }>
    const paymentOrders = paymentOrdersRes.data ?? []
    const paymentRecent = (paymentSummary24hRes.data ?? []) as Array<{
      product: string | null
      tier: string | null
      billing_interval: string | null
      amount_cents: number | null
      status: string | null
      source: string | null
    }>
    const boiSubs = boiSubsRes.data ?? []
    const frameworks = complianceFrameworkRes.data ?? []
    const referrals30d = (referrals30dRes.data ?? []) as Array<{
      event_type: string
      status: string | null
      amount_cents: number | null
      metadata: Record<string, unknown>
      created_at: string
    }>

    // 24h summary
    const summary24h: SummaryRow[] = []
    const counts: Record<string, number> = {}
    let confirmedAmount = 0
    for (const e of eventsRecent) {
      counts[e.event_type] = (counts[e.event_type] ?? 0) + 1
      if (e.event_type === 'payment.confirmed' && typeof e.amount_cents === 'number') {
        confirmedAmount += e.amount_cents
      }
    }
    for (const [type, n] of Object.entries(counts).sort((a, b) => b[1] - a[1])) {
      summary24h.push({ label: type, value: n })
    }

    // Active subs by product
    const subsByProduct: Record<string, { active: number; mrr_cents: number }> = {}
    for (const order of paymentRecent) {
      if (order.status !== 'active' || !order.product) continue
      if (!subsByProduct[order.product]) {
        subsByProduct[order.product] = { active: 0, mrr_cents: 0 }
      }
      subsByProduct[order.product].active += 1
      if (order.billing_interval === 'monthly' && typeof order.amount_cents === 'number') {
        subsByProduct[order.product].mrr_cents += order.amount_cents
      } else if (order.billing_interval === 'yearly' && typeof order.amount_cents === 'number') {
        subsByProduct[order.product].mrr_cents += Math.round(order.amount_cents / 12)
      }
    }

    // 24h checkout funnel
    const intents24h = paymentRecent.filter((o) => o.status === 'pending').length
    const confirmed24h = paymentRecent.filter((o) => o.status === 'active' || o.status === 'paid').length
    const conversionPct = intents24h + confirmed24h > 0
      ? Math.round((confirmed24h / (intents24h + confirmed24h)) * 100)
      : 0

    // Referrals pipeline (asymmetric pillar) — 30d aggregate.
    // received → routed → responded → closed → paid
    const referralsAgg = {
      received_30d: 0,
      routed_30d: 0,
      responded_30d: 0,
      closed_30d: 0,
      paid_30d: 0,
      committed_revenue_cents_30d: 0, // sum of referral.closed amount_cents
      paid_revenue_cents_30d: 0,      // sum of referral.paid amount_cents
      unmatched_30d: 0,
    }
    const partnerCloseCounts: Record<string, number> = {}
    for (const e of referrals30d) {
      switch (e.event_type) {
        case 'referral.received':
          referralsAgg.received_30d += 1
          if (e.status === 'failed' && (e.metadata as { outcome?: string } | null)?.outcome === 'unmatched') {
            referralsAgg.unmatched_30d += 1
          }
          break
        case 'referral.routed':
          referralsAgg.routed_30d += 1
          break
        case 'referral.responded':
          referralsAgg.responded_30d += 1
          break
        case 'referral.closed': {
          referralsAgg.closed_30d += 1
          if (typeof e.amount_cents === 'number') {
            referralsAgg.committed_revenue_cents_30d += e.amount_cents
          }
          const pid = (e.metadata as { partner_id?: string } | null)?.partner_id
          if (pid) partnerCloseCounts[pid] = (partnerCloseCounts[pid] ?? 0) + 1
          break
        }
        case 'referral.paid':
          referralsAgg.paid_30d += 1
          if (typeof e.amount_cents === 'number') {
            referralsAgg.paid_revenue_cents_30d += e.amount_cents
          }
          break
      }
    }
    const topPartners = Object.entries(partnerCloseCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([partner_id, closes]) => ({ partner_id, closes }))

    return NextResponse.json({
      generated_at: new Date().toISOString(),
      window: '24h',
      source_filter: requestedSources.length === 0 ? null : requestedSources.length === 1 ? requestedSources[0]! : requestedSources,
      summary: {
        events_24h: eventsRecent.length,
        confirmed_revenue_cents_24h: confirmedAmount,
        payment_intents_24h: intents24h,
        payment_confirmed_24h: confirmed24h,
        checkout_conversion_pct: conversionPct,
        active_subs_total: Object.values(subsByProduct).reduce((s, x) => s + x.active, 0),
        boi_active_subs: boiSubs.filter((s) => s.status === 'active').length,
        framework_changes_recent: frameworks.filter((f) => f.is_change).length,
      },
      summary_by_type: summary24h,
      events,
      payment_orders_recent: paymentOrders,
      subs_by_product: subsByProduct,
      boi_subs_recent: boiSubs,
      frameworks_recent: frameworks,
      referrals: {
        ...referralsAgg,
        top_partners: topPartners,
        window_days: 30,
      },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown error'
    console.error('[ops/feed]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
