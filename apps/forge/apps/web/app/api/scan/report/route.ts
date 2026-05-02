import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { generateReport, type VerticalType } from '@/lib/claude/index'
import { sendScanDelivery } from '@/lib/resend/index'

const ReportSchema = z.object({
  scan_id: z.string().uuid(),
})

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-internal-secret')
  if (secret !== process.env.INTERNAL_API_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const parsed = ReportSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const { scan_id } = parsed.data
    const supabase = createServerClient()

    const { data: scan } = await supabase
      .from('scans')
      .select('*')
      .eq('id', scan_id)
      .single()

    if (!scan) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (scan.payment_status !== 'paid') return NextResponse.json({ error: 'Not paid' }, { status: 402 })

    const reportMarkdown = await generateReport(
      scan.vertical as VerticalType,
      scan.findings,
      scan.company_name ?? scan.url
    )

    // Upload report to Supabase Storage
    const fileName = `scans/${scan_id}/report.md`
    await supabase.storage
      .from('reports')
      .upload(fileName, Buffer.from(reportMarkdown, 'utf-8'), {
        contentType: 'text/markdown',
        upsert: true,
      })

    const { data: urlData } = supabase.storage.from('reports').getPublicUrl(fileName)
    const reportUrl = urlData.publicUrl

    await supabase
      .from('scans')
      .update({ report_url: reportUrl, fix_delivered: true })
      .eq('id', scan_id)

    if (scan.email) {
      await sendScanDelivery(
        scan.email,
        scan.company_name ?? scan.url,
        reportUrl,
        scan.vertical,
        scan.risk_level ?? 'medium'
      )
    }

    return NextResponse.json({ success: true, report_url: reportUrl })
  } catch (err) {
    console.error('Scan report error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
