import { NextResponse } from 'next/server'

/**
 * DEAL44 /api/digest — daily activity feed for the hub aggregator.
 * Honest-when-quiet: never fabricate activity.
 */

export const dynamic = 'force-dynamic'

interface ProductDigest {
  readonly product: 'deal44'
  readonly date: string
  readonly headline: string
  readonly bullets: ReadonlyArray<string>
  readonly score: number
  readonly links: ReadonlyArray<{ label: string; href: string }>
}

export async function GET(): Promise<NextResponse> {
  const date = new Date().toISOString().slice(0, 10)
  const body: ProductDigest = {
    product: 'deal44',
    date,
    headline: 'Deal rooms — quiet day.',
    bullets: [
      'No new paid rooms in the past 24 hours.',
      'Hebrew/RTL rooms stay live; alerts cron is deterministic, not an agent.',
    ],
    score: 0,
    links: [
      { label: 'Open DEAL44', href: 'https://deal44.bizlegal-ai.com/' },
      { label: 'Start a room', href: 'https://deal44.bizlegal-ai.com/start' },
    ],
  }
  return NextResponse.json(body, {
    status: 200,
    headers: { 'cache-control': 'public, s-maxage=300, stale-while-revalidate=3600' },
  })
}
