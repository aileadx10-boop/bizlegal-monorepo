import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { runPassportAssessment, type PassportIntake } from '@/lib/claude/index'
import { generateAndUploadPassportReport } from '@/lib/fulfillment/passport-pdf'
import { sendPassportDelivery } from '@/lib/resend/index'

const ProcessSchema = z.object({
  passport_id: z.string().uuid(),
})

export async function POST(req: NextRequest) {
  // Verify internal secret to prevent unauthorized calls
  const secret = req.headers.get('x-internal-secret')
  if (secret !== process.env.INTERNAL_API_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const parsed = ProcessSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const { passport_id } = parsed.data
    const supabase = createServerClient()

    // Fetch the record
    const { data: record, error: fetchError } = await supabase
      .from('passport_assessments')
      .select('*')
      .eq('id', passport_id)
      .single()

    if (fetchError || !record) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 })
    }

    if (record.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not confirmed' }, { status: 402 })
    }

    // Mark as scanning
    await supabase
      .from('passport_assessments')
      .update({ status: 'scanning' })
      .eq('id', passport_id)

    // Build intake for Claude
    const intake: PassportIntake = {
      company_name: record.company_name,
      contact_name: record.contact_name,
      email: record.email,
      product_type: record.product_type ?? '',
      crypto_involved: record.crypto_involved ?? false,
      entity_types: record.entity_types ?? [],
      target_markets: record.target_markets ?? [],
      current_revenue_usd: record.current_revenue_usd ?? undefined,
      fundraising_stage: record.fundraising_stage ?? undefined,
      investor_jurisdiction: record.investor_jurisdiction ?? undefined,
      notes: record.notes ?? undefined,
    }

    // Run Claude assessment
    const result = await runPassportAssessment(intake)

    // Generate and upload HTML report
    const reportUrl = await generateAndUploadPassportReport(passport_id, intake, result)

    // Update record with results
    await supabase
      .from('passport_assessments')
      .update({
        status: 'complete',
        regulatory_map: result.markets,
        risk_flags: result.red_flags,
        priority_actions: result.priority_actions_30_days,
        report_summary: result.summary,
        report_url: reportUrl,
        delivered_at: new Date().toISOString(),
      })
      .eq('id', passport_id)

    // Send email delivery
    await sendPassportDelivery(
      record.email,
      record.contact_name,
      record.company_name,
      reportUrl,
      result
    )

    return NextResponse.json({ success: true, report_url: reportUrl })
  } catch (err) {
    console.error('Passport process error:', err)

    // Mark as failed
    const body = await req.json().catch(() => ({}))
    if (body?.passport_id) {
      const supabase = createServerClient()
      await supabase
        .from('passport_assessments')
        .update({ status: 'failed' })
        .eq('id', body.passport_id)
    }

    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }
}
