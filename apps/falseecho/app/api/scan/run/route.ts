import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { executeScan, ScanRow } from '@/lib/run-scan'
import { scanHash } from '@/lib/evidence'
import { sendReportReady } from '@/lib/email'
import { logEventAsync } from '@/lib/ops/log'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * POST /api/scan/run — full 25-prompt paid battery. Internal-only: fired by
 * /api/paypal-capture, /api/payments/nowpayments/webhook, and /api/scan's
 * paid-intake path. Gated on x-internal-key (BIZLEGAL_INBOUND_SECRET) — the
 * same internal-trigger pattern TRACR uses for /api/generate-report.
 *
 * Double-payment safe: a scan already 'delivered' short-circuits.
 */
export async function POST(req: NextRequest) {
  try {
    const key = req.headers.get('x-internal-key') ?? ''
    const expected = process.env.BIZLEGAL_INBOUND_SECRET ?? ''
    if (!expected || key !== expected) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    const { scanRef } = await req.json()
    if (!scanRef || typeof scanRef !== 'string') {
      return NextResponse.json({ error: 'scanRef required' }, { status: 400 })
    }

    const { data: scan, error } = await supabaseAdmin
      .from('falseecho_scans')
      .select('id, scan_ref, entity, entity_url, email, tier, status, paid_at')
      .eq('scan_ref', scanRef)
      .maybeSingle()

    if (error || !scan) {
      return NextResponse.json({ error: 'scan not found' }, { status: 404 })
    }
    if (scan.status === 'delivered') {
      return NextResponse.json({ ok: true, already: true, scanRef })
    }
    if (!scan.paid_at) {
      return NextResponse.json({ error: 'scan is not paid' }, { status: 402 })
    }

    const result = await executeScan(scan as ScanRow, 'full')

    if (result.ok) {
      // Scan-level anchor: SHA-256 over the ordered evidence hashes.
      const { data: hashes } = await supabaseAdmin
        .from('falseecho_evidence')
        .select('sha256')
        .eq('scan_id', scan.id)
        .order('seq', { ascending: true })
      const anchor = scanHash((hashes ?? []).map((h: { sha256: string }) => h.sha256))
      await supabaseAdmin.from('falseecho_scans').update({ scan_sha256: anchor }).eq('id', scan.id)

      if (scan.email) {
        await sendReportReady({
          to: scan.email,
          scanRef,
          entity: scan.entity,
          score: result.score,
          flagsCount: result.flagsCount,
        }).catch((err) => console.warn('[scan/run] report email failed:', err))
      }

      logEventAsync({
        type: 'email.sent',
        source: 'falseecho',
        ref_id: scanRef,
        email: scan.email ?? undefined,
        status: 'ok',
        metadata: { kind: 'evidence_pack', score: result.score, flags: result.flagsCount },
      })
    }

    return NextResponse.json({ ...result, scanRef })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown error'
    console.error('[scan/run]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
