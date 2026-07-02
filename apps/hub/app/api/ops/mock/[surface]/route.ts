import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * GET/POST /api/ops/mock/[surface]
 *
 * Phase 4 of PLATFORM-BUILD-2026-07-02 — debugger layer.
 *
 * Toggle mock mode for a named surface. When mock mode is enabled,
 * callers (or the debug shim) can check this endpoint to get a fake
 * response instead of hitting the real service.
 *
 * In-memory store — intentionally ephemeral (serverless cold-start safe).
 *
 * Auth: ?t=OPS_DASHBOARD_TOKEN
 *
 * Valid surfaces: hub | docai | tracr | brai | lexaudit | forge | leadforge
 *
 * POST body: { enabled: boolean, response?: object }
 * POST response: { ok: true, surface: string, state: MockState }
 *
 * GET response: { surface: string, state: MockState }
 *   When enabled=true, also includes state.response (the mock payload).
 */

type SurfaceName = 'hub' | 'docai' | 'tracr' | 'brai' | 'lexaudit' | 'forge' | 'leadforge'

const VALID_SURFACES = new Set<string>([
  'hub',
  'docai',
  'tracr',
  'brai',
  'lexaudit',
  'forge',
  'leadforge',
])

interface MockState {
  enabled: boolean
  response: Record<string, unknown> | null
  toggled_at: string
}

// Module-level store — intentionally ephemeral (serverless cold-start safe)
const mockStore = new Map<SurfaceName, MockState>()

interface MockBody {
  enabled?: unknown
  response?: unknown
}

function authCheck(req: NextRequest): boolean {
  const token = req.nextUrl.searchParams.get('t')
  const expected = process.env.OPS_DASHBOARD_TOKEN
  return Boolean(expected && token === expected)
}

export async function GET(
  req: NextRequest,
  { params }: { params: { surface: string } },
) {
  if (!authCheck(req)) {
    return NextResponse.json({ error: 'not found' }, { status: 404 })
  }

  const { surface } = params
  if (!VALID_SURFACES.has(surface)) {
    return NextResponse.json(
      { error: `unknown surface; valid: ${Array.from(VALID_SURFACES).join(', ')}` },
      { status: 400 },
    )
  }

  const state = mockStore.get(surface as SurfaceName) ?? {
    enabled: false,
    response: null,
    toggled_at: new Date().toISOString(),
  }

  return NextResponse.json(
    { surface, state },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}

export async function POST(
  req: NextRequest,
  { params }: { params: { surface: string } },
) {
  if (!authCheck(req)) {
    return NextResponse.json({ error: 'not found' }, { status: 404 })
  }

  const { surface } = params
  if (!VALID_SURFACES.has(surface)) {
    return NextResponse.json(
      { error: `unknown surface; valid: ${Array.from(VALID_SURFACES).join(', ')}` },
      { status: 400 },
    )
  }

  try {
    const body = (await req.json()) as MockBody

    if (typeof body.enabled !== 'boolean') {
      return NextResponse.json({ error: 'enabled (boolean) required' }, { status: 400 })
    }

    const state: MockState = {
      enabled: body.enabled,
      response:
        body.enabled &&
        body.response !== undefined &&
        typeof body.response === 'object' &&
        body.response !== null
          ? (body.response as Record<string, unknown>)
          : null,
      toggled_at: new Date().toISOString(),
    }

    mockStore.set(surface as SurfaceName, state)

    return NextResponse.json(
      { ok: true, surface, state },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
