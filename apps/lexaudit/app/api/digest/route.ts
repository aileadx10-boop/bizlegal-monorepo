import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

/**
 * LexAudit /api/digest — daily product activity feed for the hub.
 *
 * Aggregator at bizlegal-lead-intake.bizlegal-ai.workers.dev fetches
 * this every day at 06:00 UTC and packages it into the hub's
 * "Today's Brief" Product Digest strip.
 *
 * Anti-hallucination contract: this endpoint MUST return real signals
 * derived from real data (compliance score updates, new check runs).
 * If we have nothing to report, return a quiet-day placeholder with
 * score=0 — never fabricate.
 *
 * TODO: Wire to real signals once the score-update pipeline lands.
 *       For now, return a stable "quiet day" placeholder so the
 *       aggregator validates the shape and the hub homepage renders
 *       a Compliance Health Score chip rather than fabricated data.
 */

export const dynamic = 'force-dynamic'

interface DigestLink {
  readonly label: string
  readonly href: string
}

interface ProductDigest {
  readonly product: 'lexaudit'
  readonly date: string
  readonly headline: string
  readonly bullets: ReadonlyArray<string>
  readonly score: number
  readonly links: ReadonlyArray<DigestLink>
}

export async function GET(): Promise<NextResponse> {
  const date = new Date().toISOString().slice(0, 10)
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  let activeSubscribers = 0
  let recentChanges = 0
  let changedFrameworks: string[] = []

  const supabase = getSupabase()
  if (supabase) {
    const [subsResult, changesResult] = await Promise.all([
      supabase
        .from('compliance_subs')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active'),
      supabase
        .from('compliance_framework_index')
        .select('framework_id')
        .eq('is_change', true)
        .gte('fetched_at', since),
    ])

    activeSubscribers = subsResult.count ?? 0
    if (changesResult.data) {
      changedFrameworks = Array.from(new Set(changesResult.data.map((r) => r.framework_id as string)))
      recentChanges = changedFrameworks.length
    }
  }

  const hasChanges = recentChanges > 0
  const headline = hasChanges
    ? `${recentChanges} framework${recentChanges > 1 ? 's' : ''} updated in the last 24h: ${changedFrameworks.join(', ')}.`
    : 'Compliance Health Score — quiet day.'

  const bullets = hasChanges
    ? [
        `${recentChanges} regulatory framework${recentChanges > 1 ? 's' : ''} changed: ${changedFrameworks.join(', ')}.`,
        `${activeSubscribers} active monitor${activeSubscribers !== 1 ? 's' : ''} will receive email alerts.`,
      ]
    : [
        'No new framework updates in the past 24 hours.',
        `${activeSubscribers} active monitor${activeSubscribers !== 1 ? 's' : ''} — background sync continues.`,
      ]

  const body: ProductDigest = {
    product: 'lexaudit',
    date,
    headline,
    bullets,
    score: activeSubscribers,
    links: [
      { label: 'Open LexAudit', href: 'https://lexaudit.bizlegal-ai.com/' },
      { label: 'Methodology', href: 'https://lexaudit.bizlegal-ai.com/methodology' },
    ],
  }

  return NextResponse.json(body, {
    status: 200,
    headers: {
      'cache-control': 'public, s-maxage=300, stale-while-revalidate=3600',
    },
  })
}
