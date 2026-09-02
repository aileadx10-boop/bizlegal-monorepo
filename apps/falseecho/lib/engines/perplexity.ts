/* Perplexity probe — OpenAI-compatible Chat Completions API. */

import {
  EngineAdapter,
  EngineProbeRequest,
  EngineProbeResult,
  unavailableResult,
  errorResult,
  fetchWithTimeout,
} from './types'

export const perplexityEngine: EngineAdapter = {
  id: 'perplexity',
  displayName: 'Perplexity',
  envKey: 'PERPLEXITY_API_KEY',

  isConfigured() {
    return Boolean(process.env.PERPLEXITY_API_KEY)
  },

  async probe(req: EngineProbeRequest): Promise<EngineProbeResult> {
    if (!this.isConfigured()) return unavailableResult(this.id, this.envKey)
    const started = Date.now()
    try {
      const res = await fetchWithTimeout('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: process.env.PERPLEXITY_MODEL ?? 'sonar',
          messages: [{ role: 'user', content: req.prompt }],
          max_tokens: 400,
          temperature: 0,
        }),
      })
      if (!res.ok) {
        return errorResult(this.id, new Error(`perplexity_http_${res.status}`), Date.now() - started)
      }
      const data = await res.json()
      const text: string = data?.choices?.[0]?.message?.content ?? ''
      if (!text) return errorResult(this.id, new Error('perplexity_empty_response'), Date.now() - started)
      return { engine: this.id, status: 'ok', response: text, latencyMs: Date.now() - started }
    } catch (err) {
      return errorResult(this.id, err, Date.now() - started)
    }
  },
}
