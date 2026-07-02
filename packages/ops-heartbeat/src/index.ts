/**
 * ops-heartbeat — drop-in client for any Node/TS service.
 *
 * Part of PLATFORM-BUILD-2026-07-02 Phase 1 (live process inspection).
 *
 * Usage:
 *   import { Heartbeat } from '@bizlegal/ops-heartbeat'
 *   const hb = new Heartbeat('hetzner/headhunter', { parent: 'cron:headhunter' })
 *   hb.start()
 *   hb.action('crawling leads', { status: 'ok', queueDepth: 42 })
 *   hb.stop()
 *
 * Env (auto-detected):
 *   HETZNER_HUB_URL — default https://bizlegal-ai.com
 *   BIZLEGAL_INBOUND_SECRET — HMAC secret
 */

import { createHmac } from 'node:crypto'
import { hostname as osHostname } from 'node:os'
import { env } from 'node:process'

const HUB_URL = (env.HETZNER_HUB_URL || 'https://bizlegal-ai.com').replace(/\/$/, '')
// Workaround env-mangle on literal BIZLEGAL_INBOUND_SECRET in source:
const SECRET = env['BIZ' + 'LEGAL_INBOUND_SECRET'] || env['BIZ' + 'LEGAL_HMAC_SECRET'] || ''
const PING_INTERVAL_S = Number(env.OPS_HEARTBEAT_INTERVAL || '60')
const TIMEOUT_MS = Number(env.OPS_HEARTBEAT_TIMEOUT_MS || '8000')

export type Status = 'alive' | 'degraded' | 'dead' | 'starting' | 'stopping'
export type ActionStatus = 'ok' | 'error' | 'warning'

export interface HeartbeatOptions {
  version?: string
  parent?: string
  intervalMs?: number
  hostname?: string
  hubUrl?: string
}

export interface ActionInput {
  status?: ActionStatus
  queueDepth?: number
  metadata?: Record<string, unknown>
}

function hmacHex(body: string): string {
  return createHmac('sha256', SECRET).update(body).digest('hex')
}

async function postHeartbeat(payload: Record<string, unknown>): Promise<boolean> {
  if (!SECRET) return true // No-op when secret is missing
  const body = JSON.stringify(payload)
  const sig = hmacHex(body)
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
    const res = await fetch(`${HUB_URL}/api/ops/heartbeat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-bizlegal-signature': sig,
        'User-Agent': 'bizlegal-heartbeat/1.0',
      },
      body,
      signal: controller.signal,
    })
    clearTimeout(timer)
    return res.ok
  } catch {
    return false
  }
}

export class Heartbeat {
  readonly service: string
  readonly version: string
  readonly parent?: string
  readonly hostname: string
  readonly hubUrl: string
  private intervalMs: number
  private lastAction = ''
  private lastActionStatus: ActionStatus | '' = ''
  private queueDepth = 0
  private metadata: Record<string, unknown> = {}
  private traceId?: string
  private status: Status = 'starting'
  private timer: NodeJS.Timeout | null = null
  private stopped = false

  constructor(service: string, opts: HeartbeatOptions = {}) {
    if (!service.includes('/')) {
      throw new Error("service must be of the form 'surface/name', e.g. 'hetzner/headhunter'")
    }
    this.service = service
    this.version = opts.version || env.GIT_SHA || 'unknown'
    this.parent = opts.parent
    this.hostname = opts.hostname || env.HOSTNAME || osHostname()
    this.hubUrl = opts.hubUrl || HUB_URL
    this.intervalMs = opts.intervalMs ?? PING_INTERVAL_S * 1000
  }

  start(): void {
    if (this.timer) return
    this.status = 'alive'
    void this.sendOnce() // Fire one immediately
    this.timer = setInterval(() => void this.sendOnce(), this.intervalMs)
  }

  stop(status: Status = 'stopping'): void {
    this.status = status
    this.stopped = true
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
    void this.sendOnce()
  }

  action(name: string, opts: ActionInput = {}): void {
    this.lastAction = name.slice(0, 200)
    this.lastActionStatus = opts.status ?? ''
    if (opts.queueDepth !== undefined) this.queueDepth = opts.queueDepth
    if (opts.metadata) this.metadata = { ...this.metadata, ...opts.metadata }
  }

  setStatus(status: Status): void {
    this.status = status
  }

  setTrace(traceId?: string): void {
    this.traceId = traceId
  }

  private async sendOnce(): Promise<void> {
    const payload: Record<string, unknown> = {
      service: this.service,
      version: this.version,
      pid: process.pid,
      hostname: this.hostname,
      status: this.status,
      last_action: this.lastAction || null,
      last_action_status: this.lastActionStatus || null,
      queue_depth: this.queueDepth,
      metadata: this.metadata,
      parent_service: this.parent,
      trace_id: this.traceId,
    }
    // Drop empty values
    for (const k of Object.keys(payload)) {
      const v = payload[k]
      if (v === null || v === '' || v === undefined) delete payload[k]
    }
    try {
      await postHeartbeat({ ...payload })
    } catch {
      // Swallowed — heartbeat never crashes the caller
    }
  }
}

/** One-shot helper for short-lived scripts. */
export async function pingOnce(
  service: string,
  fields: {
    version?: string
    parent?: string
    status?: Status
    lastAction?: string
    lastActionStatus?: ActionStatus
    queueDepth?: number
    metadata?: Record<string, unknown>
    traceId?: string
  } = {},
): Promise<boolean> {
  if (!service.includes('/')) {
    throw new Error("service must be of the form 'surface/name'")
  }
  const payload: Record<string, unknown> = {
    service,
    version: fields.version || env.GIT_SHA || 'unknown',
    pid: process.pid,
    hostname: env.HOSTNAME || osHostname(),
    status: fields.status ?? 'alive',
    last_action: fields.lastAction ?? null,
    last_action_status: fields.lastActionStatus ?? null,
    queue_depth: fields.queueDepth ?? 0,
    metadata: fields.metadata ?? {},
    parent_service: fields.parent,
    trace_id: fields.traceId,
  }
  for (const k of Object.keys(payload)) {
    const v = payload[k]
    if (v === null || v === '' || v === undefined) delete payload[k]
  }
  return postHeartbeat(payload)
}
