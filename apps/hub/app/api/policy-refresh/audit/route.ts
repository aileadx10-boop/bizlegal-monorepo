import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logEventAsync } from '@/lib/ops/log'
import { isConfigured as firecrawlConfigured, scrapeMarkdown } from '@/lib/firecrawl/scrape'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * POST /api/policy-refresh/audit
 *
 * V2 — Privacy Auto-Refresh. Fetches the customer's privacy policy URL
 * via Firecrawl, runs Sonnet redline against 7 framework canon
 * (GDPR / CCPA / CPRA / Quebec Law 25 / Colorado CPA / Connecticut DPA /
 * Texas DPSA), returns redline + summary. Free first audit; recurring
 * monitoring on $29/mo subscription.
 *
 * REVENUE+LIABILITY framing: redline is decision-support intelligence,
 * not a finalised privacy notice. Output ships with mandatory
 * "review with counsel before publishing" boilerplate.
 *
 * Anti-hallucination: Sonnet is constrained to cite ONLY framework IDs
 * from a fixed allowed list (gdpr / ccpa / cpra / law25 / co_cpa / ct_dpa /
 * tx_dpsa) and must include a verbatim quote from the customer's policy
 * for each finding. A post-processor strips findings where the quote
 * doesn't appear (case-insensitive substring) in the scraped policy text.
 */

interface AuditBody {
  email: string
  policy_url: string
}

interface RedlineFinding {
  framework: string
  severity: 'low' | 'medium' | 'high'
  finding: string
  policy_quote: string
  suggested_language: string
}

interface AuditResponse {
  audit_id: string
  policy_url: string
  policy_title: string | null
  frameworks_touched: string[]
  findings: RedlineFinding[]
  summary: string
  legal_notice: string
  disclaimer_version: string
  generated_at: string
}

import { ALLOWED_FRAMEWORKS } from '@/lib/policy-refresh/frameworks'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase env not configured')
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

const PROMPT = `You are a senior privacy-counsel reviewer. Compare the privacy policy
text below against the 7 frameworks in scope: GDPR, CCPA, CPRA,
Quebec Law 25, Colorado CPA, Connecticut DPA, Texas DPSA.

Return STRICT JSON (no prose):
{
  "policy_title": "<extracted from <h1> or <title>>",
  "frameworks_touched": ["<2-letter framework keys from this list: gdpr, ccpa, cpra, law25, co_cpa, ct_dpa, tx_dpsa>"],
  "findings": [
    {
      "framework": "<one of the keys above>",
      "severity": "low" | "medium" | "high",
      "finding": "<1-2 sentence statement of what's missing or stale>",
      "policy_quote": "<verbatim quote, 5-30 words, from the policy showing the gap or stale text. If absence is the gap, leave empty.>",
      "suggested_language": "<1-3 sentences of replacement or addition, plain language no jargon>"
    }
  ],
  "summary": "<3-5 sentence executive summary of the redline>"
}

Constraints:
- Output 5-15 findings ONLY. Do not invent findings to pad the count.
- frameworks_touched must be a deduplicated subset of the keys above.
- severity HIGH = imminent enforcement risk (missing notice of right to
  opt out for sale of personal info, no DPO designation in EU operations,
  no CCPA "Do Not Sell" link). MEDIUM = stale or ambiguous language.
  LOW = best-practice gap.
- Never invent regulator article numbers. Cite by framework key only.
- If the policy is well-aligned with all 7 frameworks, return findings: []
  with summary explaining why.

=== POLICY TEXT (extracted markdown) ===
{policy}
=== END ===
`

async function auditWithSonnet(policyMarkdown: string): Promise<Omit<AuditResponse, 'audit_id' | 'policy_url' | 'legal_notice' | 'disclaimer_version' | 'generated_at'> | null> {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return null
  const prompt = PROMPT.replace('{policy}', policyMarkdown.slice(0, 16000))

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-6',
        max_tokens: 3000,
        temperature: 0.1,
        messages: [{ role: 'user', content: prompt }],
      }),
    })
    if (!res.ok) {
      console.warn('[policy-refresh] Sonnet HTTP', res.status)
      return null
    }
    const blob = (await res.json()) as { content?: Array<{ type: string; text?: string }> }
    const text = (blob.content ?? []).find((c) => c.type === 'text')?.text?.trim()
    if (!text) return null
    const cleaned = text.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '')
    const parsed = JSON.parse(cleaned) as Partial<{
      policy_title: string
      frameworks_touched: string[]
      findings: RedlineFinding[]
      summary: string
    }>

    const frameworksTouched = (parsed.frameworks_touched ?? [])
      .filter((f) => ALLOWED_FRAMEWORKS.has(f))
      .slice(0, 7)
    const policyLower = policyMarkdown.toLowerCase()
    const findings = (parsed.findings ?? [])
      .filter((f) => f && ALLOWED_FRAMEWORKS.has(f.framework))
      .filter((f) => f.severity === 'low' || f.severity === 'medium' || f.severity === 'high')
      // Anti-hallucination: drop findings whose quote isn't in the policy.
      // Empty quote is allowed (signals "absence is the gap").
      .filter((f) => !f.policy_quote || policyLower.includes(f.policy_quote.toLowerCase().slice(0, 40)))
      .map((f) => ({
        framework: f.framework,
        severity: f.severity,
        finding: String(f.finding ?? '').slice(0, 400),
        policy_quote: String(f.policy_quote ?? '').slice(0, 280),
        suggested_language: String(f.suggested_language ?? '').slice(0, 600),
      }))
      .slice(0, 15)

    if (!parsed.summary) return null

    return {
      policy_title: parsed.policy_title ? String(parsed.policy_title).slice(0, 200) : null,
      frameworks_touched: frameworksTouched,
      findings,
      summary: String(parsed.summary).slice(0, 1500),
    }
  } catch (err) {
    console.warn('[policy-refresh] Sonnet call failed:', err)
    return null
  }
}

function isValid(input: unknown): input is AuditBody {
  if (!input || typeof input !== 'object') return false
  const o = input as Record<string, unknown>
  return (
    typeof o.email === 'string' &&
    o.email.includes('@') &&
    typeof o.policy_url === 'string' &&
    /^https?:\/\//.test(o.policy_url) &&
    o.policy_url.length < 500
  )
}

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }
  if (!isValid(body)) {
    return NextResponse.json(
      { error: 'email and policy_url (https://) are required' },
      { status: 400 }
    )
  }

  if (!firecrawlConfigured()) {
    return NextResponse.json(
      { error: 'audit_unavailable; FIRECRAWL_API_KEY not configured.' },
      { status: 503 }
    )
  }

  const start = Date.now()
  const fc = await scrapeMarkdown(body.policy_url)
  if (!fc.ok) {
    logEventAsync({
      type: 'policy.refreshed',
      source: 'hub',
      email: body.email,
      status: 'failed',
      metadata: {
        policy_url: body.policy_url,
        scrape_error: fc.error,
        duration_ms: Date.now() - start,
      },
    })
    return NextResponse.json(
      { error: `policy_url_unreachable: ${fc.error}` },
      { status: 502 }
    )
  }

  const audit = await auditWithSonnet(fc.markdown)
  if (!audit) {
    return NextResponse.json(
      { error: 'auditor_unavailable; please retry shortly.' },
      { status: 503 }
    )
  }

  // Persist
  let auditId = ''
  try {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('policy_refresh_audits')
      .insert({
        user_email: body.email.toLowerCase(),
        policy_url: body.policy_url,
        policy_title: audit.policy_title,
        frameworks_touched: audit.frameworks_touched,
        findings: audit.findings,
        summary: audit.summary,
      })
      .select('id')
      .single()
    if (!error && data) auditId = String(data.id)
  } catch (err) {
    console.warn('[policy-refresh] persist failed:', err)
  }

  logEventAsync({
    type: 'policy.refreshed',
    source: 'hub',
    ref_id: auditId || undefined,
    email: body.email,
    status: 'ok',
    metadata: {
      policy_url: body.policy_url,
      frameworks_touched: audit.frameworks_touched,
      findings_count: audit.findings.length,
      severity_high: audit.findings.filter((f) => f.severity === 'high').length,
      severity_medium: audit.findings.filter((f) => f.severity === 'medium').length,
      duration_ms: Date.now() - start,
      extractor: 'firecrawl',
    },
  })

  const response: AuditResponse = {
    audit_id: auditId,
    policy_url: body.policy_url,
    policy_title: audit.policy_title,
    frameworks_touched: audit.frameworks_touched,
    findings: audit.findings,
    summary: audit.summary,
    legal_notice:
      'Decision-support intelligence — not a finalised privacy notice. Review with counsel before publishing or relying on this redline for compliance filings.',
    disclaimer_version: 'v1.0.0-p4',
    generated_at: new Date().toISOString(),
  }

  return NextResponse.json(response)
}

