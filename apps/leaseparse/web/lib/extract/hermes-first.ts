/**
 * Hermes-first extraction — local Ollama, $0 marginal cost.
 *
 * Strategy: POST to `${OLLAMA_BASE_URL}/api/generate` with
 * `format: 'json'` and EXTRACTION_PROMPT + the lease text, then parse
 * the response into a LeaseAbstract and score completeness
 * deterministically. Claude is consulted only when
 * shouldFallback() in claude-fallback.ts says the score is too low.
 *
 * Untrusted model JSON is narrowed into a LeaseAbstract by ./coerce —
 * nothing here trusts the shape of what the model returns.
 */

import { coerceLeaseAbstract, parseModelJson } from './coerce'
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

/** Ollama can be slow on a long lease; below this we'd rather fail to Claude. */
const HERMES_TIMEOUT_MS = 240_000

interface OllamaGenerateResponse {
  response?: string
  error?: string
}

async function callOllama(
  baseUrl: string,
  model: string,
  prompt: string,
  signal: AbortSignal
): Promise<string> {
  const res = await fetch(`${baseUrl.replace(/\/+$/, '')}/api/generate`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      // Cloudflare in front of the Hetzner box 1010s requests with no UA.
      'user-agent': 'bizlegal-leaseparse/1.0',
    },
    body: JSON.stringify({
      model,
      prompt,
      format: 'json',
      stream: false,
      options: { temperature: 0 },
    }),
    signal,
  })

  if (!res.ok) {
    throw new Error(`hermes_http_${res.status}`)
  }

  const payload = (await res.json()) as OllamaGenerateResponse
  if (payload.error) throw new Error(`hermes_error: ${payload.error}`)
  const body = payload.response ?? ''
  if (body.trim().length === 0) throw new Error('hermes_empty_response')
  return body
}

/**
 * One repair round-trip. The model is shown its own malformed output and asked
 * for the object again — cheaper and far more reliable than re-reading the
 * whole lease, and it caps the blast radius of a bad generation at two calls.
 */
function repairPrompt(broken: string): string {
  return `The following was supposed to be a single JSON object matching the lease-abstract schema, but it did not parse.
Return ONLY the corrected JSON object. No prose, no code fences, no explanation.

${broken.slice(0, 8_000)}`
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
  if (text.trim().length === 0) {
    // Defence in depth — extractPdfText already refuses empty documents, and an
    // empty prompt makes an LLM confidently invent an entire lease.
    throw new Error('hermes_empty_input: refusing to extract from empty text')
  }

  const warnings: string[] = []
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), HERMES_TIMEOUT_MS)

  try {
    const raw = await callOllama(
      baseUrl,
      model,
      `${EXTRACTION_PROMPT}\n\n--- LEASE TEXT ---\n${text}`,
      controller.signal
    )

    let parsed = parseModelJson(raw)
    if (parsed === null) {
      warnings.push('hermes returned malformed JSON; attempted one repair pass')
      const repaired = await callOllama(baseUrl, model, repairPrompt(raw), controller.signal)
      parsed = parseModelJson(repaired)
      if (parsed === null) {
        throw new Error('hermes_unparseable_json: repair pass also failed')
      }
    }

    const { abstract, warnings: coerceWarnings } = coerceLeaseAbstract(parsed)
    return {
      abstract,
      confidence: scoreConfidence(abstract),
      engine: 'hermes',
      warnings: [...warnings, ...coerceWarnings],
    }
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error(`hermes_timeout: no response in ${HERMES_TIMEOUT_MS}ms`)
    }
    throw err
  } finally {
    clearTimeout(timer)
  }
}
