/* Claude probe — Anthropic Messages API. */

import {
  EngineAdapter,
  EngineProbeRequest,
  EngineProbeResult,
  unavailableResult,
  errorResult,
  fetchWithTimeout,
} from './types'

export const claudeEngine: EngineAdapter = {
  id: 'claude',
  displayName: 'Claude (Anthropic)',
  envKey: 'ANTHROPIC_API_KEY',

  isConfigured() {
    return Boolean(process.env.ANTHROPIC_API_KEY)
  },

  async probe(req: EngineProbeRequest): Promise<EngineProbeResult> {
    if (!this.isConfigured()) return unavailableResult(this.id, this.envKey)
    const started = Date.now()
    try {
      const res = await fetchWithTimeout('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': process.env.ANTHROPIC_API_KEY!,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: process.env.ANTHROPIC_MODEL ?? 'claude-3-5-haiku-20241022',
          max_tokens: 400,
          messages: [{ role: 'user', content: req.prompt }],
        }),
      })
      if (!res.ok) {
        return errorResult(this.id, new Error(`anthropic_http_${res.status}`), Date.now() - started)
      }
      const data = await res.json()
      const text: string = (data?.content ?? [])
        .filter((b: { type?: string }) => b?.type === 'text')
        .map((b: { text?: string }) => b.text ?? '')
        .join('\n')
      if (!text) return errorResult(this.id, new Error('anthropic_empty_response'), Date.now() - started)
      return { engine: this.id, status: 'ok', response: text, latencyMs: Date.now() - started }
    } catch (err) {
      return errorResult(this.id, err, Date.now() - started)
    }
  },
}
