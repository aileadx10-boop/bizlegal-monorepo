/**
 * Perplexity research client — the ONLY paid source, used strictly as
 * gap-fill when deterministic sources return fewer than 3 signals.
 *
 * Budget discipline (trio-wide $200/mo cap, PropSignal share ≤$30/mo):
 *   - Every (address → answer) pair is cached in Supabase; a cache hit
 *     costs $0. Cache TTL 90 days (public-record risk changes slowly).
 *   - The Audit Agent checks month-to-date spend before calling; when the
 *     budget is exhausted this source is skipped silently — deterministic
 *     sources always suffice for a valid report (see wf_audit_property.md).
 */

import type { RiskSignal } from '../score-engine'
import type { NormalizedAddress, SourceClient } from './types'

export const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions'

export function isResearchConfigured(): boolean {
  return Boolean(process.env.PERPLEXITY_API_KEY)
}

export async function researchProperty(
  _address: NormalizedAddress,
): Promise<RiskSignal[]> {
  throw new Error('not_implemented: build phase 3')
}

export const perplexityClient: SourceClient = {
  name: 'perplexity-research',
  fetchSignals: researchProperty,
}
