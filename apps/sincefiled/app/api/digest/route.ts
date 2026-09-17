import { NextResponse } from 'next/server'

/**
 * SinceFiled /api/digest — daily activity feed for the hub aggregator.
 * Honest-when-quiet: never fabricate activity.
 */

export const dynamic = 'force-dynamic'

interface ProductDigest {
  readonly product: 'sincefiled'
  readonly date: string
  readonly headline: string
  readonly bullets: ReadonlyArray<string>
  readonly score: number
  readonly links: ReadonlyArray<{ label: string; href: string }>
}

export async function GET(): Promise<NextResponse> {
  const date = new Date().toISOString().slice(0, 10)
  const body: ProductDigest = {
    product: 'sincefiled',
    date,
    headline: 'Days-since tracker — quiet day.',
    bullets: [
      'No new obligation events in the past 24 hours.',
      'Predicted-due estimates remain an estimate, not a legal deadline.',
    ],
    score: 0,
    links: [
      { label: 'Open SinceFiled', href: 'https://sincefiled.bizlegal-ai.com/' },
      { label: 'Pricing', href: 'https://sincefiled.bizlegal-ai.com/pricing' },
    ],
  }
  return NextResponse.json(body, {
    status: 200,
    headers: { 'cache-control': 'public, s-maxage=300, stale-while-revalidate=3600' },
  })
}
