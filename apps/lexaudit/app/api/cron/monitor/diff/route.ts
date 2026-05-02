import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import type { FrameworkId } from '@/lib/health-score/signals'
import { FRAMEWORK_LABELS, signalsByFramework } from '@/lib/health-score/signals'
import { logEventAsync } from '@/lib/ops/log'
import { isConfigured as firecrawlConfigured, scrapeMarkdown, summariseChange } from '@/lib/firecrawl/scrape'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * Daily cron — fetches the canonical source URL for each tracked compliance
 * framework, computes SHA-256 of the response body, compares to the most
 * recent stored hash, and notifies subscribers via Resend when a framework
 * changes.
 *
 * Authentication: CRON_SECRET in Authorization: Bearer header.
 *
 * Schedule: 0 6 * * *  (daily 06:00 UTC)
 *
 * REVENUE+LIABILITY framing: subscribers get a "the regulator changed
 * something; please review" alert with a link to the source. We do NOT
 * claim to interpret the change, attest the customer's posture, or
 * guarantee compliance. We are a monitor, not a compliance attestation.
 */

interface FrameworkSource {
  framework_id: FrameworkId | 'nist-800-53'
  source_name: string
  source_url: string
  source_version: string
}

const FRAMEWORK_SOURCES: FrameworkSource[] = [
  {
    framework_id: 'soc2',
    source_name: 'AICPA Trust Services Criteria',
    source_url: 'https://www.aicpa-cima.com/resources/landing/system-and-organization-controls-soc-suite-of-services',
    source_version: 'TSP 2017 (latest)',
  },
  {
    framework_id: 'iso27001',
    source_name: 'ISO/IEC 27001:2022 — Information Security',
    source_url: 'https://www.iso.org/standard/27001',
    source_version: '2022',
  },
  {
    framework_id: 'gdpr',
    source_name: 'EUR-Lex GDPR consolidated text',
    source_url: 'https://eur-lex.europa.eu/eli/reg/2016/679/oj',
    source_version: '2016/679',
  },
  {
    framework_id: 'hipaa',
    source_name: 'HHS HIPAA Security Rule',
    source_url: 'https://www.hhs.gov/hipaa/for-professionals/security/laws-regulations/index.html',
    source_version: '45 CFR §164',
  },
  {
    framework_id: 'dpdp',
    source_name: 'India DPDP Act 2023 — MeitY',
    source_url: 'https://www.meity.gov.in/data-protection-framework',
    source_version: 'DPDP 2023',
  },
  {
    framework_id: 'nist-800-53',
    source_name: 'NIST SP 800-53 Rev. 5',
    source_url: 'https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final',
    source_version: 'r5',
  },
]

interface ComplianceSubRow {
  id: number
  user_email: string
  frameworks: string[]
  subscribed_signals: string[]
  notification_channel: string
  last_notified_at: string | null
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase env not configured')
  return createClient(url, key)
}

interface FetchAndHashOk {
  ok: true
  sha: string
  /** Extracted markdown body when Firecrawl was available; empty string otherwise. */
  extracted: string
  /** Tracking which extractor produced the hash (for change_summary enrichment gating). */
  source: 'firecrawl' | 'raw'
}

interface FetchAndHashFail {
  ok: false
  status?: number
  error?: string
}

type FetchAndHashResult = FetchAndHashOk | FetchAndHashFail

async function fetchAndHash(url: string): Promise<FetchAndHashResult> {
  // Q2 — prefer Firecrawl semantic extraction so the hash captures
  // substantive content (titles, paragraphs, lists) rather than HTML
  // markup noise (whitespace, build hashes, ad slots). Falls back to
  // raw-HTML hash if Firecrawl is unset or fails on this URL.
  if (firecrawlConfigured()) {
    const fc = await scrapeMarkdown(url)
    if (fc.ok) {
      const sha = crypto.createHash('sha256').update(fc.markdown).digest('hex')
      return { ok: true, sha, extracted: fc.markdown, source: 'firecrawl' }
    }
    console.warn(`[monitor/diff] firecrawl scrape failed for ${url}: ${fc.error}; falling back to raw hash`)
  }
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'LexAudit-Compliance-Monitor/1.0' },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      next: { revalidate: 0 } as any,
    })
    if (!res.ok) return { ok: false, status: res.status }
    const text = await res.text()
    const sha = crypto.createHash('sha256').update(text).digest('hex')
    return { ok: true, sha, extracted: '', source: 'raw' }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.name : String(err) }
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
    const fetchedAt = new Date().toISOString()
    const changedFrameworks: Array<FrameworkSource & { changeSummary: string | null }> = []
    let firecrawlHits = 0
    let rawFallbacks = 0

    // 1. Scrape each canonical source; hash the extract; insert if changed
    for (const fw of FRAMEWORK_SOURCES) {
      const result = await fetchAndHash(fw.source_url)
      if (!result.ok) continue
      if (result.source === 'firecrawl') firecrawlHits += 1
      else rawFallbacks += 1

      const { data: previous } = await supabase
        .from('compliance_framework_index')
        .select('content_sha256, extracted_content')
        .eq('framework_id', fw.framework_id)
        .order('fetched_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      const isChange = !!previous && previous.content_sha256 !== result.sha

      // Sonnet semantic-diff enrichment when we have BOTH the prior and
      // current Firecrawl extracts. Only fires on real changes; returns
      // null if Anthropic key unset, model 5xx, or only cosmetic deltas
      // (Sonnet's own "no substantive change" gate).
      let changeSummary: string | null = null
      if (
        isChange &&
        result.source === 'firecrawl' &&
        result.extracted &&
        previous?.extracted_content &&
        typeof previous.extracted_content === 'string'
      ) {
        changeSummary = await summariseChange({
          previous: previous.extracted_content,
          next: result.extracted,
          framework_id: fw.framework_id,
          source_name: fw.source_name,
        })
      }

      // Insert snapshot whether or not it changed (audit trail)
      await supabase.from('compliance_framework_index').insert({
        framework_id: fw.framework_id,
        source_url: fw.source_url,
        source_version: fw.source_version,
        content_sha256: result.sha,
        extracted_content: result.extracted || null,
        change_summary: isChange
          ? changeSummary ?? 'Source content changed since last fetch — please review.'
          : null,
        affected_signal_ids:
          isChange && fw.framework_id !== 'nist-800-53'
            ? signalsByFramework(fw.framework_id as FrameworkId).map((s) => s.id)
            : [],
        fetched_at: fetchedAt,
        is_change: isChange,
      })

      // Sonnet may have decided the change was cosmetic — if it returned
      // null and the only signal we have is the raw-HTML hash flip, treat
      // it as cosmetic and DON'T notify subscribers. Avoids the
      // false-positive alert storm that the old hash-only system caused.
      const isMaterialChange =
        isChange && (result.source === 'firecrawl' ? changeSummary !== null : true)

      if (isMaterialChange) {
        changedFrameworks.push({ ...fw, changeSummary })
        logEventAsync({
          type: 'framework.changed',
          source: 'lexaudit',
          ref_id: fw.framework_id,
          status: 'ok',
          metadata: {
            framework_id: fw.framework_id,
            source_url: fw.source_url,
            source_version: fw.source_version,
            content_sha256: result.sha,
            extractor: result.source,
            has_change_summary: changeSummary !== null,
          },
        })
      }
    }

    // 2. Notify subscribers whose tracked frameworks have changes
    let notified = 0
    if (changedFrameworks.length > 0) {
      const changedIds: Set<string> = new Set(changedFrameworks.map((f) => f.framework_id))
      const { data: subs } = await supabase
        .from('compliance_subs')
        .select('id, user_email, frameworks, subscribed_signals, notification_channel, last_notified_at')
        .eq('status', 'active')
      const subscribers = (subs ?? []) as ComplianceSubRow[]

      for (const sub of subscribers) {
        const matched = sub.frameworks.filter((f) => changedIds.has(f))
        if (matched.length === 0) continue

        const matchedSources = changedFrameworks.filter((f) => matched.includes(f.framework_id))
        await sendChangeAlert(sub.user_email, matchedSources)
        notified++

        await supabase
          .from('compliance_subs')
          .update({ last_notified_at: fetchedAt })
          .eq('id', sub.id)
      }
    }

    logEventAsync({
      type: 'cron.completed',
      source: 'lexaudit',
      ref_id: 'monitor/diff',
      status: 'ok',
      metadata: {
        cron: 'monitor/diff',
        sources_checked: FRAMEWORK_SOURCES.length,
        frameworks_changed: changedFrameworks.length,
        firecrawl_extractions: firecrawlHits,
        raw_fallbacks: rawFallbacks,
        subscribers_notified: notified,
      },
    })

    return NextResponse.json({
      ok: true,
      sources_checked: FRAMEWORK_SOURCES.length,
      frameworks_changed: changedFrameworks.length,
      firecrawl_extractions: firecrawlHits,
      raw_fallbacks: rawFallbacks,
      subscribers_notified: notified,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown error'
    console.error('[cron/monitor/diff]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

async function sendChangeAlert(
  email: string,
  changed: Array<FrameworkSource & { changeSummary: string | null }>
): Promise<void> {
  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) return

  const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'intelligence@intelligence.bizlegal-ai.com'
  const replyTo = process.env.RESEND_REPLY_TO ?? 'team@bizlegal-ai.com'

  const items = changed
    .map((f) => {
      const label =
        f.framework_id === 'nist-800-53'
          ? f.source_name
          : (FRAMEWORK_LABELS[f.framework_id as FrameworkId] ?? f.source_name)
      const summary = f.changeSummary
        ? `<div style="margin-top:6px;padding:8px 10px;background:#f7f3ff;border-left:3px solid #5b21b6;font-size:13px;line-height:1.5;color:#3b275f">${escapeHtml(f.changeSummary)}</div>`
        : ''
      return `<li style="margin-bottom:14px"><strong>${escapeHtml(label)}</strong> — ${escapeHtml(f.source_version)}<br><a href="${f.source_url}" style="color:#c9a84c;font-size:13px">${f.source_url}</a>${summary}</li>`
    })
    .join('')

  const subject = `Compliance Monitor · ${changed.length} framework${changed.length > 1 ? 's' : ''} changed`

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: `LexAudit Compliance Monitor <${fromEmail}>`,
      to: [email],
      reply_to: replyTo,
      subject,
      html: `<div style="font-family:Inter,sans-serif;max-width:560px;margin:auto;padding:24px;color:#0e0b1a">
<h2 style="font-weight:800;letter-spacing:-0.02em;margin:0 0 16px">${escapeHtml(subject)}</h2>
<p style="line-height:1.6;color:#4b3f6a">The canonical source for the following framework${changed.length > 1 ? 's' : ''} has changed since our last check. Please review the source text and assess whether your current controls remain aligned.</p>
<ul style="line-height:1.7;color:#4b3f6a;padding-left:20px">${items}</ul>
<div style="background:#fef3c7;border:1px solid #f59e0b;padding:12px 14px;border-radius:8px;margin-top:18px;font-size:13px;color:#7c2d12;line-height:1.5">
<strong>Decision-support only.</strong> We monitor source URLs and surface changes; we do not interpret the change, attest your posture, or guarantee compliance. Run a fresh Compliance Health Score or consult licensed counsel for binding determinations.
</div>
<p style="font-size:12px;color:#6b6188;margin-top:18px">Disclosure v1.0.0-p4 — Reply to manage your subscription.</p>
</div>`,
    }),
  }).catch((e) => console.warn('[cron/monitor/diff] notify failed', e))
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
