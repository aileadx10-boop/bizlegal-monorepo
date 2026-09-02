/* ─── Triage: cheap local/heuristic scorer (spec §4) ───────────────────────
   Flags suspected falsehoods in engine responses. Heuristic only — it
   detects responses that associate the entity with defamation-shaped
   claims (fraud, lawsuits, sanctions…). Flagged items are then graded by
   Claude for confidence + a factual narrative. NO legal conclusions:
   output language is "this claim appears factually inaccurate", never
   "this is defamation". */

const SUSPICION_TERMS: readonly string[] = [
  'fraud', 'fraudulent', 'scam', 'ponzi', 'embezzl',
  'lawsuit', 'sued', 'suing', 'litigation against',
  'convicted', 'conviction', 'criminal charges', 'indicted', 'arrested',
  'sanctioned', 'disbarred', 'suspended license', 'license revoked',
  'shut down', 'bankrupt', 'bankruptcy', 'insolvent',
  'misleading', 'deceptive', 'untrustworthy', 'not trustworthy',
  'malpractice', 'misconduct', 'ethical violation',
  'complaint', 'charged with', 'under investigation',
  'avoid', 'do not recommend', 'poor reputation',
]

export interface TriageFlag {
  flagged: boolean
  terms: string[]
}

/**
 * Flag a response when it names the entity AND attaches suspicion terms.
 * Requiring the entity mention avoids flagging generic "what is fraud"
 * answers that never talk about the target.
 */
export function heuristicFlag(response: string, entity: string): TriageFlag {
  const text = response.toLowerCase()
  const name = entity.toLowerCase().trim()
  if (!name || !text.includes(name)) return { flagged: false, terms: [] }

  const terms = SUSPICION_TERMS.filter((t) => text.includes(t))
  return { flagged: terms.length > 0, terms }
}

export interface BatteryScoring {
  /** 0–100 exposure score: share of usable responses that flagged, scaled. */
  score: number
  flagsCount: number
  probedCount: number
  unavailableEngines: string[]
  failedEngines: string[]
}

/**
 * Combine per-engine probe results into the scan score (spec §4 "Triage").
 * Unavailable/error engines are excluded from the denominator so a missing
 * API key never fabricates a clean bill of health.
 */
export function combineResults(
  items: ReadonlyArray<{ engine: string; status: 'ok' | 'unavailable' | 'error'; flagged: boolean }>,
  allEngineIds: readonly string[],
): BatteryScoring {
  const unavailable = allEngineIds.filter((id) =>
    items.some((i) => i.engine === id && i.status === 'unavailable'),
  )
  const failed = allEngineIds.filter(
    (id) =>
      !unavailable.includes(id) &&
      items.some((i) => i.engine === id && i.status === 'error') &&
      !items.some((i) => i.engine === id && i.status === 'ok'),
  )

  const usable = items.filter((i) => i.status === 'ok')
  const flagsCount = usable.filter((i) => i.flagged).length
  const score = usable.length === 0 ? 0 : Math.min(100, Math.round((flagsCount / usable.length) * 100 * 2))

  return {
    score,
    flagsCount,
    probedCount: usable.length,
    unavailableEngines: unavailable,
    failedEngines: failed,
  }
}

export function exposureLabel(score: number): string {
  if (score >= 60) return 'High'
  if (score >= 30) return 'Moderate'
  if (score > 0) return 'Low'
  return 'No flags'
}
