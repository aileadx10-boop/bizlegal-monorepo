/**
 * /api/qualify — async qualifier chat backend (Engine 3 of
 * decisions/REVENUE-MACHINE-24-7-2026-07-04.md).
 *
 * POST { sessionId?, email?, message, context? }
 *   1. Create/load qualifier_sessions row; append user message to transcript.
 *   2. Haiku reply with the qualifier system prompt + full transcript.
 *   3. Every 3rd user turn (and on deal-room completion) run a cheap haiku
 *      JSON extraction to update icp / budget_band / score / email.
 *   4. When the model emits the DEAL_ROOM sentinel (stripped before display):
 *      mint a 32-hex token (same shape as social approval tokens), draft the
 *      scope via one sonnet call, insert deal_rooms, email the private link
 *      (lib/resend idiom), fire lead.qualified + email.sent ops events, and
 *      Telegram-notify Moses.
 *   5. Return { sessionId, reply }.
 *
 * Rate limit: NOT applied here yet — no public hub route wires
 * @bizlegal/rate-limit today (see the deferred note in
 * app/api/payments/paddle/start/route.ts). Input caps below keep abuse
 * bounded (message <= 2000 chars, transcript <= 60 messages).
 */
import { randomBytes } from 'node:crypto'
import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logEventAsync } from '@/lib/ops/log'
import { sendToTelegram } from '@/lib/agents/ea-runner'
import { resend } from '@/lib/resend'
import {
  buildExtractionPrompt,
  buildQualifierSystemPrompt,
  buildScopePrompt,
  CUSTOM_BUILD_TIERS,
  DEAL_ROOM_SENTINEL_REGEX,
  type CustomBuildTier,
} from '@/lib/agents/qualifier-prompt'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// Same model ids as lib/agents/ea-runner.ts — haiku for volume turns,
// sonnet only for the one-off deal-room scope draft.
const HAIKU_MODEL = 'claude-haiku-4-5-20251001'
const SONNET_MODEL = 'claude-sonnet-4-6'

const MAX_MESSAGE_CHARS = 2000
const MAX_TRANSCRIPT_MESSAGES = 60

interface QualifyBody {
  sessionId?: string
  email?: string
  message?: string
  context?: string
}

interface TranscriptMessage {
  role: 'user' | 'assistant'
  content: string
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase env not configured')
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

function getAnthropic(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured')
  return new Anthropic({ apiKey })
}

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)
}

function isUuid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s)
}

function textFromResponse(response: Anthropic.Message): string {
  return response.content
    .filter((c): c is Anthropic.TextBlock => c.type === 'text')
    .map((c) => c.text)
    .join('\n')
    .trim()
}

/** Cheap JSON extraction of icp / budget_band / score / email from the transcript. */
async function runExtraction(
  client: Anthropic,
  transcript: TranscriptMessage[],
): Promise<{ icp: string | null; budget_band: string | null; score: number | null; email: string | null } | null> {
  try {
    const response = await client.messages.create({
      model: HAIKU_MODEL,
      max_tokens: 256,
      messages: [{ role: 'user', content: buildExtractionPrompt(transcript) }],
    })
    let raw = textFromResponse(response)
    if (raw.startsWith('```')) raw = raw.replace(/^```(?:json)?\s*|\s*```$/g, '')
    const parsed = JSON.parse(raw) as {
      icp?: string | null
      budget_band?: string | null
      score?: number | null
      email?: string | null
    }
    return {
      icp: typeof parsed.icp === 'string' ? parsed.icp : null,
      budget_band: typeof parsed.budget_band === 'string' ? parsed.budget_band : null,
      score: typeof parsed.score === 'number' ? Math.max(0, Math.min(100, Math.round(parsed.score))) : null,
      email: typeof parsed.email === 'string' && isValidEmail(parsed.email) ? parsed.email.toLowerCase() : null,
    }
  } catch {
    return null // extraction is best-effort; never breaks the chat turn
  }
}

async function sendDealRoomEmail(args: {
  email: string
  tier: CustomBuildTier
  priceUsd: number
  dealUrl: string
  expiresAt: string
}): Promise<boolean> {
  const { email, tier, priceUsd, dealUrl, expiresAt } = args
  const tierLabel = CUSTOM_BUILD_TIERS[tier].label
  const price = `$${priceUsd.toLocaleString('en-US')}`
  const expires = new Date(expiresAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  try {
    await resend.emails.send({
      from: 'BizLegal AI <orders@intelligence.bizlegal-ai.com>',
      to: email,
      subject: `Your private deal room — Custom Build (${tierLabel})`,
      html: `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="background:#0e1322;color:#dee1f7;font-family:'Manrope',sans-serif;margin:0;padding:0;">
<div style="max-width:580px;margin:0 auto;padding:40px 24px;">
  <div style="font-family:Georgia,serif;font-size:22px;color:#dee1f7;margin-bottom:32px;">BizLegal <span style="color:#e9c349;">•</span> AI</div>
  <span style="font-size:9px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#e9c349;">Private Deal Room</span>
  <h1 style="font-family:Georgia,serif;font-size:26px;color:#dee1f7;line-height:1.25;margin:8px 0 16px;">I scoped this for you.</h1>
  <p style="color:#c3c6d7;font-size:14px;line-height:1.65;margin:0 0 16px;">Based on our conversation, I put together a custom scope and fixed price for your build — <strong style="color:#e9c349;">Custom Build (${tierLabel}), ${price} USD</strong>. The full scope, FAQ, and payment options are in your private room:</p>
  <a href="${dealUrl}" style="display:inline-block;background:#2563eb;color:#eeefff;padding:12px 24px;text-decoration:none;font-weight:700;font-size:13px;margin:8px 0;">Open Your Deal Room →</a>
  <p style="color:#c3c6d7;font-size:13px;line-height:1.6;margin:16px 0 0;">The link is private to you and expires on <strong style="color:#dee1f7;">${expires}</strong>. Questions? Just reply to this email — everything at BizLegal AI runs async, and Moses reads every reply.</p>
  <hr style="border:none;border-top:1px solid #2a3148;margin:24px 0;"/>
  <p style="font-size:11px;color:#8d90a0;line-height:1.6;margin:0;">BizLegal AI is software operated by DOR INNOVATIONS. Not a law firm; outputs are research, not legal advice. Questions: <a href="mailto:team@bizlegal-ai.com" style="color:#b4c5ff;">team@bizlegal-ai.com</a></p>
</div>
</body></html>`,
    })
    return true
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[qualify] deal room email failed', err instanceof Error ? err.message : err)
    return false
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: QualifyBody
  try {
    body = (await req.json()) as QualifyBody
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }
  const message = typeof body.message === 'string' ? body.message.trim() : ''
  if (!message) {
    return NextResponse.json({ error: 'message required' }, { status: 400 })
  }
  if (message.length > MAX_MESSAGE_CHARS) {
    return NextResponse.json({ error: `message too long (max ${MAX_MESSAGE_CHARS} chars)` }, { status: 400 })
  }
  const context = typeof body.context === 'string' ? body.context.slice(0, 64) : undefined
  const bodyEmail = typeof body.email === 'string' && isValidEmail(body.email) ? body.email.toLowerCase() : null

  try {
    const supabase = getSupabase()
    const anthropic = getAnthropic()

    // 1 — create or load the session
    let sessionId: string
    let sessionEmail: string | null = bodyEmail
    let transcript: TranscriptMessage[] = []
    let sessionStatus = 'active'

    if (body.sessionId && isUuid(body.sessionId)) {
      const { data: existing } = await supabase
        .from('qualifier_sessions')
        .select('id, email, transcript, status')
        .eq('id', body.sessionId)
        .maybeSingle()
      if (!existing) {
        return NextResponse.json({ error: 'session not found' }, { status: 404 })
      }
      sessionId = existing.id as string
      sessionEmail = bodyEmail ?? ((existing.email as string | null) || null)
      transcript = Array.isArray(existing.transcript) ? (existing.transcript as TranscriptMessage[]) : []
      sessionStatus = (existing.status as string) || 'active'
    } else {
      const { data: created, error: createErr } = await supabase
        .from('qualifier_sessions')
        .insert({ email: bodyEmail, transcript: [], status: 'active' })
        .select('id')
        .single()
      if (createErr || !created) {
        // eslint-disable-next-line no-console
        console.error('[qualify] session insert failed', createErr)
        return NextResponse.json({ error: 'session_create_failed' }, { status: 500 })
      }
      sessionId = created.id as string
      logEventAsync({
        type: 'lead.inbound',
        source: 'hub',
        ref_id: sessionId,
        email: bodyEmail ?? undefined,
        status: 'ok',
        metadata: { channel: 'qualifier_chat', context: context ?? null },
      })
    }

    if (transcript.length >= MAX_TRANSCRIPT_MESSAGES) {
      return NextResponse.json({
        sessionId,
        reply:
          'This conversation has hit its length limit. Email team@bizlegal-ai.com and mention this chat — Moses reviews every transcript and will pick it up from there.',
      })
    }

    // 2 — append user message, then get the qualifier reply
    transcript.push({ role: 'user', content: message })

    const response = await anthropic.messages.create({
      model: HAIKU_MODEL,
      max_tokens: 512,
      system: buildQualifierSystemPrompt(context),
      messages: transcript.map((m) => ({ role: m.role, content: m.content })),
    })
    const rawReply = textFromResponse(response)

    // 3 — sentinel detection (strip before anything user-visible is stored)
    const sentinelMatch = rawReply.match(DEAL_ROOM_SENTINEL_REGEX)
    const reply = rawReply.replace(DEAL_ROOM_SENTINEL_REGEX, '').trim()
    transcript.push({ role: 'assistant', content: reply })

    const userTurns = transcript.filter((m) => m.role === 'user').length
    const shouldExtract = sentinelMatch !== null || userTurns % 3 === 0

    const update: Record<string, unknown> = {
      transcript,
      updated_at: new Date().toISOString(),
    }

    if (shouldExtract) {
      const extracted = await runExtraction(anthropic, transcript)
      if (extracted) {
        if (extracted.icp) update.icp = extracted.icp
        if (extracted.budget_band) update.budget_band = extracted.budget_band
        if (extracted.score !== null) update.score = extracted.score
        if (!sessionEmail && extracted.email) sessionEmail = extracted.email
      }
    }
    if (sessionEmail) update.email = sessionEmail

    // 4 — deal room creation on sentinel (requires an email on file; the
    // system prompt instructs the model to collect it first)
    if (sentinelMatch && sessionEmail && sessionStatus !== 'deal_room') {
      const tier = sentinelMatch[1] as CustomBuildTier
      const declaredPrice = Number(sentinelMatch[2])
      // Clamp to the canonical ladder price — the model picks the tier, the
      // ladder sets the number. Prevents a hallucinated $250 flagship.
      const priceUsd = CUSTOM_BUILD_TIERS[tier]?.price_usd ?? declaredPrice
      const token = randomBytes(16).toString('hex') // 32 hex chars, same shape as social approval tokens

      // One sonnet call: 6-10 bullet scope from the transcript
      let scopeMd: string | null = null
      try {
        const scopeRes = await anthropic.messages.create({
          model: SONNET_MODEL,
          max_tokens: 1024,
          messages: [{ role: 'user', content: buildScopePrompt(transcript, tier, priceUsd) }],
        })
        scopeMd = textFromResponse(scopeRes) || null
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[qualify] scope draft failed', err instanceof Error ? err.message : err)
      }

      const { data: room, error: roomErr } = await supabase
        .from('deal_rooms')
        .insert({
          token,
          qualifier_session_id: sessionId,
          email: sessionEmail,
          offer_tier: tier,
          price_usd: priceUsd,
          scope_md: scopeMd,
          status: 'open',
        })
        .select('id, expires_at')
        .single()

      if (roomErr || !room) {
        // eslint-disable-next-line no-console
        console.error('[qualify] deal room insert failed', roomErr)
      } else {
        update.status = 'deal_room'
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bizlegal-ai.com'
        const dealUrl = `${siteUrl}/deal/${token}`

        const emailed = await sendDealRoomEmail({
          email: sessionEmail,
          tier,
          priceUsd,
          dealUrl,
          expiresAt: String(room.expires_at),
        })

        // Existing event types only — lead.qualified for the room,
        // email.sent for the delivery. ref_id is the room uuid, never the token.
        logEventAsync({
          type: 'lead.qualified',
          source: 'hub',
          ref_id: String(room.id),
          email: sessionEmail,
          amount_cents: priceUsd * 100,
          status: 'ok',
          metadata: {
            channel: 'qualifier_chat',
            offer_tier: tier,
            qualifier_session_id: sessionId,
          },
        })
        logEventAsync({
          type: emailed ? 'email.sent' : 'email.failed',
          source: 'hub',
          ref_id: String(room.id),
          email: sessionEmail,
          status: emailed ? 'ok' : 'failed',
          metadata: { template: 'deal_room_invite', offer_tier: tier },
        })

        // Telegram goes to Moses's private channel — link included so he can
        // review the room before the prospect opens it (standing-order style).
        void sendToTelegram(
          `💼 *Deal room opened*\n${sessionEmail}\nCustom Build (${CUSTOM_BUILD_TIERS[tier].label}) — $${priceUsd.toLocaleString('en-US')}\n${dealUrl}`,
        )
      }
    }

    const { error: updateErr } = await supabase
      .from('qualifier_sessions')
      .update(update)
      .eq('id', sessionId)
    if (updateErr) {
      // eslint-disable-next-line no-console
      console.error('[qualify] session update failed', updateErr)
    }

    return NextResponse.json({ sessionId, reply })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[qualify]', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'qualify_failed' }, { status: 500 })
  }
}
