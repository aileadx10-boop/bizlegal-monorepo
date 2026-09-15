import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * Forge /api/digest — daily product activity feed for the hub.
 *
 * Anti-hallucination: must reflect real scan completions across the
 * 15 frameworks. Quiet days emit score=0 with a "Quiet day" headline.
 *
 * Real signals come from the canonical ops_events stream (HMAC-verified
 * writes via /api/ops/log), filtered to this surface.
 */

export const dynamic = 'force-dynamic'

interface DigestLink {
  readonly label: string
  readonly href: string
}

interface ProductDigest {
  readonly product: 'forge'
  readonly date: string
  readonly headline: string
  readonly bullets: ReadonlyArray<string>
  readonly score: number
  readonly links: ReadonlyArray<DigestLink>
  /** True when the digest could not be computed (env missing / query failed). */
  readonly degraded?: boolean
}

interface OpsEventRow {
  event_type: string
  count: number
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

const SIGNAL_TYPES = new Set([
  'download.report',
  'report.generated',
  'payment.intent',
  'payment.confirmed',
  'payment.failed',
  'subscription.created',
  'subscription.cancelled',
])

/**
 * Degraded digest: the hub must see "unavailable" rather than a fabricated
 * quiet day when env is missing or the query fails. Never cached.
 */
function degradedResponse(
  date: string,
  links: ReadonlyArray<DigestLink>,
  headline: string,
  bullet: string,
): NextResponse {
  const body: ProductDigest = {
    product: 'forge',
    date,
    headline,
    bullets: [bullet],
    score: 0,
    links,
    degraded: true,
  }
  return NextResponse.json(body, {
    status: 200,
    headers: { 'cache-control': 'no-store' },
  })
}

export async function GET(): Promise<NextResponse> {
  const date = new Date().toISOString().slice(0, 10)
  const links: ReadonlyArray<DigestLink> = [
    { label: 'Run a scan', href: 'https://forge.bizlegal-ai.com/scan' },
    { label: 'Gap monitor', href: 'https://forge.bizlegal-ai.com/gap' },
  ]

  const supabase = getSupabase()
  if (!supabase) {
    return degradedResponse(
      date,
      links,
      'Digest unavailable — env missing',
      'NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_KEY not set on this deployment.',
    )
  }

  const { data, error } = await supabase
    .from('ops_events_24h_by_type')
    .select('event_type, count')
    .eq('source', 'forge')
    .order('count', { ascending: false })
    .limit(10)
  if (error) {
    console.error('[digest] ops_events_24h_by_type query failed:', error.message)
    return degradedResponse(
      date,
      links,
      'Digest unavailable — query failed',
      'ops_events_24h_by_type query failed on this deployment; see server logs.',
    )
  }
  const rows = (data ?? []) as OpsEventRow[]

  const signalRows = rows.filter((r) => SIGNAL_TYPES.has(r.event_type))
  const signalEvents = signalRows.reduce((acc, r) => acc + r.count, 0)

  const hasActivity = signalEvents > 0
  const headline = hasActivity
    ? `${signalEvents} Forge event${signalEvents > 1 ? 's' : ''} in the last 24h.`
    : 'Compliance Scanner — quiet day.'

  const bullets = hasActivity
    ? signalRows.slice(0, 4).map((r) => `${r.count}× ${r.event_type}`)
    : [
        'No new scans completed in the past 24 hours.',
        'Rule registry sync continues across 15 frameworks (GDPR, AML, MiCA, VARA, SEC, more).',
      ]

  const body: ProductDigest = {
    product: 'forge',
    date,
    headline,
    bullets,
    score: signalEvents,
    links,
  }

  return NextResponse.json(body, {
    status: 200,
    headers: {
      'cache-control': 'public, s-maxage=300, stale-while-revalidate=3600',
    },
  })
}
