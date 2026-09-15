/**
 * O-027 digest sender.
 *
 * Email goes through the hub relay (`/api/internal/send-email`, HMAC-signed
 * with BIZLEGAL_INBOUND_SECRET) — the fleet's one outbound email path. The
 * relay sends from the verified Resend domain and only accepts allow-listed
 * operator recipients, which is exactly what an internal digest needs. This
 * tool never talks to Resend directly (shared-stream rule; the previous raw
 * transport 403'd because RESEND_FROM was on an unverified domain).
 *
 * Telegram fallback when TELEGRAM_HUB_TOKEN/TELEGRAM_CHAT_ID are set;
 * otherwise the digest is written to a local file (local proof mode).
 */
import { createHmac } from 'node:crypto'
import { writeFileSync } from 'node:fs'
import path from 'node:path'

export interface SendResult {
  ok: boolean
  channel: 'email' | 'telegram' | 'file'
  error?: string
}

const HUB_URL = (process.env.NEXT_PUBLIC_HUB_URL ?? 'https://bizlegal-ai.com').replace(/\/$/, '')

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

async function sendViaHubRelay(to: string, secret: string, subject: string, text: string): Promise<string | undefined> {
  const body = JSON.stringify({
    to,
    subject,
    html: `<pre style="font-family:ui-monospace,Menlo,monospace;white-space:pre-wrap;font-size:13px">${escapeHtml(text)}</pre>`,
  })
  const signature = createHmac('sha256', secret).update(body).digest('hex')
  try {
    const res = await fetch(`${HUB_URL}/api/internal/send-email`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-bizlegal-signature': signature,
        'user-agent': 'bizlegal-social-autopilot/1.0',
      },
      body,
    })
    if (res.ok) return undefined
    return `relay_${res.status}`
  } catch (e) {
    return e instanceof Error ? e.message : 'relay_error'
  }
}

export async function sendDigest(digestText: string, outDir: string, dateStr: string): Promise<SendResult> {
  const to = process.env.SOCIAL_DIGEST_TO_EMAIL
  const secret = process.env.BIZLEGAL_INBOUND_SECRET
  let emailError: string | undefined
  if (to && secret) {
    emailError = await sendViaHubRelay(to, secret, `BizLegal Fleet Social Digest — ${dateStr}`, digestText)
    if (!emailError) return { ok: true, channel: 'email' }
  }
  const tgToken = process.env.TELEGRAM_HUB_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (tgToken && chatId) {
    try {
      const res = await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: digestText.slice(0, 4000) }),
      })
      if (res.ok) return { ok: true, channel: 'telegram', error: emailError }
      return { ok: false, channel: 'telegram', error: [emailError, `tg_${res.status}`].filter(Boolean).join(';') }
    } catch (e) {
      return { ok: false, channel: 'telegram', error: e instanceof Error ? e.message : 'telegram_error' }
    }
  }
  writeFileSync(path.join(outDir, `daily-digest-${dateStr}.txt`), digestText, 'utf8')
  return { ok: true, channel: 'file', error: emailError }
}
