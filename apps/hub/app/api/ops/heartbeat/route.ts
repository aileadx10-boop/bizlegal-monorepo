import { NextRequest, NextResponse } from 'next/server'
import * as crypto from 'node:crypto'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const maxDuration = 10

/**
 * POST /api/ops/heartbeat
 *
 * Phase 1 of PLATFORM-BUILD-2026-07-02 — live process inspection.
 *
 * Every Python service, CF Worker, and cron job pings this every 60s.
 * The row is upserted (service + hostname + pid is the natural key),
 * so a service that has been silent for 15+ min is detectable by the
 * /api/ops/live read query.
 *
 * Auth: same HMAC pattern as /api/ops/log. Any service that already
 * has BIZLEGAL_INBOUND_SECRET can call this — no new key.
 *
 * Body:
 *   {
 *     service: string             e.g. "hetzner/headhunter"
 *     version?: string            git SHA or "1.2.3"
 *     pid?: number
 *     hostname?: string           box identifier (auto-detected if absent)
 *     status?: "alive" | "degraded" | "dead" | "starting" | "stopping"
 *     last_action?: string        free-form, e.g. "crawling leads"
 *     last_action_status?: "ok" | "error" | "warning"
 *     queue_depth?: number
 *     metadata?: Record<string, unknown>
 *     parent_service?: string     for cron:headhunter → parent: cron
 *     trace_id?: string           current in-flight trace
 *   }
 *
 * Response: 200 { ok: true, heartbeat_id: string } on success
 *           401 { error: "unauthorized" } on HMAC failure
 *           400 { error: "service required" } on missing service
 */

interface HeartbeatBody {
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

function verifyHmac(body: string, sig: string | null, secret: string): boolean {
  if (!sig || !secret) return false
  const expected = crypto.createHmac('sha256', secret).update(body).digest('hex')
  if (expected.length !== sig.length) return false
  let diff = 0
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i)
  }
  return diff === 0
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase env not configured')
  return createClient(url, key)
}

const ALLOWED_STATUS = new Set(['alive', 'degraded', 'dead', 'starting', 'stopping'])
const SERVICE_PATTERN = /^[a-z0-9_-]+\/[a-z0-9_-]+$/i

export async function POST(req: NextRequest) {
  try {
    const raw = await req.text()
    const sig = req.headers.get('x-bizlegal-signature')
    const secret = process.env.BIZLEGAL_INBOUND_SECRET ?? ''
    if (!verifyHmac(raw, sig, secret)) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    const body = JSON.parse(raw) as HeartbeatBody
    if (!body.service || !SERVICE_PATTERN.test(body.service)) {
      return NextResponse.json(
        { error: 'service required, format: surface/name (e.g. hetzner/headhunter)' },
        { status: 400 },
      )
    }
    if (body.status && !ALLOWED_STATUS.has(body.status)) {
      return NextResponse.json(
        { error: `status must be one of: ${Array.from(ALLOWED_STATUS).join(', ')}` },
        { status: 400 },
      )
    }

    const supabase = getSupabase()
    const insert = {
      service: body.service,
      version: body.version ?? null,
      pid: body.pid ?? null,
      hostname: body.hostname ?? (req.headers.get('x-forwarded-for') ?? 'unknown'),
      status: body.status ?? 'alive',
      last_action: body.last_action ?? null,
      last_action_status: body.last_action_status ?? null,
      queue_depth: body.queue_depth ?? 0,
      metadata: body.metadata ?? {},
      parent_service: body.parent_service ?? null,
      trace_id: body.trace_id ?? null,
      pinged_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('agent_heartbeats')
      .insert(insert)
      .select('id')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, heartbeat_id: data?.id })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
