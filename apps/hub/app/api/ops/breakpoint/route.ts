import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * GET/POST /api/ops/breakpoint
 *
 * Phase 4 of PLATFORM-BUILD-2026-07-02 — debugger layer.
 *
 * In-memory breakpoint registry. Vercel serverless cold starts clear it,
 * which is fine — breakpoints are ephemeral debugging aids.
 *
 * Auth: ?t=OPS_DASHBOARD_TOKEN
 *
 * POST body: { service: string, enabled: boolean, condition?: string }
 * POST response: { ok: true, breakpoints: Breakpoint[] }
 *
 * GET response: { breakpoints: Breakpoint[] }
 */

interface Breakpoint {
  service: string
  enabled: boolean
  condition: string | null
  set_at: string
}

// Module-level store — intentionally ephemeral (serverless cold-start safe)
const breakpointStore = new Map<string, Breakpoint>()

interface BreakpointBody {
  service?: unknown
  enabled?: unknown
  condition?: unknown
}

function authCheck(req: NextRequest): boolean {
  const token = req.nextUrl.searchParams.get('t')
  const expected = process.env.OPS_DASHBOARD_TOKEN
  return Boolean(expected && token === expected)
}

export async function GET(req: NextRequest) {
  if (!authCheck(req)) {
    return NextResponse.json({ error: 'not found' }, { status: 404 })
  }

  return NextResponse.json(
    { breakpoints: Array.from(breakpointStore.values()) },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}

export async function POST(req: NextRequest) {
  if (!authCheck(req)) {
    return NextResponse.json({ error: 'not found' }, { status: 404 })
  }

  try {
    const body = (await req.json()) as BreakpointBody

    if (typeof body.service !== 'string' || !body.service) {
      return NextResponse.json({ error: 'service (string) required' }, { status: 400 })
    }
    if (typeof body.enabled !== 'boolean') {
      return NextResponse.json({ error: 'enabled (boolean) required' }, { status: 400 })
    }

    const bp: Breakpoint = {
      service: body.service,
      enabled: body.enabled,
      condition: typeof body.condition === 'string' ? body.condition : null,
      set_at: new Date().toISOString(),
    }

    if (bp.enabled) {
      breakpointStore.set(bp.service, bp)
    } else {
      breakpointStore.delete(bp.service)
    }

    return NextResponse.json(
      { ok: true, breakpoints: Array.from(breakpointStore.values()) },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
