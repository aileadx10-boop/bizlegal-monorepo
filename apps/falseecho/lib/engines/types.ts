/* ─── Detection-engine adapter contract ────────────────────────────────────
   Each engine probes the same prompt battery. Graceful degradation is the
   contract: an adapter whose API key env var is absent answers with
   status "unavailable" — never a throw, never a 500 to the caller. */

export type EngineId = 'chatgpt' | 'claude' | 'perplexity' | 'google_aio'

export type EngineStatus = 'ok' | 'unavailable' | 'error'

export interface EngineProbeRequest {
  prompt: string
  entity: string
}

export interface EngineProbeResult {
  engine: EngineId
  status: EngineStatus
  /** Raw text answer when status === 'ok'. */
  response?: string
  /** Short diagnostic when status !== 'ok' (never the env value). */
  error?: string
  latencyMs: number
}

export interface EngineAdapter {
  readonly id: EngineId
  readonly displayName: string
  /** Env var that must be present for this engine to run. */
  readonly envKey: string
  isConfigured(): boolean
  probe(req: EngineProbeRequest): Promise<EngineProbeResult>
}

export const ENGINE_TIMEOUT_MS = 20_000

export function unavailableResult(id: EngineId, envKey: string): EngineProbeResult {
  return { engine: id, status: 'unavailable', error: `${envKey} not configured`, latencyMs: 0 }
}

export function errorResult(id: EngineId, err: unknown, latencyMs: number): EngineProbeResult {
  const msg = err instanceof Error ? err.message : String(err)
  return { engine: id, status: 'error', error: msg.slice(0, 200), latencyMs }
}

export async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number = ENGINE_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}
