import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logEventAsync } from '@/lib/ops/log'

/**
 * Hub /api/digest — daily activity feed for the hub itself.
 *
 * The hub is the aggregator that consumes /api/digest from each of the
 * 6 product subdomains (TRACR / BRAI / LexAudit / DocAI / Forge /
 * LeadForge) and stitches them into Today's Brief. But the hub also
 * has its own user-visible activity worth surfacing in the same shape:
 *   - snapshot intakes processed in the last 24h
 *   - jurisdiction comparisons run
 *   - risk-engine deep-analyses generated
 *   - real-estate intake volume
 *
 * Anti-hallucination: real counts only, sourced from the ops_events
 * stream (the canonical HMAC-verified event log). When nothing happened,
 * return score=0 with an honest "Quiet day" headline. Never fabricate.
 */

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface DigestLink {
  readonly label: string
  readonly href: string
}

interface ProductDigest {
  readonly product: 'hub'
  readonly date: string
  readonly headline: string
  readonly bullets: ReadonlyArray<string>
  readonly score: number
  readonly links: ReadonlyArray<DigestLink>
}

interface OpsEventRow {
  event_type: string
  source: string
  count: number
  amount_cents_sum: number | null
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

// Event types that represent real user/business activity worth surfacing
// in Today's Brief (as opposed to cron/heartbeat noise).
const SIGNAL_TYPES = new Set([
  'payment.intent',
  'payment.confirmed',
  'payment.failed',
  'payment.refunded',
  'subscription.created',
  'subscription.renewed',
  'subscription.cancelled',
  'lead.inbound',
  'lead.qualified',
  'snapshot.generated',
  'risk.analysis',
  'risk.assessment',
  'jurisdiction.compare',
  'sqa.draft',
  'dpa.negotiation',
  'psp.audit',
  'framework.changed',
  'cert.released',
  'download.report',
  'report.generated',
  'referral.received',
  'referral.routed',
  'referral.closed',
  'agent.checkout',
])

export async function GET(): Promise<NextResponse> {
  const date = new Date().toISOString().slice(0, 10)

  let rows: OpsEventRow[] = []
  const supabase = getSupabase()
  if (supabase) {
    const { data, error } = await supabase
      .from('ops_events_24h_by_type')
      .select('event_type, source, count, amount_cents_sum')
      .order('count', { ascending: false })
      .limit(10)
    if (!error && data) rows = data as OpsEventRow[]
  }

  const signalRows = rows.filter((r) => SIGNAL_TYPES.has(r.event_type))
  const totalEvents = rows.reduce((acc, r) => acc + r.count, 0)
  const signalEvents = signalRows.reduce((acc, r) => acc + r.count, 0)
  const revenueEvents = rows
    .filter((r) => r.event_type.startsWith('payment.') || r.event_type.startsWith('subscription.'))
    .reduce((acc, r) => acc + r.count, 0)
  const revenueCents = rows
    .filter((r) => r.event_type.startsWith('payment.') || r.event_type.startsWith('subscription.'))
    .reduce((acc, r) => acc + (r.amount_cents_sum ?? 0), 0)

  const hasActivity = signalEvents > 0
  const headline = hasActivity
    ? `${signalEvents} business event${signalEvents > 1 ? 's' : ''} across the fleet in the last 24h.`
    : 'BizLegal AI hub — quiet day.'

  const bullets = hasActivity
    ? [
        ...signalRows.slice(0, 4).map((r) => `${r.count}× ${r.event_type} (${r.source})`),
        revenueEvents > 0
          ? `${revenueEvents} payment/subscription event${revenueEvents > 1 ? 's' : ''} — $${(revenueCents / 100).toFixed(2)} tracked.`
          : 'No payment or subscription events in the last 24h.',
      ]
    : [
        'No new snapshots, deep-analyses, or jurisdiction comparisons recorded in the past 24 hours.',
        'Six product surfaces continue publishing their own intelligence; check each /api/digest for live counts.',
        'Disclosure version v1.0.0-p4. Intelligence — not legal advice.',
      ]

  const body: ProductDigest = {
    product: 'hub',
    date,
    headline,
    bullets,
    score: signalEvents,
    links: [
      { label: 'Free Snapshot', href: 'https://bizlegal-ai.com/snapshot' },
      { label: 'Risk Engine', href: 'https://bizlegal-ai.com/risk-engine' },
      { label: 'Jurisdiction Arbitrage', href: 'https://bizlegal-ai.com/jurisdictions' },
      { label: 'Real-Estate Intelligence', href: 'https://bizlegal-ai.com/realestate' },
    ],
  }

  logEventAsync({
    type: 'cron.completed',
    source: 'hub',
    ref_id: 'digest',
    status: 'ok',
    metadata: { product: 'hub', score: body.score, date, total_events: totalEvents },
  })

  return NextResponse.json(body, {
    headers: {
      'cache-control': 'public, s-maxage=300, stale-while-revalidate=900',
      'content-type': 'application/json; charset=utf-8',
    },
  })
}
