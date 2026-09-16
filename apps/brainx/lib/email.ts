import { sendEmail } from '@bizlegal/email'

/* ─── Transport ────────────────────────────────────────────────────────────
   Every send in this file goes through @bizlegal/email — suppression and
   double-opt-in are enforced inside that package, not here (packages/email
   CLAUDE.md). Both senders below are kind: 'transactional' and the
   justification is written here rather than assumed:

     · sendAccessLink — the magic link IS the deliverable a paying subscriber
       needs to reach what they just bought. Not a promotion of the product.
     · sendBriefReady — the BUILD THIS brief the subscriber requested is
       ready; this is the delivery of a paid feature, not marketing.

   Suppression still applies to both. Nothing here is marketing, and nothing
   here may be reused for marketing — the weekly radar pick to confirmed
   double-opt-in leads is tools/send-weekly-pick.ts, kind: 'marketing'. */

const SITE = process.env.NEXT_PUBLIC_BRAINX_SITE_URL ?? 'https://brainx.bizlegal-ai.com'

function fromAddress(): string {
  const raw = process.env.RESEND_FROM
  if (!raw) return 'BrainX <radar@bizlegal-ai.com>'
  return raw.includes('<') ? raw : `BrainX <${raw}>`
}

async function deliver(label: string, to: string, subject: string, html: string): Promise<void> {
  const res = await sendEmail({ to, subject, html, kind: 'transactional', from: fromAddress() })
  if (!res.ok) {
    console.warn(`[email] ${label} not sent to ${to}: ${res.error}${res.detail ? ` — ${res.detail}` : ''}`)
  }
}

const SHELL_OPEN = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: Inter, -apple-system, sans-serif; background: #070A12; color: #E6ECF8; padding: 40px 20px; margin: 0;">
  <div style="max-width: 560px; margin: 0 auto;">
    <div style="font-family: 'JetBrains Mono', monospace; font-size: 20px; font-weight: 600; letter-spacing: 0.04em; margin-bottom: 32px;">
      Brain<span style="color: #43E0F5;">X</span>
    </div>
    <div style="background: #0F1528; border: 1px solid rgba(230,236,248,.10); border-radius: 14px; padding: 32px; margin-bottom: 24px;">`
const SHELL_CLOSE = `
    </div>
    <p style="font-size: 11px; color: #5A6488; font-family: 'JetBrains Mono', monospace; line-height: 1.7; text-align: center;">
      BrainX · ${SITE}<br>
      Weekly evidence-first opportunity radar. Not legal advice; no outcome guarantee.
    </p>
  </div>
</body>
</html>`

const BTN = (href: string, label: string) =>
  `<a href="${href}" style="display: block; text-align: center; padding: 14px; background: #43E0F5; color: #070A12; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 15px;">${label}</a>`

export async function sendAccessLink(params: {
  to: string
  token: string
  tier: 'radar' | 'radar_build'
  orderId: string
}): Promise<void> {
  const { to, token, tier, orderId } = params
  const link = `${SITE}/enter?k=${encodeURIComponent(token)}`
  const tierName = tier === 'radar_build' ? 'Radar + Build' : 'Radar'

  await deliver(
    'access_link',
    to,
    `Your BrainX ${tierName} access link`,
    `${SHELL_OPEN}
      <div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #5A6488; letter-spacing: 0.14em; text-transform: uppercase; margin-bottom: 12px;">Subscription confirmed</div>
      <h1 style="font-size: 24px; font-weight: 700; margin: 0 0 16px;">Your BrainX ${tierName} radar is ready.</h1>
      <p style="font-size: 14px; color: #9AA6C4; line-height: 1.7; margin: 0 0 24px;">
        Order <span style="font-family: 'JetBrains Mono', monospace;">${orderId}</span> is confirmed.
        This link signs you in — bookmark it or use "email me my link" on
        <a href="${SITE}/access" style="color:#43E0F5;">${SITE.replace('https://', '')}/access</a> if you lose it.
      </p>
      ${BTN(link, 'Open your radar →')}
      ${SHELL_CLOSE}`,
  )
}

export async function sendBriefReady(params: {
  to: string
  productId: string
  opportunityName: string
}): Promise<void> {
  const { to, productId, opportunityName } = params
  const link = `${SITE}/radar/briefs/${encodeURIComponent(productId)}`

  await deliver(
    'brief_ready',
    to,
    `Your BUILD THIS brief is ready — ${opportunityName}`,
    `${SHELL_OPEN}
      <div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #5A6488; letter-spacing: 0.14em; text-transform: uppercase; margin-bottom: 12px;">Build This — ready</div>
      <h1 style="font-size: 22px; font-weight: 700; margin: 0 0 16px;">${opportunityName}</h1>
      <p style="font-size: 14px; color: #9AA6C4; line-height: 1.7; margin: 0 0 24px;">
        Offer, buyer, deliverable, pricing hypothesis, sales angle, landing-page
        brief, delivery workflow, evidence pack and next actions — every claim
        cites a source from this opportunity's evidence vault.
      </p>
      ${BTN(link, 'View your brief →')}
      ${SHELL_CLOSE}`,
  )
}

export async function sendAccessLinkResend(params: { to: string; token: string; tier: 'radar' | 'radar_build' }): Promise<void> {
  const { to, token, tier } = params
  const link = `${SITE}/enter?k=${encodeURIComponent(token)}`
  const tierName = tier === 'radar_build' ? 'Radar + Build' : 'Radar'
  await deliver(
    'access_link_resend',
    to,
    'Your BrainX access link',
    `${SHELL_OPEN}
      <h1 style="font-size: 22px; font-weight: 700; margin: 0 0 16px;">Here's your BrainX ${tierName} link.</h1>
      <p style="font-size: 14px; color: #9AA6C4; line-height: 1.7; margin: 0 0 24px;">Sign-in link, requested from the access page.</p>
      ${BTN(link, 'Open your radar →')}
      ${SHELL_CLOSE}`,
  )
}
