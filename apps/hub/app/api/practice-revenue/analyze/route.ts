// app/api/practice-revenue/analyze/route.ts
//
// POST: pseudonymised CSV text → pure engine → free-totals row → totals email.
//
// The browser has already replaced client, matter and invoice identifiers
// with codes and dropped description columns (lib/practice-revenue/
// pseudonymise.ts). This route still scans every cell for anything that looks
// like an email address, SSN or phone number and refuses (422) rather than
// storing it. No LLM, no third-party call except Supabase and the
// transactional email.

import { randomBytes } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { rateLimit, clientIpFromHeaders } from '@bizlegal/rate-limit'
import { sendEmail } from '@bizlegal/email'
import { logEventAsync } from '@/lib/ops/log'
import { MAX_CSV_CHARS, findPiiCells, parseInvoicesCsv, parseTimeEntriesCsv, splitCsv } from '@/lib/practice-revenue/csv'
import type { InvoiceField, TimeField } from '@/lib/practice-revenue/csv'
import { formatMoney } from '@/lib/practice-revenue/drafts'
import { computeReport } from '@/lib/practice-revenue/engine'
import type { ClientRow, DateFormat, Headline, PracticeRevenueReport } from '@/lib/practice-revenue/types'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

const RATE_LIMIT = { windowMs: 60_000, limit: 5 }
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const ISO_RE = /^\d{4}-\d{2}-\d{2}$/
const SITE = 'https://bizlegal-ai.com'
const FROM = 'BizLegal AI <orders@intelligence.bizlegal-ai.com>'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

function newReportRef(): string {
  return `PR-${new Date().getUTCFullYear()}-${randomBytes(5).toString('hex')}`
}

/** The one free per-client row: rank 1, codes only. */
function teaserOf(report: PracticeRevenueReport): ClientRow | null {
  return report.clients.find((c) => c.rank === 1) ?? report.clients[0] ?? null
}

function money(cents: number | null, currency: string): string {
  return cents === null ? 'not computable from this export' : formatMoney(cents, currency)
}

function totalsEmail(ref: string, h: Headline, currency: string): { subject: string; text: string; html: string } {
  const url = `${SITE}/practice-revenue/report/${encodeURIComponent(ref)}`
  const lines = [
    `Open receivables: ${money(h.arOpenCents, currency)}`,
    `Past due 60+ days: ${money(h.overdue60Cents, currency)}`,
    `Unbilled work: ${money(h.unbilledCents, currency)}`,
    `Collection rate: ${h.collectionPct === null ? 'not computable' : `${h.collectionPct}%`}`,
    `Realization rate: ${h.realizationPct === null ? 'not computable' : `${h.realizationPct}%`}`,
  ]
  const text = [
    'Hello,',
    '',
    `Your free totals (reference ${ref}):`,
    ...lines.map((l) => `- ${l}`),
    '',
    `Full report (every invoice and client row, timing counterfactuals, reminder drafts): ${url}`,
    '',
    'Totals are arithmetic on the export you uploaded; not a financial statement; not legal, tax or accounting advice. Free totals are kept for 14 days.',
    '',
    'BizLegal AI (DOR INNOVATIONS) — a software company, not a law firm.',
  ].join('\n')
  const html = `<div style="font-family:Georgia,serif;font-size:15px;line-height:1.7;color:#111;max-width:620px">
<p>Hello,</p>
<p>Your free totals (reference <strong>${ref}</strong>):</p>
<ul>${lines.map((l) => `<li>${l}</li>`).join('')}</ul>
<p>Full report (every invoice and client row, timing counterfactuals, reminder drafts): <a href="${url}">${url}</a></p>
<p style="font-size:12px;color:#555">Totals are arithmetic on the export you uploaded; not a financial statement; not legal, tax or accounting advice. Free totals are kept for 14 days. BizLegal AI (DOR INNOVATIONS) &mdash; a software company, not a law firm.</p>
</div>`
  return { subject: `Your practice revenue totals (${ref})`, text, html }
}

const TIME_NUMERIC: readonly TimeField[] = ['hours', 'rate', 'amount', 'invoiceId', 'date']
const INVOICE_NUMERIC: readonly InvoiceField[] = ['invoiceId', 'amount', 'paid', 'balance', 'issuedDate', 'dueDate', 'paidDate']

export async function POST(req: NextRequest) {
  const ip = clientIpFromHeaders(req.headers) ?? 'unknown'
  const rl = rateLimit('practice-revenue', ip, RATE_LIMIT)
  if (!rl.ok) {
    return NextResponse.json(
      { error: 'rate_limited', message: 'Too many uploads — please wait a minute and try again.' },
      { status: 429, headers: { 'retry-after': String(Math.ceil(rl.retryAfterMs / 1000)) } },
    )
  }

  let body: Record<string, unknown>
  try {
    body = (await req.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const invoicesCsv = typeof body.invoicesCsv === 'string' ? body.invoicesCsv : ''
  const timeCsv = typeof body.timeCsv === 'string' && body.timeCsv.trim() ? body.timeCsv : null
  const dateFormat = body.dateFormat === 'dmy' || body.dateFormat === 'mdy' ? (body.dateFormat as DateFormat) : undefined
  const currency = typeof body.currency === 'string' && /^[A-Z]{3}$/.test(body.currency) ? body.currency : 'USD'
  const asOf = typeof body.asOf === 'string' && ISO_RE.test(body.asOf) ? body.asOf : new Date().toISOString().slice(0, 10)

  if (!EMAIL_RE.test(email)) return NextResponse.json({ error: 'invalid_email', message: 'Enter the email address the totals should go to.' }, { status: 400 })
  if (!invoicesCsv) return NextResponse.json({ error: 'invoices_required', message: 'The invoice export is required.' }, { status: 400 })
  if (invoicesCsv.length > MAX_CSV_CHARS || (timeCsv && timeCsv.length > MAX_CSV_CHARS)) {
    return NextResponse.json({ error: 'too_large', message: 'Each file must be under 4 MB.' }, { status: 413 })
  }

  const inv = parseInvoicesCsv(invoicesCsv, { dateFormat })
  if (!inv.ok || !inv.headerMap) {
    return NextResponse.json({ error: 'invoices_unparseable', message: inv.error, findings: inv.findings, dateFormat: inv.dateFormat }, { status: 422 })
  }
  const time = timeCsv ? parseTimeEntriesCsv(timeCsv, { dateFormat }) : null
  if (time && (!time.ok || !time.headerMap)) {
    return NextResponse.json({ error: 'time_unparseable', message: time.error, findings: time.findings, dateFormat: time.dateFormat }, { status: 422 })
  }

  // Server-side backstop: refuse anything that looks like contact details.
  const invGrid = splitCsv(invoicesCsv)
  const invNumeric = new Set(INVOICE_NUMERIC.map((f) => inv.headerMap?.colOf.get(f)).filter((c): c is number => c !== undefined))
  const pii = findPiiCells(invGrid, invNumeric)
  if (time && time.headerMap) {
    const timeGrid = splitCsv(timeCsv as string)
    const timeNumeric = new Set(TIME_NUMERIC.map((f) => time.headerMap?.colOf.get(f)).filter((c): c is number => c !== undefined))
    pii.push(...findPiiCells(timeGrid, timeNumeric).map((h) => ({ ...h, row: h.row + 1_000_000 })))
  }
  if (pii.length > 0) {
    return NextResponse.json(
      {
        error: 'pii_detected',
        message: 'A cell looks like an email address, phone number or ID number. Use the in-browser name key (it replaces names with codes) and remove contact columns before uploading.',
        hits: pii.slice(0, 5).map((h) => ({ kind: h.kind, file: h.row >= 1_000_000 ? 'time' : 'invoices' })),
      },
      { status: 422 },
    )
  }

  const report = computeReport({
    time: time ? time.rows : [],
    invoices: inv.rows,
    timeColumns: time ? time.columns : [],
    invoiceColumns: inv.columns,
    hasTimeFile: time !== null,
    options: { asOf, currency },
    parseFindings: [...inv.findings, ...(time ? time.findings : [])],
  })

  const supabase = getSupabase()
  if (!supabase) return NextResponse.json({ error: 'report_store_unavailable' }, { status: 503 })

  const ref = newReportRef()
  const h = report.headline
  const { data: row, error } = await supabase
    .from('practice_revenue_reports')
    .insert({
      report_ref: ref,
      email,
      tier: 'free',
      status: 'delivered',
      as_of: asOf,
      currency,
      engine_version: 1,
      pseudonymised: true,
      time_entry_count: report.coverage.timeEntries,
      invoice_count: report.coverage.invoices,
      unbilled_cents: h.unbilledCents,
      unbilled_aged_cents: h.unbilledAgedCents,
      ar_open_cents: h.arOpenCents,
      overdue_60_cents: h.overdue60Cents,
      realization_pct: h.realizationPct,
      collection_pct: h.collectionPct,
      utilization_pct: h.utilizationPct,
      dso_days: h.dsoDays,
      lockup_days: h.lockupDays,
      dormant_client_count: h.dormantClientCount,
      findings: report.findings,
      report,
    })
    .select('report_ref, expires_at')
    .single()

  if (error || !row) {
    console.error('[practice-revenue/analyze] insert failed:', error?.message)
    logEventAsync({ type: 'error', source: 'hub', ref_id: ref, status: 'failed', metadata: { where: 'practice-revenue/analyze', error: error?.message ?? 'insert_failed' } })
    return NextResponse.json({ error: 'report_store_failed', message: 'The report store is temporarily unavailable. Please retry in a minute.' }, { status: 503 })
  }

  // Opportunistic retention sweep; no cron needed.
  void supabase
    .from('practice_revenue_reports')
    .delete()
    .lt('expires_at', new Date().toISOString())
    .then(() => undefined, () => undefined)

  const mail = totalsEmail(ref, h, currency)
  void sendEmail({ to: email, ...mail, kind: 'transactional', from: FROM, idempotencyKey: `prr-free-${ref}` }).then(
    (r) => {
      if (!r.ok) console.warn('[practice-revenue/analyze] totals email not sent:', r.error)
    },
    () => undefined,
  )

  logEventAsync({
    type: 'lead.qualified',
    source: 'hub',
    ref_id: ref,
    email,
    status: 'ok',
    metadata: {
      product: 'practice_revenue_report',
      has_time_file: time !== null,
      ar_open_cents: h.arOpenCents,
      overdue_60_cents: h.overdue60Cents,
      unbilled_cents: h.unbilledCents,
    },
  })

  return NextResponse.json({
    ok: true,
    report_ref: ref,
    expires_at: row.expires_at,
    as_of: asOf,
    currency,
    headline: h,
    findings: report.findings,
    coverage: report.coverage,
    teaser: teaserOf(report),
  })
}

export const GET = () => NextResponse.json({ error: 'POST only' }, { status: 405 })
