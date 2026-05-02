/**
 * Lightweight Resend wrapper. Sends email via REST API rather than the
 * official SDK to avoid pulling another dependency. Failures are logged
 * but never thrown — email delivery is auxiliary, not critical-path.
 */

interface SendEmailInput {
  to: string
  subject: string
  html: string
  replyTo?: string
}

const RESEND_ENDPOINT = 'https://api.resend.com/emails'

export async function sendEmail(input: SendEmailInput): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return { ok: false, error: 'RESEND_API_KEY not configured' }
  }
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'intelligence@intelligence.bizlegal-ai.com'
  const replyTo = input.replyTo ?? process.env.RESEND_REPLY_TO ?? 'team@bizlegal-ai.com'

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `LexAudit <${fromEmail}>`,
        to: [input.to],
        reply_to: replyTo,
        subject: input.subject,
        html: input.html,
      }),
    })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      return { ok: false, error: `Resend ${res.status}: ${text.slice(0, 200)}` }
    }
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'unknown error' }
  }
}

export function certReadyHtml(input: {
  certId: string
  certUrl: string
  matterTitle: string
  lawyerName: string
  partnerName?: string | null
  amountUsd: number
  gateway: 'nowpayments' | 'paypal'
}): string {
  const gatewayLabel = input.gateway === 'paypal' ? 'card (PayPal)' : 'crypto (NOWPayments)'
  return `<div style="font-family:Inter,sans-serif;max-width:560px;margin:auto;padding:24px;color:#0e0b1a">
<h2 style="font-weight:800;letter-spacing:-0.02em;margin:0 0 16px">Compliance Health Score · ${escapeHtml(input.certId)}</h2>
<p style="line-height:1.6;color:#4b3f6a;margin:0 0 16px">Your tamper-evident cert is ready. Open the link below to view, download, or print the snapshot.</p>
<p style="margin:24px 0">
  <a href="${input.certUrl}" style="display:inline-block;padding:14px 28px;background:#c9a84c;color:#0a0a0f;text-decoration:none;border-radius:9999px;font-weight:700;font-size:14px">Open certificate →</a>
</p>
<table style="border-collapse:collapse;width:100%;margin:18px 0;font-size:13px;color:#4b3f6a">
  <tr><td style="padding:6px 0;width:38%">Matter</td><td style="padding:6px 0;color:#0e0b1a"><strong>${escapeHtml(input.matterTitle)}</strong></td></tr>
  <tr><td style="padding:6px 0">Responsible lawyer</td><td style="padding:6px 0;color:#0e0b1a">${escapeHtml(input.lawyerName)}</td></tr>
  ${input.partnerName ? `<tr><td style="padding:6px 0">Reviewing partner</td><td style="padding:6px 0;color:#0e0b1a">${escapeHtml(input.partnerName)}</td></tr>` : ''}
  <tr><td style="padding:6px 0">Amount paid</td><td style="padding:6px 0;color:#0e0b1a">$${input.amountUsd.toFixed(2)} USD via ${gatewayLabel}</td></tr>
</table>
<div style="background:#fef3c7;border:1px solid #f59e0b;padding:12px 14px;border-radius:8px;margin:18px 0;font-size:12px;color:#7c2d12;line-height:1.55">
  <strong>Decision-support only.</strong> This is a process-attestation snapshot — regulatory intelligence, not legal advice and not a verdict on the underlying work product.
</div>
<p style="font-size:12px;color:#6b6188;margin:18px 0 0">Disclosure ${process.env.DISCLAIMER_VERSION ?? 'v1.0.0-p4'} — Reply to this email for support.</p>
</div>`
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
