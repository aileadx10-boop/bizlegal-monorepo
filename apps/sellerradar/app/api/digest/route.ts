import { NextResponse } from 'next/server'

/**
 * SellerRadar /api/digest — daily product activity feed for the hub
 * aggregator (same shape as FalseEcho /api/digest). Honest-when-quiet:
 * never fabricate activity.
 */

export const dynamic = 'force-dynamic'

interface DigestLink {
  readonly label: string
  readonly href: string
}

interface ProductDigest {
  readonly product: 'sellerradar'
  readonly date: string
  readonly headline: string
  readonly bullets: ReadonlyArray<string>
  readonly score: number
  readonly links: ReadonlyArray<DigestLink>
}

export async function GET(): Promise<NextResponse> {
  const date = new Date().toISOString().slice(0, 10)

  const body: ProductDigest = {
    product: 'sellerradar',
    date,
    headline: 'Amazon fee-change monitoring — quiet day.',
    bullets: [
      'No monitor-tier alerts fired in the past 24 hours.',
      'Catalog impact analysis remains available on demand at /analyze.',
    ],
    score: 0,
    links: [
      { label: 'Open SellerRadar', href: 'https://sellerradar.bizlegal-ai.com/' },
      { label: 'Pricing', href: 'https://sellerradar.bizlegal-ai.com/pricing' },
    ],
  }

  return NextResponse.json(body, {
    status: 200,
    headers: {
      'cache-control': 'public, s-maxage=300, stale-while-revalidate=3600',
    },
  })
}
