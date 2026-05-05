/**
 * @bizlegal/turnstile-verify — server-side Cloudflare Turnstile verifier.
 *
 * Phase AA D9 (INTEGRATION-V3 F-2 fix). The decision-tree lead-capture
 * endpoints are unauthenticated POST; without a bot challenge, anyone
 * can pump leads (wasting Anthropic spend on nurture sends + hurting
 * Resend reputation through bounce-heavy fake addresses).
 *
 * Skip-if-not-configured: if `TURNSTILE_SECRET_KEY` is unset on the
 * server, this returns ok=true so dev and pre-launch deploys keep
 * working. Set the secret on each subdomain Vercel project to enable.
 *
 * Mirrors the pattern in services/worker/src/turnstile.ts so the
 * worker + every subdomain share one verification shape.
 */

const TURNSTILE_VERIFY_URL =
  'https://challenges.cloudflare.com/turnstile/v0/siteverify'

export interface TurnstileVerifyResult {
  readonly ok: boolean
  /** True when no secret is configured — verification was skipped. */
  readonly skipped?: boolean
  readonly errorCodes?: readonly string[]
}

export interface TurnstileVerifyOptions {
  readonly token?: string | null
  /** Optional client IP for additional anti-replay protection. */
  readonly clientIp?: string | null
  /** Override the secret env var name (default TURNSTILE_SECRET_KEY). */
  readonly envVar?: string
}

export async function verifyTurnstile(
  opts: TurnstileVerifyOptions,
): Promise<TurnstileVerifyResult> {
  const envVar = opts.envVar ?? 'TURNSTILE_SECRET_KEY'
  const secret = process.env[envVar]
  if (!secret) {
    return { ok: true, skipped: true }
  }
  if (!opts.token || typeof opts.token !== 'string' || opts.token.length < 10) {
    return { ok: false, errorCodes: ['missing-input-response'] }
  }

  const form = new URLSearchParams()
  form.set('secret', secret)
  form.set('response', opts.token)
  if (opts.clientIp) form.set('remoteip', opts.clientIp)

  let res: Response
  try {
    res = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    })
  } catch (err) {
    return { ok: false, errorCodes: [`network-${(err as Error).name ?? 'unknown'}`] }
  }
  if (!res.ok) {
    return { ok: false, errorCodes: [`http-${res.status}`] }
  }
  const payload = (await res.json().catch(() => ({}))) as {
    success?: boolean
    'error-codes'?: readonly string[]
  }
  if (payload.success) return { ok: true }
  return { ok: false, errorCodes: payload['error-codes'] ?? ['unknown'] }
}

/** Helper: derive a likely client IP from a Next.js Request. */
export function clientIpFromHeaders(
  headers: { get: (name: string) => string | null },
): string | null {
  const cf = headers.get('cf-connecting-ip')
  if (cf) return cf
  const xff = headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0]?.trim() ?? null
  return headers.get('x-real-ip')
}
