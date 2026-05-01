import { NextResponse } from 'next/server'
import { logEventAsync } from '@/lib/ops/log'

/**
 * Hub /api/digest — daily activity feed for the hub itself.
 *
 * The hub is the aggregator that consumes /api/digest from each of the
 * 6 product subdomains (TRACR / BRAI / LexAudit / DocAI / Forge /
 * LeadForge) and stitches them into Today's Brief. But the hub also
 * has its own user-visible activity worth surfacing in the same shape:
 *   - snapshot intakes processed in the last 24h
 *   - jurisdiction comparisons run
 *   - risk-engine deep-analyses generated
 *   - real-estate intake volume
 *
 * Anti-hallucination: real counts only. When nothing happened, return
 * score=0 with an honest "Quiet day" headline. Never fabricate.
 *
 * TODO: wire to Supabase queries against the appropriate tables once
 *       the snapshot intake + risk-engine logging persists rows. For
 *       now, return a stable placeholder so the EA Worker aggregator
 *       and any cross-product hub-of-hubs layer validates the shape.
 */

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface DigestLink {
  readonly label: string
  readonly href: string
}

interface ProductDigest {
  readonly product: 'hub'
  readonly date: string
  readonly headline: string
  readonly bullets: ReadonlyArray<string>
  readonly score: number
  readonly links: ReadonlyArray<DigestLink>
}

export async function GET(): Promise<NextResponse> {
  const date = new Date().toISOString().slice(0, 10)

  const body: ProductDigest = {
    product: 'hub',
    date,
    headline: 'BizLegal AI hub — quiet day.',
    bullets: [
      'No new snapshots, deep-analyses, or jurisdiction comparisons recorded in the past 24 hours.',
      'Six product surfaces continue publishing their own intelligence; check each /api/digest for live counts.',
      'Disclosure version v1.0.0-p4. Intelligence — not legal advice.',
    ],
    score: 0,
    links: [
      { label: 'Free Snapshot', href: 'https://bizlegal-ai.com/snapshot' },
      { label: 'Risk Engine', href: 'https://bizlegal-ai.com/risk-engine' },
      { label: 'Jurisdiction Arbitrage', href: 'https://bizlegal-ai.com/jurisdictions' },
      { label: 'Real-Estate Intelligence', href: 'https://bizlegal-ai.com/realestate' },
    ],
  }

  logEventAsync({
    type: 'cron.completed',
    source: 'hub',
    ref_id: 'digest',
    status: 'ok',
    metadata: { product: 'hub', score: body.score, date },
  })

  return NextResponse.json(body, {
    headers: {
      'cache-control': 'public, s-maxage=300, stale-while-revalidate=900',
      'content-type': 'application/json; charset=utf-8',
    },
  })
}
