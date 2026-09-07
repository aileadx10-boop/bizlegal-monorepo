/**
 * Address verification (rule 7 v2, item 1). ZeroBounce-class validate call;
 * only `valid` may be sent to. No key → 'unknown', which the invariant check
 * treats as a refusal — the absence of verification never becomes a send.
 *
 * Never constructs, guesses or "fixes" an address.
 */

export type VerificationStatus = 'valid' | 'invalid' | 'catch-all' | 'unknown' | 'spamtrap' | 'abuse' | 'do_not_mail'

export interface VerificationResult {
  readonly status: VerificationStatus
  readonly subStatus: string | null
  readonly provider: 'zerobounce' | 'none'
  readonly checkedAt: string
}

const ZB_URL = 'https://api.zerobounce.net/v2/validate'

export async function verifyEmailAddress(email: string, opts: { apiKey?: string; fetchImpl?: typeof fetch } = {}): Promise<VerificationResult> {
  const checkedAt = new Date().toISOString()
  const apiKey = opts.apiKey ?? process.env.ZEROBOUNCE_API_KEY
  if (!apiKey) return { status: 'unknown', subStatus: 'not_configured', provider: 'none', checkedAt }
  const doFetch = opts.fetchImpl ?? fetch
  try {
    const url = `${ZB_URL}?api_key=${encodeURIComponent(apiKey)}&email=${encodeURIComponent(email)}&ip_address=`
    const res = await doFetch(url, { headers: { 'user-agent': 'bizlegal-agent/1.0' } })
    if (!res.ok) return { status: 'unknown', subStatus: `http_${res.status}`, provider: 'zerobounce', checkedAt }
    const json = (await res.json()) as { status?: string; sub_status?: string }
    const raw = (json.status ?? 'unknown').toLowerCase()
    const status: VerificationStatus =
      raw === 'valid' ? 'valid' : raw === 'invalid' ? 'invalid' : raw === 'catch-all' ? 'catch-all' : raw === 'spamtrap' ? 'spamtrap' : raw === 'abuse' ? 'abuse' : raw === 'do_not_mail' ? 'do_not_mail' : 'unknown'
    return { status, subStatus: json.sub_status ?? null, provider: 'zerobounce', checkedAt }
  } catch (err) {
    return { status: 'unknown', subStatus: err instanceof Error ? err.message : 'network_error', provider: 'zerobounce', checkedAt }
  }
}
