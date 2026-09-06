import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

/**
 * GET /api/report/[scan_ref] — report-page data. Unauthenticated (fleet
 * pattern: the scan_ref is the bearer secret, same as TRACR's report page).
 *
 * Paid-gated: unpaid scans return the exposure summary (score, flags count,
 * engine matrix) but NEVER the evidence rows. Evidence — prompts, responses,
 * SHA-256 anchors, narratives — only ships for paid/delivered scans.
 * Buyer email is never served here; checkout resolves it server-side.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { scan_ref: string } },
) {
  try {
    const { data: scan, error } = await supabaseAdmin
      .from('falseecho_scans')
      .select('id, scan_ref, entity, tier, status, score, flags_count, engines, submission_sha256, scan_sha256, created_at, completed_at, paid_at')
      .eq('scan_ref', params.scan_ref)
      .maybeSingle()

    if (error || !scan) {
      return NextResponse.json({ error: 'not found' }, { status: 404 })
    }

    // Paid gate is the paid_at column alone — tier and status can never be
    // the gate because they are writable earlier in the flow.
    const paid = Boolean(scan.paid_at)

    if (!paid) {
      return NextResponse.json({
        scan: {
          scan_ref: scan.scan_ref,
          entity: scan.entity,
          tier: scan.tier,
          status: scan.status,
          score: scan.score,
          flags_count: scan.flags_count,
          engines: scan.engines,
          created_at: scan.created_at,
        },
        evidence: null,
        paid: false,
      })
    }

    const { data: evidence } = await supabaseAdmin
      .from('falseecho_evidence')
      .select('engine, prompt, response, status, sha256, seq, flagged, flag_terms, confidence, narrative, scanned_at')
      .eq('scan_id', scan.id)
      .order('seq', { ascending: true })

    return NextResponse.json({
      scan: {
        scan_ref: scan.scan_ref,
        entity: scan.entity,
        tier: scan.tier,
        status: scan.status,
        score: scan.score,
        flags_count: scan.flags_count,
        engines: scan.engines,
        submission_sha256: scan.submission_sha256,
        scan_sha256: scan.scan_sha256,
        created_at: scan.created_at,
        completed_at: scan.completed_at,
      },
      evidence: evidence ?? [],
      paid: true,
    })
  } catch (err) {
    console.error('[report]', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}
