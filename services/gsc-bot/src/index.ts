import { getAccessToken } from './jwt'

interface Env {
  readonly GSC_SERVICE_ACCOUNT_JSON: string
  readonly BIZLEGAL_INBOUND_SECRET?: string
  readonly OPS_LOG_URL?: string
  readonly ADMIN_TOKEN?: string
  readonly SITES: string
}

interface SitePair {
  readonly site: string
  readonly sitemap: string
}

interface SubmissionResult {
  readonly site: string
  readonly sitemap: string
  readonly status: number
  readonly ok: boolean
  readonly error?: string
}

function parseSites(raw: string): ReadonlyArray<SitePair> {
  return raw
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0)
    .map((entry) => {
      const [site, sitemap] = entry.split('|').map((s) => s.trim())
      if (!site || !sitemap) {
        throw new Error(`Malformed SITES entry: "${entry}" (expected "site|sitemap")`)
      }
      return { site, sitemap }
    })
}

async function submitSitemap(
  accessToken: string,
  pair: SitePair,
): Promise<SubmissionResult> {
  const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(pair.site)}/sitemaps/${encodeURIComponent(pair.sitemap)}`
  try {
    const res = await fetch(url, {
      method: 'PUT',
      headers: { authorization: `Bearer ${accessToken}` },
    })
    const ok = res.status >= 200 && res.status < 300
    let error: string | undefined
    if (!ok) {
      const body = await res.text()
      error = body.slice(0, 300)
    }
    return { site: pair.site, sitemap: pair.sitemap, status: res.status, ok, error }
  } catch (err) {
    return {
      site: pair.site,
      sitemap: pair.sitemap,
      status: 0,
      ok: false,
      error: err instanceof Error ? err.message : 'fetch failed',
    }
  }
}

async function hmacSign(secret: string, body: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body))
  const bytes = new Uint8Array(sig)
  let hex = ''
  for (let i = 0; i < bytes.length; i++) {
    hex += (bytes[i] ?? 0).toString(16).padStart(2, '0')
  }
  return hex
}

async function logToOps(
  env: Env,
  type: string,
  payload: Record<string, unknown>,
): Promise<void> {
  if (!env.OPS_LOG_URL || !env.BIZLEGAL_INBOUND_SECRET) return
  const body = JSON.stringify({
    type,
    surface: 'gsc-bot',
    payload,
    timestamp: new Date().toISOString(),
  })
  const signature = await hmacSign(env.BIZLEGAL_INBOUND_SECRET, body)
  try {
    await fetch(env.OPS_LOG_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-bizlegal-signature': signature,
      },
      body,
    })
  } catch {
    // ops-log is best-effort — never fail the run on a log error
  }
}

async function runSubmissions(env: Env): Promise<ReadonlyArray<SubmissionResult>> {
  const pairs = parseSites(env.SITES)
  const accessToken = await getAccessToken(env.GSC_SERVICE_ACCOUNT_JSON)
  const results: SubmissionResult[] = []
  for (const pair of pairs) {
    // Sequential to avoid GSC quota bursts; 8 calls in series is ~3s.
    const r = await submitSitemap(accessToken, pair)
    results.push(r)
  }
  return results
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    if (url.pathname === '/health') {
      return Response.json({
        ok: true,
        sites: parseSites(env.SITES).length,
        version: '0.1.0',
      })
    }

    if (url.pathname === '/run' && request.method === 'POST') {
      const token = url.searchParams.get('token') ?? request.headers.get('x-admin-token')
      if (!env.ADMIN_TOKEN || token !== env.ADMIN_TOKEN) {
        return new Response('forbidden', { status: 403 })
      }
      try {
        const results = await runSubmissions(env)
        const failed = results.filter((r) => !r.ok)
        await logToOps(env, 'gsc.submit.manual', {
          total: results.length,
          ok: results.length - failed.length,
          failed: failed.length,
          results,
        })
        return Response.json({ ok: failed.length === 0, results })
      } catch (err) {
        const message = err instanceof Error ? err.message : 'unknown error'
        await logToOps(env, 'gsc.submit.error', { source: 'manual', message })
        return new Response(`error: ${message}`, { status: 500 })
      }
    }

    return new Response('bizlegal-gsc-bot', { status: 200 })
  },

  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(
      (async () => {
        try {
          const results = await runSubmissions(env)
          const failed = results.filter((r) => !r.ok)
          await logToOps(env, 'gsc.submit.cron', {
            cron: event.cron,
            total: results.length,
            ok: results.length - failed.length,
            failed: failed.length,
            results,
          })
        } catch (err) {
          const message = err instanceof Error ? err.message : 'unknown error'
          await logToOps(env, 'gsc.submit.error', { source: 'cron', cron: event.cron, message })
        }
      })(),
    )
  },
}
