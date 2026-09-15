import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { summarizeLeadforgeDigest, type OpsEventRow } from '@/lib/digest'

/**
 * LeadForge /api/digest — daily product activity feed for the hub aggregator.
 *
 * Anti-hallucination: reads real signals from the canonical ops_events
 * stream (HMAC-verified writes via hub /api/ops/log), filtered to this
 * surface. When nothing happened, returns score=0 with an honest
 * "Quiet day" headline. When the env or the query is unavailable it says
 * so (degraded: true) instead of pretending the day was quiet.
 *
 * Closes the /api/ops/health probe 404 (observed 2026-05-21).
 */

export const dynamic = 'force-dynamic'

interface DigestLink {
  readonly label: string
  readonly href: string
}

interface ProductDigest {
  readonly product: 'leadforge'
  readonly date: string
  readonly headline: string
  readonly bullets: ReadonlyArray<string>
  readonly score: number
  readonly links: ReadonlyArray<DigestLink>
  readonly degraded?: boolean
}

const LINKS: ReadonlyArray<DigestLink> = [
  { label: 'Open LeadForge', href: 'https://leadforge.bizlegal-ai.com/' },
]

function getSupabase() {
  try {
    return createServerSupabaseClient()
  } catch {
    return null
  }
}

function degradedDigest(date: string, headline: string, detail: string): NextResponse {
  const body: ProductDigest = {
    product: 'leadforge',
    date,
    headline,
    bullets: [detail],
    score: 0,
    degraded: true,
    links: LINKS,
  }

  return NextResponse.json(body, {
    status: 200,
    headers: { 'cache-control': 'no-store' },
  })
}

export async function GET(): Promise<NextResponse> {
  const date = new Date().toISOString().slice(0, 10)

  const supabase = getSupabase()
  if (!supabase) {
    return degradedDigest(
      date,
      'Digest unavailable — env missing',
      'NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_KEY not set on this deployment.',
    )
  }

  const { data, error } = await supabase
    .from('ops_events_24h_by_type')
    .select('event_type, count')
    .eq('source', 'leadforge')
    .order('count', { ascending: false })
    .limit(10)

  if (error) {
    return degradedDigest(
      date,
      'Digest unavailable — query failed',
      'ops_events_24h_by_type returned an error for source=leadforge; check Supabase logs.',
    )
  }

  const summary = summarizeLeadforgeDigest((data ?? []) as OpsEventRow[])

  const body: ProductDigest = {
    product: 'leadforge',
    date,
    ...summary,
    links: LINKS,
  }

  return NextResponse.json(body, {
    status: 200,
    headers: {
      'cache-control': 'public, s-maxage=300, stale-while-revalidate=3600',
    },
  })
}
