import { NextRequest, NextResponse } from 'next/server'
import { logEventAsync } from '@/lib/ops/log'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * GET /api/cron/smoke
 *
 * Daily subdomain reachability check. For each of the 7 fleet surfaces
 * (hub + 6 product subdomains + OCI router), GET /api/digest (or /health
 * for OCI) and record up/down status. Fires:
 *
 *   - cron.completed (always) with the per-host status table
 *   - error (per-host) when a subdomain is unreachable or returns 5xx
 *
 * Auth: CRON_SECRET in Authorization: Bearer header.
 *
 * Vercel cron entry: { "path": "/api/cron/smoke", "schedule": "0 9 * * *" }
 */

interface SmokeTarget {
  readonly name: string
  readonly url: string
  readonly source: 'hub' | 'docai' | 'lexaudit' | 'tracr' | 'brai' | 'forge' | 'leadforge' | 'oci' | 'worker'
}

const TARGETS: ReadonlyArray<SmokeTarget> = [
  { name: 'hub',       url: 'https://bizlegal-ai.com/api/digest',           source: 'hub' },
  { name: 'tracr',     url: 'https://tracr.bizlegal-ai.com/api/digest',     source: 'tracr' },
  { name: 'brai',      url: 'https://brai.bizlegal-ai.com/api/digest',      source: 'brai' },
  { name: 'lexaudit',  url: 'https://lexaudit.bizlegal-ai.com/api/digest',  source: 'lexaudit' },
  { name: 'docai',     url: 'https://docai.bizlegal-ai.com/api/digest',     source: 'docai' },
  { name: 'leadforge', url: 'https://leadforge.bizlegal-ai.com/api/digest', source: 'leadforge' },
  { name: 'forge',     url: 'https://forge.bizlegal-ai.com/api/digest',     source: 'forge' },
  { name: 'oci',       url: 'https://router.bizlegal-ai.com/health',        source: 'oci' },
]

interface ProbeResult {
  name: string
  source: SmokeTarget['source']
  url: string
  status: number | null
  ok: boolean
  duration_ms: number
  error?: string
}

async function probe(target: SmokeTarget): Promise<ProbeResult> {
  const start = Date.now()
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 8000)
  try {
    const res = await fetch(target.url, {
      method: 'GET',
      signal: controller.signal,
      headers: { 'user-agent': 'bizlegal-smoke-cron/1.0' },
      cache: 'no-store',
    })
    clearTimeout(timer)
    return {
      name: target.name,
      source: target.source,
      url: target.url,
      status: res.status,
      ok: res.ok,
      duration_ms: Date.now() - start,
    }
  } catch (err) {
    clearTimeout(timer)
    return {
      name: target.name,
      source: target.source,
      url: target.url,
      status: null,
      ok: false,
      duration_ms: Date.now() - start,
      error: err instanceof Error ? err.name : String(err),
    }
  }
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') ?? ''
    const expected = `Bearer ${process.env.CRON_SECRET ?? ''}`
    const url = new URL(req.url)
    const manual = url.searchParams.get('secret') === process.env.CRON_SECRET && url.searchParams.get('now') === '1'
    if (!manual) {
      if (!process.env.CRON_SECRET || authHeader !== expected) {
        return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
      }
    }

    const results = await Promise.all(TARGETS.map(probe))
    const failures = results.filter((r) => !r.ok)

    // Per-failure error event so /ops feed can show which subdomain went down.
    for (const f of failures) {
      logEventAsync({
        type: 'error',
        source: f.source,
        ref_id: `smoke/${f.name}`,
        status: 'failed',
        metadata: {
          smoke_check: 'digest',
          url: f.url,
          status: f.status,
          duration_ms: f.duration_ms,
          error: f.error ?? null,
        },
      })
    }

    logEventAsync({
      type: 'cron.completed',
      source: 'hub',
      ref_id: 'smoke',
      status: failures.length > 0 ? 'failed' : 'ok',
      metadata: {
        cron: 'smoke',
        targets: TARGETS.length,
        ok: results.length - failures.length,
        failed: failures.length,
        results: results.map((r) => ({
          name: r.name,
          status: r.status,
          ok: r.ok,
          ms: r.duration_ms,
        })),
      },
    })

    return NextResponse.json({
      ok: failures.length === 0,
      checked: results.length,
      failures: failures.length,
      results,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown error'
    console.error('[cron/smoke]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
