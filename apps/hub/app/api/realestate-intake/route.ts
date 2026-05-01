// app/api/realestate-intake/route.ts
//
// Hub-side proxy for the OCI Deal Router (Stream B). Takes a form
// submission from /realestate, composes a Worker-shape payload, signs
// with HMAC-SHA256(BIZLEGAL_INBOUND_SECRET, body), and forwards to
// https://router.bizlegal-ai.com/lead.
//
// Header contract matches the rest of the fleet: x-bizlegal-signature
// (raw hex, no `sha256=` prefix). The OCI router accepts both the
// hub-form shape ({text, contact_*}) and the EA Worker shape
// ({lead, classification}); we send the hub-form variant.

import { NextRequest, NextResponse } from 'next/server'
import { logEventAsync } from '@/lib/ops/log'

export const dynamic = 'force-dynamic'
export const maxDuration = 15

const ROUTER_URL =
  process.env.OCI_ROUTER_URL || 'https://router.bizlegal-ai.com/lead'
const ROUTER_TIMEOUT_MS = 10_000

interface FormPayload {
  name: string
  email: string
  jurisdiction: string
  budget: string
  deal_type: string
  timeline: string
  message: string
}

async function hmacHex(secret: string, body: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(body)
  )
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function isValid(input: unknown): input is FormPayload {
  if (!input || typeof input !== 'object') return false
  const o = input as Record<string, unknown>
  return (
    typeof o.email === 'string' &&
    o.email.includes('@') &&
    typeof o.message === 'string' &&
    o.message.trim().length > 0
  )
}

function composeText(p: FormPayload): string {
  return [
    `Jurisdiction: ${p.jurisdiction || 'unspecified'}`,
    `Budget: ${p.budget || 'unspecified'}`,
    `Deal type: ${p.deal_type || 'unspecified'}`,
    `Timeline: ${p.timeline || 'unspecified'}`,
    '',
    p.message.trim(),
  ].join('\n')
}

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }
  if (!isValid(body)) {
    return NextResponse.json(
      { error: 'email and message are required' },
      { status: 400 }
    )
  }

  const secret = process.env.BIZLEGAL_INBOUND_SECRET
  if (!secret) {
    console.error('[realestate-intake] BIZLEGAL_INBOUND_SECRET missing')
    return NextResponse.json({ error: 'service unavailable' }, { status: 503 })
  }

  const referer = req.headers.get('referer') ?? null
  const userAgent = req.headers.get('user-agent') ?? null
  const ipCountry = req.headers.get('x-vercel-ip-country') ?? null

  const outbound = {
    source: 'hub_form',
    source_url: 'https://bizlegal-ai.com/realestate',
    referrer: referer,
    user_agent: userAgent,
    ip_country: ipCountry,
    contact_name: body.name || null,
    contact_email: body.email,
    contact_role: null,
    text: composeText(body),
  }
  const outboundJson = JSON.stringify(outbound)
  const signature = await hmacHex(secret, outboundJson)

  // V0.1 — fire referral.received BEFORE the OCI proxy so we capture
  // every inbound even when the router is down. /ops sees the funnel
  // intake even if routing fails downstream.
  logEventAsync({
    type: 'referral.received',
    source: 'hub',
    email: body.email,
    status: 'pending',
    metadata: {
      jurisdiction: body.jurisdiction || null,
      budget_band: body.budget || null,
      deal_type: body.deal_type || null,
      timeline: body.timeline || null,
      message_chars: body.message.length,
      ip_country: ipCountry,
      source_url: outbound.source_url,
    },
  })

  const start = Date.now()
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), ROUTER_TIMEOUT_MS)
  try {
    const res = await fetch(ROUTER_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'content-type': 'application/json',
        'x-bizlegal-signature': signature,
        'user-agent': 'bizlegal-hub-realestate-intake',
      },
      body: outboundJson,
    })
    clearTimeout(timer)
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>
    const durationMs = Date.now() - start
    if (!res.ok) {
      console.error('[realestate-intake] router error', res.status, data)
      logEventAsync({
        type: 'routing.attempted',
        source: 'hub',
        email: body.email,
        status: 'failed',
        metadata: {
          target: 'oci_router',
          status_code: res.status,
          duration_ms: durationMs,
          jurisdiction: body.jurisdiction || null,
        },
      })
      return NextResponse.json(
        { error: 'routing failed; we have logged the matter and will follow up.' },
        { status: 502 }
      )
    }
    logEventAsync({
      type: 'routing.attempted',
      source: 'hub',
      ref_id: typeof data.lead_id === 'string' ? data.lead_id : undefined,
      email: body.email,
      status: 'ok',
      metadata: {
        target: 'oci_router',
        status_code: res.status,
        duration_ms: durationMs,
        jurisdiction: body.jurisdiction || null,
        oci_classification: typeof data.classification === 'string' ? data.classification : null,
        oci_action: typeof data.action === 'string' ? data.action : null,
      },
    })
    return NextResponse.json({
      ok: true,
      lead_id: data.lead_id ?? null,
    })
  } catch (err) {
    clearTimeout(timer)
    const durationMs = Date.now() - start
    console.error('[realestate-intake] fetch failed', err)
    logEventAsync({
      type: 'routing.attempted',
      source: 'hub',
      email: body.email,
      status: 'failed',
      metadata: {
        target: 'oci_router',
        duration_ms: durationMs,
        error: err instanceof Error ? err.name : String(err),
        jurisdiction: body.jurisdiction || null,
      },
    })
    return NextResponse.json(
      { error: 'network error contacting router; please retry.' },
      { status: 502 }
    )
  }
}

export const GET = () =>
  NextResponse.json({ error: 'POST only' }, { status: 405 })
