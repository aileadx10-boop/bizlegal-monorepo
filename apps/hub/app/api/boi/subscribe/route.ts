import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logEventAsync } from '@/lib/ops/log'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

interface SubscribeBody {
  email: string
  entity_legal_name: string
  entity_type?: 'LLC' | 'Corp' | 'LLP' | 'PLLC' | 'LP' | 'other'
  entity_filing_date?: string  // ISO YYYY-MM-DD
  ein_last4?: string
  state_of_formation?: string
  tier?: 'solo' | 'firm' | 'trial' | 'paid'
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase env not configured')
  return createClient(url, key)
}

const ENTITY_TYPES = ['LLC', 'Corp', 'LLP', 'PLLC', 'LP', 'other'] as const

/**
 * POST /api/boi/subscribe — adds an entity to the BOI tracker.
 * Idempotent: same (user_email, entity_legal_name) returns existing row.
 *
 * Designed to run AFTER payment is confirmed (called by the payment
 * webhooks on `product=cta_boi_tracker`). Standalone callable for testing.
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<SubscribeBody>
    const email = (body.email ?? '').trim().toLowerCase()
    const name = (body.entity_legal_name ?? '').trim()
    // R3 — accept 'trial' for the 7-day no-card lead magnet. The
    // tracker treats trial as a tier='solo' subscription with
    // status='trial' and a trial_ends_at timestamp 7 days out; the
    // BOI check cron will skip notifications for expired trials but
    // continue for active ones, and a day-8 nudge email goes out
    // separately to upsell to Solo monthly.
    const requestedTier = body.tier
    const isTrial = requestedTier === 'trial'
    const tier = requestedTier === 'firm' ? 'firm' : 'solo'
    const entityType = body.entity_type && ENTITY_TYPES.includes(body.entity_type) ? body.entity_type : null
    const filingDate = body.entity_filing_date ?? null
    const ein4 = (body.ein_last4 ?? '').trim().slice(0, 4) || null
    const state = (body.state_of_formation ?? '').trim().slice(0, 2).toUpperCase() || null

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: 'invalid email' }, { status: 400 })
    }
    if (name.length < 2 || name.length > 200) {
      return NextResponse.json({ error: 'entity_legal_name must be 2-200 chars' }, { status: 400 })
    }
    if (filingDate && !/^\d{4}-\d{2}-\d{2}$/.test(filingDate)) {
      return NextResponse.json({ error: 'entity_filing_date must be YYYY-MM-DD' }, { status: 400 })
    }
    if (ein4 && !/^\d{4}$/.test(ein4)) {
      return NextResponse.json({ error: 'ein_last4 must be 4 digits' }, { status: 400 })
    }

    const supabase = getSupabase()

    // Idempotency check — return existing row for same email + entity
    const { data: existing } = await supabase
      .from('boi_subscriptions')
      .select('id, status, tier')
      .eq('user_email', email)
      .eq('entity_legal_name', name)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({
        subscription_id: existing.id,
        status: existing.status,
        tier: existing.tier,
        message: 'already subscribed',
      })
    }

    const trialEndsAt = isTrial
      ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      : null

    const { data: row, error } = await supabase
      .from('boi_subscriptions')
      .insert({
        user_email: email,
        tier,
        entity_legal_name: name,
        entity_type: entityType,
        entity_filing_date: filingDate,
        ein_last4: ein4,
        state_of_formation: state,
        status: isTrial ? 'trial' : 'active',
        trial_ends_at: trialEndsAt,
      })
      .select('id')
      .single()

    if (error || !row) {
      console.error('[boi/subscribe] insert failed', error)
      return NextResponse.json({ error: 'subscribe failed' }, { status: 500 })
    }

    // Send welcome via Resend (non-fatal if it fails)
    const resendKey = process.env.RESEND_API_KEY
    if (resendKey) {
      const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'intelligence@intelligence.bizlegal-ai.com'
      const replyTo = process.env.RESEND_REPLY_TO ?? 'team@bizlegal-ai.com'
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: `BizLegal AI Intelligence <${fromEmail}>`,
          to: [email],
          reply_to: replyTo,
          subject: isTrial
            ? `BOI Tracker free trial active for ${name}`
            : `BOI Tracker activated for ${name}`,
          html: welcomeHtml(name, tier, isTrial),
        }),
      }).catch((e) => console.warn('[boi/subscribe] welcome email failed', e))
    }

    logEventAsync({
      type: 'boi.subscribed',
      source: 'hub',
      ref_id: String(row.id),
      email,
      status: 'ok',
      metadata: {
        tier,
        is_trial: isTrial,
        trial_ends_at: trialEndsAt,
        entity_legal_name: name,
        entity_type: entityType,
        state,
      },
    })

    return NextResponse.json({
      subscription_id: row.id,
      status: isTrial ? 'trial' : 'active',
      tier,
      trial_ends_at: trialEndsAt,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown error'
    console.error('[boi/subscribe]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

function welcomeHtml(entityName: string, tier: string, isTrial = false): string {
  const seatLine = isTrial
    ? "<strong>7-day free trial active.</strong> No card on file. We'll email a renewal nudge on day 8 — ignore it to cancel automatically. Or upgrade any time at <a href=\"https://bizlegal-ai.com/agents/boi-tracker\" style=\"color:#5b21b6\">/agents/boi-tracker</a>."
    : tier === 'firm'
      ? "Firm tier active — you can track up to 50 entities. Reply to this email with additional entity legal names."
      : "Solo tier active — tracking 1 entity. Upgrade to Firm ($99/mo) to track up to 50."
  const headline = isTrial
    ? `BOI Tracker · 7-day free trial · ${entityName}`
    : `BOI Tracker activated · ${entityName}`
  return `<div style="font-family:Inter,sans-serif;max-width:560px;margin:auto;padding:24px;color:#0e0b1a">
<h2 style="font-weight:800;letter-spacing:-0.02em;margin:0 0 12px">${headline}</h2>
<p style="line-height:1.6;color:#4b3f6a">Your CTA-2024 Beneficial Ownership Information tracker is now live. We monitor FinCEN guidance daily and email you when:</p>
<ul style="line-height:1.7;color:#4b3f6a">
<li>An amendment to the rule affects your entity type</li>
<li>You're approaching a 30-day refiling window after a material change</li>
<li>FinCEN extends or compresses any deadlines</li>
</ul>
<p style="line-height:1.6;color:#4b3f6a">${seatLine}</p>
<p style="font-size:12px;color:#6b6188;margin-top:24px">Disclosure v1.0.0-p4 — Intelligence not legal advice. Reply to this email for support or to add additional entities.</p>
</div>`
}
