/**
 * Claude fallback — high-accuracy extraction for the ~10% of leases
 * Hermes can't confidently abstract.
 *
 * COST GATE: this engine is budgeted at ≤$80/mo (inside the trio's
 * shared $100/mo Claude budget). It may ONLY be called when
 * shouldFallback() returns true, and every call must be ops-logged so
 * the Hermes prompt can be improved to shrink the fallback rate.
 *
 * Implementation lands in trio build phase 2 (uses ANTHROPIC_API_KEY
 * via @anthropic-ai/sdk, added as a dependency at that point).
 */

import type { ExtractionResult } from './types'

/** Hermes results at or above this confidence never reach Claude. */
export const CONFIDENCE_FLOOR = 0.85

export function shouldFallback(result: ExtractionResult): boolean {
  return result.engine === 'hermes' && result.confidence < CONFIDENCE_FLOOR
}

export async function extractWithClaude(text: string): Promise<ExtractionResult> {
  void text
  throw new Error('not_implemented: build phase 2')
}
