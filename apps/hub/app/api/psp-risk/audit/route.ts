import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { searchAup, type AupItem } from '@/lib/psp-risk/aup-corpus'
import { logEventAsync } from '@/lib/ops/log'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

interface AuditBody {
  mode: 'prevention' | 'recovery'
  business_description: string
  current_processor?: AupItem['processor']
  freeze_email_text?: string
  vertical?: string
  monthly_revenue_usd?: number
  email?: string
}

const MAX_DESC = 6000
const MAX_FREEZE = 6000

function getAnthropic(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY env var is not configured on this deployment')
  }
  return new Anthropic()
}

function clamp(s: string, max: number): string {
  return s.length <= max ? s : s.slice(0, max)
}

interface AuditResponse {
  audit_id: string
  mode: 'prevention' | 'recovery'
  analysis: string
  flagged_aup_clauses: ReadonlyArray<{ source_name: string; source_url: string; processor: string; category: string }>
  recommended_processors?: ReadonlyArray<string>
  appeal_path?: string
  regulator_pathways?: ReadonlyArray<{ source_name: string; source_url: string }>
  legal_notice: string
  disclaimer_version: string
  issued_at: string
}

const DISCLAIMER_VERSION = process.env.DISCLAIMER_VERSION ?? 'v1.0.0-p4'

const PREVENTION_LEGAL_NOTICE =
  "Decision-support only. Pattern recognition against public AUP texts. Outcome of any specific application depends on the processor's underwriting team and is not guaranteed. Consult licensed counsel before structuring your business or making any representations during onboarding."

const RECOVERY_LEGAL_NOTICE =
  "Decision-support only. We surface published appeal pathways and regulator-complaint routes. We do not represent customers before processors or regulators, and we do not guarantee account reinstatement, fund release, or any specific outcome. Consult licensed counsel for binding determinations."

function buildPreventionPrompt(body: AuditBody, hits: AupItem[]): string {
  const corpus = hits
    .map((h) => `[${h.processor}/${h.category}] ${h.source_name}\n${h.source_url}\n${h.text}`)
    .join('\n\n---\n\n')
  return `You are a payment-risk pre-flight auditor. The customer is preparing to apply (or has already applied) to a payment processor. Your job: surface AUP clauses and underwriting patterns the customer is likely to trigger, and recommend a path with the lowest rejection risk. You are NOT pre-approving anything; the processor's underwriting team makes the final call.

CONSTRAINTS:
- Cite ONLY the public AUP excerpts below using inline parenthetical citations like (Stripe Restricted Businesses) or (PayPal AUP).
- DO NOT invent AUP clauses or imply you have insider knowledge of any processor's review process.
- DO NOT promise approval, account reinstatement, or any specific outcome.
- For each flagged clause, give: (a) why this business will likely trigger it, (b) a concrete documentation or business-structure suggestion to mitigate, (c) the cited source.
- End with a 3-row "Recommended Processor Order" ranked from most-likely-approve to least, citing public AUP fit.
- ~500 words, plain markdown.

BUSINESS DESCRIPTION:
"""
${clamp(body.business_description, MAX_DESC)}
"""

VERTICAL: ${body.vertical ?? 'unspecified'}
TARGET PROCESSOR: ${body.current_processor ?? 'unspecified'}
MONTHLY REVENUE (USD): ${body.monthly_revenue_usd ?? 'unspecified'}

PUBLIC AUP CORPUS (cite inline):
"""
${corpus.slice(0, 12_000)}
"""

Output the analysis only. No preamble.`
}

function buildRecoveryPrompt(body: AuditBody, hits: AupItem[]): string {
  const corpus = hits
    .map((h) => `[${h.processor}/${h.category}] ${h.source_name}\n${h.source_url}\n${h.text}`)
    .join('\n\n---\n\n')
  return `You are a payment-account-freeze recovery analyst. The customer's processor account has been limited, frozen, or closed. Your job: pattern the freeze email or reason code against published appeal pathways, draft an appeal-letter outline, and surface regulator-complaint routes if the appeal fails. You are NOT representing the customer; you are drafting decision-support.

CONSTRAINTS:
- Cite ONLY the public sources below using inline parenthetical citations.
- DO NOT promise reinstatement, fund release, or successful regulator complaint.
- Output structure (markdown):
  1. **Pattern match** — what AUP clause or risk signal best fits the freeze reason (cite source)
  2. **Appeal letter outline** — 5 numbered points the customer should address in their appeal, each with a 1-sentence rationale and the documentation evidence to attach
  3. **Regulator escalation path** — if the appeal is denied or the processor does not respond within published timelines, the next step (CFPB / FCA / EBA / etc.) with the relevant URL
  4. **Alternative-processor recommendation** — 2-3 processors most likely to onboard this business, citing AUP fit
  5. **Closing legal notice line**: "This is decision-support only. Consult licensed counsel before sending an appeal or filing a regulator complaint."
- ~600 words.

BUSINESS DESCRIPTION:
"""
${clamp(body.business_description, MAX_DESC)}
"""

CURRENT PROCESSOR: ${body.current_processor ?? 'unspecified'}
VERTICAL: ${body.vertical ?? 'unspecified'}

FREEZE / LIMITATION EMAIL OR REASON:
"""
${clamp(body.freeze_email_text ?? '(customer did not paste freeze email — work from business description only)', MAX_FREEZE)}
"""

PUBLIC SOURCES (cite inline):
"""
${corpus.slice(0, 12_000)}
"""

Output the structured analysis only. No preamble.`
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<AuditBody>
    const mode = body.mode === 'recovery' ? 'recovery' : 'prevention'
    const desc = (body.business_description ?? '').trim()
    const freeze = (body.freeze_email_text ?? '').trim()
    const email = (body.email ?? '').trim()

    if (!desc || desc.length < 40 || desc.length > MAX_DESC) {
      return NextResponse.json(
        { error: `business_description must be 40-${MAX_DESC} chars` },
        { status: 400 },
      )
    }
    if (mode === 'recovery' && (!freeze || freeze.length < 20)) {
      return NextResponse.json(
        { error: 'freeze_email_text required (min 20 chars) for recovery mode' },
        { status: 400 },
      )
    }
    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: 'invalid email' }, { status: 400 })
    }

    // 1. Retrieve relevant AUP entries
    const queryText = mode === 'prevention' ? desc : `${desc}\n\n${freeze}`
    const hits = searchAup(queryText, {
      mode,
      processor: body.current_processor,
      limit: 8,
    })

    // 2. Compose via Sonnet
    const client = getAnthropic()
    const prompt =
      mode === 'prevention' ? buildPreventionPrompt(body as AuditBody, hits) : buildRecoveryPrompt(body as AuditBody, hits)

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2400,
      messages: [{ role: 'user', content: prompt }],
    })
    const textBlock = message.content.find((b) => b.type === 'text')
    const analysis = textBlock && textBlock.type === 'text' ? textBlock.text : ''

    if (!analysis) {
      return NextResponse.json({ error: 'analysis returned empty' }, { status: 502 })
    }

    // 3. Compose response
    const flagged = hits.map((h) => ({
      source_name: h.source_name,
      source_url: h.source_url,
      processor: h.processor,
      category: h.category,
    }))

    const regulators = hits.filter((h) => h.category === 'regulator-complaint')
    const altProcessors = hits.filter((h) => h.category === 'alternative-processor')

    const auditId = `psp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`

    const response: AuditResponse = {
      audit_id: auditId,
      mode,
      analysis,
      flagged_aup_clauses: flagged,
      recommended_processors:
        altProcessors.length > 0 ? altProcessors.map((a) => a.source_name) : undefined,
      appeal_path:
        mode === 'recovery'
          ? hits.find((h) => h.category === 'appeal-pathway')?.source_url
          : undefined,
      regulator_pathways:
        mode === 'recovery'
          ? regulators.map((r) => ({ source_name: r.source_name, source_url: r.source_url }))
          : undefined,
      legal_notice: mode === 'prevention' ? PREVENTION_LEGAL_NOTICE : RECOVERY_LEGAL_NOTICE,
      disclaimer_version: DISCLAIMER_VERSION,
      issued_at: new Date().toISOString(),
    }

    logEventAsync({
      type: 'psp.audit',
      source: 'hub',
      ref_id: auditId,
      email: email || undefined,
      status: 'ok',
      metadata: {
        mode,
        processor: body.current_processor,
        vertical: body.vertical,
        hits: hits.length,
      },
    })

    return NextResponse.json(response)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown error'
    console.error('[psp-risk/audit]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

