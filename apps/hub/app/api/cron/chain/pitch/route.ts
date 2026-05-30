import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { draftColdPitch, draftFollowUp, buildRunRecord } from '@/lib/agents/chain/lead-commander'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

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

  const results = { pitched: 0, followed_up: 0, skipped: 0, errors: [] as string[] }

  try {
    const { data: scoredLeads } = await supabase
      .from('leads')
      .select('email, source, product, created_at')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(20)

    const { data: alreadyPitched } = await supabase
      .from('lead_outreach')
      .select('lead_email')
      .in('lead_email', (scoredLeads ?? []).map(l => l.email))

    const pitchedEmails = new Set((alreadyPitched ?? []).map(p => p.lead_email))

    const newLeads = (scoredLeads ?? []).filter(l => !pitchedEmails.has(l.email)).slice(0, 10)

    for (const lead of newLeads) {
      const pitch = draftColdPitch({
        email: lead.email,
        company: lead.product || 'your company',
        signal: `your interest in ${lead.source || 'compliance'}`,
        pain: 'compliance review is still manual and expensive',
        outcome: '60-80% less review time with AI-powered scanning',
      })

      const { error: insertError } = await supabase.from('lead_outreach').insert({
        lead_email: pitch.lead_email,
        lead_name: pitch.lead_name,
        company: pitch.company,
        pitch_variant: pitch.pitch_variant,
        subject: pitch.subject,
        body_preview: pitch.body.slice(0, 200),
        status: 'drafted',
      })

      if (insertError) {
        results.errors.push(`Insert failed for ${lead.email}: ${insertError.message}`)
        continue
      }

      const run = buildRunRecord('cold_pitch.drafted', 'success', lead.email, { subject: pitch.subject })
      await supabase.from('agent_runs').insert(run)
      results.pitched++
    }

    const { data: pendingFollowUps } = await supabase
      .from('lead_outreach')
      .select('id, lead_email, company, pitch_variant, sent_at')
      .eq('status', 'sent')
      .eq('pitch_variant', 'initial')
      .lt('sent_at', new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString())
      .limit(10)

    for (const pu of pendingFollowUps ?? []) {
      const existing = await supabase
        .from('lead_outreach')
        .select('id')
        .eq('lead_email', pu.lead_email)
        .eq('pitch_variant', 'followup_1')
        .maybeSingle()

      if (existing.data) { results.skipped++; continue }

      const fu = draftFollowUp(
        { email: pu.lead_email, company: pu.company || '', pain: 'compliance review costs' },
        'followup_1'
      )

      await supabase.from('lead_outreach').insert({
        lead_email: fu.lead_email,
        company: fu.company,
        pitch_variant: fu.pitch_variant,
        subject: fu.subject,
        body_preview: fu.body.slice(0, 200),
        status: 'drafted',
      })

      const run = buildRunRecord('followup.drafted', 'success', pu.lead_email, { variant: 'followup_1' })
      await supabase.from('agent_runs').insert(run)
      results.followed_up++
    }
  } catch (err) {
    results.errors.push(err instanceof Error ? err.message : 'Unknown error')
  }

  return NextResponse.json({ agent: 'lead_commander', workflow: 'WF-1+WF-4', ...results })
}
