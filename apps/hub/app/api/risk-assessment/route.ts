import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import { calculateRisk, type RiskInput } from '@/lib/riskEngine'
import { sendRiskReportEmail } from '@/lib/resend'
import { logEventAsync } from '@/lib/ops/log'

// Accept both legacy enum format ('under1k') AND client format ('1-100') for
// userCountRange. Client sends '1-100' / '100-1000' / '1000-10000' / '10000+'
// per RiskEngineClient.tsx line ~403.
const userCountRangeSchema = z.union([
  z.enum(['under1k', '1k-10k', '10k-100k', 'over100k']),
  z.enum(['1-100', '100-1000', '1000-10000', '10000+']),
])

// Permissive: accept any reasonable industry slug. The downstream
// calculateRisk function in lib/riskEngine handles unknown gracefully.
const industrySchema = z.string().min(1).max(40)

// Permissive: hub supports 10 jurisdictions, not 4. Accept any 2-letter code.
const regionsSchema = z.array(z.string().min(1).max(20)).min(1).max(20)

const schema = z.object({
  industry: industrySchema,
  userCountRange: userCountRangeSchema,
  regions: regionsSchema,
  hasDPO: z.boolean(),
  email: z.string().email(),
})

// Map client format → legacy format for the riskEngine library.
function normaliseUserCountRange(v: string): 'under1k' | '1k-10k' | '10k-100k' | 'over100k' {
  switch (v) {
    case '1-100':
    case 'under1k':
      return 'under1k'
    case '100-1000':
    case '1k-10k':
      return '1k-10k'
    case '1000-10000':
    case '10k-100k':
      return '10k-100k'
    case '10000+':
    case 'over100k':
      return 'over100k'
    default:
      return '1k-10k'
  }
}

// Map client industry slugs to riskEngine's 6-value enum.
function normaliseIndustry(v: string): 'fintech' | 'saas' | 'healthcare' | 'ecommerce' | 'crypto' | 'legal' {
  const lower = v.toLowerCase()
  if (lower === 'crypto' || lower === 'saas' || lower === 'fintech') return lower
  if (lower === 'exchange' || lower === 'lending' || lower === 'payments') return 'fintech'
  if (lower === 'legal' || lower === 'healthcare' || lower === 'ecommerce') return lower
  return 'fintech'
}

// Map client jurisdiction codes to riskEngine's 4-value region enum.
function normaliseRegions(jurisdictions: string[]): Array<'US' | 'EU' | 'UAE' | 'Global'> {
  const seen = new Set<'US' | 'EU' | 'UAE' | 'Global'>()
  for (const j of jurisdictions) {
    const u = j.toUpperCase()
    if (u === 'US' || u === 'CA') seen.add('US')
    else if (u === 'EU' || u === 'UK' || u === 'CH') seen.add('EU')
    else if (u === 'UAE') seen.add('UAE')
    else seen.add('Global')
  }
  return Array.from(seen)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const input = schema.parse(body)

    // Normalise client-format inputs to riskEngine's expected enums.
    const normalisedInput: RiskInput = {
      industry: normaliseIndustry(input.industry),
      userCountRange: normaliseUserCountRange(input.userCountRange),
      regions: normaliseRegions(input.regions),
      hasDPO: input.hasDPO,
    }

    const result = calculateRisk(normalisedInput)

    const { data, error } = await supabaseAdmin
      .from('assessments')
      .insert({
        industry: input.industry,
        user_count_range: input.userCountRange,
        regions: input.regions,
        has_dpo: input.hasDPO,
        email: input.email,
        score: result.score,
        severity: result.severity,
      })
      .select('id')
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Failed to save assessment' }, { status: 500 })
    }

    await sendRiskReportEmail(
      input.email,
      data.id,
      result.score,
      result.severity,
      result.threats
    ).catch(() => null)

    logEventAsync({
      type: 'risk.assessment',
      source: 'hub',
      ref_id: String(data.id),
      email: input.email,
      status: 'ok',
      metadata: {
        product: 'hub_risk_engine',
        score: result.score,
        severity: result.severity,
        threats_count: result.threats?.length,
      },
    })
    logEventAsync({
      type: 'email.sent',
      source: 'hub',
      ref_id: String(data.id),
      email: input.email,
      status: 'ok',
      metadata: { kind: 'risk-assessment-report', score: result.score, severity: result.severity },
    })

    return NextResponse.json({ reportId: data.id, score: result.score, severity: result.severity })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: err.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
