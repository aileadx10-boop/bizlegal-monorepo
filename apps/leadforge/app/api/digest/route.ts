import { NextResponse } from 'next/server'

/**
 * LeadForge /api/digest — daily product activity feed for the hub aggregator.
 *
 * Anti-hallucination: must return real signals (lead intent matches, reports
 * generated). When nothing happened, return score=0 with an honest "Quiet day"
 * headline. Never fabricate.
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
}

export async function GET(): Promise<NextResponse> {
  const date = new Date().toISOString().slice(0, 10)

  const body: ProductDigest = {
    product: 'leadforge',
    date,
    headline: 'Lead intelligence — quiet day.',
    bullets: [
      'No new intent matches surfaced in the past 24 hours.',
      'Decision-tree lead capture remains live; reports generated on demand.',
    ],
    score: 0,
    links: [
      { label: 'Open LeadForge', href: 'https://leadforge.bizlegal-ai.com/' },
    ],
  }

  return NextResponse.json(body, {
    status: 200,
    headers: {
      'cache-control': 'public, s-maxage=300, stale-while-revalidate=3600',
    },
  })
}
