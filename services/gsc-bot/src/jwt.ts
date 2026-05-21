/**
 * RS256 JWT signer for Google service-account auth.
 * Uses Web Crypto (SubtleCrypto) — the only crypto primitive available
 * inside a Cloudflare Worker. Same approach Google's own JS libraries
 * use under their `web` runtime entry point.
 */

interface ServiceAccountJson {
  readonly client_email: string
  readonly private_key: string
  readonly token_uri: string
}

interface AccessTokenResponse {
  readonly access_token: string
  readonly expires_in: number
  readonly token_type: string
}

const SCOPE = 'https://www.googleapis.com/auth/webmasters'

function base64UrlEncode(input: ArrayBuffer | string): string {
  const bytes =
    typeof input === 'string'
      ? new TextEncoder().encode(input)
      : new Uint8Array(input)
  let bin = ''
  for (let i = 0; i < bytes.length; i++) {
    bin += String.fromCharCode(bytes[i] ?? 0)
  }
  return btoa(bin).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_')
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const body = pem
    .replace(/-----BEGIN [^-]+-----/g, '')
    .replace(/-----END [^-]+-----/g, '')
    .replace(/\s+/g, '')
  const binary = atob(body)
  const buf = new ArrayBuffer(binary.length)
  const view = new Uint8Array(buf)
  for (let i = 0; i < binary.length; i++) view[i] = binary.charCodeAt(i)
  return buf
}

async function importPrivateKey(pem: string): Promise<CryptoKey> {
  const keyBuffer = pemToArrayBuffer(pem)
  return crypto.subtle.importKey(
    'pkcs8',
    keyBuffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  )
}

async function signJwt(sa: ServiceAccountJson): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const header = { alg: 'RS256', typ: 'JWT' }
  const claims = {
    iss: sa.client_email,
    scope: SCOPE,
    aud: sa.token_uri,
    iat: now,
    exp: now + 3600,
  }

  const signingInput = `${base64UrlEncode(JSON.stringify(header))}.${base64UrlEncode(JSON.stringify(claims))}`
  const key = await importPrivateKey(sa.private_key)
  const sig = await crypto.subtle.sign(
    { name: 'RSASSA-PKCS1-v1_5' },
    key,
    new TextEncoder().encode(signingInput),
  )
  return `${signingInput}.${base64UrlEncode(sig)}`
}

/** Exchange a service-account JWT for a short-lived OAuth access token. */
export async function getAccessToken(saJson: string): Promise<string> {
  let sa: ServiceAccountJson
  try {
    sa = JSON.parse(saJson) as ServiceAccountJson
  } catch {
    throw new Error('GSC_SERVICE_ACCOUNT_JSON is not valid JSON')
  }
  if (!sa.private_key || !sa.client_email || !sa.token_uri) {
    throw new Error('Service account JSON missing private_key, client_email, or token_uri')
  }

  const assertion = await signJwt(sa)
  const res = await fetch(sa.token_uri, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Google token endpoint ${res.status}: ${body.slice(0, 200)}`)
  }
  const data = (await res.json()) as AccessTokenResponse
  return data.access_token
}
