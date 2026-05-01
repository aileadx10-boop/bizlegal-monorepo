import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logEventAsync } from '@/lib/ops/log'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * GET /api/cron/policy-refresh
 *
 * V2 — Daily re-audit cron. For each active policy_refresh_subs row,
 * re-runs the audit (calls /api/policy-refresh/audit internally), diffs
 * against last_redline, emails the subscriber when a material change
 * appears (new high-severity finding OR finding count changed by >2).
 *
 * Auth: CRON_SECRET in Authorization: Bearer header.
 * Schedule: 0 12 * * * (daily 12:00 UTC; offset from ai-act-monitor at 11:00).
 */

interface PolicyRefreshSub {
  id: number
  user_email: string
  policy_url: string
  status: string
  last_audit_id: number | null
}

interface AuditFinding {
  framework: string
  severity: 'low' | 'medium' | 'high'
  finding: string
  policy_quote: string
  suggested_language: string
}

interface AuditRow {
  id: number
  findings: AuditFinding[]
  frameworks_touched: string[]
  summary: string
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase env not configured')
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

function diffMaterial(
  prev: AuditFinding[] | null,
  next: AuditFinding[]
): { material: boolean; new_high: number; total_delta: number } {
  if (!prev) return { material: true, new_high: next.filter((f) => f.severity === 'high').length, total_delta: next.length }
  const prevHighSet = new Set(prev.filter((f) => f.severity === 'high').map((f) => `${f.framework}|${f.finding.slice(0, 80)}`))
  const newHigh = next.filter(
    (f) => f.severity === 'high' && !prevHighSet.has(`${f.framework}|${f.finding.slice(0, 80)}`)
  ).length
  const totalDelta = Math.abs(next.length - prev.length)
  return {
    material: newHigh > 0 || totalDelta > 2,
    new_high: newHigh,
    total_delta: totalDelta,
  }
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') ?? ''
    const expected = `Bearer ${process.env.CRON_SECRET ?? ''}`
    if (!process.env.CRON_SECRET || authHeader !== expected) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    const supabase = getSupabase()
    const proto = req.headers.get('x-forwarded-proto') ?? 'https'
    const host = req.headers.get('host') ?? 'bizlegal-ai.com'
    const internalAuditUrl = `${proto}://${host}/api/policy-refresh/audit`

    const { data: subs } = await supabase
      .from('policy_refresh_subs')
      .select('id, user_email, policy_url, status, last_audit_id')
      .eq('status', 'active')
      .limit(200)

    const subscribers = (subs ?? []) as PolicyRefreshSub[]
    let processed = 0
    let materialChanges = 0
    let notified = 0
    let failed = 0

    for (const sub of subscribers) {
      processed += 1
      try {
        const audit = await fetch(internalAuditUrl, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ email: sub.user_email, policy_url: sub.policy_url }),
        })
        if (!audit.ok) {
          failed += 1
          continue
        }
        const next = (await audit.json()) as { audit_id: string; findings: AuditFinding[]; summary: string; frameworks_touched: string[] }
        if (!next.audit_id) {
          failed += 1
          continue
        }

        // Pull prior findings for diff
        let prev: AuditFinding[] | null = null
        if (sub.last_audit_id) {
          const { data: prior } = await supabase
            .from('policy_refresh_audits')
            .select('findings')
            .eq('id', sub.last_audit_id)
            .maybeSingle()
          if (prior && Array.isArray((prior as AuditRow).findings)) {
            prev = (prior as AuditRow).findings
          }
        }

        const diff = diffMaterial(prev, next.findings)

        // Update sub with new last_audit_id regardless of diff
        await supabase
          .from('policy_refresh_subs')
          .update({
            last_audit_id: Number(next.audit_id),
            last_audit_at: new Date().toISOString(),
          })
          .eq('id', sub.id)

        if (diff.material) {
          materialChanges += 1
          if (await sendChangeAlert(sub.user_email, sub.policy_url, next, diff)) {
            notified += 1
            await supabase
              .from('policy_refresh_subs')
              .update({ last_notified_at: new Date().toISOString() })
              .eq('id', sub.id)
          }
        }
      } catch (err) {
        console.warn(`[cron/policy-refresh] sub ${sub.id} failed:`, err)
        failed += 1
      }
    }

    logEventAsync({
      type: 'cron.completed',
      source: 'hub',
      ref_id: 'policy-refresh',
      status: failed > 0 ? 'failed' : 'ok',
      metadata: {
        cron: 'policy-refresh',
        subscribers: subscribers.length,
        processed,
        material_changes: materialChanges,
        notified,
        failed,
      },
    })

    return NextResponse.json({
      ok: true,
      subscribers: subscribers.length,
      processed,
      material_changes: materialChanges,
      notified,
      failed,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown error'
    console.error('[cron/policy-refresh]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

async function sendChangeAlert(
  email: string,
  policyUrl: string,
  next: { findings: AuditFinding[]; summary: string; frameworks_touched: string[] },
  diff: { new_high: number; total_delta: number }
): Promise<boolean> {
  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) return false
  const fromEmail = process.env.RESEND_FROM ?? 'intelligence@intelligence.bizlegal-ai.com'
  const replyTo = process.env.RESEND_REPLY_TO ?? 'team@bizlegal-ai.com'

  const subject =
    diff.new_high > 0
      ? `Privacy Auto-Refresh · ${diff.new_high} new HIGH finding${diff.new_high > 1 ? 's' : ''} on your policy`
      : `Privacy Auto-Refresh · ${next.findings.length} findings, redline updated`

  const findingsList = next.findings
    .filter((f) => f.severity === 'high' || f.severity === 'medium')
    .slice(0, 5)
    .map(
      (f) =>
        `<li style="margin-bottom:10px;color:#4b3f6a"><strong style="color:${f.severity === 'high' ? '#dc2626' : '#d97706'}">${f.severity.toUpperCase()}</strong> · ${escapeHtml(f.finding)}</li>`
    )
    .join('')

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: `BizLegal AI Intelligence <${fromEmail}>`,
        to: [email],
        reply_to: replyTo,
        subject,
        html: `<div style="font-family:Inter,sans-serif;max-width:560px;margin:auto;padding:24px;color:#0e0b1a">
<h2 style="font-weight:800;letter-spacing:-0.02em;margin:0 0 12px">${escapeHtml(subject)}</h2>
<p style="line-height:1.6;color:#4b3f6a">Today's daily re-audit of <a href="${escapeHtml(policyUrl)}" style="color:#5b21b6">${escapeHtml(policyUrl)}</a> against ${next.frameworks_touched.length} frameworks surfaced changes vs last run.</p>
<p style="line-height:1.6;color:#4b3f6a"><strong>Summary:</strong> ${escapeHtml(next.summary)}</p>
<ul style="line-height:1.7;padding-left:20px">${findingsList}</ul>
<p style="line-height:1.6;color:#4b3f6a">Full redline + suggested language available in your dashboard at <a href="https://bizlegal-ai.com/agents/policy-refresh" style="color:#5b21b6">/agents/policy-refresh</a>.</p>
<div style="background:#fef3c7;border:1px solid #f59e0b;padding:12px 14px;border-radius:8px;margin-top:18px;font-size:13px;color:#7c2d12;line-height:1.5">
<strong>Decision-support only.</strong> Review the redline with counsel before publishing or relying on it for compliance filings.
</div>
<p style="font-size:12px;color:#6b6188;margin-top:18px">Disclosure v1.0.0-p4 — Reply to manage your subscription.</p>
</div>`,
      }),
    })
    return res.ok
  } catch (err) {
    console.warn('[cron/policy-refresh] notify failed', err)
    return false
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
