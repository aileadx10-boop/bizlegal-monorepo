import { NextRequest, NextResponse } from 'next/server'
import { verifyTurnstile } from '@bizlegal/turnstile-verify'
import { enqueueNurture } from '@bizlegal/nurture-enqueue'
import { supabaseAdmin } from '@/lib/supabase'
import { logEventAsync } from '@/lib/ops/log'

export const dynamic = 'force-dynamic'

/**
 * POST /api/lead — landing-page lead capture (hero quick-capture + intake
 * form from LandingV2). Turnstile-gated (skip-if-unconfigured), stored in
 * sellerradar_leads, enqueued into the fleet nurture cadence.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    const name = typeof body.name === 'string' ? body.name.trim() : null
    const scenario = typeof body.scenario === 'string' ? body.scenario.trim() : null
    const source = typeof body.source === 'string' ? body.source : 'home'

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'valid email required' }, { status: 400 })
    }

    const turnstile = await verifyTurnstile({ token: body.turnstile_token })
    if (!turnstile.ok) {
      return NextResponse.json({ error: 'turnstile verification failed' }, { status: 403 })
    }

    const { error } = await supabaseAdmin.from('sellerradar_leads').insert({
      email,
      name,
      scenario,
      source,
    })
    if (error) {
      console.error('[lead] insert failed:', error.message)
      return NextResponse.json({ error: 'could not save lead' }, { status: 500 })
    }

    logEventAsync({
      type: 'lead.inbound',
      source: 'sellerradar',
      email,
      status: 'ok',
      metadata: { surface: source },
    })

    void enqueueNurture({
      lead_id: `sellerradar-${Date.now()}`,
      email,
      vertical: 'sellerradar',
      source: `sellerradar:${source}`,
      lead_classification: { surface: source },
    }).catch((err) => console.warn('[lead] nurture enqueue failed:', err))

    return NextResponse.json({ ok: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown error'
    console.error('[lead]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
