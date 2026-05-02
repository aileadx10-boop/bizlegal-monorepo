/**
 * DocAI — draft composer.
 *
 * Produces a SqaDraft from a retrieval result and a generation
 * callable. Every paragraph in the draft cites the retrieval hit(s)
 * it was grounded on. If retrieval is below threshold, the draft
 * must admit limits rather than hallucinate — the compose function
 * enforces this by emitting the canonical limits response when the
 * retrieval flag is set.
 *
 * Generation itself is pluggable via the GenerateCallable interface.
 * A production adapter wraps the Anthropic SDK; a test adapter
 * returns a deterministic string for fixtures.
 */

import { DISCLAIMER_VERSION, disclaimerStamp } from "@/lib/legal/disclaimer"
import type { RetrievalResult } from "./retrieval"
import { computeConfidence, type ConfidenceScore } from "./confidence-score"

export interface GenerateCallable {
  (input: { query: string; context: string[] }): Promise<{
    text: string
    uncertainty: number
  }>
}

export interface DraftCitation {
  item_id: string
  source_name: string
  source_url: string
  matched_terms: string[]
}

export interface SqaDraft {
  draft_id: string
  query: string
  answer: string
  citations: DraftCitation[]
  confidence: ConfidenceScore
  disclaimer_version: string
  issued_at: string
  /** True if the draft took the canonical "out of scope" path. */
  out_of_scope: boolean
}

const OUT_OF_SCOPE_TEMPLATE =
  "The DocAI knowledge base does not contain enough relevant material to answer this question with confidence. Rather than fabricate a response, the draft is held for a human reviewer. If the question sits in a framework we cover (see the Methodology page), we will source the material and respond; otherwise the question may sit outside our coverage."

export async function compose(
  retrieval: RetrievalResult,
  generate: GenerateCallable,
): Promise<SqaDraft> {
  const stamp = disclaimerStamp()

  if (retrieval.below_threshold) {
    const confidence = computeConfidence({
      retrieval,
      model_uncertainty: 1,
      all_claims_cited: true,
      admitted_limits: true,
    })
    return {
      draft_id: `draft-oos:${stamp.issued_at}`,
      query: retrieval.query.text,
      answer: OUT_OF_SCOPE_TEMPLATE,
      citations: [],
      confidence,
      disclaimer_version: stamp.disclaimer_version,
      issued_at: stamp.issued_at,
      out_of_scope: true,
    }
  }

  const context = retrieval.hits.map((h) => `[${h.item.source_name}] ${h.item.text}`)
  const generated = await generate({ query: retrieval.query.text, context })

  const citations: DraftCitation[] = retrieval.hits.map((h) => ({
    item_id: h.item.id,
    source_name: h.item.source_name,
    source_url: h.item.source_url,
    matched_terms: h.matched_terms,
  }))

  // Heuristic: if the answer references at least one source token, we
  // treat it as cited. A stricter check can be wired later.
  const lowered = generated.text.toLowerCase()
  const all_claims_cited = citations.some((c) =>
    c.matched_terms.some((t) => lowered.includes(t.toLowerCase())),
  )

  const admitted_limits =
    /\b(unsure|uncertain|out of scope|insufficient|we do not know|cannot confirm)\b/i.test(
      generated.text,
    )

  const confidence = computeConfidence({
    retrieval,
    model_uncertainty: generated.uncertainty,
    all_claims_cited,
    admitted_limits,
  })

  return {
    draft_id: `draft:${stamp.issued_at}`,
    query: retrieval.query.text,
    answer: generated.text,
    citations,
    confidence,
    disclaimer_version: stamp.disclaimer_version,
    issued_at: stamp.issued_at,
    out_of_scope: false,
  }
}

export function serializeDraft(draft: SqaDraft): string {
  return JSON.stringify(
    {
      ...draft,
      _stamp: { disclaimer_version: DISCLAIMER_VERSION, schema: "docai.sqa.draft.v1" },
    },
    null,
    2,
  )
}
