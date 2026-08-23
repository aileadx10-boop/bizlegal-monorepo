import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyChain, type AuditChainRow } from '@/lib/audit-chain'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

/**
 * GET /api/ops/audit/verify?t=...&agent=...&date=YYYY-MM-DD
 *
 * Recomputes the agent_runs hash chain and reports whether it is valid.
 * Optional filters: agent (exact agent_name), date (created_at::date).
 * Token-gated by OPS_DASHBOARD_TOKEN (same pattern as /api/ops/feed — 404 on
 * mismatch so the route's existence is not leaked).
 */

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase env not configured')
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

function timingSafeEq(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return diff === 0
}

export async function GET(req: NextRequest) {
  try {
    const expected = process.env.OPS_DASHBOARD_TOKEN ?? ''
    const url = new URL(req.url)
    const provided = url.searchParams.get('token') ?? url.searchParams.get('t') ?? ''
    const headerToken = req.headers.get('x-ops-token') ?? ''
    const tokenInput = provided || headerToken
    if (!expected || !tokenInput || !timingSafeEq(expected, tokenInput)) {
      return NextResponse.json({ error: 'not found' }, { status: 404 })
    }

    const supabase = getSupabase()

    let query = supabase
      .from('agent_runs')
      .select('id, agent_name, workflow_id, action, status, details, target_email, created_at, payload_hash, prev_hash, chain_status')
      .order('created_at', { ascending: false })
      .limit(500)

    const agent = url.searchParams.get('agent')?.trim()
    if (agent) query = query.eq('agent_name', agent)

    const date = url.searchParams.get('date')?.trim()
    if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      const next = new Date(date)
      next.setUTCDate(next.getUTCDate() + 1)
      query = query.gte('created_at', `${date}T00:00:00.000Z`).lt('created_at', next.toISOString())
    }

    const { data, error } = await query
    if (error) throw new Error(error.message)

    const rows = (data ?? []) as AuditChainRow[]
    const result = verifyChain(rows)

    return NextResponse.json({
      generated_at: new Date().toISOString(),
      filters: { agent: agent ?? null, date: date ?? null },
      rows_loaded: rows.length,
      ...result,
      note: 'Tamper-evident, not tamper-proof: the chain proves the log was altered, not that the outcome was correct.',
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown error'
    console.error('[ops/audit/verify]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
