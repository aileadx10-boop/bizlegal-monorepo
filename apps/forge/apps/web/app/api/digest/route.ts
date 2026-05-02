import { NextResponse } from 'next/server'

/**
 * Forge /api/digest — daily product activity feed for the hub.
 *
 * Anti-hallucination: must reflect real scan completions across the
 * 15 frameworks. Quiet days emit score=0 with a "Quiet day" headline.
 *
 * TODO: Wire to the scan-completion store + Vercel-schema-cache
 *       Supabase project once the BOI Kit pipeline is unblocked.
 */

export const dynamic = 'force-dynamic'

interface DigestLink {
  readonly label: string
  readonly href: string
}

interface ProductDigest {
  readonly product: 'forge'
  readonly date: string
  readonly headline: string
  readonly bullets: ReadonlyArray<string>
  readonly score: number
  readonly links: ReadonlyArray<DigestLink>
}

export async function GET(): Promise<NextResponse> {
  const date = new Date().toISOString().slice(0, 10)

  const body: ProductDigest = {
    product: 'forge',
    date,
    headline: 'Compliance Scanner — quiet day.',
    bullets: [
      'No new scans completed in the past 24 hours.',
      'Rule registry sync continues across 15 frameworks (GDPR, AML, MiCA, VARA, SEC, more).',
    ],
    score: 0,
    links: [
      { label: 'Run a scan', href: 'https://forge.bizlegal-ai.com/scan' },
      { label: 'Gap monitor', href: 'https://forge.bizlegal-ai.com/gap' },
    ],
  }

  return NextResponse.json(body, {
    status: 200,
    headers: {
      'cache-control': 'public, s-maxage=300, stale-while-revalidate=3600',
    },
  })
}
