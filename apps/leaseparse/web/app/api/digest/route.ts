import { NextResponse } from 'next/server'

/**
 * LeaseParse /api/digest — daily activity feed for the hub aggregator.
 * Honest-when-quiet: never fabricate activity.
 */

export const dynamic = 'force-dynamic'

interface ProductDigest {
  readonly product: 'leaseparse'
  readonly date: string
  readonly headline: string
  readonly bullets: ReadonlyArray<string>
  readonly score: number
  readonly links: ReadonlyArray<{ label: string; href: string }>
}

export async function GET(): Promise<NextResponse> {
  const date = new Date().toISOString().slice(0, 10)
  const body: ProductDigest = {
    product: 'leaseparse',
    date,
    headline: 'Lease abstracts — quiet day.',
    bullets: [
      'No new abstracts delivered in the past 24 hours.',
      'Checkout stays dark until leaseparse_credits exists and LEASEPARSE_CHECKOUT_LIVE is set.',
    ],
    score: 0,
    links: [
      { label: 'Open LeaseParse', href: 'https://leaseparse.bizlegal-ai.com/' },
    ],
  }
  return NextResponse.json(body, {
    status: 200,
    headers: { 'cache-control': 'public, s-maxage=300, stale-while-revalidate=3600' },
  })
}
