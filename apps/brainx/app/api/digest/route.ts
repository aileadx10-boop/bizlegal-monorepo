import { NextResponse } from 'next/server'

/**
 * BrainX /api/digest — daily activity feed for the hub aggregator.
 * Honest-when-quiet: never fabricate activity.
 */

export const dynamic = 'force-dynamic'

interface ProductDigest {
  readonly product: 'brainx'
  readonly date: string
  readonly headline: string
  readonly bullets: ReadonlyArray<string>
  readonly score: number
  readonly links: ReadonlyArray<{ label: string; href: string }>
}

export async function GET(): Promise<NextResponse> {
  const date = new Date().toISOString().slice(0, 10)
  const body: ProductDigest = {
    product: 'brainx',
    date,
    headline: 'Opportunity radar — quiet day.',
    bullets: [
      'No new subscriber activity in the past 24 hours.',
      'Weekly radar is operator-run; next run lands as a scored shortlist, not a 24/7 feed.',
    ],
    score: 0,
    links: [
      { label: 'Open BrainX', href: 'https://brainx.bizlegal-ai.com/' },
      { label: 'Sample radar', href: 'https://brainx.bizlegal-ai.com/sample' },
    ],
  }
  return NextResponse.json(body, {
    status: 200,
    headers: { 'cache-control': 'public, s-maxage=300, stale-while-revalidate=3600' },
  })
}
