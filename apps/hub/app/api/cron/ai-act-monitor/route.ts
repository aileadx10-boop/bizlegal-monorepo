import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import { logEventAsync } from '@/lib/ops/log'
import { isConfigured as firecrawlConfigured, scrapeMarkdown, summariseChange } from '@/lib/firecrawl/scrape'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * GET /api/cron/ai-act-monitor
 *
 * V1 — Daily semantic-diff cron over 5 EU AI Act sources. Same pattern
 * as LexAudit Q2 Compliance Monitor: Firecrawl extracts markdown,
 * we hash the extract (semantic content, not raw HTML), Sonnet
 * summarises material changes, subscribers get an email when their
 * tier or its downstream obligations are affected.
 *
 * Sources:
 *   1. Consolidated EU AI Act text (EUR-Lex)
 *   2. Annex III categories
 *   3. Commission Implementing Regulations on AI Act
 *   4. ESMA AI guidance (sectoral overlap on financial AI)
 *   5. EDPB AI guidance (data-protection overlap)
 *
 * Auth: CRON_SECRET in Authorization: Bearer header.
 * Schedule: 0 11 * * * (daily 11:00 UTC; offset from monitor/diff at 06:00).
 *
 * Anti-hallucination: Sonnet's "no substantive change" gate suppresses
 * cosmetic-edit alerts (same as Q2). Storing extracted_content for the
 * NEXT run is what enables that semantic diff.
 */

interface AiActSource {
  source_id: string
  source_name: string
  source_url: string
  source_version: string
}

const SOURCES: AiActSource[] = [
  {
    source_id: 'ai-act-consolidated',
    source_name: 'EU AI Act consolidated text',
    source_url: 'https://eur-lex.europa.eu/eli/reg/2024/1689/oj',
    source_version: '2024/1689',
  },
  {
    source_id: 'ai-act-annex-iii',
    source_name: 'AI Act Annex III — high-risk categories',
    source_url: 'https://artificialintelligenceact.eu/annex/3/',
    source_version: 'Annex III',
  },
  {
    source_id: 'ai-act-commission-irs',
    source_name: 'Commission Implementing Regulations on the AI Act',
    source_url: 'https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai',
    source_version: 'IRs (rolling)',
  },
  {
    source_id: 'ai-act-esma',
    source_name: 'ESMA — AI in financial services guidance',
    source_url: 'https://www.esma.europa.eu/policy-rules/fintech-and-digital-finance',
    source_version: 'rolling',
  },
  {
    source_id: 'ai-act-edpb',
    source_name: 'EDPB — AI guidance',
    source_url: 'https://www.edpb.europa.eu/our-work-tools/our-documents/topic/artificial-intelligence_en',
    source_version: 'rolling',
  },
]

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase env not configured')
  return createClient(url, key)
}

interface FetchResult {
  ok: boolean
  sha?: string
  extracted?: string
  source: 'firecrawl' | 'raw'
  status?: number
}

async function fetchAndHash(url: string): Promise<FetchResult> {
  if (firecrawlConfigured()) {
    const fc = await scrapeMarkdown(url)
    if (fc.ok) {
      const sha = crypto.createHash('sha256').update(fc.markdown).digest('hex')
      return { ok: true, sha, extracted: fc.markdown, source: 'firecrawl' }
    }
  }
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'BizLegal-AI-Act-Monitor/1.0' },
      cache: 'no-store',
    })
    if (!res.ok) return { ok: false, status: res.status, source: 'raw' }
    const text = await res.text()
    const sha = crypto.createHash('sha256').update(text).digest('hex')
    return { ok: true, sha, extracted: '', source: 'raw' }
  } catch {
    return { ok: false, source: 'raw' }
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
    const changedSources: Array<AiActSource & { changeSummary: string | null }> = []
    let firecrawlHits = 0
    let rawFallbacks = 0

    for (const src of SOURCES) {
      const result = await fetchAndHash(src.source_url)
      if (!result.ok || !result.sha) continue
      if (result.source === 'firecrawl') firecrawlHits += 1
      else rawFallbacks += 1

      const { data: previous } = await supabase
        .from('ai_act_framework_index')
        .select('content_sha256, extracted_content')
        .eq('source_id', src.source_id)
        .order('fetched_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      const isChange = !!previous && previous.content_sha256 !== result.sha

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
          framework_id: src.source_id,
          source_name: src.source_name,
        })
      }

      await supabase.from('ai_act_framework_index').insert({
        source_id: src.source_id,
        source_url: src.source_url,
        source_version: src.source_version,
        content_sha256: result.sha,
        extracted_content: result.extracted || null,
        change_summary: isChange
          ? changeSummary ?? 'Source content changed since last fetch — please review.'
          : null,
        fetched_at: fetchedAt,
        is_change: isChange,
      })

      const isMaterialChange =
        isChange && (result.source === 'firecrawl' ? changeSummary !== null : true)

      if (isMaterialChange) {
        changedSources.push({ ...src, changeSummary })
        logEventAsync({
          type: 'framework.changed',
          source: 'hub',
          ref_id: `ai-act/${src.source_id}`,
          status: 'ok',
          metadata: {
            framework_id: src.source_id,
            source_url: src.source_url,
            source_version: src.source_version,
            content_sha256: result.sha,
            extractor: result.source,
            has_change_summary: changeSummary !== null,
            domain: 'ai-act',
          },
        })
      }
    }

    // Notify active ai_act_subs subscribers
    let notified = 0
    if (changedSources.length > 0) {
      const { data: subs } = await supabase
        .from('ai_act_subs')
        .select('id, user_email, status, last_notified_at')
        .eq('status', 'active')

      for (const sub of subs ?? []) {
        await sendChangeAlert(sub.user_email as string, changedSources)
        notified += 1
        await supabase
          .from('ai_act_subs')
          .update({ last_notified_at: fetchedAt })
          .eq('id', sub.id)
      }
    }

    logEventAsync({
      type: 'cron.completed',
      source: 'hub',
      ref_id: 'ai-act-monitor',
      status: 'ok',
      metadata: {
        cron: 'ai-act-monitor',
        sources_checked: SOURCES.length,
        sources_changed: changedSources.length,
        firecrawl_extractions: firecrawlHits,
        raw_fallbacks: rawFallbacks,
        subscribers_notified: notified,
      },
    })

    return NextResponse.json({
      ok: true,
      sources_checked: SOURCES.length,
      sources_changed: changedSources.length,
      firecrawl_extractions: firecrawlHits,
      raw_fallbacks: rawFallbacks,
      subscribers_notified: notified,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown error'
    console.error('[cron/ai-act-monitor]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

async function sendChangeAlert(
  email: string,
  changed: Array<AiActSource & { changeSummary: string | null }>
): Promise<void> {
  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) return
  const fromEmail = process.env.RESEND_FROM ?? 'intelligence@intelligence.bizlegal-ai.com'
  const replyTo = process.env.RESEND_REPLY_TO ?? 'team@bizlegal-ai.com'

  const items = changed
    .map((c) => {
      const summary = c.changeSummary
        ? `<div style="margin-top:6px;padding:8px 10px;background:#f7f3ff;border-left:3px solid #5b21b6;font-size:13px;line-height:1.5;color:#3b275f">${escapeHtml(c.changeSummary)}</div>`
        : ''
      return `<li style="margin-bottom:14px"><strong>${escapeHtml(c.source_name)}</strong> — ${escapeHtml(c.source_version)}<br><a href="${c.source_url}" style="color:#c9a84c;font-size:13px">${c.source_url}</a>${summary}</li>`
    })
    .join('')

  const subject = `EU AI Act · ${changed.length} source${changed.length > 1 ? 's' : ''} changed`

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: `BizLegal AI Intelligence <${fromEmail}>`,
      to: [email],
      reply_to: replyTo,
      subject,
      html: `<div style="font-family:Inter,sans-serif;max-width:560px;margin:auto;padding:24px;color:#0e0b1a">
<h2 style="font-weight:800;letter-spacing:-0.02em;margin:0 0 16px">${escapeHtml(subject)}</h2>
<p style="line-height:1.6;color:#4b3f6a">A canonical EU AI Act source changed since our last check. Review the source text and re-confirm whether your current tier still holds — or paste your system description back into <a href="https://bizlegal-ai.com/agents/ai-act" style="color:#5b21b6">the classifier</a> for a fresh re-classification.</p>
<ul style="line-height:1.7;color:#4b3f6a;padding-left:20px">${items}</ul>
<div style="background:#fef3c7;border:1px solid #f59e0b;padding:12px 14px;border-radius:8px;margin-top:18px;font-size:13px;color:#7c2d12;line-height:1.5">
<strong>Decision-support only.</strong> We monitor source URLs and surface changes; we do not interpret the change as a tier-flip for your system. Re-run the classifier or consult EU-qualified counsel for binding determinations.
</div>
<p style="font-size:12px;color:#6b6188;margin-top:18px">Disclosure v1.0.0-p4 — Reply to manage your subscription.</p>
</div>`,
    }),
  }).catch((e) => console.warn('[ai-act-monitor] notify failed', e))
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
