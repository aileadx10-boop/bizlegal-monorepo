/**
 * Fallback AI extraction: Minimax (Anthropic-compatible API).
 * Used only when Anthropic call fails. Same schema, same prompt.
 * Ported from services/funnel-mvp/src/ai/minimax-client.ts pattern.
 */

import { extractionSchema, type ExtractionResult } from './schema'

const DEFAULT_BASE_URL = 'https://api.minimaxi.chat/v1'
const DEFAULT_MODEL = 'MiniMax-M2'

const SYSTEM_PROMPT = `You are a legal-risk extractor for B2B contracts. Return STRICT JSON only with this schema:
{ "clauses": [], "anomalies": [], "missing_protections": [], "ambiguities": [], "overall_risk": "low"|"medium"|"high", "summary": str }
Each item: { "title": str, "detail": str, "severity": "low"|"medium"|"high" }. No prose, no backticks.`

export async function extractWithMinimax(documentText: string): Promise<ExtractionResult> {
  const apiKey = process.env.MINIMAX_API_KEY
  if (!apiKey) throw new Error('MINIMAX_API_KEY not configured (fallback unavailable)')
  const baseUrl = process.env.MINIMAX_BASE_URL ?? DEFAULT_BASE_URL
  const model = process.env.MINIMAX_MODEL ?? DEFAULT_MODEL

  const response = await fetch(`${baseUrl}/text/chatcompletion_v2`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Contract text:\n\n${documentText}` },
      ],
      max_tokens: 2500,
    }),
  })
  if (!response.ok) {
    throw new Error(`Minimax ${response.status}: ${(await response.text()).slice(0, 200)}`)
  }
  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>
  }
  const raw = data.choices?.[0]?.message?.content?.trim() ?? ''
  if (!raw) throw new Error('Minimax response was empty')
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim()
  return extractionSchema.parse(JSON.parse(cleaned))
}
