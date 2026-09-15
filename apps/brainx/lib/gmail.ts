// Gmail adapter — send, receive, and thread-aware labels for BrainX.
// Uses Google Gmail API via OAuth / service account (gws pattern).
// Resend remains the fallback for transactional alerts.

export interface GmailAdapterConfig {
  accessToken?: string
  refreshToken?: string
  clientEmail?: string
  privateKey?: string
  from?: string
}

export interface GmailMessage {
  id: string
  threadId: string
  from: string
  to: string
  subject: string
  body: string
  snippet?: string
  receivedAt?: string
}

type AuthHeaders = Record<string, string>

function base64UrlEncode(input: string): string {
  return Buffer.from(input, 'utf8')
    .toString('base64')
    .replace(/=+$/, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

export async function getGmailAuthHeaders(_cfg: GmailAdapterConfig): Promise<AuthHeaders> {
  // OAuth2 user token path when accessToken/refreshToken present.
  // Service-account JWT path when clientEmail/privateKey present (gws pattern).
  // For MVP, the caller (services/agents or API route) provides a pre-fetched
  // Google OAuth access token; full gws CLI auth lives in scripts/gmail-auth.
  const token =
    _cfg.accessToken ||
    process.env.GOOGLE_GMAIL_ACCESS_TOKEN ||
    ''
  if (!token) {
    throw new Error('Gmail adapter: no Google OAuth access token bound')
  }
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
}

export async function gmailSend(
  _cfg: GmailAdapterConfig,
  opts: { to: string; subject: string; body: string; from?: string },
): Promise<{ ok: boolean; id?: string }> {
  const headers = await getGmailAuthHeaders(_cfg)
  const from = opts.from || _cfg.from || process.env.GMAIL_FROM || 'brainx@bizlegal-ai.com'
  const raw = [
    `From: ${from}`,
    `To: ${opts.to}`,
    `Subject: =?UTF-8?Q?${encodeURIComponent(opts.subject).replace(/%20/g, '_')}?=`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    '',
    opts.body,
  ].join('\r\n')
  const body = JSON.stringify({ raw: base64UrlEncode(raw) })
  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers,
    body,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Gmail send failed ${res.status}: ${text.slice(0, 200)}`)
  }
  const json = (await res.json()) as { id?: string }
  return { ok: true, id: json.id }
}

export async function gmailList(
  _cfg: GmailAdapterConfig,
  query = 'label:bizlegal-brainx newer_than:14d',
  max = 50,
): Promise<GmailMessage[]> {
  const headers = await getGmailAuthHeaders(_cfg)
  const q = new URLSearchParams({ q: query, maxResults: String(max) })
  const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?${q}`, { headers })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Gmail list failed ${res.status}: ${text.slice(0, 200)}`)
  }
  const json = (await res.json()) as { messages?: { id: string; threadId: string }[] }
  return (json.messages || []).map((m) => ({
    id: m.id,
    threadId: m.threadId,
    from: '',
    to: '',
    subject: '',
    body: '',
  }))
}
