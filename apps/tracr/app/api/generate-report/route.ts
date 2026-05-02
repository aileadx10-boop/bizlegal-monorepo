import { NextRequest, NextResponse } from 'next/server'
import { getTransactions } from '@/lib/covalent'
import { calculateRisk } from '@/lib/risk-engine'
import { generateFullReport } from '@/lib/ai-prompts'
import { sendReportReady } from '@/lib/email'
import { supabaseAdmin } from '@/lib/supabase'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  // Verify internal call
  const key = req.headers.get('x-internal-key')
  if (key !== process.env.NOWPAYMENTS_IPN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { reportId } = await req.json()
  if (!reportId) return NextResponse.json({ error: 'reportId required' }, { status: 400 })

  try {
    const { data: order } = await supabaseAdmin
      .from('tracr_orders').select('*').eq('report_id', reportId).single()

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    if (order.status !== 'paid') return NextResponse.json({ error: 'Not paid' }, { status: 402 })
    if (order.ai_content) return NextResponse.json({ success: true, reportId })  // already done

    const walletAddr = order.wallet_address
    const isRegScan = walletAddr.startsWith('REG-SCAN-') || order.tier === 'regulatory'

    let aiContent: Record<string, unknown>

    if (isRegScan) {
      // Regulatory scan — generate from case_context (no blockchain data)
      const parsed = safeParseJSON(order.case_context ?? '{}')
      aiContent = await generateRegulatoryReport(parsed)
    } else {
      // Full blockchain forensic report
      const txs = await getTransactions(walletAddr, order.network ?? 'ethereum')

      if (txs.length === 0) {
        await supabaseAdmin.from('tracr_orders').update({ status: 'error' }).eq('report_id', reportId)
        return NextResponse.json({
          error: 'No on-chain transaction data available for this wallet. Blockchain API keys may not be configured or the wallet has no activity. Report cannot be generated without real data.',
        }, { status: 422 })
      }

      const risk = calculateRisk(txs)
      const content = await generateFullReport(walletAddr, txs, risk)

      await supabaseAdmin.from('tracr_orders')
        .update({ risk_score: risk.score, risk_level: risk.level })
        .eq('report_id', reportId)

      aiContent = content as unknown as Record<string, unknown>
    }

    const site = process.env.NEXT_PUBLIC_SITE_URL ?? ''
    const reportUrl = `${site}/report/${reportId}`

    await supabaseAdmin.from('tracr_orders').update({
      ai_content:   aiContent,
      status:       'delivered',
      report_url:   reportUrl,
      delivered_at: new Date().toISOString(),
    }).eq('report_id', reportId)

    // Send email — riskScore/Level from aiContent (freshly computed, not stale order fields)
    const emailScore = (aiContent.riskScore ?? aiContent.score ?? order.risk_score ?? 0) as number
    const emailLevel = (aiContent.riskLevel ?? aiContent.level ?? order.risk_level ?? 'Pending') as string

    sendReportReady({
      to:          order.email,
      firstName:   order.first_name ?? 'there',
      reportId,
      riskScore:   emailScore,
      riskLevel:   emailLevel,
      reportUrl,
    }).catch(console.error)

    return NextResponse.json({ success: true, reportId })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Generation failed'
    console.error('[generate-report]', err)
    await supabaseAdmin.from('tracr_orders').update({ status: 'error' }).eq('report_id', reportId)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

function safeParseJSON(str: string): Record<string, unknown> {
  try { return JSON.parse(str) } catch { return {} }
}

async function generateRegulatoryReport(scanData: Record<string, unknown>) {
  const Anthropic = (await import('@anthropic-ai/sdk')).default
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const res = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    messages: [{
      role: 'user',
      content: `You are a regulatory compliance attorney. Generate a compliance analysis based on this business profile. Return ONLY a JSON object, no markdown, no code fences, no extra text.

BUSINESS PROFILE: ${JSON.stringify(scanData)}

Return this exact JSON structure with short, concise values:
{"executiveSummary":"2 sentences max","riskScore":0,"riskLevel":"Low|Moderate|High|Critical","frameworks":["framework1"],"violations":[{"framework":"","article":"","description":"1 sentence","severity":"critical|high|medium"}],"remediationRoadmap":[{"action":"1 sentence","timeframe":"30|60|90 days","priority":"P0|P1|P2"}],"estimatedExposureLow":"€0","estimatedExposureHigh":"€0","conclusion":"1 sentence"}`,
    }],
  })

  const text = (res.content[0] as { type: string; text: string }).text
  const clean = text.replace(/\`\`\`json|\`\`\`/g, '').trim()
  return JSON.parse(clean)
}
