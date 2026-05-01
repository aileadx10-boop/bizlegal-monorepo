import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { logEventAsync } from '@/lib/ops/log'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

// Lazy init — never crash the build if env is unset.
function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY env var is not configured on this deployment')
  }
  return new Anthropic()
}

interface RiskEngineDeepAnalysisInput {
  score: number
  regulatory: number
  financial: number
  enforcement: number
  enforcementProb: number
  exposure: string
  threats: string[]
  mitigations: string[]
  jurisdictions: string[]
  industry: string
  userCount: number
  transactionVolume: number
  hasComplianceProgram: boolean
  hasDPO: boolean
  hasAML: boolean
  hasLicense: boolean
}

const ALLOWED_INDUSTRIES = ['crypto', 'exchange', 'lending', 'payments', 'saas', 'fintech']

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RiskEngineDeepAnalysisInput

    if (!body || typeof body.score !== 'number' || !Array.isArray(body.jurisdictions)) {
      return NextResponse.json({ error: 'Invalid input shape' }, { status: 400 })
    }
    if (!ALLOWED_INDUSTRIES.includes(body.industry)) {
      return NextResponse.json({ error: 'Unsupported industry' }, { status: 400 })
    }
    if (body.jurisdictions.length === 0 || body.jurisdictions.length > 10) {
      return NextResponse.json({ error: 'Provide 1-10 jurisdictions' }, { status: 400 })
    }

    const client = getClient()

    const prompt = `You are a regulatory intelligence analyst at BizLegal AI. A digital-asset/fintech business has run an automated risk scan. Below is the structured score from our deterministic risk engine.

Your job: produce a 600-word narrative deep-dive in Markdown that gives the user actionable, specific intelligence — not generic advice.

Required sections:

## 1. Your Risk Profile in Plain English
2-3 paragraphs interpreting the score in business terms. What is the user actually exposed to today, in dollars and operational terms?

## 2. Recent Enforcement Examples (Last 18 Months)
List 2-4 SPECIFIC enforcement actions from regulators in the user's primary jurisdiction(s) that match their industry profile. Use real cases you know of from up to your knowledge cutoff (January 2026). Format each as:
- **[Date] – [Regulator] vs [Company]:** [1-sentence description] – Penalty: [amount]. **Why this matters to you:** [1 sentence].
If you don't have a real case, write "No directly comparable enforcement action in the last 18 months — this is itself a signal of regulator focus area" rather than making one up.

## 3. Your 30 / 60 / 90 Day Action Plan
Bulleted, specific, prioritised. 4-6 items per timeframe. Each item must be ONE concrete action (not "consider doing X"). For example: "Day 7: Engage [type of counsel] to draft a [specific document]" not "Get legal advice".

## 4. The Three Steps You Should Take Right Now (CTAs)
Three calls-to-action, each one short, in this exact order:
1. Snapshot Pro upgrade ($149/mo) — for ongoing monitoring of regulators in your jurisdictions
2. TRACR wallet scan ($149) — if your business handles crypto, scan your treasury wallets for sanctions exposure
3. Real-estate JV intelligence (free intro) — only if user mentions cross-border real-estate or family-office activity in industry/jurisdictions

INPUT (deterministic risk engine output):
- Composite score: ${body.score}/100
- Regulatory axis: ${body.regulatory}/100
- Financial axis: ${body.financial}/100
- Enforcement axis: ${body.enforcement}/100
- Enforcement probability: ${body.enforcementProb}%
- Estimated exposure: ${body.exposure}
- Industry: ${body.industry}
- Jurisdictions: ${body.jurisdictions.join(', ')}
- User count: ${body.userCount}
- Transaction volume (USD): ${body.transactionVolume}
- Compliance program in place: ${body.hasComplianceProgram}
- DPO appointed: ${body.hasDPO}
- AML/CTF programme: ${body.hasAML}
- Operating licence: ${body.hasLicense}

Identified threats:
${body.threats.map((t) => `- ${t}`).join('\n')}

Recommended mitigations:
${body.mitigations.map((m) => `- ${m}`).join('\n')}

CONSTRAINTS:
- Do NOT invent regulator names, fines, or case names. If you don't have a real example, say so.
- Do NOT promise legal outcomes. Use language like "may expose to", "is associated with", "regulators in jurisdiction X have flagged".
- Output Markdown only — no front-matter, no code fences around the whole response.
- Open with the H2 \`## 1. Your Risk Profile in Plain English\` — no preamble.
- Aim for ~600 words total across the four sections.`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2400,
      messages: [{ role: 'user', content: prompt }],
    })

    const textBlock = message.content.find((b) => b.type === 'text')
    const narrative = textBlock && textBlock.type === 'text' ? textBlock.text : ''

    if (!narrative || narrative.length < 200) {
      return NextResponse.json(
        { error: 'Analysis generation failed; please try again' },
        { status: 502 },
      )
    }

    logEventAsync({
      type: 'risk.analysis',
      source: 'hub',
      status: 'ok',
      metadata: { jurisdictions_count: body.jurisdictions?.length, industry: body.industry },
    })

    return NextResponse.json({
      narrative,
      model: 'claude-sonnet-4-6',
      generated_at: new Date().toISOString(),
      disclaimer_version: 'v1.0.0-p4',
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[risk-engine/deep-analysis]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
