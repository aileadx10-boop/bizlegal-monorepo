/**
 * CoGuard CF Email Routing Worker
 *
 * CF Email Routing delivers forwarded emails to this Worker as multipart
 * HTTP posts. The Worker:
 *   1. Validates the routing token
 *   2. Parses the alias from the To: header
 *   3. Looks up subscriber_id from COGUARD_ALIASES KV
 *   4. Posts to OCI /coguard/process (HMAC-signed, fire-and-forget via ctx.waitUntil)
 *   5. Returns 200 immediately
 *
 * CF Email Routing calls the Worker synchronously — we must return 200
 * quickly or CF retries. All heavy work goes in ctx.waitUntil().
 */

import type { Env } from './types'
import { logEvent } from './ops-log'

// Parse the UUID portion from: {uuid}@inbox.coguard.bizlegal-ai.com
function extractAliasUuid(toHeader: string): string | null {
  const match = toHeader.match(/([a-f0-9-]{36})@inbox\.coguard\.bizlegal-ai\.com/i)
  return match ? match[1] : null
}

async function hmacHex(secret: string, body: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body))
  return Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

async function processIncoming(env: Env, formData: FormData, subscriberId: string, aliasUuid: string): Promise<void> {
  const rawEmail = formData.get('email') as string | null
  const from = formData.get('from') as string ?? ''
  const to = formData.get('to') as string ?? ''
  const subject = formData.get('subject') as string ?? ''
  const messageId = formData.get('message-id') as string ?? ''
  const date = formData.get('date') as string ?? new Date().toISOString()
  const text = formData.get('text') as string ?? rawEmail ?? ''

  const ociBase = env.OCI_BASE_URL ?? 'https://oci.bizlegal-ai.com'
  const payload = JSON.stringify({
    subscriber_id: subscriberId,
    alias_uuid: aliasUuid,
    sender: from,
    subject,
    text,
    message_id: messageId,
    received_at: date,
  })

  const sig = await hmacHex(env.WEBHOOK_SHARED_SECRET, payload)

  try {
    const res = await fetch(`${ociBase}/coguard/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-bizlegal-signature': sig,
        'User-Agent': 'coguard-email-worker/1.0',
      },
      body: payload,
    })
    if (!res.ok) {
      console.warn('[coguard-worker] OCI process failed', res.status)
    }
  } catch (err) {
    console.warn('[coguard-worker] OCI POST error', err)
  }

  await logEvent(env, 'coguard.message.received', {
    ref_id: subscriberId,
    metadata: { alias_uuid: aliasUuid, message_id: messageId },
  })
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // CF Email Routing calls this as a POST with multipart/form-data
    if (request.method !== 'POST') {
      return new Response('method not allowed', { status: 405 })
    }

    // Validate routing token
    const routingToken = request.headers.get('x-forwarding-token') ?? request.headers.get('cf-email-routing-token') ?? ''
    if (env.CF_COGUARD_ROUTING_TOKEN && routingToken !== env.CF_COGUARD_ROUTING_TOKEN) {
      console.warn('[coguard-worker] invalid routing token')
      return new Response('unauthorized', { status: 401 })
    }

    let formData: FormData
    try {
      formData = await request.formData()
    } catch {
      return new Response('bad request', { status: 400 })
    }

    const to = formData.get('to') as string ?? ''
    const aliasUuid = extractAliasUuid(to)
    if (!aliasUuid) {
      console.warn('[coguard-worker] no alias in to:', to)
      return new Response('ok', { status: 200 }) // ack but ignore unknown addresses
    }

    // KV lookup: aliasUuid → subscriberId
    const subscriberId = await env.COGUARD_ALIASES.get(aliasUuid)
    if (!subscriberId) {
      console.warn('[coguard-worker] unknown alias:', aliasUuid)
      return new Response('ok', { status: 200 })
    }

    // Fire-and-forget OCI processing — return 200 immediately so CF doesn't retry
    ctx.waitUntil(processIncoming(env, formData, subscriberId, aliasUuid))

    return new Response('ok', { status: 200 })
  },
}
