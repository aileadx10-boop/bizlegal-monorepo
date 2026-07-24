/**
 * Weekly "Regulatory Pulse" digest — compiles the most recently added
 * guides into an email, drafts a short intro via Haiku, and sends to
 * every confirmed, active, non-unsubscribed newsletter_subscribers row.
 *
 * Triggered by app/api/newsletter/send/route.ts (CRON_SECRET-gated).
 */
import { createClient } from '@supabase/supabase-js'
import { logEventAsync } from '@/lib/ops/log'
import { GUIDES, type Guide } from '@/lib/guides'
import { runEaTask } from './ea-runner'
import { signSubscriberId } from '@/lib/newsletter-token'

const DIGEST_SIZE = 4

interface Subscriber {
  readonly id: string
  readonly email: string
}

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

async function draftIntro(guides: readonly Guide[]): Promise<string> {
  const system = `You write the 2-3 sentence intro paragraph for BizLegal AI's "Regulatory Pulse" newsletter digest, sent to fintech/crypto/SaaS founders and compliance officers. Voice: a practicing attorney, direct and specific. Never open with "Hi there" or "We're excited to share". Lead with what's actually new in this issue, not a greeting.`
  const userMessage = `This issue features:\n${guides.map((g) => `- ${g.title}`).join('\n')}\n\nWrite the intro now.`
  const result = await runEaTask({ task: 'newsletter-intro', model: 'haiku', systemPrompt: system, userMessage, maxTokens: 300 })
  if (!result.ok || !result.text.trim()) {
    return `This issue covers ${guides.length} new compliance developments relevant to fintech, crypto, and B2B SaaS teams.`
  }
  return result.text.trim()
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function renderHtml(intro: string, guides: readonly Guide[], subscriber: Subscriber): string {
  const sig = signSubscriberId(subscriber.id)
  const unsubUrl = `https://bizlegal-ai.com/api/newsletter/unsubscribe?id=${encodeURIComponent(subscriber.id)}&sig=${sig}`

  const rows = guides
    .map(
      (g) => `
    <tr>
      <td style="padding:16px 0;border-bottom:1px solid #2a2a3d">
        <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:0.06em;color:#8b8ba7;font-weight:600">${escapeHtml(g.tag)}</p>
        <a href="https://bizlegal-ai.com${g.href}" style="color:#e8e8f0;font-size:16px;font-weight:700;text-decoration:none;line-height:1.4">${escapeHtml(g.title)}</a>
        <p style="margin:6px 0 0;color:#a0a0b8;font-size:13.5px;line-height:1.6">${escapeHtml(g.description)}</p>
      </td>
    </tr>`,
    )
    .join('')

  return `<!doctype html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0f0f1a;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif">
  <table role="presentation" width="100%" style="max-width:600px;margin:0 auto;background:#16161f">
    <tr><td style="padding:32px 28px 20px">
      <p style="margin:0;color:#5b7cfa;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase">BizLegal AI · Regulatory Pulse</p>
      <p style="margin:16px 0 0;color:#e8e8f0;font-size:15px;line-height:1.7">${escapeHtml(intro)}</p>
    </td></tr>
    <tr><td style="padding:0 28px">
      <table role="presentation" width="100%">${rows}</table>
    </td></tr>
    <tr><td style="padding:24px 28px 8px">
      <a href="https://docai.bizlegal-ai.com" style="display:inline-block;background:#5b7cfa;color:#fff;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px;text-decoration:none">Scan a Contract — $97</a>
    </td></tr>
    <tr><td style="padding:24px 28px 32px;border-top:1px solid #2a2a3d">
      <p style="margin:0;color:#6a6a85;font-size:12px;line-height:1.6">
        BizLegal AI · <a href="${unsubUrl}" style="color:#6a6a85">Unsubscribe</a>
      </p>
    </td></tr>
  </table>
</body>
</html>`
}

async function sendOne(subscriber: Subscriber, subject: string, html: string): Promise<boolean> {
  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) return false
  const from = process.env.RESEND_FROM || 'intelligence@intelligence.bizlegal-ai.com'
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'bizlegal-agent/1.0',
      },
      body: JSON.stringify({ from: `BizLegal AI <${from}>`, to: [subscriber.email], subject, html }),
    })
    return r.ok
  } catch {
    return false
  }
}

export interface NewsletterRunResult {
  readonly recipients: number
  readonly sent: number
  readonly failed: number
  readonly skipped: 'no_recipients' | null
}

export async function runNewsletterDigest(): Promise<NewsletterRunResult> {
  const sb = getClient()
  if (!sb) return { recipients: 0, sent: 0, failed: 0, skipped: 'no_recipients' }

  const { data: subs } = await sb
    .from('newsletter_subscribers')
    .select('id, email')
    .eq('active', true)
    .eq('double_optin_confirmed', true)
    .is('unsubscribed_at', null)

  const recipients = (subs ?? []) as Subscriber[]
  if (recipients.length === 0) {
    return { recipients: 0, sent: 0, failed: 0, skipped: 'no_recipients' }
  }

  const featured = GUIDES.slice(-DIGEST_SIZE).reverse()
  const intro = await draftIntro(featured)
  const firstTag = featured[0]?.tag ?? 'This Week'
  const subject = featured.length > 1
    ? `Regulatory Pulse: ${firstTag} + ${featured.length - 1} more`
    : `Regulatory Pulse: ${firstTag}`

  let sent = 0
  let failed = 0
  for (const subscriber of recipients) {
    const html = renderHtml(intro, featured, subscriber)
    const ok = await sendOne(subscriber, subject, html)
    if (ok) sent++
    else failed++
  }

  logEventAsync({
    type: sent > 0 ? 'agent.run.completed' : 'agent.run.error',
    source: 'hub',
    ref_id: 'newsletter-digest',
    status: sent > 0 ? 'ok' : 'failed',
    metadata: { recipients: recipients.length, sent, failed, featured: featured.map((g) => g.href) },
  })

  return { recipients: recipients.length, sent, failed, skipped: null }
}
