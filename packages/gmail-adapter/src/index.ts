// Gmail adapter — BrainX send/receive via Gmail API, Resend fallback.

export interface GmailConfig {
  from: string
  accessToken?: string
}

export interface SendOptions {
  to: string
  subject: string
  body: string
  label?: string
}

export function base64UrlEncode(s: string): string {
  return Buffer.from(s, 'utf8')
    .toString('base64')
    .replace(/=+$/, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

export function rawMessage(from: string, to: string, subject: string, body: string): string {
  return [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: =?UTF-8?Q?${encodeURIComponent(subject).replace(/%20/g, '_')}?=`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    '',
    body,
  ].join('\r\n')
}

export async function gmailSend(cfg: GmailConfig, opts: SendOptions): Promise<{ ok: boolean; id?: string }> {
  const token = cfg.accessToken || process.env.GOOGLE_GMAIL_ACCESS_TOKEN || ''
  if (!token) throw new Error('Gmail adapter: missing access token')
  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw: base64UrlEncode(rawMessage(cfg.from, opts.to, opts.subject, opts.body)) }),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Gmail send failed ${res.status}: ${text.slice(0, 200)}`)
  }
  const json = (await res.json()) as { id?: string }
  return { ok: true, id: json.id }
}
