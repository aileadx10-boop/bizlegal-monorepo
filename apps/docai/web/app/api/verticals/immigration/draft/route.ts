import { NextResponse, type NextRequest } from 'next/server'
import { getSession } from '../../../../../lib/auth'
import { checkTierAccess, incrementUsage } from '../../../../../lib/tier-gate'
import { draftImmigrationPetition, type ImmigrationIntake } from '../../../../../lib/verticals/immigration'
import { getSupabaseAdmin } from '../../../../../lib/supabase'

export const maxDuration = 60

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => null)
  if (!body?.beneficiary_name || !body?.position_title) {
    return NextResponse.json({ error: 'beneficiary_name and position_title required' }, { status: 400 })
  }

  const tierCheck = await checkTierAccess(session.user.id, 'draft')
  if (!tierCheck.allowed) {
    return NextResponse.json({ error: 'draft_limit_reached', remaining: 0, tier: tierCheck.tier, upgrade_url: '/pricing' }, { status: 429 })
  }

  try {
    const intake: ImmigrationIntake = {
      visa_preference: body.visa_preference,
      petitioner_name: body.petitioner_name || '',
      petitioner_ein: body.petitioner_ein,
      beneficiary_name: body.beneficiary_name,
      beneficiary_nationality: body.beneficiary_nationality || '',
      beneficiary_education: body.beneficiary_education || '',
      position_title: body.position_title,
      position_duties: body.position_duties || '',
      salary: body.salary,
      additional_context: body.additional_context,
    }

    const result = await draftImmigrationPetition(intake, body.consent_timestamp || new Date().toISOString())

    const admin = getSupabaseAdmin()
    const reportId = crypto.randomUUID()

    await admin.from('conductor_reports').insert({
      id: reportId,
      user_id: session.user.id,
      email: session.user.email,
      vertical: 'immigration',
      report_type: 'petition-draft',
      title: `${result.recommended_visa} Petition — ${intake.beneficiary_name}`,
      input_data: intake,
      ai_output: result,
      status: 'complete',
      paid: true,
    })

    await incrementUsage(session.user.id, 'draft')
    return NextResponse.json({ report_id: reportId, ...result })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Draft failed' }, { status: 500 })
  }
}
