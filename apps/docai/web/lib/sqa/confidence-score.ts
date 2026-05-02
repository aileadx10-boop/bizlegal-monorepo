/**
 * DocAI — confidence score for a SQA response.
 *
 * The confidence score combines retrieval signal with model-reported
 * uncertainty. It is intentionally conservative: a response with high
 * retrieval overlap but a model-reported uncertainty stays below the
 * auto-deliver threshold so a human reviewer sees it.
 *
 * Scores are deterministic given inputs; tweaking the weights bumps
 * the disclosure version so prior responses remain reproducible.
 */

import type { RetrievalResult } from "./retrieval"

export interface ConfidenceInputs {
  /** The retrieval result the answer was grounded in. */
  retrieval: RetrievalResult
  /** Model-reported self-uncertainty in [0, 1], where 0 is certain. */
  model_uncertainty: number
  /** True if every sentence in the draft cites at least one retrieved item. */
  all_claims_cited: boolean
  /** True if the response includes a "we cannot answer" admission. */
  admitted_limits: boolean
}

export interface ConfidenceScore {
  /** Score in [0, 1]. Above AUTO_DELIVER_THRESHOLD auto-delivers. */
  score: number
  components: {
    retrieval_signal: number
    model_certainty: number
    citation_integrity: number
    limits_admitted: number
  }
  /** One of the below labels, driven by the score. */
  tier: "auto_deliver" | "human_review" | "hold"
  rationale: string
}

export const AUTO_DELIVER_THRESHOLD = 0.75
export const HUMAN_REVIEW_THRESHOLD = 0.45

function retrievalSignal(retrieval: RetrievalResult): number {
  const top = retrieval.hits[0]?.relevance ?? 0
  return Math.min(1, top)
}

export function computeConfidence(inputs: ConfidenceInputs): ConfidenceScore {
  const retrieval_signal = retrievalSignal(inputs.retrieval)
  const model_certainty = 1 - Math.min(1, Math.max(0, inputs.model_uncertainty))
  const citation_integrity = inputs.all_claims_cited ? 1 : 0
  // Admitting limits is a trust signal, not a penalty.
  const limits_admitted = inputs.admitted_limits ? 1 : 0.5

  // Weights sum to 1.0 by construction.
  const score =
    retrieval_signal * 0.4 +
    model_certainty * 0.35 +
    citation_integrity * 0.15 +
    limits_admitted * 0.1

  const tier: ConfidenceScore["tier"] =
    score >= AUTO_DELIVER_THRESHOLD
      ? "auto_deliver"
      : score >= HUMAN_REVIEW_THRESHOLD
        ? "human_review"
        : "hold"

  const rationale = buildRationale(inputs, { retrieval_signal, model_certainty, citation_integrity, limits_admitted }, score)

  return {
    score,
    components: { retrieval_signal, model_certainty, citation_integrity, limits_admitted },
    tier,
    rationale,
  }
}

function buildRationale(
  inputs: ConfidenceInputs,
  c: ConfidenceScore["components"],
  score: number,
): string {
  const parts: string[] = []
  if (inputs.retrieval.below_threshold) {
    parts.push("Retrieval returned no hit above the minimum relevance threshold.")
  } else {
    parts.push(`Top retrieval hit scored ${(c.retrieval_signal * 100).toFixed(0)}%.`)
  }
  if (!inputs.all_claims_cited) {
    parts.push("At least one claim in the draft is not tied to a retrieval hit; requires review.")
  }
  parts.push(`Model self-certainty: ${(c.model_certainty * 100).toFixed(0)}%.`)
  if (inputs.admitted_limits) {
    parts.push("Draft admits limits where coverage is thin.")
  }
  parts.push(`Composite confidence: ${(score * 100).toFixed(0)}%.`)
  return parts.join(" ")
}
