/* ChatGPT probe — OpenAI Chat Completions API. */

import {
  EngineAdapter,
  EngineProbeRequest,
  EngineProbeResult,
  unavailableResult,
  errorResult,
  fetchWithTimeout,
} from './types'

export const chatgptEngine: EngineAdapter = {
  id: 'chatgpt',
  displayName: 'ChatGPT (OpenAI)',
  envKey: 'OPENAI_API_KEY',

  isConfigured() {
    return Boolean(process.env.OPENAI_API_KEY)
  },

  async probe(req: EngineProbeRequest): Promise<EngineProbeResult> {
    if (!this.isConfigured()) return unavailableResult(this.id, this.envKey)
    const started = Date.now()
    try {
      const res = await fetchWithTimeout('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
          messages: [{ role: 'user', content: req.prompt }],
          max_tokens: 400,
          temperature: 0,
        }),
      })
      if (!res.ok) {
        return errorResult(this.id, new Error(`openai_http_${res.status}`), Date.now() - started)
      }
      const data = await res.json()
      const text: string = data?.choices?.[0]?.message?.content ?? ''
      if (!text) return errorResult(this.id, new Error('openai_empty_response'), Date.now() - started)
      return { engine: this.id, status: 'ok', response: text, latencyMs: Date.now() - started }
    } catch (err) {
      return errorResult(this.id, err, Date.now() - started)
    }
  },
}
