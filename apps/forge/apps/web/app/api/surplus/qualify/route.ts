// app/api/surplus/qualify/route.ts
// Surplus Funds case intake → qualify → route to attorney

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { qualifyCase } from '@/lib/claude/index'

const QualifySchema = z.object({
  contact_name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  state: z.string().min(1),
  case_type: z.string().min(1),
  estimated_value: z.string().optional(),
  notes: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = QualifySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten().fieldErrors }, { status: 400 })
    }

    const data = parsed.data
    const supabase = createServerClient()

    // Create qualified case record
    const { data: record, error: dbError } = await supabase
      .from('qualified_cases')
      .insert({
        vertical: 'surplus_funds',
        raw_data: data,
        case_summary: `${data.case_type} in ${data.state}${data.estimated_value ? ` (est. ${data.estimated_value})` : ''}`,
        status: 'new',
      })
      .select('id')
      .single()

    if (dbError || !record) {
      console.error('DB insert error full:', JSON.stringify(dbError, null, 2))
      return NextResponse.json({ error: 'DB insert error', detail: dbError }, { status: 500 })
    }

    // Run Claude qualification
    const qualification = await qualifyCase('surplus_funds', {
      ...data,
      case_id: record.id,
    })

    // Update case with qualification
    await supabase
      .from('qualified_cases')
      .update({
        score: qualification.score,
        estimated_value: qualification.estimated_value_usd,
        case_summary: qualification.summary,
        risk_flags: qualification.risk_flags,
      })
      .eq('id', record.id)

    if (qualification.qualified) {
      // Find an appropriate executor (attorney) for this state/case type
      const { data: executor } = await supabase
        .from('executors')
        .select('id, name, email, states, specialties')
        .eq('active', true)
        .eq('type', 'attorney')
        .contains('states', [data.state])
        .contains('specialties', ['surplus_funds'])
        .limit(1)
        .single()

      if (executor) {
        // Assign case to executor
        await supabase
          .from('qualified_cases')
          .update({ status: 'assigned', executor_id: executor.id, assigned_at: new Date().toISOString() })
          .eq('id', record.id)
      }
    }

    return NextResponse.json({
      success: true,
      case_id: record.id,
      qualified: qualification.qualified,
      score: qualification.score,
      estimated_value: qualification.estimated_value_usd,
      summary: qualification.summary,
    })
  } catch (err) {
    console.error('Surplus qualify error:', JSON.stringify(err, null, 2))
    return NextResponse.json({ error: 'Internal server error', detail: String(err) }, { status: 500 })
  }
}
