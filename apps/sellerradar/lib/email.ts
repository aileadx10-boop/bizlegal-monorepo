import { Resend } from 'resend'

// Lazy init — avoids "Missing API key" crash during Vercel build (env not available at bundle time)
function getResend() { return new Resend(process.env.RESEND_API_KEY) }
const FROM = process.env.RESEND_FROM ?? 'reports@bizlegal-ai.com'
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sellerradar.bizlegal-ai.com'

const ESTIMATE_NOTE =
  'All impact figures are estimates computed from published Amazon fee schedules and your uploaded unit economics — verify against your settlement reports.'

export async function sendReportReady(params: {
  to: string
  reportRef: string
  skuCount: number
  affectedCount: number
  annualImpact: number
}) {
  const { to, reportRef, skuCount, affectedCount, annualImpact } = params
  const reportUrl = `${SITE}/report/${reportRef}`

  await getResend().emails.send({
    from: `SellerRadar <${FROM}>`,
    to,
    subject: `Your SellerRadar fee-impact report is ready — ${reportRef}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: 'DM Sans', -apple-system, sans-serif; background: #07090e; color: #e8ecf4; padding: 40px 20px; margin: 0;">
  <div style="max-width: 560px; margin: 0 auto;">
    <div style="font-family: monospace; font-size: 22px; font-weight: 500; letter-spacing: 0.12em; margin-bottom: 32px;">
      Seller<span style="color: #d4a843;">Radar</span>
    </div>

    <div style="background: #0d1118; border: 1px solid #1a2035; border-radius: 12px; padding: 32px; margin-bottom: 24px;">
      <div style="font-family: monospace; font-size: 11px; color: #5a6278; letter-spacing: 0.18em; text-transform: uppercase; margin-bottom: 12px;">Impact Report Ready</div>
      <h1 style="font-family: Georgia, serif; font-size: 26px; font-weight: 700; color: #e8ecf4; margin: 0 0 16px;">
        Your Amazon fee-change impact is computed.
      </h1>
      <p style="font-size: 14px; color: #5a6278; line-height: 1.7; margin: 0 0 24px;">
        We parsed <strong style="color: #e8ecf4;">${skuCount} SKUs</strong> from your catalog export and
        diffed them against the latest fee schedule.
        <strong style="color: #d4a843;">${affectedCount} SKUs</strong> are affected —
        estimated <strong style="color: #c0392b;">$${Math.abs(annualImpact).toLocaleString('en-US')}/year</strong>.
      </p>

      <a href="${reportUrl}" style="display: block; text-align: center; padding: 14px; background: #d4a843; color: #07090e; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 15px;">
        View Impact Report →
      </a>
    </div>

    <p style="font-size: 11px; color: #2e3450; font-family: monospace; line-height: 1.7; text-align: center;">
      SellerRadar · ${SITE}<br>
      ${ESTIMATE_NOTE}<br>
      Not financial or tax advice. Report ref: ${reportRef}
    </p>
  </div>
</body>
</html>`,
  })
}

/**
 * Sent when a hub apex checkout (bizlegal-ai.com/checkout?product=sellerradar)
 * completes: we know the buyer's email + tier but not their catalog yet, so
 * the email drives them to the upload form to claim the paid audit.
 */
export async function sendIntakeEmail(params: {
  to: string
  tier: string
  orderId: string
}) {
  const { to, tier, orderId } = params
  const intakeUrl = `${SITE}/analyze?order=${encodeURIComponent(orderId)}`

  await getResend().emails.send({
    from: `SellerRadar <${FROM}>`,
    to,
    subject: `Your SellerRadar ${tier} purchase — upload your catalog`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: 'DM Sans', -apple-system, sans-serif; background: #07090e; color: #e8ecf4; padding: 40px 20px; margin: 0;">
  <div style="max-width: 520px; margin: 0 auto;">
    <div style="font-family: monospace; font-size: 20px; margin-bottom: 24px;">Seller<span style="color: #d4a843;">Radar</span></div>
    <h2 style="font-family: Georgia, serif; font-size: 22px; color: #e8ecf4; margin-bottom: 12px;">Payment confirmed — one step left.</h2>
    <p style="font-size: 14px; color: #5a6278; margin-bottom: 20px; line-height: 1.7;">
      Your SellerRadar <strong style="color: #d4a843;">${tier}</strong> purchase is confirmed
      (order <span style="font-family: monospace;">${orderId}</span>).
      Upload your catalog CSV and we compute the per-SKU dollar impact of the
      latest Amazon fee change.
    </p>
    <a href="${intakeUrl}" style="display: inline-block; padding: 12px 28px; background: #d4a843; color: #07090e; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 14px;">
      Upload my catalog →
    </a>
    <p style="font-size: 11px; color: #2e3450; font-family: monospace; margin-top: 24px;">SellerRadar · Estimates only — verify against settlement reports. Not financial or tax advice.</p>
  </div>
</body>
</html>`,
  })
}
