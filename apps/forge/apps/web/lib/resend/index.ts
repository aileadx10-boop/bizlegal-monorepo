import { Resend } from 'resend'
import type { PassportResult } from '@/lib/claude/index'

// Lazy-init: avoid throwing at module load if RESEND_API_KEY is absent
// during Vercel's collect-page-data step.
let _resend: Resend | null = null
function resendClient(): Resend {
  if (_resend) return _resend
  _resend = new Resend(process.env.RESEND_API_KEY ?? '')
  return _resend
}
const FROM = process.env.RESEND_FROM ?? 'Forge Compliance <forge@resend.dev>'
const resend = new Proxy({} as Resend, {
  get(_t, p) {
    const r = resendClient() as unknown as Record<string | symbol, unknown>
    const v = r[p]
    return typeof v === 'function' ? (v as (...a: unknown[]) => unknown).bind(r) : v
  },
})

export async function sendPassportDelivery(
  email: string,
  contactName: string,
  companyName: string,
  reportUrl: string,
  result: PassportResult
): Promise<void> {
  const marketList = Object.keys(result.markets)
    .map((m) => `<li>${m}</li>`)
    .join('')

  const actionList = result.priority_actions_30_days
    .slice(0, 5)
    .map((a) => `<li>${a}</li>`)
    .join('')

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `Your Regulatory Passport — ${companyName}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0f1117;color:#e2e8f0;padding:40px 20px;margin:0;">
  <div style="max-width:600px;margin:0 auto;">
    <h1 style="color:#4f7aff;font-size:24px;margin-bottom:8px;">Forge Compliance Engine</h1>
    <h2 style="color:#fff;font-size:20px;margin-bottom:24px;">Your Regulatory Passport is Ready</h2>

    <p>Hi ${contactName},</p>
    <p>Your Regulatory Passport for <strong>${companyName}</strong> has been generated.</p>

    <div style="background:#1a1d27;border:1px solid #2a2d3a;border-radius:12px;padding:24px;margin:24px 0;">
      <p style="margin-top:0;font-weight:600;color:#fff;">Risk Level: <span style="color:${result.risk_level === 'critical' ? '#ef4444' : result.risk_level === 'high' ? '#f97316' : '#eab308'}">${result.risk_level?.toUpperCase()}</span></p>
      <p style="color:#9ca3af;">${result.summary}</p>

      <p style="font-weight:600;color:#fff;margin-bottom:8px;">Markets Covered:</p>
      <ul style="color:#9ca3af;margin:0;padding-left:20px;">${marketList}</ul>

      ${actionList ? `
      <p style="font-weight:600;color:#fff;margin-bottom:8px;margin-top:16px;">Priority Actions (30 Days):</p>
      <ul style="color:#9ca3af;margin:0;padding-left:20px;">${actionList}</ul>
      ` : ''}
    </div>

    <a href="${reportUrl}" style="display:inline-block;background:#4f7aff;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;margin-bottom:24px;">
      View Full Passport Report
    </a>

    <hr style="border:none;border-top:1px solid #2a2d3a;margin:24px 0;">
    <p style="font-size:12px;color:#6b7280;">
      Not legal advice. This report constitutes regulatory intelligence, not legal opinion.
      For legal advice, consult a licensed attorney in the relevant jurisdiction.
    </p>
  </div>
</body>
</html>
    `,
  })
}

export async function sendScanDelivery(
  email: string,
  companyName: string,
  reportUrl: string,
  vertical: string,
  riskLevel: string
): Promise<void> {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `Web Compliance Report — ${companyName}`,
    html: `
<!DOCTYPE html>
<html>
<body style="font-family:-apple-system,sans-serif;background:#0f1117;color:#e2e8f0;padding:40px 20px;margin:0;">
  <div style="max-width:600px;margin:0 auto;">
    <h1 style="color:#4f7aff;">Forge Compliance Engine</h1>
    <h2 style="color:#fff;">Your ${vertical.toUpperCase()} Compliance Report</h2>
    <p>Risk level: <strong>${riskLevel?.toUpperCase()}</strong></p>
    <a href="${reportUrl}" style="display:inline-block;background:#4f7aff;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;">
      View Full Report
    </a>
    <p style="font-size:12px;color:#6b7280;margin-top:24px;">
      Not legal advice. For legal advice, consult a licensed attorney.
    </p>
  </div>
</body>
</html>
    `,
  })
}
