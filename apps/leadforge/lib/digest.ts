/**
 * LeadForge digest summariser — pure, no I/O.
 *
 * Mirrors apps/docai/web/app/api/digest/route.ts. Only the event types
 * LeadForge actually emits count as signal: `lead.qualified` (from
 * /api/free-audit and /api/decision-tree/lead) and `lead.inbound`
 * (allowed by lib/ops/log.ts). cron.* / error rows are noise and never
 * score, so the digest cannot inflate a quiet day.
 */

export const SIGNAL_TYPES: ReadonlySet<string> = new Set(['lead.inbound', 'lead.qualified'])

export interface OpsEventRow {
  readonly event_type: string
  readonly count: number
}

export interface DigestSummary {
  readonly headline: string
  readonly bullets: string[]
  readonly score: number
}

const QUIET_HEADLINE = 'Lead intelligence — quiet day.'
const QUIET_BULLETS: ReadonlyArray<string> = [
  'No new intent matches surfaced in the past 24 hours.',
  'Decision-tree lead capture remains live; reports generated on demand.',
]
const MAX_BULLETS = 4

export function summarizeLeadforgeDigest(rows: ReadonlyArray<OpsEventRow>): DigestSummary {
  const signalRows = rows.filter((r) => SIGNAL_TYPES.has(r.event_type))
  const score = signalRows.reduce((acc, r) => acc + r.count, 0)

  if (score === 0) {
    return { headline: QUIET_HEADLINE, bullets: [...QUIET_BULLETS], score: 0 }
  }

  return {
    headline: `${score} LeadForge lead event${score > 1 ? 's' : ''} in the last 24h.`,
    bullets: signalRows.slice(0, MAX_BULLETS).map((r) => `${r.count}× ${r.event_type}`),
    score,
  }
}
