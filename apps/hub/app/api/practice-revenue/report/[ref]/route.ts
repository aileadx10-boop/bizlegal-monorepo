// app/api/practice-revenue/report/[ref]/route.ts
//
// GET: the report behind a bearer reference. Headline totals, findings and
// the single teaser client row are always returned; the full report only
// when paid_at is set (the SellerRadar rule — gate on paid_at, never on tier).
// 410 once expires_at has passed.

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { rateLimit, clientIpFromHeaders } from '@bizlegal/rate-limit'
import type { PracticeRevenueReport } from '@/lib/practice-revenue/types'

export const dynamic = 'force-dynamic'
export const maxDuration = 10

const REF_RE = /^PR-\d{4}-[0-9a-f]{10}$/i

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ ref: string }> }) {
  const ip = clientIpFromHeaders(req.headers) ?? 'unknown'
  const rl = rateLimit('practice-revenue-report', ip, { windowMs: 60_000, limit: 30 })
  if (!rl.ok) return NextResponse.json({ error: 'rate_limited' }, { status: 429, headers: { 'retry-after': String(Math.ceil(rl.retryAfterMs / 1000)) } })

  const { ref: raw } = await ctx.params
  const ref = (raw ?? '').trim().toUpperCase()
  if (!REF_RE.test(ref)) return NextResponse.json({ error: 'invalid_ref' }, { status: 400 })

  const supabase = getSupabase()
  if (!supabase) return NextResponse.json({ error: 'report_store_unavailable' }, { status: 503 })

  const { data, error } = await supabase
    .from('practice_revenue_reports')
    .select('report_ref, as_of, currency, findings, report, paid_at, created_at, expires_at')
    .eq('report_ref', ref)
    .maybeSingle()

  if (error || !data) return NextResponse.json({ error: 'not_found' }, { status: 404 })
  if (data.expires_at && new Date(data.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ error: 'expired', message: 'This report has expired and its data was deleted. Upload again to get fresh totals.' }, { status: 410 })
  }

  const report = data.report as PracticeRevenueReport
  const paid = data.paid_at !== null
  const teaser = report.clients.find((c) => c.rank === 1) ?? report.clients[0] ?? null

  return NextResponse.json(
    {
      ok: true,
      report_ref: data.report_ref,
      paid,
      as_of: data.as_of,
      currency: data.currency,
      created_at: data.created_at,
      expires_at: data.expires_at,
      headline: report.headline,
      findings: report.findings,
      coverage: report.coverage,
      benchmark: report.benchmark,
      teaser,
      report: paid ? report : null,
    },
    { headers: { 'Cache-Control': 'private, no-store' } },
  )
}
