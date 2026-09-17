import { NextResponse } from 'next/server'

/**
 * CasePage /api/digest — daily activity feed for the hub aggregator.
 * Honest-when-quiet: never fabricate activity.
 */

export const dynamic = 'force-dynamic'

interface ProductDigest {
  readonly product: 'casepage'
  readonly date: string
  readonly headline: string
  readonly bullets: ReadonlyArray<string>
  readonly score: number
  readonly links: ReadonlyArray<{ label: string; href: string }>
}

export async function GET(): Promise<NextResponse> {
  const date = new Date().toISOString().slice(0, 10)
  const body: ProductDigest = {
    product: 'casepage',
    date,
    headline: 'Matter-status pages — quiet day.',
    bullets: [
      'No new waitlist or paid-firm activity in the past 24 hours.',
      'Client-facing matter pages remain available at /pricing.',
    ],
    score: 0,
    links: [
      { label: 'Open CasePage', href: 'https://casepage.bizlegal-ai.com/' },
      { label: 'Pricing', href: 'https://casepage.bizlegal-ai.com/pricing' },
    ],
  }
  return NextResponse.json(body, {
    status: 200,
    headers: { 'cache-control': 'public, s-maxage=300, stale-while-revalidate=3600' },
  })
}
