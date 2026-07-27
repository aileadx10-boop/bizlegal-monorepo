/**
 * Hermes-first extraction — local Ollama, $0 marginal cost.
 *
 * Strategy: POST to `${OLLAMA_BASE_URL}/api/generate` with
 * `format: 'json'` and EXTRACTION_PROMPT + the lease text, then parse
 * the response into a LeaseAbstract and score completeness
 * deterministically. Claude is consulted only when
 * shouldFallback() in claude-fallback.ts says the score is too low.
 *
 * Implementation lands in trio build phase 2 (LeaseParse). The
 * signatures, prompt template, and confidence scorer below are the
 * stable contract the route handlers already compile against.
 */

import type { ExtractionResult, LeaseAbstract } from './types'

export interface HermesOptions {
  /** Defaults to process.env.OLLAMA_BASE_URL. */
  baseUrl?: string
  /** Defaults to 'hermes3'. */
  model?: string
}

export const EXTRACTION_PROMPT = `You are a commercial lease abstractor.
Read the lease text and return ONLY a JSON object with this exact shape:
{
  "parties": { "landlord": "", "tenant": "", "guarantor": "" },
  "premises": { "address": "", "city": "", "state": "", "square_feet": 0, "suite": "" },
  "term": { "commencement": "YYYY-MM-DD", "expiration": "YYYY-MM-DD", "renewal_options": "" },
  "financial": { "base_rent_cents": 0, "escalations": [], "cam": "", "percentage_rent": "", "security_deposit_cents": 0 },
  "critical_dates": [ { "key": "", "label": "", "date": "YYYY-MM-DD", "notice_window_days": 0 } ],
  "risk_flags": [ { "clause": "co_tenancy|go_dark|assignment_restriction|exclusive_use|relocation|demolition", "excerpt": "", "severity": "info|warn|high" } ]
}
Use empty strings / omit optional fields when the lease is silent.
Quote risk_flag excerpts verbatim. Never invent dates.`

/**
 * Deterministic completeness score: fraction of required fields present.
 * Not an LLM judgment — the same abstract always scores the same.
 */
export function scoreConfidence(abstract: LeaseAbstract): number {
  const checks: boolean[] = [
    abstract.parties.landlord.length > 0,
    abstract.parties.tenant.length > 0,
    abstract.premises.address.length > 0,
    abstract.premises.state.length > 0,
    /^\d{4}-\d{2}-\d{2}$/.test(abstract.term.commencement),
    /^\d{4}-\d{2}-\d{2}$/.test(abstract.term.expiration),
    abstract.financial.base_rent_cents > 0,
    abstract.critical_dates.length > 0,
  ]
  const passed = checks.filter(Boolean).length
  return passed / checks.length
}

export async function extractWithHermes(
  text: string,
  opts: HermesOptions = {}
): Promise<ExtractionResult> {
  const baseUrl = opts.baseUrl ?? process.env.OLLAMA_BASE_URL
  const model = opts.model ?? 'hermes3'
  if (!baseUrl) {
    throw new Error('hermes_unconfigured: OLLAMA_BASE_URL missing')
  }
  void text
  void model
  throw new Error('not_implemented: build phase 2')
}
