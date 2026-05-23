/**
 * Primary AI extraction: Claude Haiku 4.5.
 * Reuses the canonical model id from ~/.claude/rules/common/performance.md.
 * On Vercel functions (60s timeout), Haiku is fast enough for typical contracts.
 */

import Anthropic from '@anthropic-ai/sdk'
import { extractionSchema, type ExtractionResult } from './schema'

const MODEL_ID = 'claude-haiku-4-5-20251001'

const SYSTEM_PROMPT = `You are a legal-risk extractor for B2B contracts. You read a contract and return STRICT JSON with this schema:

{
  "clauses": [{ "title": str, "detail": str, "severity": "low"|"medium"|"high" }],
  "anomalies": [{ ... }],
  "missing_protections": [{ ... }],
  "ambiguities": [{ ... }],
  "overall_risk": "low"|"medium"|"high",
  "summary": str
}

Rules:
- Output ONLY a JSON object. No prose, no backticks, no commentary.
- Identify 3-10 clauses worth flagging; rank by severity.
- Anomalies = clauses that deviate from market standard.
- Missing protections = standard B2B clauses absent (e.g. mutual indemnity, IP carve-out, source-code escrow).
- Ambiguities = vague terms that create disputed interpretations.
- Overall risk = the highest-severity issue across all buckets.
- Summary = one paragraph (≤300 chars) Moses-grade plain-English assessment.
- Never invent facts. If the contract doesn't say something, don't say it does.`

let _client: Anthropic | null = null

function getClient(): Anthropic {
  if (_client) return _client
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured')
  _client = new Anthropic({ apiKey })
  return _client
}

export async function extractWithAnthropic(documentText: string): Promise<ExtractionResult> {
  const client = getClient()
  const response = await client.messages.create({
    model: MODEL_ID,
    max_tokens: 2500,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: `Contract text:\n\n${documentText}` }],
  })
  const raw = response.content
    .filter((c): c is Anthropic.TextBlock => c.type === 'text')
    .map((c) => c.text)
    .join('\n')
    .trim()

  const json = parseJsonLoosely(raw)
  return extractionSchema.parse(json)
}

/** Tolerates the rare case where Haiku wraps JSON in ```json ... ``` despite instructions. */
function parseJsonLoosely(raw: string): unknown {
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim()
  return JSON.parse(cleaned)
}
