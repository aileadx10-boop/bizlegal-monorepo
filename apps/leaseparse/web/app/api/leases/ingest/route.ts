/**
 * POST /api/leases/ingest
 *
 * Step 2 of the DocParse flow. Called after the browser has PUT the PDF
 * to Supabase Storage via the signed URL from /api/leases/upload-url.
 *
 * Pipeline:
 *   1. Download PDF from Supabase Storage (private bucket)
 *   2. Extract plain text with pdf-parse
 *   3. Extract lease abstract with Hermes (Ollama, $0 marginal cost)
 *   4. If confidence < CONFIDENCE_FLOOR (0.85), fall back to Claude Haiku
 *   5. Derive critical-date alerts
 *   6. Persist extracted_json + critical_dates + risk_flags to leaseparse_leases
 *   7. Return the full extraction result
 *
 * Uses Node.js runtime because pdf-parse relies on Node builtins.
 * maxDuration 300 (Vercel Pro) to handle large leases + slow Ollama.
 *
 * Body: { lease_id, storage_path, order_id? }
 * Query: ?order=<hub payment_orders id>  (alternative to body order_id)
 *
 * PAID GATE (§B4, 2026-09-15) — the gap this route used to carry is closed.
 * Before it downloads anything, it resolves the lease's paid credit
 * (lib/payments/credits.ts): 503 checkout_dark while LEASEPARSE_CHECKOUT_LIVE
 * is off, 402 payment_required when no unused credit covers the lease. The
 * credit is consumed only once the abstract has actually been delivered, so a
 * failed parse never costs the buyer their purchase.
 *
 * COST GATE: the Claude calls below reserve their worst-case spend against the
 * $80/mo counter first (lib/extract/llm-budget.ts). Over cap, the lease is
 * parked as 'pending_budget' and NO model call is made.
 */

import { NextRequest, NextResponse } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { getServiceClient } from '@/lib/db/client'
import { extractWithHermes, scoreConfidence } from '@/lib/extract/hermes-first'
import { shouldFallback, extractWithClaude } from '@/lib/extract/claude-fallback'
import { isBudgetExceeded, type LlmBudgetExceededError } from '@/lib/extract/llm-budget'
import { deriveCriticalDates } from '@/lib/extract/date-engine'
import { extractPdfText } from '@/lib/extract/pdf-text'
import { scoreLeaseRisk } from '@/lib/risk/score-engine'
import { deliverLeaseReport } from '@/lib/report/deliver'
import { logEventAsync } from '@/lib/ops/log'
import {
  consumeLeaseCredit,
  normaliseOrderId,
  requireLeaseCredit,
} from '@/lib/payments/credits'
import type { ExtractionResult } from '@/lib/extract/types'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 300

const BUCKET = 'lease-documents'

/**
 * Park the job instead of spending over the cap. The credit is deliberately
 * left unconsumed — the buyer has paid and the abstract is still owed; it is
 * the spend that is deferred, not the deliverable.
 */
async function holdForBudget(
  db: SupabaseClient,
  leaseId: string,
  email: string | null,
  err: LlmBudgetExceededError,
): Promise<NextResponse> {
  await db
    .from('leaseparse_leases')
    .update({ parse_status: 'pending_budget' })
    .eq('id', leaseId)

  logEventAsync({
    type: 'error',
    source: 'leaseparse',
    ref_id: leaseId,
    email: email ?? undefined,
    status: 'pending',
    metadata: {
      step: 'llm_budget',
      reason: err.reason,
      model: err.model,
      estimate_usd: err.estimateUsd,
      spent_usd: err.spentUsd,
      cap_usd: err.capUsd,
    },
  })

  return NextResponse.json(
    {
      ok: false,
      error: 'llm_budget_exceeded',
      lease_id: leaseId,
      parse_status: 'pending_budget',
      detail:
        'This lease needs the high-accuracy engine, and the monthly extraction budget is spent. Your purchase is held, not lost — we finish the abstract when the budget resets, or sooner if you email team@bizlegal-ai.com.',
    },
    { status: 503 },
  )
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const { lease_id, storage_path } = body as Record<string, unknown>

  if (typeof lease_id !== 'string' || !lease_id) {
    return NextResponse.json({ error: 'lease_id_required' }, { status: 400 })
  }
  if (typeof storage_path !== 'string' || !storage_path) {
    return NextResponse.json({ error: 'storage_path_required' }, { status: 400 })
  }

  const db = getServiceClient()

  // Verify the lease row exists and hasn't already been parsed
  const { data: lease, error: fetchErr } = await db
    .from('leaseparse_leases')
    .select('id, email, parsed_at, paid_order_id')
    .eq('id', lease_id)
    .single()

  if (fetchErr || !lease) {
    return NextResponse.json({ error: 'lease_not_found' }, { status: 404 })
  }
  if (lease.parsed_at) {
    return NextResponse.json({ error: 'already_parsed', lease_id }, { status: 409 })
  }

  // ── The gate. Resolve the paid credit before a single byte is downloaded,
  //    a model is called, or an email is sent. ───────────────────────────────
  const orderId =
    normaliseOrderId(req.nextUrl.searchParams.get('order')) ||
    normaliseOrderId((body as Record<string, unknown>).order_id) ||
    normaliseOrderId(lease.paid_order_id)

  const gate = await requireLeaseCredit(db, { email: lease.email ?? undefined, orderId })
  if (!gate.ok) {
    logEventAsync({
      type: 'payment.failed',
      source: 'leaseparse',
      ref_id: lease_id,
      email: lease.email ?? undefined,
      status: 'failed',
      metadata: { step: 'ingest_gate', error: gate.body.error, order_id: orderId || null },
    })
    return NextResponse.json(gate.body, { status: gate.status })
  }
  const credit = gate.credit

  // 1. Download PDF from Supabase Storage
  const { data: fileData, error: downloadErr } = await db.storage
    .from(BUCKET)
    .download(storage_path)

  if (downloadErr || !fileData) {
    console.error('[leases/ingest] download failed', downloadErr?.message)
    return NextResponse.json({ error: 'storage_download_failed' }, { status: 500 })
  }

  // 2. Extract the text layer. A scanned PDF stops here — LeaseParse has no
  //    OCR (fixed scope), and an image-only lease must reach the refund path
  //    rather than an LLM, which would happily invent an abstract from nothing.
  const arrayBuffer = await fileData.arrayBuffer()
  const pdfText = await extractPdfText(Buffer.from(arrayBuffer))

  if (!pdfText.ok) {
    const refundable = pdfText.reason === 'no_text_layer' || pdfText.reason === 'empty_file'
    console.warn('[leases/ingest] text extraction failed', pdfText.reason, pdfText.message)

    await db
      .from('leaseparse_leases')
      .update({
        extracted_json: { unparseable: pdfText.reason, message: pdfText.message },
        parse_status: 'failed',
      })
      .eq('id', lease_id)

    logEventAsync({
      type: 'error',
      source: 'leaseparse',
      ref_id: lease_id,
      email: lease.email ?? undefined,
      status: 'failed',
      metadata: {
        step: 'pdf_text_extraction',
        reason: pdfText.reason,
        pages: pdfText.pages,
        chars: pdfText.chars,
        refund_required: refundable,
      },
    })

    return NextResponse.json(
      {
        ok: false,
        error: refundable ? 'scanned_pdf_not_supported' : 'pdf_parse_failed',
        lease_id,
        refund_required: refundable,
        detail: pdfText.message,
        next_step: refundable
          ? 'LeaseParse reads text-layer PDFs only. This document has no extractable text, so the order is refundable — contact team@bizlegal-ai.com and we will refund it.'
          : 'The PDF could not be read. Re-upload or contact team@bizlegal-ai.com.',
      },
      { status: 422 }
    )
  }

  const leaseText = pdfText.text

  // 3. Extract with Hermes (Ollama)
  let result: ExtractionResult
  let hermesWarnings: string[] = []

  try {
    result = await extractWithHermes(leaseText)
    hermesWarnings = result.warnings
  } catch (hermesErr) {
    // Hermes unavailable — fall straight to Claude
    console.warn('[leases/ingest] hermes failed, falling to claude',
      hermesErr instanceof Error ? hermesErr.message : hermesErr)
    try {
      result = await extractWithClaude(leaseText, { budgetDb: db })
    } catch (claudeErr) {
      // Over the monthly cap: park the job rather than deliver nothing and
      // rather than spend past the budget. No model call was made.
      if (isBudgetExceeded(claudeErr)) {
        return holdForBudget(db, lease_id, lease.email ?? null, claudeErr)
      }
      console.error('[leases/ingest] both engines failed',
        claudeErr instanceof Error ? claudeErr.message : claudeErr)
      await db.from('leaseparse_leases').update({ parse_status: 'failed' }).eq('id', lease_id)
      return NextResponse.json({ error: 'extraction_failed_both_engines' }, { status: 502 })
    }
  }

  // 4. Claude fallback if confidence too low
  if (shouldFallback(result)) {
    const hermesConfidence = result.confidence
    try {
      const claudeResult = await extractWithClaude(leaseText, { budgetDb: db })
      // Use Claude result — it should be more complete
      result = claudeResult
      logEventAsync({
        type: 'cron.completed',
        source: 'leaseparse',
        ref_id: lease_id,
        email: lease.email ?? undefined,
        metadata: {
          step: 'claude_fallback',
          hermes_confidence: hermesConfidence,
          claude_confidence: claudeResult.confidence,
          hermes_warnings: hermesWarnings,
        },
      })
    } catch (claudeErr) {
      // Over the cap. The buyer paid for the accurate abstract, so shipping a
      // low-confidence Hermes result instead would be the wrong trade — hold
      // the job (credit unspent) until the budget resets.
      if (isBudgetExceeded(claudeErr)) {
        return holdForBudget(db, lease_id, lease.email ?? null, claudeErr)
      }
      // Claude fallback failed — keep Hermes result with warning
      console.warn('[leases/ingest] claude fallback failed, keeping hermes result',
        claudeErr instanceof Error ? claudeErr.message : claudeErr)
      result.warnings.push('claude_fallback_failed: using hermes result despite low confidence')
    }
  }

  // 5. Derive critical-date alerts and score the lease (both deterministic)
  const alerts = deriveCriticalDates(result.abstract)
  const risk = scoreLeaseRisk(result.abstract)

  // 6. Persist to DB. extracted_json carries the score alongside the abstract
  //    so the dashboard and report never recompute it inconsistently.
  const { error: updateErr } = await db
    .from('leaseparse_leases')
    .update({
      pdf_url: storage_path,
      extracted_json: { ...result.abstract, risk_score: risk },
      confidence_score: result.confidence,
      engine: result.engine,
      critical_dates: result.abstract.critical_dates,
      risk_flags: result.abstract.risk_flags,
      parsed_at: new Date().toISOString(),
      parse_status: 'parsed',
      paid_order_id: credit.order_id,
    })
    .eq('id', lease_id)

  if (updateErr) {
    console.error('[leases/ingest] db update failed', updateErr.message)
    return NextResponse.json({ error: 'db_update_failed' }, { status: 500 })
  }

  // The abstract exists and is persisted — the credit is now spent. One
  // purchase, one abstract: a second lease needs a second order.
  await consumeLeaseCredit(db, credit.id, lease_id)

  // 7. Generate + store the report and email the link. Delivery problems are
  //    logged, not fatal — the parse succeeded and the row is already saved.
  const delivery = await deliverLeaseReport({
    db,
    leaseId: lease_id,
    email: lease.email ?? null,
    abstract: result.abstract,
    risk,
    alerts,
    engine: result.engine,
    confidence: result.confidence,
    warnings: result.warnings,
  })

  if (delivery.issues.length > 0) {
    console.warn('[leases/ingest] delivery issues', delivery.issues.join('; '))
  }

  logEventAsync({
    type: delivery.emailed ? 'email.sent' : 'email.failed',
    source: 'leaseparse',
    ref_id: lease_id,
    email: lease.email ?? undefined,
    status: delivery.emailed ? 'ok' : 'failed',
    metadata: { step: 'report_delivery', report_url: delivery.reportUrl, issues: delivery.issues },
  })

  logEventAsync({
    type: 'download.report',
    source: 'leaseparse',
    ref_id: lease_id,
    email: lease.email ?? undefined,
    status: 'ok',
    metadata: {
      engine: result.engine,
      confidence: result.confidence,
      risk_score: risk.score,
      risk_grade: risk.grade,
      critical_date_count: result.abstract.critical_dates.length,
      risk_flag_count: result.abstract.risk_flags.length,
      upcoming_alert_count: alerts.length,
      warnings: result.warnings,
    },
  })

  return NextResponse.json({
    ok: true,
    lease_id,
    order_id: credit.order_id,
    engine: result.engine,
    confidence: result.confidence,
    abstract: result.abstract,
    risk,
    report_url: delivery.reportUrl,
    emailed: delivery.emailed,
    upcoming_alerts: alerts,
    warnings: result.warnings,
  })
}
