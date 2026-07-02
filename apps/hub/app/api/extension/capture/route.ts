/**
 * Hub /api/extension/capture — browser extension compliance capture endpoint.
 *
 * Receives page captures, contract text, compliance check requests, and wallet
 * addresses from the BizLegal AI browser extension. Stores each event in the
 * `extension_captures` Supabase table (gracefully skips if the table doesn't
 * exist yet). Rate-limited to 10 requests per IP per minute.
 *
 * No HMAC required — extension users are anonymous consumers; rate limiting
 * is the bot-pump backstop.
 *
 * Returns:
 *   200  { ok: true, capture_id: string, message: string, next_action_url?: string }
 *   400  { ok: false, error: string }
 *   429  { ok: false, error: 'rate_limited', retry_after_ms: number }
 */

import crypto from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, clientIpFromHeaders } from '@bizlegal/rate-limit'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const maxDuration = 10

type CaptureAction = 'page_capture' | 'contract_analyze' | 'compliance_check' | 'wallet_track'

const VALID_ACTIONS = new Set<CaptureAction>([
  'page_capture',
  'contract_analyze',
  'compliance_check',
  'wallet_track',
])

const MAX_TEXT_LEN = 50_000
const MAX_URL_LEN = 2_083
const MAX_TITLE_LEN = 500
const MAX_API_KEY_LEN = 128

const DOCAI_ORIGIN = 'https://docai.bizlegal-ai.com'
const TRACR_ORIGIN = 'https://tracr.bizlegal-ai.com'
const HUB_ORIGIN = 'https://bizlegal-ai.com'

interface CaptureBody {
  url: string
  title?: string
  text?: string
  action?: CaptureAction
  api_key?: string
}

function isValidUrl(s: string): boolean {
  try {
    const u = new URL(s)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

function clamp(v: string | null | undefined, max: number): string {
  return (v ?? '').slice(0, max)
}

function nextActionUrl(action: CaptureAction, url: string): string {
  switch (action) {
    case 'contract_analyze':
      return `${DOCAI_ORIGIN}/?ref=extension`
    case 'compliance_check':
      return `${HUB_ORIGIN}/use-cases/website-compliance?url=${encodeURIComponent(url)}`
    case 'wallet_track':
      return `${TRACR_ORIGIN}/?ref=extension`
    default:
      return `${HUB_ORIGIN}/agents`
  }
}

function hashIp(ip: string): string {
  return crypto.createHash('sha256').update(ip).digest('hex')
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  // ── Rate limit ────────────────────────────────────────────────────────────
  const ip = clientIpFromHeaders(req.headers) || 'unknown'
  const rl = rateLimit('extension-capture', ip, { windowMs: 60_000, limit: 10 })
  if (!rl.ok) {
    return NextResponse.json(
      { ok: false, error: 'rate_limited', retry_after_ms: rl.retryAfterMs },
      { status: 429 },
    )
  }

  // ── Parse body ────────────────────────────────────────────────────────────
  let body: CaptureBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 })
  }

  // ── Validate ──────────────────────────────────────────────────────────────
  const url = clamp(body.url, MAX_URL_LEN).trim()
  if (!url || !isValidUrl(url)) {
    return NextResponse.json({ ok: false, error: 'invalid_url' }, { status: 400 })
  }

  const action: CaptureAction = VALID_ACTIONS.has(body.action as CaptureAction)
    ? (body.action as CaptureAction)
    : 'page_capture'

  const text = clamp(body.text, MAX_TEXT_LEN)
  const title = clamp(body.title, MAX_TITLE_LEN)
  const apiKey = body.api_key ? clamp(body.api_key, MAX_API_KEY_LEN) : null

  const captureId = crypto.randomUUID()
  const ipHash = ip !== 'unknown' ? hashIp(ip) : null

  // ── Persist to Supabase ───────────────────────────────────────────────────
  // Wrap in try/catch so a missing table (during initial rollout) never
  // causes the endpoint to return 5xx. The capture still succeeds for UX;
  // the missing-table error is surfaced only in the warning field.
  let storageWarning: string | null = null
  try {
    const { error: dbError } = await supabaseAdmin.from('extension_captures').insert({
      id: captureId,
      url,
      page_title: title || null,
      page_text: text || null,
      action,
      api_key: apiKey,
      ip_hash: ipHash,
    })

    if (dbError) {
      // Table doesn't exist yet or RLS denies insert — soft-fail
      if (
        dbError.message.includes('does not exist') ||
        dbError.message.includes('relation') ||
        dbError.code === '42P01'
      ) {
        storageWarning = 'extension_captures table not yet migrated'
      } else {
        storageWarning = `db_error: ${dbError.message}`
      }
    }
  } catch (err) {
    storageWarning = err instanceof Error ? err.message : 'unexpected_db_error'
  }

  // ── Response ──────────────────────────────────────────────────────────────
  const actionMessages: Record<CaptureAction, string> = {
    page_capture: 'Page captured and queued for analysis.',
    contract_analyze: 'Contract text captured — open DocAI to review.',
    compliance_check: 'Compliance check queued — opening BRAI scanner.',
    wallet_track: 'Wallet address captured — opening Tracr.',
  }

  const payload: Record<string, unknown> = {
    ok: true,
    capture_id: captureId,
    message: actionMessages[action],
    next_action_url: nextActionUrl(action, url),
  }

  if (storageWarning) {
    payload.warning = storageWarning
  }

  return NextResponse.json(payload, { status: 200 })
}
