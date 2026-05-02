import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import type { FrameworkId } from '@/lib/health-score/signals'
import { FRAMEWORK_LABELS, signalsByFramework } from '@/lib/health-score/signals'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

/**
 * GET /api/monitor/check?frameworks=soc2,gdpr,hipaa
 *
 * Returns the most recent framework-index snapshots + last-7-days change
 * count per framework. Used by hub /compliance-monitor to render the live
 * change feed.
 *
 * HMAC-signed inter-service POST also supported with `frameworks` body.
 *
 * REVENUE+LIABILITY: surfaces public source URLs + SHA-256 hashes only.
 * Never returns the customer's evaluated signals or any firm data.
 */

interface FrameworkIndexRow {
  framework_id: string
  source_url: string
  source_version: string | null
  fetched_at: string
  is_change: boolean
  change_summary: string | null
  affected_signal_ids: string[]
}

interface CheckResponse {
  framework_id: string
  framework_label: string
  signal_count: number
  source_url: string
  source_version: string | null
  last_checked: string
  changes_last_7d: number
  most_recent_change: { fetched_at: string; affected_signal_ids: string[] } | null
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase env not configured')
  return createClient(url, key)
}

function verifyHmac(req: NextRequest, body: string): boolean {
  const secret = process.env.BIZLEGAL_INBOUND_SECRET
  if (!secret) return false
  const sig = req.headers.get('x-bizlegal-signature') ?? ''
  if (!sig) return false
  const expected = crypto.createHmac('sha256', secret).update(body).digest('hex')
  return sig === expected
}

const ALL_FRAMEWORKS = ['soc2', 'iso27001', 'gdpr', 'hipaa', 'dpdp', 'nist-800-53'] as const

function labelFor(id: string): string {
  if (id === 'nist-800-53') return 'NIST SP 800-53 Rev. 5'
  return FRAMEWORK_LABELS[id as FrameworkId] ?? id
}

function signalCountFor(id: string): number {
  if (id === 'nist-800-53') return 0  // not in LexAudit signals registry yet
  return signalsByFramework(id as FrameworkId).length
}

async function buildResponse(frameworks: string[]): Promise<CheckResponse[]> {
  const supabase = getSupabase()
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const result: CheckResponse[] = []

  for (const fw of frameworks) {
    const { data: latest } = await supabase
      .from('compliance_framework_index')
      .select('framework_id, source_url, source_version, fetched_at, is_change, change_summary, affected_signal_ids')
      .eq('framework_id', fw)
      .order('fetched_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    const { count: changeCount } = await supabase
      .from('compliance_framework_index')
      .select('id', { count: 'exact', head: true })
      .eq('framework_id', fw)
      .eq('is_change', true)
      .gte('fetched_at', sevenDaysAgo)

    const { data: lastChange } = await supabase
      .from('compliance_framework_index')
      .select('fetched_at, affected_signal_ids')
      .eq('framework_id', fw)
      .eq('is_change', true)
      .order('fetched_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    const row = latest as FrameworkIndexRow | null
    result.push({
      framework_id: fw,
      framework_label: labelFor(fw),
      signal_count: signalCountFor(fw),
      source_url: row?.source_url ?? '',
      source_version: row?.source_version ?? null,
      last_checked: row?.fetched_at ?? new Date(0).toISOString(),
      changes_last_7d: changeCount ?? 0,
      most_recent_change: lastChange
        ? {
            fetched_at: lastChange.fetched_at,
            affected_signal_ids: lastChange.affected_signal_ids ?? [],
          }
        : null,
    })
  }

  return result
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const param = url.searchParams.get('frameworks') ?? ''
    const requested = param
      ? param
          .split(',')
          .map((s) => s.trim().toLowerCase())
          .filter((s) => (ALL_FRAMEWORKS as readonly string[]).includes(s))
      : (ALL_FRAMEWORKS as readonly string[]).slice()

    if (requested.length === 0) {
      return NextResponse.json({ error: 'no valid frameworks requested' }, { status: 400 })
    }

    const result = await buildResponse(requested)
    return NextResponse.json({
      frameworks: result,
      generated_at: new Date().toISOString(),
      legal_notice:
        'Source-monitoring service. We hash canonical regulator publications and surface changes. We do not interpret changes, attest your compliance posture, or guarantee compliance.',
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown error'
    console.error('[monitor/check] GET', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const raw = await req.text()
    if (!verifyHmac(req, raw)) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }
    const body = (raw ? JSON.parse(raw) : {}) as { frameworks?: string[] }
    const requested = (body.frameworks ?? []).filter((s): s is string => typeof s === 'string')
    if (requested.length === 0) {
      return NextResponse.json({ error: 'frameworks array required' }, { status: 400 })
    }
    const filtered = requested
      .map((s) => s.trim().toLowerCase())
      .filter((s) => (ALL_FRAMEWORKS as readonly string[]).includes(s))
    if (filtered.length === 0) {
      return NextResponse.json({ error: 'no valid frameworks' }, { status: 400 })
    }
    const result = await buildResponse(filtered)
    return NextResponse.json({
      frameworks: result,
      generated_at: new Date().toISOString(),
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown error'
    console.error('[monitor/check] POST', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
