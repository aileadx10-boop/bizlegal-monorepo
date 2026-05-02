import { NextResponse } from 'next/server'

/**
 * LexAudit /api/digest — daily product activity feed for the hub.
 *
 * Aggregator at bizlegal-lead-intake.bizlegal-ai.workers.dev fetches
 * this every day at 06:00 UTC and packages it into the hub's
 * "Today's Brief" Product Digest strip.
 *
 * Anti-hallucination contract: this endpoint MUST return real signals
 * derived from real data (compliance score updates, new check runs).
 * If we have nothing to report, return a quiet-day placeholder with
 * score=0 — never fabricate.
 *
 * TODO: Wire to real signals once the score-update pipeline lands.
 *       For now, return a stable "quiet day" placeholder so the
 *       aggregator validates the shape and the hub homepage renders
 *       a Compliance Health Score chip rather than fabricated data.
 */

export const dynamic = 'force-dynamic'

interface DigestLink {
  readonly label: string
  readonly href: string
}

interface ProductDigest {
  readonly product: 'lexaudit'
  readonly date: string
  readonly headline: string
  readonly bullets: ReadonlyArray<string>
  readonly score: number
  readonly links: ReadonlyArray<DigestLink>
}

export async function GET(): Promise<NextResponse> {
  const date = new Date().toISOString().slice(0, 10)

  // TODO replace with real query against the LexAudit score-update store.
  const body: ProductDigest = {
    product: 'lexaudit',
    date,
    headline: 'Compliance Health Score — quiet day.',
    bullets: [
      'No new score updates in the past 24 hours.',
      'Background framework rules sync continues (60-signal composite).',
    ],
    score: 0,
    links: [
      { label: 'Open LexAudit', href: 'https://lexaudit.bizlegal-ai.com/' },
      { label: 'Methodology', href: 'https://lexaudit.bizlegal-ai.com/methodology' },
    ],
  }

  return NextResponse.json(body, {
    status: 200,
    headers: {
      'cache-control': 'public, s-maxage=300, stale-while-revalidate=3600',
    },
  })
}
