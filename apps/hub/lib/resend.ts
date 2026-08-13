import { Resend } from 'resend'

// Lazy init — avoids build-time throw when RESEND_API_KEY is not set
let _resend: Resend | null = null
function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY || 'placeholder')
  return _resend
}
export const resend = { emails: { send: (...args: Parameters<Resend['emails']['send']>) => getResend().emails.send(...args) } }

export async function sendWelcomeEmail(email: string, latestArticleSlug?: string) {
  const articleUrl = latestArticleSlug
    ? `${process.env.NEXT_PUBLIC_SITE_URL}/guides/${latestArticleSlug}`
    : `${process.env.NEXT_PUBLIC_SITE_URL}/regulations`

  return resend.emails.send({
    from: 'BizLegal AI <pulse@intelligence.bizlegal-ai.com>',
    to: email,
    subject: "You're in — The BizLegal AI Regulatory Pulse",
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
body { background: #0e1322; color: #dee1f7; font-family: 'Manrope', sans-serif; margin: 0; padding: 0; }
.container { max-width: 580px; margin: 0 auto; padding: 40px 24px; }
.logo { font-family: Georgia, serif; font-size: 22px; color: #dee1f7; margin-bottom: 32px; }
.logo span { color: #e9c349; }
h1 { font-family: Georgia, serif; font-size: 28px; color: #dee1f7; margin-bottom: 16px; line-height: 1.2; }
p { color: #c3c6d7; font-size: 14px; line-height: 1.65; margin-bottom: 16px; }
.btn { display: inline-block; background: #2563eb; color: #eeefff; padding: 12px 24px; text-decoration: none; font-weight: 700; font-size: 13px; margin: 8px 0; }
.divider { border: none; border-top: 0.5px solid #434655; margin: 24px 0; }
.footer { font-size: 11px; color: #8d90a0; }
.tag { font-size: 9px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: #e9c349; }
</style></head>
<body>
<div class="container">
  <div class="logo">BizLegal <span>•</span> AI</div>
  <span class="tag">Welcome · Regulatory Pulse</span>
  <h1>Precise intelligence,<br/>every 48 hours.</h1>
  <p>You're now subscribed to the BizLegal AI Regulatory Pulse — the compliance briefing trusted by fintech and crypto executives navigating SEC, MiCA, VARA, and GDPR.</p>
  <p>Each issue delivers:</p>
  <ul style="color:#c3c6d7;padding-left:20px;margin-bottom:16px;">
    <li>Live enforcement alerts with penalty analysis</li>
    <li>Jurisdiction-specific compliance updates</li>
    <li>Risk scoring for your industry and region</li>
    <li>Curated regulatory precedents</li>
  </ul>
  <a href="${articleUrl}" class="btn">Read the Latest Analysis →</a>
  <hr class="divider"/>
  <p class="footer">BizLegal AI · Compliance Intelligence Platform<br/>
  This email was sent to ${email}. <a href="${process.env.NEXT_PUBLIC_SITE_URL}/contact?subject=unsubscribe" style="color:#8d90a0;">Unsubscribe</a></p>
</div>
</body>
</html>`,
  })
}

export async function sendBankWireInstructions(args: {
  email: string
  orderId: string
  reference: string
  amountCents: number
  currency: 'USD' | 'EUR'
  productLabel: string
  wire: {
    bankName: string
    bankAddress: string
    beneficiary: string
    iban?: string
    bic?: string
    routing?: string
    swift?: string
    accountNumber?: string
    accountType?: string
  }
}) {
  const { email, orderId, reference, amountCents, currency, productLabel, wire } = args
  const amount = `${currency === 'USD' ? '$' : '€'}${(amountCents / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
  const detailRows: Array<[string, string | undefined]> = currency === 'EUR'
    ? [
        ['Bank name', wire.bankName],
        ['Bank address', wire.bankAddress],
        ['IBAN', wire.iban],
        ['BIC / SWIFT', wire.bic],
        ['Beneficiary name', wire.beneficiary],
      ]
    : [
        ['Bank name', wire.bankName],
        ['Bank address', wire.bankAddress],
        ['Routing (ABA)', wire.routing],
        ['Account number', wire.accountNumber],
        ['Account type', wire.accountType],
        ['SWIFT (intl. wires)', wire.swift],
        ['Beneficiary name', wire.beneficiary],
      ]
  const rowsHtml = detailRows
    .filter(([, v]) => v && v.length > 0)
    .map(
      ([k, v]) => `<tr>
  <td style="padding:8px 14px;border-bottom:1px solid #2a3148;font-size:12px;color:#8d90a0;letter-spacing:0.05em;text-transform:uppercase;width:42%;">${k}</td>
  <td style="padding:8px 14px;border-bottom:1px solid #2a3148;font-size:14px;color:#dee1f7;font-family:'Courier New',monospace;font-weight:600;">${v}</td>
</tr>`,
    )
    .join('\n')

  return resend.emails.send({
    from: 'BizLegal AI <orders@intelligence.bizlegal-ai.com>',
    to: email,
    subject: `Wire instructions — ${productLabel} — ref ${reference}`,
    html: `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="background:#0e1322;color:#dee1f7;font-family:'Manrope',sans-serif;margin:0;padding:0;">
<div style="max-width:580px;margin:0 auto;padding:40px 24px;">
  <div style="font-family:Georgia,serif;font-size:22px;color:#dee1f7;margin-bottom:32px;">BizLegal <span style="color:#e9c349;">•</span> AI</div>
  <h1 style="font-family:Georgia,serif;font-size:24px;color:#dee1f7;line-height:1.25;margin:0 0 8px;">Wire instructions for your order</h1>
  <p style="font-size:13px;color:#8d90a0;margin:0 0 24px;letter-spacing:0.04em;text-transform:uppercase;">Order ${reference} · ${productLabel}</p>
  <p style="color:#c3c6d7;font-size:14px;line-height:1.65;margin:0 0 16px;">Wire <strong style="color:#e9c349;">${amount} ${currency}</strong> using the details below. The reference code is what we use to match your wire to your order, so please put it in the bank&rsquo;s memo / reference field exactly as written.</p>
  <table style="width:100%;border-collapse:collapse;background:#161b2b;border:1px solid #2a3148;margin:16px 0 24px;">
${rowsHtml}
  <tr>
    <td style="padding:8px 14px;border-bottom:1px solid #2a3148;font-size:12px;color:#e9c349;letter-spacing:0.05em;text-transform:uppercase;font-weight:700;">Reference (REQUIRED)</td>
    <td style="padding:8px 14px;border-bottom:1px solid #2a3148;font-size:16px;color:#e9c349;font-family:'Courier New',monospace;font-weight:700;">${reference}</td>
  </tr>
  </table>
  <p style="color:#c3c6d7;font-size:13px;line-height:1.6;margin:0 0 16px;"><strong style="color:#dee1f7;">Next steps:</strong></p>
  <ol style="color:#c3c6d7;font-size:13px;line-height:1.7;padding-left:20px;margin:0 0 24px;">
    <li>Wire ${amount} ${currency} from your bank using the details above.</li>
    <li>Put the reference <strong style="color:#e9c349;">${reference}</strong> in the wire memo.</li>
    <li>Reply to this email with proof of transfer (screenshot or PDF) to speed up confirmation.</li>
    <li>We mark your order paid within 1 business day of the wire landing in our account.</li>
  </ol>
  <p style="color:#c3c6d7;font-size:13px;line-height:1.6;margin:0 0 16px;">Wires from outside the bank&rsquo;s home jurisdiction may take 1&ndash;3 business days. SEPA / domestic wires usually land same-day or next-day.</p>
  <hr style="border:none;border-top:1px solid #2a3148;margin:24px 0;"/>
  <p style="font-size:11px;color:#8d90a0;line-height:1.6;margin:0;">BizLegal AI is software operated by DOR INNOVATIONS. Not a law firm; outputs are research, not legal advice. Order non-refundable once delivered. Questions: <a href="mailto:team@bizlegal-ai.com" style="color:#b4c5ff;">team@bizlegal-ai.com</a>. Order ID: <code style="font-family:'Courier New',monospace;">${orderId}</code></p>
</div>
</body></html>`,
  })
}

export async function sendPaymentConfirmationEmail(
  email: string,
  product: string,
  amountCents: number,
  billingInterval: string | null,
) {
  const amount = `$${(amountCents / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`

  const intervalLabel =
    billingInterval === 'monthly'
      ? '/month'
      : billingInterval === 'yearly'
        ? '/year'
        : ''

  // Map product families to their access URLs for the 'next steps' CTA
  const accessUrlMap: Record<string, string> = {
    docai: 'https://docai.bizlegal-ai.com',
    lexaudit: 'https://lexaudit.bizlegal-ai.com',
    conductor: 'https://docai.bizlegal-ai.com',
    tracr: 'https://tracr.bizlegal-ai.com',
    brai: 'https://brai.bizlegal-ai.com',
    forge: 'https://forge.bizlegal-ai.com',
  }
  const family = Object.keys(accessUrlMap).find((k) => product.startsWith(k))
  const accessUrl = family ? accessUrlMap[family] : 'https://bizlegal-ai.com'

  return resend.emails.send({
    from: 'BizLegal AI <orders@intelligence.bizlegal-ai.com>',
    to: email,
    subject: 'Your BizLegal AI order is confirmed',
    html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
body { background: #0e1322; color: #dee1f7; font-family: 'Manrope', sans-serif; margin: 0; padding: 0; }
.container { max-width: 580px; margin: 0 auto; padding: 40px 24px; }
.logo { font-family: Georgia, serif; font-size: 22px; color: #dee1f7; margin-bottom: 32px; }
.logo span { color: #e9c349; }
h1 { font-family: Georgia, serif; font-size: 26px; color: #dee1f7; margin-bottom: 16px; line-height: 1.2; }
p { color: #c3c6d7; font-size: 14px; line-height: 1.65; margin-bottom: 16px; }
.amount { color: #e9c349; font-size: 28px; font-family: Georgia, serif; font-weight: 700; }
.btn { display: inline-block; background: #2563eb; color: #eeefff; padding: 12px 24px; text-decoration: none; font-weight: 700; font-size: 13px; margin: 8px 0; }
.divider { border: none; border-top: 0.5px solid #434655; margin: 24px 0; }
.footer { font-size: 11px; color: #8d90a0; }
.tag { font-size: 9px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: #e9c349; }
</style></head>
<body>
<div class="container">
  <div class="logo">BizLegal <span>•</span> AI</div>
  <span class="tag">Order Confirmed</span>
  <h1>Your payment was received.</h1>
  <p>Thank you for your purchase. Your order is now active.</p>
  <p><strong style="color:#dee1f7;">Product:</strong> ${product.replace(/_/g, ' ')}</p>
  <p><strong style="color:#dee1f7;">Amount paid:</strong> <span class="amount">${amount}${intervalLabel}</span></p>
  <p>You can access your product using the link below. If you have any questions, reply to this email or contact us at <a href="mailto:team@bizlegal-ai.com" style="color:#b4c5ff;">team@bizlegal-ai.com</a>.</p>
  <a href="${accessUrl}" class="btn">Access Your Product →</a>
  <hr class="divider"/>
  <p class="footer">BizLegal AI is software operated by DOR INNOVATIONS. Not a law firm; outputs are research, not legal advice.<br/>
  This email was sent to ${email}. <a href="${process.env.NEXT_PUBLIC_SITE_URL}/contact?subject=unsubscribe" style="color:#8d90a0;">Unsubscribe</a></p>
</div>
</body>
</html>`,
  })
}

export async function sendRiskReportEmail(
  email: string,
  reportId: string,
  score: number,
  severity: string,
  threats: string[]
) {
  const severityColor = severity === 'CRITICAL' ? '#f87171' : severity === 'MODERATE' ? '#e9c349' : '#10B981'
  const reportUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/report/${reportId}`

  return resend.emails.send({
    from: 'BizLegal AI <reports@intelligence.bizlegal-ai.com>',
    to: email,
    subject: `Your Compliance Risk Report — Score: ${score} (${severity})`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
body { background: #0e1322; color: #dee1f7; font-family: 'Manrope', sans-serif; margin: 0; padding: 0; }
.container { max-width: 580px; margin: 0 auto; padding: 40px 24px; }
.logo { font-family: Georgia, serif; font-size: 22px; color: #dee1f7; margin-bottom: 32px; }
.logo span { color: #e9c349; }
.score-band { border: 0.5px solid ${severityColor}; background: rgba(0,0,0,0.3); padding: 24px; margin-bottom: 24px; text-align: center; }
.score-num { font-family: Georgia, serif; font-size: 72px; font-weight: 700; color: ${severityColor}; line-height: 1; }
.severity { font-size: 10px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: ${severityColor}; margin-top: 8px; }
h2 { font-family: Georgia, serif; font-size: 20px; color: #dee1f7; margin: 24px 0 12px; }
.threat { border-left: 2px solid #f87171; padding: 10px 14px; background: rgba(22,27,43,0.8); margin-bottom: 8px; font-size: 13px; color: #c3c6d7; }
.btn { display: inline-block; background: #2563eb; color: #eeefff; padding: 12px 24px; text-decoration: none; font-weight: 700; font-size: 13px; margin: 16px 0; }
.footer { font-size: 11px; color: #8d90a0; margin-top: 32px; border-top: 0.5px solid #434655; padding-top: 16px; }
</style></head>
<body>
<div class="container">
  <div class="logo">BizLegal <span>•</span> AI</div>
  <div class="score-band">
    <div class="score-num">${score}</div>
    <div class="severity">${severity} Risk</div>
  </div>
  <h2>Your Top Threats</h2>
  ${threats.slice(0, 2).map(t => `<div class="threat">${t}</div>`).join('')}
  <a href="${reportUrl}" class="btn">View Full Risk Report →</a>
  <p>Your report includes 4 identified threats, 3 mitigation strategies, and a relevant enforcement precedent.</p>
  <a href="https://bizlegal-ai.com/tools" style="color:#b4c5ff;font-size:13px;">Fix these with the compliance tools →</a>
  <div class="footer">
    BizLegal AI · Compliance Intelligence Platform<br/>
    This report is for informational purposes only and does not constitute legal advice.<br/>
    © 2026 BizLegal AI. All rights reserved.
  </div>
</div>
</body>
</html>`,
  })
}
