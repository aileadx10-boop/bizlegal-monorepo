import { NextResponse, type NextRequest } from 'next/server'
import { getSession } from '../../../../../lib/auth'
import { checkTierAccess, incrementUsage } from '../../../../../lib/tier-gate'
import { classifyAiSystem, analyzeAiActDocument } from '../../../../../lib/verticals/ai-act'
import { getSupabaseAdmin } from '../../../../../lib/supabase'
import type { AiActQuestionnaire } from '../../../../../lib/verticals/ai-act/risk-classifier'

export const maxDuration = 60

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const tierCheck = await checkTierAccess(session.user.id, 'scan')
  if (!tierCheck.allowed) {
    return NextResponse.json({
      error: 'scan_limit_reached',
      remaining: tierCheck.remaining,
      tier: tierCheck.tier,
      upgrade_url: '/pricing',
    }, { status: 429 })
  }

  const consentTimestamp = body.consent_timestamp || new Date().toISOString()

  try {
    let result
    if (body.document_text) {
      result = await analyzeAiActDocument(body.document_text, consentTimestamp)
    } else if (body.questionnaire) {
      const q: AiActQuestionnaire = body.questionnaire
      if (!q.system_name || !q.system_purpose) {
        return NextResponse.json({ error: 'system_name and system_purpose required' }, { status: 400 })
      }
      result = await classifyAiSystem(q, consentTimestamp)
    } else {
      return NextResponse.json({ error: 'Provide either document_text or questionnaire' }, { status: 400 })
    }

    const admin = getSupabaseAdmin()
    const reportId = crypto.randomUUID()

    await admin.from('conductor_reports').insert({
      id: reportId,
      user_id: session.user.id,
      email: session.user.email,
      vertical: 'ai-act',
      report_type: body.document_text ? 'compliance-gap-analysis' : 'risk-classification',
      title: body.questionnaire?.system_name || 'AI Act Compliance Scan',
      input_data: body.document_text ? { document_preview: body.document_text.slice(0, 500) } : { questionnaire: body.questionnaire },
      ai_output: result,
      risk_level: result.classification.risk_tier === 'unacceptable' ? 'critical' : result.classification.risk_tier === 'high' ? 'high' : result.classification.risk_tier === 'limited' ? 'medium' : 'low',
      risk_score: result.classification.risk_tier === 'unacceptable' ? 95 : result.classification.risk_tier === 'high' ? 75 : result.classification.risk_tier === 'limited' ? 40 : 15,
      status: 'complete',
      paid: true,
    })

    await incrementUsage(session.user.id, 'scan')

    return NextResponse.json({ report_id: reportId, ...result })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Analysis failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
