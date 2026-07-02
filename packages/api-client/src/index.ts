/**
 * @bizlegal/api-client
 *
 * Type-safe Node.js client for BizLegal Hub API.
 * Handles HMAC signing for HMAC-gated endpoints automatically.
 *
 * Node.js only — uses node:crypto for HMAC. Not browser-safe.
 */

import crypto from 'node:crypto'

// ── Config ────────────────────────────────────────────────────────────────────

const DEFAULT_HUB_BASE = 'https://bizlegal-ai.com'

// ── Public types ──────────────────────────────────────────────────────────────

export interface BizLegalClientOptions {
  /** Override hub base URL. Defaults to NEXT_PUBLIC_HUB_BASE_URL env or production URL. */
  baseUrl?: string
  /** Trace ID to attach to all requests as x-bizlegal-trace-id. */
  traceId?: string
  /** HMAC secret for signing HMAC-gated requests (BIZLEGAL_INBOUND_SECRET). */
  inboundSecret?: string
}

// Ops

export interface HeartbeatPayload {
  service: string
  version?: string
  pid?: number
  hostname?: string
  status?: 'alive' | 'degraded' | 'dead' | 'starting' | 'stopping'
  last_action?: string
  last_action_status?: 'ok' | 'error' | 'warning'
  queue_depth?: number
  metadata?: Record<string, unknown>
  parent_service?: string
  trace_id?: string
}

export interface HeartbeatResult {
  ok: boolean
  heartbeat_id: string
}

export interface LiveService {
  service: string
  status: string
  last_action: string | null
  last_action_status: string | null
  pinged_at: string
  age_seconds: number
  is_stale: boolean
  hostname: string | null
  pid: number | null
  version: string | null
  queue_depth: number
  metadata: Record<string, unknown>
}

export interface LiveResult {
  generated_at: string
  services: LiveService[]
  summary: {
    total: number
    alive: number
    degraded: number
    dead: number
    starting: number
    stopping: number
    stale: number
    oldest_ping_seconds: number | null
    newest_ping_seconds: number | null
  }
  cron_alerts: Array<{
    service: string
    last_ping: string
    age_seconds: number
    last_action: string | null
  }>
}

// Payments

export type GatewayPreference = 'crypto' | 'card'

export interface PayStartPayload {
  product_id: string
  user_email: string
  user_name?: string
  gateway: GatewayPreference
}

export interface PayStartResult {
  ok: true
  provider: string
  checkout_url: string
  provider_invoice_id?: string
  product_id: string
  amount_cents: number
}

// Error envelope

export interface ApiError {
  ok: false
  error: string
  status: number
}

export type ApiResult<T> = T | ApiError

// ── Internal helpers ──────────────────────────────────────────────────────────

function hmacSign(body: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(body).digest('hex')
}

function isApiError(v: unknown): v is ApiError {
  return typeof v === 'object' && v !== null && (v as ApiError).ok === false
}

// ── Client class ───────────────────────────────────────────────────────────────

export class BizLegalClient {
  private readonly base: string
  private readonly traceId: string | undefined
  private readonly secret: string | undefined

  constructor(opts: BizLegalClientOptions = {}) {
    this.base = (
      opts.baseUrl ??
      process.env['HUB_BASE_URL'] ??
      DEFAULT_HUB_BASE
    ).replace(/\/$/, '')
    this.traceId = opts.traceId
    this.secret = opts.inboundSecret ?? process.env['BIZLEGAL_INBOUND_SECRET']
  }

  private baseHeaders(): Record<string, string> {
    const h: Record<string, string> = { 'Content-Type': 'application/json' }
    if (this.traceId) h['x-bizlegal-trace-id'] = this.traceId
    return h
  }

  private async postHmac<T>(path: string, payload: unknown): Promise<T> {
    if (!this.secret) {
      throw new Error(
        '@bizlegal/api-client: inboundSecret or BIZLEGAL_INBOUND_SECRET required for HMAC endpoints',
      )
    }
    const body = JSON.stringify(payload)
    const sig = hmacSign(body, this.secret)
    const res = await fetch(`${this.base}${path}`, {
      method: 'POST',
      headers: {
        ...this.baseHeaders(),
        'x-bizlegal-signature': sig,
      },
      body,
    })
    const json = (await res.json()) as T
    return json
  }

  private async postOpen<T>(path: string, payload: unknown): Promise<T> {
    const body = JSON.stringify(payload)
    const res = await fetch(`${this.base}${path}`, {
      method: 'POST',
      headers: this.baseHeaders(),
      body,
    })
    const json = (await res.json()) as T
    return json
  }

  private async getTokenGated<T>(path: string, token: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${this.base}${path}`)
    url.searchParams.set('t', token)
    if (params) {
      for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
    }
    const res = await fetch(url, { headers: this.baseHeaders() })
    const json = (await res.json()) as T
    return json
  }

  // ── Ops endpoints ───────────────────────────────────────────────────────────

  /** POST /api/ops/heartbeat — requires HMAC (BIZLEGAL_INBOUND_SECRET) */
  async opsHeartbeat(payload: HeartbeatPayload): Promise<HeartbeatResult> {
    return this.postHmac<HeartbeatResult>('/api/ops/heartbeat', payload)
  }

  /** GET /api/ops/live — requires OPS_DASHBOARD_TOKEN */
  async opsLive(token: string, staleSeconds?: number): Promise<LiveResult> {
    const params: Record<string, string> = {}
    if (staleSeconds !== undefined) params['stale_seconds'] = String(staleSeconds)
    return this.getTokenGated<LiveResult>('/api/ops/live', token, params)
  }

  // ── Payment endpoints ────────────────────────────────────────────────────────

  /** POST /api/pay/start — open endpoint, returns checkout_url */
  async payStart(payload: PayStartPayload): Promise<ApiResult<PayStartResult>> {
    const result = await this.postOpen<PayStartResult | ApiError>('/api/pay/start', payload)
    return result
  }

  // ── Utility ──────────────────────────────────────────────────────────────────

  /** Check if a result is an API error (ok: false). */
  static isError(result: ApiResult<unknown>): result is ApiError {
    return isApiError(result)
  }
}
