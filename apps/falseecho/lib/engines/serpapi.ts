/* Google AI Overviews probe — SerpAPI parse (spec §4). */

import {
  EngineAdapter,
  EngineProbeRequest,
  EngineProbeResult,
  unavailableResult,
  errorResult,
  fetchWithTimeout,
} from './types'

interface SerpAiOverview {
  text_blocks?: Array<{ type?: string; snippet?: string; text?: string }>
}

export const googleAioEngine: EngineAdapter = {
  id: 'google_aio',
  displayName: 'Google AI Overviews',
  envKey: 'SERPAPI_API_KEY',

  isConfigured() {
    return Boolean(process.env.SERPAPI_API_KEY)
  },

  async probe(req: EngineProbeRequest): Promise<EngineProbeResult> {
    if (!this.isConfigured()) return unavailableResult(this.id, this.envKey)
    const started = Date.now()
    try {
      const params = new URLSearchParams({
        engine: 'google_ai_overview',
        q: req.prompt,
        api_key: process.env.SERPAPI_API_KEY!,
      })
      const res = await fetchWithTimeout(`https://serpapi.com/search.json?${params.toString()}`, {
        method: 'GET',
      })
      if (!res.ok) {
        return errorResult(this.id, new Error(`serpapi_http_${res.status}`), Date.now() - started)
      }
      const data = (await res.json()) as { ai_overview?: SerpAiOverview; error?: string }
      if (data.error) {
        return errorResult(this.id, new Error(`serpapi_${data.error}`), Date.now() - started)
      }
      const blocks = data.ai_overview?.text_blocks ?? []
      const text = blocks
        .map((b) => b.snippet ?? b.text ?? '')
        .filter(Boolean)
        .join('\n')
      // No AI Overview for a query is a valid capture, not an engine error.
      return {
        engine: this.id,
        status: 'ok',
        response: text || '(no AI Overview returned for this query)',
        latencyMs: Date.now() - started,
      }
    } catch (err) {
      return errorResult(this.id, err, Date.now() - started)
    }
  },
}
