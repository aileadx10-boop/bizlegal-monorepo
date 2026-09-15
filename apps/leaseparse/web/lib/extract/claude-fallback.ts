/**
 * Claude fallback — high-accuracy extraction for the ~10% of leases
 * Hermes can't confidently abstract.
 *
 * COST GATE: this engine is capped at $80/mo (inside the trio's shared
 * budget) and the cap is ENFORCED, not documented — pass `budgetDb` and every
 * call reserves its worst-case cost against the leaseparse_llm_spend counter
 * before the request goes out (./llm-budget). It may ONLY be called when
 * shouldFallback() returns true, and every call must be ops-logged so
 * the Hermes prompt can be improved to shrink the fallback rate.
 *
 * Uses ANTHROPIC_API_KEY via @anthropic-ai/sdk directly, matching how every
 * other surface in this monorepo calls Claude (hub, docai, tracr, lexaudit) —
 * there is deliberately no bespoke LLM wrapper here.
 */

import Anthropic from '@anthropic-ai/sdk'
import type { SupabaseClient } from '@supabase/supabase-js'
import { coerceLeaseAbstract, parseModelJson } from './coerce'
import { EXTRACTION_PROMPT, scoreConfidence } from './hermes-first'
import {
  LlmBudgetExceededError,
  estimateCostUsd,
  reserveLlmSpend,
  resolveModel,
} from './llm-budget'
import type { ExtractionResult } from './types'

/** Hermes results at or above this confidence never reach Claude. */
export const CONFIDENCE_FLOOR = 0.85

export function shouldFallback(result: ExtractionResult): boolean {
  return result.engine === 'hermes' && result.confidence < CONFIDENCE_FLOOR
}

const MAX_TOKENS = 4_096
/**
 * Rough character cap on what we send. A commercial lease that overflows this
 * is truncated rather than silently costing a multiple of the per-parse budget.
 */
const MAX_INPUT_CHARS = 180_000

export interface ClaudeOptions {
  /** Defaults to process.env.ANTHROPIC_API_KEY. */
  apiKey?: string
  /** Defaults to `ANTHROPIC_MODEL ?? 'claude-sonnet-5'` (see ./llm-budget). */
  model?: string
  /**
   * Service-role client used to reserve this call's worst-case cost against the
   * $80/mo counter BEFORE the request goes out. Omitting it skips the reservation
   * and is for tests only — every production caller passes it, and the route
   * that forgets is the one that blows the budget.
   */
  budgetDb?: SupabaseClient
}

export async function extractWithClaude(
  text: string,
  opts: ClaudeOptions = {}
): Promise<ExtractionResult> {
  const apiKey = opts.apiKey ?? process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error('claude_unconfigured: ANTHROPIC_API_KEY missing')
  }
  if (text.trim().length === 0) {
    // Same guard as Hermes: an empty prompt yields a fabricated lease.
    throw new Error('claude_empty_input: refusing to extract from empty text')
  }

  const warnings: string[] = []
  let leaseText = text
  if (leaseText.length > MAX_INPUT_CHARS) {
    leaseText = leaseText.slice(0, MAX_INPUT_CHARS)
    warnings.push(`lease truncated to ${MAX_INPUT_CHARS} chars before Claude extraction`)
  }

  const model = resolveModel(opts.model)

  // Cost gate. Reserve first, call second — and if the reservation is refused,
  // no request is made at all. See ./llm-budget for why it fails closed.
  if (opts.budgetDb) {
    const estimateUsd = estimateCostUsd(model, leaseText.length + EXTRACTION_PROMPT.length, MAX_TOKENS)
    const decision = await reserveLlmSpend({ db: opts.budgetDb, usd: estimateUsd })
    if (!decision.allowed) {
      throw new LlmBudgetExceededError(decision, model, estimateUsd)
    }
  }

  const client = new Anthropic({ apiKey })
  const message = await client.messages.create({
    model,
    max_tokens: MAX_TOKENS,
    temperature: 0,
    system: EXTRACTION_PROMPT,
    messages: [
      { role: 'user', content: `--- LEASE TEXT ---\n${leaseText}` },
      // Prefilling the opening brace forces the model straight into the object
      // and removes the "Here is the JSON:" preamble that breaks parsing.
      { role: 'assistant', content: '{' },
    ],
  })

  const body = message.content
    .map(block => (block.type === 'text' ? block.text : ''))
    .join('')
    .trim()

  if (body.length === 0) {
    throw new Error('claude_empty_response')
  }

  // The prefilled '{' is not echoed back in the response, so restore it.
  const parsed = parseModelJson(body.startsWith('{') ? body : `{${body}`)
  if (parsed === null) {
    throw new Error('claude_unparseable_json')
  }

  const { abstract, warnings: coerceWarnings } = coerceLeaseAbstract(parsed)
  return {
    abstract,
    confidence: scoreConfidence(abstract),
    engine: 'claude',
    warnings: [...warnings, ...coerceWarnings],
  }
}
