import { NextResponse } from 'next/server'
import { serviceSupabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

/**
 * GET /api/digest — daily product activity feed for the hub aggregator.
 * Mirrors the contract every other subdomain implements (e.g.
 * apps/tracr/app/api/digest/route.ts).
 *
 * Anti-hallucination: only emits real numbers from funnel_jobs.
 */
export async function GET(): Promise<NextResponse> {
  const date = new Date().toISOString().slice(0, 10)
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  let bullets: string[]
  let score: number
  let headline: string

  try {
    const supabase = serviceSupabase()
    const { count: uploads24h } = await supabase
      .from('funnel_jobs')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', since24h)
    const { count: paid24h } = await supabase
      .from('funnel_jobs')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'full_report_ready')
      .gte('paid_at', since24h)

    const u = uploads24h ?? 0
    const p = paid24h ?? 0
    score = p * 3 + u // weight paid sales 3× uploads
    headline = p > 0
      ? `Contract Risk Funnel — ${p} report${p === 1 ? '' : 's'} delivered.`
      : u > 0
        ? `Contract Risk Funnel — ${u} document${u === 1 ? '' : 's'} reviewed.`
        : 'Contract Risk Funnel — quiet day.'
    bullets = [
      `${u} document upload${u === 1 ? '' : 's'} in the last 24h`,
      `${p} paid report${p === 1 ? '' : 's'} delivered`,
      'PayPal-only checkout · $97 one-time',
    ]
  } catch {
    score = 0
    headline = 'Contract Risk Funnel — degraded (db unreachable).'
    bullets = ['Service env not yet configured.']
  }

  return NextResponse.json(
    {
      product: 'funnel-mvp',
      date,
      headline,
      bullets,
      score,
      links: [
        { label: 'Open Funnel', href: 'https://funnel.bizlegal-ai.com/' },
      ],
    },
    { status: 200, headers: { 'cache-control': 'public, s-maxage=300, stale-while-revalidate=3600' } },
  )
}
