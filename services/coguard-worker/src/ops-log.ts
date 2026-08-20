import type { Env } from './types'

const DEFAULT_OPS_LOG_URL = 'https://bizlegal-ai.com/api/ops/log'

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

export async function logEvent(
  env: Env,
  type: string,
  opts: { ref_id?: string; email?: string; metadata?: Record<string, unknown>; status?: string }
): Promise<void> {
  if (!env.WEBHOOK_SHARED_SECRET) return

  const payload = JSON.stringify({ type, source: 'coguard', ...opts })

  try {
    const sig = await hmacHex(env.WEBHOOK_SHARED_SECRET, payload)
    const url = DEFAULT_OPS_LOG_URL
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 5000)
    await fetch(url, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'content-type': 'application/json', 'x-bizlegal-signature': sig, 'user-agent': 'coguard-email-worker/1.0' },
      body: payload,
    }).finally(() => clearTimeout(timer))
  } catch (err) {
    console.warn('[ops-log] failed:', err)
  }
}
