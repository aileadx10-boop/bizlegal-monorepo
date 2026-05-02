import { createServerClient } from '@/lib/supabase/server'
import type { PassportResult, PassportIntake } from '@/lib/claude/index'

// Generates an HTML report and uploads it to Supabase Storage.
// Returns the public URL.
export async function generateAndUploadPassportReport(
  passportId: string,
  intake: PassportIntake,
  result: PassportResult
): Promise<string> {
  const html = buildReportHtml(intake, result)
  const supabase = createServerClient()

  const fileName = `passport/${passportId}/report.html`
  const { error } = await supabase.storage
    .from('reports')
    .upload(fileName, Buffer.from(html, 'utf-8'), {
      contentType: 'text/html',
      upsert: true,
    })

  if (error) throw new Error(`Storage upload failed: ${error.message}`)

  const { data } = supabase.storage.from('reports').getPublicUrl(fileName)
  return data.publicUrl
}

function buildReportHtml(intake: PassportIntake, result: PassportResult): string {
  const riskColor = {
    low: '#22c55e',
    medium: '#eab308',
    high: '#f97316',
    critical: '#ef4444',
  }[result.risk_level] ?? '#eab308'

  const marketsHtml = Object.entries(result.markets)
    .map(([market, data]) => {
      const d = data as Record<string, unknown>
      const licenses = (d.required_licenses as string[] | undefined) ?? []
      const actions = (d.immediate_actions as string[] | undefined) ?? []
      return `
        <div class="market-card">
          <h3>${market}</h3>
          ${d.estimated_cost_usd ? `<p class="cost">Est. compliance cost: $${Number(d.estimated_cost_usd).toLocaleString()} | Timeline: ${d.timeline_months} months</p>` : ''}
          ${licenses.length ? `<p><strong>Required Licenses:</strong></p><ul>${licenses.map((l) => `<li>${l}</li>`).join('')}</ul>` : ''}
          ${actions.length ? `<p><strong>Immediate Actions:</strong></p><ul>${actions.map((a) => `<li>${a}</li>`).join('')}</ul>` : ''}
        </div>`
    })
    .join('')

  const redFlagsHtml = result.red_flags.map((f) => `<li>${f}</li>`).join('')
  const actionsHtml = result.priority_actions_30_days.map((a) => `<li>${a}</li>`).join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Regulatory Passport — ${intake.company_name}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0f1117; color: #e2e8f0; padding: 40px 24px; }
    .container { max-width: 800px; margin: 0 auto; }
    .header { border-bottom: 2px solid #4f7aff; padding-bottom: 24px; margin-bottom: 32px; }
    .brand { font-size: 14px; color: #4f7aff; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; }
    h1 { font-size: 28px; color: #fff; margin: 8px 0 4px; }
    .meta { color: #6b7280; font-size: 14px; }
    .risk-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 700; background: ${riskColor}22; color: ${riskColor}; border: 1px solid ${riskColor}44; margin-top: 12px; }
    .section { margin-bottom: 32px; }
    h2 { font-size: 18px; color: #fff; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1px solid #2a2d3a; }
    .summary { background: #1a1d27; border: 1px solid #2a2d3a; border-radius: 12px; padding: 20px; color: #9ca3af; line-height: 1.6; }
    .market-card { background: #1a1d27; border: 1px solid #2a2d3a; border-radius: 12px; padding: 20px; margin-bottom: 16px; }
    .market-card h3 { color: #4f7aff; font-size: 16px; margin-bottom: 12px; }
    .market-card .cost { color: #6b7280; font-size: 13px; margin-bottom: 12px; }
    ul { padding-left: 20px; color: #9ca3af; line-height: 1.8; }
    ul li { margin-bottom: 4px; }
    .red-flags { background: #ef444411; border: 1px solid #ef444433; border-radius: 12px; padding: 20px; }
    .red-flags ul { color: #fca5a5; }
    .actions { background: #4f7aff11; border: 1px solid #4f7aff33; border-radius: 12px; padding: 20px; }
    .actions ul { color: #93c5fd; }
    .total-cost { background: #1a1d27; border: 1px solid #2a2d3a; border-radius: 12px; padding: 20px; text-align: center; }
    .total-cost .amount { font-size: 32px; color: #fff; font-weight: 700; }
    .total-cost .label { color: #6b7280; font-size: 13px; margin-top: 4px; }
    .disclaimer { background: #1a1d27; border: 1px solid #2a2d3a; border-radius: 8px; padding: 16px; font-size: 12px; color: #6b7280; margin-top: 32px; line-height: 1.6; }
    p { margin-bottom: 8px; }
    strong { color: #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand">Forge Compliance Engine</div>
      <h1>Regulatory Passport</h1>
      <div class="meta">${intake.company_name} &mdash; Generated ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
      <div class="risk-badge">Risk Level: ${result.risk_level?.toUpperCase()}</div>
    </div>

    <div class="section">
      <h2>Executive Summary</h2>
      <div class="summary">${result.summary}</div>
    </div>

    ${result.estimated_total_compliance_cost_usd ? `
    <div class="section">
      <div class="total-cost">
        <div class="amount">$${Number(result.estimated_total_compliance_cost_usd).toLocaleString()}</div>
        <div class="label">Estimated Total Compliance Investment Across All Markets</div>
      </div>
    </div>` : ''}

    <div class="section">
      <h2>Markets Analysis</h2>
      ${marketsHtml || '<p style="color:#6b7280">No market data available.</p>'}
    </div>

    ${result.red_flags.length ? `
    <div class="section">
      <h2>Red Flags</h2>
      <div class="red-flags"><ul>${redFlagsHtml}</ul></div>
    </div>` : ''}

    ${result.priority_actions_30_days.length ? `
    <div class="section">
      <h2>Priority Actions — Next 30 Days</h2>
      <div class="actions"><ul>${actionsHtml}</ul></div>
    </div>` : ''}

    <div class="disclaimer">
      <strong>Disclaimer:</strong> This report constitutes regulatory intelligence, not legal advice.
      The information provided is based on publicly available regulatory frameworks as of the date of generation.
      Regulations change frequently. This analysis may create exposure under recent enforcement patterns does not
      constitute a determination of actual legal liability. For legal advice specific to your situation,
      consult a licensed attorney in the relevant jurisdiction.
    </div>
  </div>
</body>
</html>`
}
