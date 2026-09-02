import { NextRequest, NextResponse } from 'next/server'
import { verifyTurnstile } from '@bizlegal/turnstile-verify'
import { supabaseAdmin } from '@/lib/supabase'
import { submissionHash } from '@/lib/evidence'
import { executeScan, ScanRow } from '@/lib/run-scan'
import { engineStatusMatrix } from '@/lib/engines'
import { logEventAsync } from '@/lib/ops/log'
import { sendReportReady } from '@/lib/email'
import { exposureLabel } from '@/lib/triage'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * POST /api/scan — scan intake.
 *
 * Two modes:
 *   free (default) — creates the scan row and runs the 3-prompt quick probe
 *     synchronously; returns the exposure summary. Report page paywalls the
 *     full battery behind the $29 audit.
 *   paid (orderId present) — claims a paid order (from hub apex checkout
 *     fulfillment or an in-app order), links it to the new scan, and fires
 *     the full 25-prompt battery asynchronously.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const entity = typeof body.entity === 'string' ? body.entity.trim() : ''
    const url = typeof body.url === 'string' && body.url.trim() ? body.url.trim() : null
    const content = typeof body.content === 'string' && body.content.trim() ? body.content.trim() : null
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    const orderId = typeof body.orderId === 'string' ? body.orderId.trim() : ''

    if (!entity || entity.length < 2 || entity.length > 120) {
      return NextResponse.json({ error: 'entity must be 2–120 characters' }, { status: 400 })
    }
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'valid email required' }, { status: 400 })
    }

    const turnstile = await verifyTurnstile({ token: body.turnstile_token })
    if (!turnstile.ok) {
      return NextResponse.json({ error: 'turnstile verification failed' }, { status: 403 })
    }

    // ── Paid mode: claim a paid order (apex fulfillment credit or in-app) ──
    let tier: 'free' | 'audit' | 'monitor' = 'free'
    let linkedOrder: { id: string; tier: string } | null = null
    if (orderId) {
      const { data: order, error: orderErr } = await supabaseAdmin
        .from('falseecho_orders')
        .select('id, tier, status, scan_id')
        .eq('report_id', orderId)
        .maybeSingle()
      if (orderErr || !order) {
        return NextResponse.json({ error: 'order not found' }, { status: 404 })
      }
      if (order.status !== 'paid') {
        return NextResponse.json({ error: 'order is not paid yet' }, { status: 402 })
      }
      if (order.scan_id) {
        return NextResponse.json({ error: 'order already claimed by another scan' }, { status: 409 })
      }
      linkedOrder = { id: order.id, tier: order.tier }
      tier = order.tier === 'monitor' ? 'monitor' : 'audit'
    }

    const scanRef = 'FE-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 90000) + 10000)
    const createdAt = new Date().toISOString()

    const { data: scan, error: scanErr } = await supabaseAdmin
      .from('falseecho_scans')
      .insert({
        scan_ref: scanRef,
        entity,
        entity_url: url,
        content_sha256: content ? submissionHash({ entity, url, content, scanRef, createdAt }) : null,
        submission_sha256: submissionHash({ entity, url, content, scanRef, createdAt }),
        email,
        tier,
        status: 'pending',
        paid_at: linkedOrder ? createdAt : null,
      })
      .select('id, scan_ref, entity, entity_url, email, tier, status')
      .single()

    if (scanErr || !scan) {
      console.error('[scan] insert failed:', scanErr)
      return NextResponse.json({ error: 'could not create scan' }, { status: 500 })
    }

    if (linkedOrder) {
      await supabaseAdmin.from('falseecho_orders').update({ scan_id: scan.id }).eq('id', linkedOrder.id)
      if (tier === 'monitor') {
        const next = new Date()
        next.setUTCDate(next.getUTCDate() + 1)
        await supabaseAdmin.from('falseecho_monitors').insert({
          email,
          entity,
          scan_id: scan.id,
          status: 'active',
          next_scan_at: next.toISOString(),
        })
      }
    }

    // ── Paid: fire the full battery async; report page polls ──
    if (linkedOrder) {
      const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://falseecho.bizlegal-ai.com'
      fetch(`${site}/api/scan/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-internal-key': process.env.BIZLEGAL_INBOUND_SECRET ?? '',
        },
        body: JSON.stringify({ scanRef }),
      }).catch((err) => console.warn('[scan] full battery trigger failed:', err))

      return NextResponse.json({ ok: true, mode: 'paid', scanRef, tier, engines: engineStatusMatrix() })
    }

    // ── Free: run the quick probe synchronously ──
    const result = await executeScan(scan as ScanRow, 'free')

    logEventAsync({
      type: 'lead.qualified',
      source: 'falseecho',
      ref_id: scanRef,
      email,
      status: 'ok',
      metadata: { score: result.score, flags: result.flagsCount },
    })

    if (email && result.ok) {
      sendReportReady({ to: email, scanRef, entity, score: result.score, flagsCount: result.flagsCount })
        .catch((err) => console.warn('[scan] free-check email failed:', err))
    }

    return NextResponse.json({
      ok: result.ok,
      mode: 'free',
      scanRef,
      score: result.score,
      scoreLabel: exposureLabel(result.score),
      flagsCount: result.flagsCount,
      probedCount: result.probedCount,
      engines: result.engines,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown error'
    console.error('[scan]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
