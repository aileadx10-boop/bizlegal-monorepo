import { NextResponse, type NextRequest } from 'next/server'
import { getSession } from '../../../../../lib/auth'
import { checkTierAccess, incrementUsage } from '../../../../../lib/tier-gate'
import { generateTemplate, type TemplateInput } from '../../../../../lib/verticals/tech-transfer'
import { getSupabaseAdmin } from '../../../../../lib/supabase'

export const maxDuration = 60

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => null)
  if (!body?.template_type || !body?.company_name || !body?.business_description) {
    return NextResponse.json({ error: 'template_type, company_name, and business_description required' }, { status: 400 })
  }

  const tierCheck = await checkTierAccess(session.user.id, 'draft')
  if (!tierCheck.allowed) {
    return NextResponse.json({ error: 'draft_limit_reached', remaining: 0, tier: tierCheck.tier, upgrade_url: '/pricing' }, { status: 429 })
  }

  try {
    const input: TemplateInput = {
      template_type: body.template_type,
      company_name: body.company_name,
      parent_jurisdiction: body.parent_jurisdiction,
      subsidiary_jurisdiction: body.subsidiary_jurisdiction,
      business_description: body.business_description,
      additional_details: body.additional_details,
    }

    const result = await generateTemplate(input, body.consent_timestamp || new Date().toISOString())

    const admin = getSupabaseAdmin()
    const reportId = crypto.randomUUID()

    await admin.from('conductor_reports').insert({
      id: reportId,
      user_id: session.user.id,
      email: session.user.email,
      vertical: 'tech-transfer',
      report_type: 'template-generation',
      title: `${input.template_type} — ${input.company_name}`,
      input_data: input,
      ai_output: result,
      status: 'complete',
      paid: true,
    })

    await incrementUsage(session.user.id, 'draft')
    return NextResponse.json({ report_id: reportId, ...result })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Generation failed' }, { status: 500 })
  }
}
