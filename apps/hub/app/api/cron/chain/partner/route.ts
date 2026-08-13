import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { draftPartnerOutreach, buildDealRunRecord, type PartnerProspect } from '@/lib/agents/chain/deal-closer'
import { writeAuditRun } from '@/lib/audit-chain'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

export async function GET(request: NextRequest) {
  const auth = request.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const SEED_PROSPECTS: PartnerProspect[] = [
    { name: 'Compliance Consulting Firm', email: '', type: 'consultant', jurisdiction: 'US', signal: 'compliance advisory' },
    { name: 'Legal Tech Vendor', email: '', type: 'legal_tech', jurisdiction: 'EU', signal: 'legal tech platform' },
    { name: 'Accounting Firm', email: '', type: 'accounting', jurisdiction: 'US-IL', signal: 'audit services' },
  ]

  let drafted = 0
  for (const prospect of SEED_PROSPECTS) {
    if (!prospect.email) continue

    const { data: existing } = await supabase
      .from('partner_outreach')
      .select('id')
      .eq('partner_email', prospect.email)
      .maybeSingle()

    if (existing) continue

    const outreach = draftPartnerOutreach(prospect)
    await supabase.from('partner_outreach').insert({
      partner_name: prospect.name,
      partner_email: prospect.email,
      partner_type: prospect.type,
      jurisdiction: prospect.jurisdiction,
      pitch_variant: 'initial',
      status: 'drafted',
    })

    const run = buildDealRunRecord('partner_outreach.drafted', 'success', prospect.email, { type: prospect.type })
    await writeAuditRun(supabase, run)
    drafted++
  }

  return NextResponse.json({ agent: 'deal_closer', workflow: 'WF-5', drafted })
}
