/**
 * Claude fallback — high-accuracy extraction for the ~10% of leases
 * Hermes can't confidently abstract.
 *
 * COST GATE: this engine is budgeted at ≤$80/mo (inside the trio's
 * shared $100/mo Claude budget). It may ONLY be called when
 * shouldFallback() returns true, and every call must be ops-logged so
 * the Hermes prompt can be improved to shrink the fallback rate.
 *
 * Uses ANTHROPIC_API_KEY via @anthropic-ai/sdk directly, matching how every
 * other surface in this monorepo calls Claude (hub, docai, tracr, lexaudit) —
 * there is deliberately no bespoke LLM wrapper here.
 */

import Anthropic from '@anthropic-ai/sdk'
import { coerceLeaseAbstract, parseModelJson } from './coerce'
import { EXTRACTION_PROMPT, scoreConfidence } from './hermes-first'
import type { ExtractionResult } from './types'

/** Hermes results at or above this confidence never reach Claude. */
export const CONFIDENCE_FLOOR = 0.85

export function shouldFallback(result: ExtractionResult): boolean {
  return result.engine === 'hermes' && result.confidence < CONFIDENCE_FLOOR
}

/** Haiku, not Sonnet — the cost gate is the whole point of this module. */
const CLAUDE_MODEL = 'claude-3-5-haiku-20241022'
const MAX_TOKENS = 4_096
/**
 * Rough character cap on what we send. A commercial lease that overflows this
 * is truncated rather than silently costing a multiple of the per-parse budget.
 */
const MAX_INPUT_CHARS = 180_000

export interface ClaudeOptions {
  /** Defaults to process.env.ANTHROPIC_API_KEY. */
  apiKey?: string
  model?: string
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

  const client = new Anthropic({ apiKey })
  const message = await client.messages.create({
    model: opts.model ?? CLAUDE_MODEL,
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
