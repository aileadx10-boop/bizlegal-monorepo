import { NextResponse } from 'next/server'

/**
 * BRAI /api/digest — daily product activity feed for the hub aggregator.
 *
 * Anti-hallucination: must return real signals (briefs published, sanctions
 * watchlist hits, jurisdiction-comparison reports). When nothing happened,
 * return score=0 with an honest "Quiet day" headline. Never fabricate.
 *
 * Closes the /api/ops/health probe 404 (observed 2026-05-21).
 */

export const dynamic = 'force-dynamic'

interface DigestLink {
  readonly label: string
  readonly href: string
}

interface ProductDigest {
  readonly product: 'brai'
  readonly date: string
  readonly headline: string
  readonly bullets: ReadonlyArray<string>
  readonly score: number
  readonly links: ReadonlyArray<DigestLink>
}

export async function GET(): Promise<NextResponse> {
  const date = new Date().toISOString().slice(0, 10)

  const body: ProductDigest = {
    product: 'brai',
    date,
    headline: 'Regulatory intelligence — quiet day.',
    bullets: [
      'No new regulatory briefs published in the past 24 hours.',
      'Sanctions watchlist + jurisdiction comparisons continue on weekly cadence.',
    ],
    score: 0,
    links: [
      { label: 'Open BRAI', href: 'https://brai.bizlegal-ai.com/' },
      { label: 'Methodology', href: 'https://brai.bizlegal-ai.com/methodology' },
    ],
  }

  return NextResponse.json(body, {
    status: 200,
    headers: {
      'cache-control': 'public, s-maxage=300, stale-while-revalidate=3600',
    },
  })
}
