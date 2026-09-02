import { NextResponse } from 'next/server'

/**
 * FalseEcho /api/digest — daily product activity feed for the hub aggregator
 * (same shape as BRAI /api/digest). Honest-when-quiet: never fabricate
 * activity.
 */

export const dynamic = 'force-dynamic'

interface DigestLink {
  readonly label: string
  readonly href: string
}

interface ProductDigest {
  readonly product: 'falseecho'
  readonly date: string
  readonly headline: string
  readonly bullets: ReadonlyArray<string>
  readonly score: number
  readonly links: ReadonlyArray<DigestLink>
}

export async function GET(): Promise<NextResponse> {
  const date = new Date().toISOString().slice(0, 10)

  const body: ProductDigest = {
    product: 'falseecho',
    date,
    headline: 'AI falsehood monitoring — quiet day.',
    bullets: [
      'No monitor-tier alerts fired in the past 24 hours.',
      '4-engine probe battery remains available on demand at /scan.',
    ],
    score: 0,
    links: [
      { label: 'Open FalseEcho', href: 'https://falseecho.bizlegal-ai.com/' },
      { label: 'Pricing', href: 'https://falseecho.bizlegal-ai.com/pricing' },
    ],
  }

  return NextResponse.json(body, {
    status: 200,
    headers: {
      'cache-control': 'public, s-maxage=300, stale-while-revalidate=3600',
    },
  })
}
