import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'node:crypto'
import { z } from 'zod'
import { logEventAsync } from '@/lib/ops/log'
import { scrapeMarkdown } from '@/lib/firecrawl/scrape'
import { resend } from '@/lib/resend'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * POST /api/risk-snapshot/generate
 *
 * Two modes on one route (the $19 AI Compliance Risk Snapshot pipeline):
 *
 * 1. INTAKE (public, rate-limited, no auth) — the /products/risk-snapshot
 *    form posts { mode: 'intake', url, jurisdiction, email } here (plain
 *    form-encoded POST or JSON). We persist a pending row in the existing
 *    `contract_scans` table (contract_type = 'risk_snapshot' — reused
 *    instead of creating a new table; url lives in `filename`, jurisdiction
 *    + status live in `ai_content` jsonb) and 303-redirect the browser to
 *    /checkout for the `risk_snapshot` SKU. The checkout email must match
 *    the form email — that's the fulfillment join key.
 *
 * 2. FULFILL (internal, authenticated) — called post-payment by the
 *    NOWPayments webhook (or manually by ops) with
 *    { order_id | email, url?, jurisdiction? }. Auth: either
 *    `Authorization: Bearer $CRON_SECRET` (cron idiom) or
 *    `x-bizlegal-signature` HMAC-SHA256 over the raw body with
 *    BIZLEGAL_INBOUND_SECRET (ops/log idiom). Pipeline:
 *    Firecrawl scrape → one Sonnet call → 2-page HTML report → Resend
 *    email ("Your AI Compliance Risk Snapshot") → contract_scans row
 *    updated with report HTML + status.
 *
 * Report prompt spec (canonical): agents/ea/prompts/risk-snapshot-report.md.
 * The prompt is inlined below because agents/ is not bundled into the hub
 * Vercel deployment (same pattern as services/worker inlining ea prompts).
 * Edit the .md first, then mirror here.
 */

// ── Simple in-memory rate limiter (same idiom as app/api/dashboard/auth) ──
const attempts = new Map<string, { count: number; resetAt: number }>()
const RL_WINDOW_MS = 10 * 60 * 1000
const RL_LIMIT = 5

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = attempts.get(ip)
  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + RL_WINDOW_MS })
    return false
  }
  entry.count++
  return entry.count > RL_LIMIT
}

// ── Supabase (service role — hub-only, per operating book) ──
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase env not configured')
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

// ── Auth for fulfill mode (CRON_SECRET bearer OR BIZLEGAL_INBOUND_SECRET HMAC) ──
function verifyHmac(body: string, sig: string | null, secret: string): boolean {
  if (!sig || !secret) return false
  const expected = crypto.createHmac('sha256', secret).update(body).digest('hex')
  if (expected.length !== sig.length) return false
  let diff = 0
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i)
  }
  return diff === 0
}

function isInternalCall(req: NextRequest, rawBody: string): boolean {
  const cronSecret = process.env.CRON_SECRET
  const authHeader = req.headers.get('authorization') ?? ''
  if (cronSecret && authHeader === `Bearer ${cronSecret}`) return true
  const inboundSecret = process.env.BIZLEGAL_INBOUND_SECRET ?? ''
  return verifyHmac(rawBody, req.headers.get('x-bizlegal-signature'), inboundSecret)
}

// ── Validation ──
const JURISDICTIONS = ['US', 'EU', 'UK', 'UAE', 'SG', 'other'] as const

const intakeSchema = z.object({
  url: z
    .string()
    .trim()
    .max(500)
    .url()
    .refine((u) => /^https?:\/\//i.test(u), 'http(s) URLs only')
    .refine((u) => {
      try {
        return new URL(u).hostname.includes('.')
      } catch {
        return false
      }
    }, 'invalid hostname'),
  jurisdiction: z.enum(JURISDICTIONS).default('US'),
  email: z.string().trim().toLowerCase().email().max(200),
})

const fulfillSchema = z
  .object({
    order_id: z.string().trim().max(100).optional(),
    email: z.string().trim().toLowerCase().email().max(200).optional(),
    url: intakeSchema.shape.url.optional(),
    jurisdiction: z.enum(JURISDICTIONS).optional(),
  })
  .refine((v) => v.order_id || v.email, 'order_id or email required')

// ── Report generation prompt (mirror of agents/ea/prompts/risk-snapshot-report.md) ──
const REPORT_SYSTEM_PROMPT = `You are a senior compliance analyst for BizLegal-AI producing a paid $19 "AI Compliance Risk Snapshot" — a 2-page HTML risk report generated from a company's PUBLIC website content.

HARD RULES:
1. Never invent facts about the company. Every finding must trace to the scraped content provided. If something cannot be determined from the content, mark it exactly "not detected" — do not guess.
2. Cite which page each finding came from (use the URL or page title visible in the scraped content; if only one page was scraped, cite that URL).
3. Keep the whole report under ~900 words.
4. The report is informational decision-support, NOT legal advice, and must say so.
5. Output ONLY valid JSON matching the schema below. No prose, no markdown fences.

Output schema:
{
  "risk_score": <integer 0-100, higher = more exposed>,
  "risk_band": "LOW" | "MODERATE" | "ELEVATED" | "CRITICAL",
  "report_html": "<HTML fragment — no <html>/<head>/<body> tags, inline styles only, structured as: (1) header with company name + report date; (2) risk score 0-100 with band; (3) jurisdiction exposure table; (4) framework gap checklist covering GDPR, SOC 2, MiCA, CTA/BOI, and CCPA as applicable (mark each: gap found / appears addressed / not detected / not applicable, with the source page); (5) top-3 priority fixes each with an effort estimate; (6) disclaimer: 'This report is informational and does not constitute legal advice.'>"
}

Scoring bands: 0-29 LOW, 30-54 MODERATE, 55-79 ELEVATED, 80-100 CRITICAL. Be conservative: absence of evidence of controls is a gap signal, but score it lower than positive evidence of a violation.`

interface SonnetReport {
  risk_score: number
  risk_band: string
  report_html: string
}

async function generateReportWithSonnet(args: {
  url: string
  jurisdiction: string
  scrapedContent: string
  pageTitle?: string
}): Promise<SonnetReport | null> {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return null

  const userMessage = `=== SNAPSHOT REQUEST ===
Website URL: ${args.url}
Page title: ${args.pageTitle ?? 'not detected'}
Primary jurisdiction (user-declared): ${args.jurisdiction}
Report date: ${new Date().toISOString().slice(0, 10)}

=== SCRAPED SITE CONTENT (public pages only) ===
${args.scrapedContent}
=== END ===

Produce the Risk Snapshot JSON. Output JSON only.`

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-6',
        max_tokens: 4096,
        temperature: 0.2,
        system: REPORT_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userMessage }],
      }),
    })
    if (!res.ok) {
      console.warn('[risk-snapshot/generate] Sonnet HTTP', res.status)
      return null
    }
    const blob = (await res.json()) as { content?: Array<{ type: string; text?: string }> }
    const text = (blob.content ?? []).find((c) => c.type === 'text')?.text?.trim()
    if (!text) return null
    const cleaned = text.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '')
    const parsed = JSON.parse(cleaned) as Partial<SonnetReport>

    const score = Math.max(0, Math.min(100, Math.round(Number(parsed.risk_score))))
    const band = ['LOW', 'MODERATE', 'ELEVATED', 'CRITICAL'].includes(String(parsed.risk_band))
      ? String(parsed.risk_band)
      : 'MODERATE'
    let html = String(parsed.report_html ?? '')
    // Defense-in-depth: report is model-generated HTML destined for email +
    // storage; strip anything executable.
    html = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
      .replace(/\son\w+="[^"]*"/gi, '')
      .replace(/\son\w+='[^']*'/gi, '')
    if (!Number.isFinite(score) || html.length < 200) return null
    return { risk_score: score, risk_band: band, report_html: html }
  } catch (err) {
    console.warn('[risk-snapshot/generate] Sonnet call failed:', err)
    return null
  }
}

// ── Email delivery (lib/resend idiom, upsell CTAs appended deterministically) ──
async function sendSnapshotEmail(email: string, url: string, report: SonnetReport) {
  const bandColor =
    report.risk_band === 'CRITICAL'
      ? '#f87171'
      : report.risk_band === 'ELEVATED' || report.risk_band === 'MODERATE'
        ? '#e9c349'
        : '#10B981'
  return resend.emails.send({
    from: 'BizLegal AI <reports@intelligence.bizlegal-ai.com>',
    to: email,
    subject: 'Your AI Compliance Risk Snapshot',
    html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="background:#0e1322;color:#dee1f7;font-family:'Manrope',sans-serif;margin:0;padding:0;">
<div style="max-width:640px;margin:0 auto;padding:40px 24px;">
  <div style="font-family:Georgia,serif;font-size:22px;color:#dee1f7;margin-bottom:24px;">BizLegal <span style="color:#e9c349;">•</span> AI</div>
  <span style="font-size:9px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#e9c349;">AI Compliance Risk Snapshot · ${url}</span>
  <div style="border:0.5px solid ${bandColor};background:rgba(0,0,0,0.3);padding:20px;margin:16px 0 24px;text-align:center;">
    <div style="font-family:Georgia,serif;font-size:56px;font-weight:700;color:${bandColor};line-height:1;">${report.risk_score}</div>
    <div style="font-size:10px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:${bandColor};margin-top:8px;">${report.risk_band} risk</div>
  </div>
  <div style="background:#161b2b;border:1px solid #2a3148;padding:24px;color:#dee1f7;font-size:14px;line-height:1.65;">
${report.report_html}
  </div>
  <div style="margin-top:28px;padding:20px;border:1px solid #2a3148;background:#161b2b;">
    <p style="color:#c3c6d7;font-size:13px;line-height:1.65;margin:0 0 12px;"><strong style="color:#dee1f7;">Want the fixes handled continuously?</strong></p>
    <p style="margin:0 0 8px;"><a href="https://docai.bizlegal-ai.com/pricing" style="display:inline-block;background:#2563eb;color:#eeefff;padding:10px 20px;text-decoration:none;font-weight:700;font-size:13px;">DocAI Starter — $29/mo: contract &amp; questionnaire risk →</a></p>
    <p style="margin:0;"><a href="https://lexaudit.bizlegal-ai.com" style="display:inline-block;background:transparent;border:1px solid #2563eb;color:#b4c5ff;padding:10px 20px;text-decoration:none;font-weight:700;font-size:13px;">LexAudit — $99/mo: daily compliance monitoring →</a></p>
  </div>
  <p style="font-size:11px;color:#8d90a0;line-height:1.6;margin-top:28px;border-top:0.5px solid #434655;padding-top:16px;">BizLegal AI is software operated by DOR INNOVATIONS. This report is informational and does not constitute legal advice. Sent to ${email}. Questions: <a href="mailto:team@bizlegal-ai.com" style="color:#b4c5ff;">team@bizlegal-ai.com</a></p>
</div>
</body>
</html>`,
  })
}

// ── Checkout redirect target (mirrors /pricing checkoutHref idiom) ──
function snapshotCheckoutUrl(baseUrl: string): string {
  const params = new URLSearchParams({
    product: 'risk_snapshot',
    tier: 'snapshot',
    interval: 'one-time',
    amount: '1900',
    name: 'AI Compliance Risk Snapshot',
  })
  return `${baseUrl}/checkout?${params.toString()}`
}

interface ScanRow {
  id: string
  email: string | null
  filename: string
  score: number | null
  ai_content: Record<string, unknown> | null
  paid: boolean
}

// ── Route ──
export async function POST(req: NextRequest) {
  const contentType = req.headers.get('content-type') ?? ''
  const isForm =
    contentType.includes('application/x-www-form-urlencoded') ||
    contentType.includes('multipart/form-data')

  let rawBody = ''
  let body: Record<string, unknown> = {}
  try {
    if (isForm) {
      const fd = await req.formData()
      fd.forEach((v, k) => {
        if (typeof v === 'string') body[k] = v
      })
    } else {
      rawBody = await req.text()
      body = rawBody ? (JSON.parse(rawBody) as Record<string, unknown>) : {}
    }
  } catch {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 })
  }

  const internal = !isForm && isInternalCall(req, rawBody)
  const mode = internal && body.mode !== 'intake' ? 'fulfill' : 'intake'

  // ───────────────── INTAKE ─────────────────
  if (mode === 'intake') {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again in 10 minutes.' },
        { status: 429 },
      )
    }

    const parsed = intakeSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.issues },
        { status: 400 },
      )
    }
    const { url, jurisdiction, email } = parsed.data

    try {
      const supabase = getSupabase()
      const scanId = crypto.randomUUID()
      const { error: insertErr } = await supabase.from('contract_scans').insert({
        id: scanId,
        email,
        filename: url, // reused column: the site URL to scrape
        contract_type: 'risk_snapshot',
        paid: false,
        ai_content: {
          kind: 'risk_snapshot',
          jurisdiction,
          status: 'pending_payment',
          requested_at: new Date().toISOString(),
        },
      })
      if (insertErr) {
        console.error('[risk-snapshot/generate] intake insert failed', insertErr)
        return NextResponse.json({ error: 'intake failed' }, { status: 500 })
      }

      logEventAsync({
        type: 'lead.inbound',
        source: 'hub',
        ref_id: scanId,
        email,
        status: 'pending',
        metadata: { product: 'risk_snapshot', jurisdiction, url },
      })

      const baseUrl =
        process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? 'https://bizlegal-ai.com'
      const checkoutUrl = snapshotCheckoutUrl(baseUrl)

      // Plain-form flow: browser follows the 303 to /checkout.
      if (isForm) return NextResponse.redirect(checkoutUrl, 303)
      return NextResponse.json({ ok: true, scan_id: scanId, checkout_url: checkoutUrl })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'unknown error'
      console.error('[risk-snapshot/generate] intake', msg)
      return NextResponse.json({ error: msg }, { status: 500 })
    }
  }

  // ───────────────── FULFILL (internal) ─────────────────
  const parsed = fulfillSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error.issues },
      { status: 400 },
    )
  }

  try {
    const supabase = getSupabase()

    // Resolve customer email from the payment order when only order_id given.
    let email = parsed.data.email ?? null
    if (!email && parsed.data.order_id) {
      const { data: order } = await supabase
        .from('payment_orders')
        .select('id, user_email, product')
        .eq('id', parsed.data.order_id)
        .single()
      email = (order?.user_email as string | undefined)?.toLowerCase() ?? null
    }
    if (!email) {
      return NextResponse.json({ error: 'order/email not found' }, { status: 404 })
    }

    // Pick up the pending intake row (latest pending risk_snapshot for this email).
    const { data: scans } = await supabase
      .from('contract_scans')
      .select('id, email, filename, score, ai_content, paid')
      .eq('email', email)
      .eq('contract_type', 'risk_snapshot')
      .order('created_at', { ascending: false })
      .limit(5)

    const rows = (scans ?? []) as ScanRow[]
    const delivered = rows.find((s) => (s.ai_content as { status?: string } | null)?.status === 'delivered')
    let scan = rows.find((s) => (s.ai_content as { status?: string } | null)?.status !== 'delivered') ?? null

    // Idempotency: webhook retries after a successful delivery are no-ops
    // (unless the caller explicitly passes a new url to re-run).
    if (!scan && delivered && !parsed.data.url) {
      return NextResponse.json({ ok: true, deduped: true, scan_id: delivered.id })
    }

    const url = parsed.data.url ?? scan?.filename ?? null
    const jurisdiction =
      parsed.data.jurisdiction ??
      ((scan?.ai_content as { jurisdiction?: string } | null)?.jurisdiction as
        | (typeof JURISDICTIONS)[number]
        | undefined) ??
      'US'

    if (!url) {
      // Paid but no intake row and no explicit url — surface for manual re-run.
      logEventAsync({
        type: 'error',
        source: 'hub',
        email,
        status: 'failed',
        metadata: { product: 'risk_snapshot', reason: 'no_pending_intake_and_no_url', order_id: parsed.data.order_id },
      })
      return NextResponse.json(
        { error: 'no pending snapshot intake found for this email; re-call with explicit url' },
        { status: 404 },
      )
    }

    // If the order email never filled the form (mismatched emails), create the row now.
    if (!scan) {
      const scanId = crypto.randomUUID()
      await supabase.from('contract_scans').insert({
        id: scanId,
        email,
        filename: url,
        contract_type: 'risk_snapshot',
        paid: false,
        ai_content: { kind: 'risk_snapshot', jurisdiction, status: 'pending_payment' },
      })
      scan = { id: scanId, email, filename: url, score: null, ai_content: { jurisdiction }, paid: false }
    }

    // 1) Scrape (Firecrawl — FIRECRAWL_API_KEY; markdown of the rendered page).
    const scrape = await scrapeMarkdown(url)
    if (!scrape.ok) {
      logEventAsync({
        type: 'error',
        source: 'hub',
        ref_id: scan.id,
        email,
        status: 'failed',
        metadata: { product: 'risk_snapshot', stage: 'scrape', reason: scrape.error, url },
      })
      return NextResponse.json({ error: `scrape failed: ${scrape.error}` }, { status: 502 })
    }

    // 2) One Sonnet call → structured 2-page HTML report.
    const report = await generateReportWithSonnet({
      url,
      jurisdiction,
      scrapedContent: scrape.markdown.slice(0, 12_000),
      pageTitle: scrape.title,
    })
    if (!report) {
      logEventAsync({
        type: 'error',
        source: 'hub',
        ref_id: scan.id,
        email,
        status: 'failed',
        metadata: { product: 'risk_snapshot', stage: 'sonnet', url },
      })
      return NextResponse.json({ error: 'report generation failed; retry shortly' }, { status: 503 })
    }

    // 3) Email delivery.
    let emailOk = true
    try {
      await sendSnapshotEmail(email, url, report)
    } catch (err) {
      emailOk = false
      console.warn('[risk-snapshot/generate] email failed:', err)
    }

    // 4) Persist report HTML + status on the existing contract_scans row.
    await supabase
      .from('contract_scans')
      .update({
        paid: true,
        score: report.risk_score,
        nowpayments_order_id: parsed.data.order_id ?? null,
        ai_content: {
          kind: 'risk_snapshot',
          jurisdiction,
          status: emailOk ? 'delivered' : 'generated_email_failed',
          risk_score: report.risk_score,
          risk_band: report.risk_band,
          report_html: report.report_html,
          source_url: url,
          generated_at: new Date().toISOString(),
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', scan.id)

    logEventAsync({
      type: 'report.generated',
      source: 'hub',
      ref_id: scan.id,
      email,
      amount_cents: 1900,
      status: 'ok',
      metadata: {
        product: 'risk_snapshot',
        risk_score: report.risk_score,
        risk_band: report.risk_band,
        jurisdiction,
        url,
        order_id: parsed.data.order_id,
      },
    })
    logEventAsync({
      type: emailOk ? 'email.sent' : 'email.failed',
      source: 'hub',
      ref_id: scan.id,
      email,
      status: emailOk ? 'ok' : 'failed',
      metadata: { kind: 'risk-snapshot-report', risk_score: report.risk_score },
    })

    return NextResponse.json({
      ok: true,
      scan_id: scan.id,
      risk_score: report.risk_score,
      risk_band: report.risk_band,
      email_sent: emailOk,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown error'
    console.error('[risk-snapshot/generate] fulfill', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
