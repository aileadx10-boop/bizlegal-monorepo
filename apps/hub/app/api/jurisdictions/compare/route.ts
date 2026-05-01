import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { logEventAsync } from '@/lib/ops/log'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY env var is not configured on this deployment')
  }
  return new Anthropic()
}

interface CompareInput {
  jurisdictionA: string
  jurisdictionB: string
  industry?: string
  businessModel?: string
}

const MIN_LEN = 2
const MAX_LEN = 60

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CompareInput

    if (!body || typeof body.jurisdictionA !== 'string' || typeof body.jurisdictionB !== 'string') {
      return NextResponse.json({ error: 'Provide jurisdictionA and jurisdictionB' }, { status: 400 })
    }
    const a = body.jurisdictionA.trim()
    const b = body.jurisdictionB.trim()
    if (a.length < MIN_LEN || a.length > MAX_LEN || b.length < MIN_LEN || b.length > MAX_LEN) {
      return NextResponse.json({ error: 'Jurisdiction names must be 2–60 chars' }, { status: 400 })
    }
    if (a.toLowerCase() === b.toLowerCase()) {
      return NextResponse.json({ error: 'Pick two different jurisdictions' }, { status: 400 })
    }

    const industry = (body.industry || 'digital-asset / fintech').slice(0, 60)
    const businessModel = (body.businessModel || 'general operating company').slice(0, 200)

    const client = getClient()

    const prompt = `You are a regulatory intelligence analyst at BizLegal AI. Compare ${a} vs ${b} for a ${industry} business operating as a ${businessModel}.

Output valid Markdown only. No preamble, no code fences. Use this exact structure:

## Side-by-side: ${a} vs ${b}

| Dimension | ${a} | ${b} | Winner |
|---|---|---|---|
| Setup speed | <weeks> | <weeks> | <name or Tie> |
| Compliance cost (yr 1) | $<USD> | $<USD> | <name or Tie> |
| Tax (corporate) | <%> | <%> | <name or Tie> |
| Banking access | <Strong/Moderate/Weak> | <same> | <name or Tie> |
| Substance requirement | <description> | <same> | <name or Tie> |
| Enforcement aggression (5yr) | <Low/Medium/High + 1 example> | <same> | <name or Tie> |
| Recent regulator focus | <1 line> | <1 line> | — |
| AML / KYC stringency | <Low/Medium/High> | <same> | <name or Tie> |

## What ${a} is good for
3-4 bullets — concrete operational profiles where ${a} wins.

## What ${b} is good for
3-4 bullets — concrete operational profiles where ${b} wins.

## Recommendation for a ${industry} ${businessModel}
2-3 paragraphs synthesising the trade-off. End with: "On balance, [pick one] is the stronger fit because [1 sentence]."

## Key risks if you pick the loser
3-4 bullets — what specifically would you give up.

## Three-step move-in plan if you pick [recommendation]
3 numbered concrete steps with specific document names + 30/60/90 day milestones.

CONSTRAINTS:
- Use only facts you are confident about as of January 2026.
- If a number is unknown, write "Not publicly available" rather than inventing.
- Recent regulator focus must be a real story you know — if you don't have one, write "No major flagged change in last 18 months — itself a signal of stable framework".
- Do NOT promise legal outcomes. Use "may", "is associated with", "regulators in X have flagged".
- Keep total output ~700 words.`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2800,
      messages: [{ role: 'user', content: prompt }],
    })

    const textBlock = message.content.find((b) => b.type === 'text')
    const markdown = textBlock && textBlock.type === 'text' ? textBlock.text : ''

    if (!markdown || markdown.length < 200) {
      return NextResponse.json(
        { error: 'Comparison generation failed; please try again' },
        { status: 502 },
      )
    }

    logEventAsync({
      type: 'jurisdiction.compare',
      source: 'hub',
      status: 'ok',
      metadata: { jurisdictionA: a, jurisdictionB: b, industry },
    })

    return NextResponse.json({
      jurisdictionA: a,
      jurisdictionB: b,
      industry,
      businessModel,
      markdown,
      model: 'claude-sonnet-4-6',
      generated_at: new Date().toISOString(),
      disclaimer_version: 'v1.0.0-p4',
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[jurisdictions/compare]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
