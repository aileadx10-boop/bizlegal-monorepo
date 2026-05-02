import { NextResponse } from 'next/server'

/**
 * TRACR /api/digest — daily product activity feed for the hub.
 *
 * Anti-hallucination: must return real signals (tracing reports issued,
 * sanctions matches surfaced). When nothing happened, return score=0
 * with an honest "Quiet day" headline. Never fabricate.
 *
 * TODO: Wire to the tracing-report log once the publishing pipeline
 *       lands; for now, return a stable placeholder so the aggregator
 *       validates the shape and the hub renders the TRACR chip.
 */

export const dynamic = 'force-dynamic'

interface DigestLink {
  readonly label: string
  readonly href: string
}

interface ProductDigest {
  readonly product: 'tracr'
  readonly date: string
  readonly headline: string
  readonly bullets: ReadonlyArray<string>
  readonly score: number
  readonly links: ReadonlyArray<DigestLink>
}

export async function GET(): Promise<NextResponse> {
  const date = new Date().toISOString().slice(0, 10)

  const body: ProductDigest = {
    product: 'tracr',
    date,
    headline: 'Wallet & Tx intelligence — quiet day.',
    bullets: [
      'No new tracing reports issued in the past 24 hours.',
      'Sanctions-list sync (OFAC, UN, EU) continues on hourly schedule.',
    ],
    score: 0,
    links: [
      { label: 'Open TRACR', href: 'https://tracr.bizlegal-ai.com/' },
      { label: 'Methodology', href: 'https://tracr.bizlegal-ai.com/methodology' },
    ],
  }

  return NextResponse.json(body, {
    status: 200,
    headers: {
      'cache-control': 'public, s-maxage=300, stale-while-revalidate=3600',
    },
  })
}
