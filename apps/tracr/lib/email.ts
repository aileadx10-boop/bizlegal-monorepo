import { Resend } from 'resend'

// Lazy init — avoids "Missing API key" crash during Vercel build (env not available at bundle time)
function getResend() { return new Resend(process.env.RESEND_API_KEY) }
const FROM = process.env.RESEND_FROM ?? 'reports@bizlegal-ai.com'
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tracr.bizlegal-ai.com'

export async function sendReportReady(params: {
  to: string
  firstName: string
  reportId: string
  riskScore: number
  riskLevel: string
  reportUrl: string
}) {
  const { to, firstName, reportId, riskScore, riskLevel, reportUrl } = params

  await getResend().emails.send({
    from: `TRACR Intelligence <${FROM}>`,
    to,
    subject: `Your TRACR Forensic Report is Ready — ${reportId}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: 'DM Sans', -apple-system, sans-serif; background: #07090e; color: #e8ecf4; padding: 40px 20px; margin: 0;">
  <div style="max-width: 560px; margin: 0 auto;">
    <div style="font-family: monospace; font-size: 22px; font-weight: 500; letter-spacing: 0.12em; margin-bottom: 32px;">
      TRA<span style="color: #d4a843;">C</span>R
    </div>

    <div style="background: #0d1118; border: 1px solid #1a2035; border-radius: 12px; padding: 32px; margin-bottom: 24px;">
      <div style="font-family: monospace; font-size: 11px; color: #5a6278; letter-spacing: 0.18em; text-transform: uppercase; margin-bottom: 12px;">Report Ready</div>
      <h1 style="font-family: Georgia, serif; font-size: 26px; font-weight: 700; color: #e8ecf4; margin: 0 0 16px;">
        Your forensic report is ready, ${firstName}.
      </h1>
      <p style="font-size: 14px; color: #5a6278; line-height: 1.7; margin: 0 0 24px;">
        Your on-chain forensic analysis for report <strong style="color: #d4a843;">${reportId}</strong> has been completed.
      </p>

      <div style="background: #111622; border: 1px solid #1a2035; border-radius: 8px; padding: 16px 20px; margin-bottom: 24px; display: flex; gap: 20px;">
        <div>
          <div style="font-family: monospace; font-size: 10px; color: #5a6278; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 4px;">Risk Score</div>
          <div style="font-family: monospace; font-size: 32px; font-weight: 500; color: ${riskLevel === 'Critical' ? '#c0392b' : riskLevel === 'High' ? '#e67e22' : riskLevel === 'Moderate' ? '#f39c12' : '#27ae60'};">${riskScore}</div>
        </div>
        <div style="border-left: 1px solid #1a2035; padding-left: 20px;">
          <div style="font-family: monospace; font-size: 10px; color: #5a6278; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 4px;">Risk Level</div>
          <div style="font-size: 18px; font-weight: 600; color: ${riskLevel === 'Critical' ? '#c0392b' : riskLevel === 'High' ? '#e67e22' : '#27ae60'};">${riskLevel}</div>
        </div>
      </div>

      <a href="${reportUrl}" style="display: block; text-align: center; padding: 14px; background: #c0392b; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 15px;">
        View Full Report →
      </a>
    </div>

    <p style="font-size: 11px; color: #2e3450; font-family: monospace; line-height: 1.7; text-align: center;">
      TRACR Intelligence · ${SITE}<br>
      This report is for informational purposes only and does not constitute legal advice.<br>
      Report ID: ${reportId}
    </p>
  </div>
</body>
</html>`,
  })
}

export async function sendLeadCapture(params: {
  to: string
  wallet: string
  riskScore: number
  riskLevel: string
}) {
  const { to, wallet, riskScore, riskLevel } = params

  await getResend().emails.send({
    from: `TRACR Intelligence <${FROM}>`,
    to,
    subject: `Your Wallet Risk Snapshot — Score: ${riskScore}/100`,
    html: `
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, sans-serif; background: #07090e; color: #e8ecf4; padding: 40px 20px; margin: 0;">
  <div style="max-width: 520px; margin: 0 auto;">
    <div style="font-family: monospace; font-size: 20px; margin-bottom: 24px;">TRA<span style="color: #d4a843;">C</span>R</div>
    <h2 style="font-family: Georgia, serif; font-size: 22px; color: #e8ecf4; margin-bottom: 12px;">Your Risk Snapshot</h2>
    <p style="font-size: 14px; color: #5a6278; margin-bottom: 20px;">
      We analyzed <strong style="color: #d4a843; font-family: monospace;">${wallet.slice(0, 10)}…</strong> and found a risk score of <strong style="color: ${riskLevel === 'Critical' || riskLevel === 'High' ? '#c0392b' : '#27ae60'};">${riskScore}/100 (${riskLevel})</strong>.
    </p>
    <a href="${SITE}/scan" style="display: inline-block; padding: 12px 28px; background: #c0392b; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 14px;">
      Order Full Forensic Report — $149 →
    </a>
    <p style="font-size: 11px; color: #2e3450; font-family: monospace; margin-top: 24px;">TRACR Intelligence · Not legal advice</p>
  </div>
</body>
</html>`,
  })
}
