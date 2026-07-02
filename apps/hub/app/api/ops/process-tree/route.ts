import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const maxDuration = 15

/**
 * GET /api/ops/process-tree
 *
 * Phase 1 of PLATFORM-BUILD-2026-07-02 — live process inspection.
 *
 * Returns the latest heartbeat per service, with parent/child links
 * derived from parent_service. Renders as a tree (services grouped by
 * parent). The /ops/live UI uses this for the left-pane tree view.
 *
 * Token-gated by OPS_DASHBOARD_TOKEN.
 *
 * Response:
 *   {
 *     generated_at: ISO,
 *     roots: [ service_name, ... ],
 *     tree: {
 *       <parent>: [ { child, status, last_action, ... } ]
 *     },
 *     orphans: [ { service, status, ... } ]  // no parent_service set
 *   }
 */

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase env not configured')
  return createClient(url, key)
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('t')
  const expected = process.env.OPS_DASHBOARD_TOKEN
  if (!expected || token !== expected) {
    return NextResponse.json({ error: 'not found' }, { status: 404 })
  }

  try {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('agent_heartbeats')
      .select('*')
      .order('pinged_at', { ascending: false })
      .limit(500)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Latest per service
    const byService = new Map<string, Record<string, unknown>>()
    for (const hb of data ?? []) {
      const key = String(hb.service)
      if (!byService.has(key)) byService.set(key, hb)
    }

    const all = Array.from(byService.values() as Iterable<Record<string, unknown>>)
    const tree: Record<string, Array<Record<string, unknown>>> = {}
    const orphans: Array<Record<string, unknown>> = []
    const rootNames = new Set<string>()

    // First, identify root services (no parent_service)
    for (const s of all) {
      if (!s.parent_service) {
        rootNames.add(String(s.service))
      }
    }

    // Group children under their parents
    for (const s of all) {
      const parent = s.parent_service ? String(s.parent_service) : null
      if (parent) {
        if (!tree[parent]) tree[parent] = []
        tree[parent].push(s)
      } else {
        orphans.push(s)
      }
    }

    return NextResponse.json(
      {
        generated_at: new Date().toISOString(),
        roots: Array.from(rootNames).sort(),
        tree,
        orphans,
      },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
