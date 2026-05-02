import { NextResponse } from 'next/server'

/**
 * DocAI /api/digest — daily product activity feed for the hub.
 *
 * Anti-hallucination: must reflect real activity (contracts generated
 * via DocStack, security questionnaires answered via the SQA engine).
 * When nothing happened, return score=0 with a "Quiet day" headline.
 *
 * TODO: Wire to the contract-generation log + SQA engine output store
 *       once those land; for now, stable placeholder so the aggregator
 *       validates the shape.
 */

export const dynamic = 'force-dynamic'

interface DigestLink {
  readonly label: string
  readonly href: string
}

interface ProductDigest {
  readonly product: 'docai'
  readonly date: string
  readonly headline: string
  readonly bullets: ReadonlyArray<string>
  readonly score: number
  readonly links: ReadonlyArray<DigestLink>
}

export async function GET(): Promise<NextResponse> {
  const date = new Date().toISOString().slice(0, 10)

  const body: ProductDigest = {
    product: 'docai',
    date,
    headline: 'Contract & SQA intelligence — quiet day.',
    bullets: [
      'No new contracts generated in the past 24 hours.',
      'SQA engine clause library sync continues (SOC 2 / CAIQ / SIG-Lite).',
    ],
    score: 0,
    links: [
      { label: 'Open DocAI', href: 'https://docai.bizlegal-ai.com/' },
      { label: 'Methodology', href: 'https://docai.bizlegal-ai.com/methodology' },
    ],
  }

  return NextResponse.json(body, {
    status: 200,
    headers: {
      'cache-control': 'public, s-maxage=300, stale-while-revalidate=3600',
    },
  })
}
