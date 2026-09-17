import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'

export interface Session {
  email: string
  firmName: string
  issuedAt: string
  expiresAt: string
  purpose: 'session'
}
interface LoginClaim {
  email: string
  expiresAt: string
  purpose: 'login'
  nonce: string
}

function secret(): string {
  const value = process.env.BIZLEGAL_INBOUND_SECRET
  if (value) return value
  if (process.env.NODE_ENV !== 'production') return 'demo-local-secret-do-not-use-prod'
  throw new Error('BIZLEGAL_INBOUND_SECRET missing')
}

function sign(claim: Session | LoginClaim): string {
  const payload = Buffer.from(JSON.stringify(claim)).toString('base64url')
  const sig = createHmac('sha256', secret()).update(payload).digest('base64url')
  return `${payload}.${sig}`
}

function verify<T extends Session | LoginClaim>(token: string, purpose: T['purpose']): T | null {
  const [payload, sig] = token.split('.')
  if (!payload || !sig) return null
  const expected = createHmac('sha256', secret()).update(payload).digest('base64url')
  const a = Buffer.from(expected)
  const b = Buffer.from(sig)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null
  try {
    const claim = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as T
    if (claim.purpose !== purpose || !claim.expiresAt || Date.parse(claim.expiresAt) <= Date.now()) return null
    return claim
  } catch {
    return null
  }
}

export function issueSession(email: string, firmName?: string): string {
  const now = new Date()
  return sign({
    email: email.toLowerCase(),
    firmName: firmName ?? email.split('@')[0] ?? 'Firm',
    issuedAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    purpose: 'session',
  })
}

export function issueLoginToken(email: string): string {
  return sign({
    email: email.toLowerCase(),
    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    purpose: 'login',
    nonce: randomBytes(16).toString('hex'),
  })
}

export function verifyToken(token: string): Session | null {
  return verify<Session>(token, 'session')
}
export function verifyLoginToken(token: string): LoginClaim | null {
  return verify<LoginClaim>(token, 'login')
}

export function issuePublicPageToken(pageId: string): string {
  const payload = Buffer.from(pageId).toString('base64url')
  const sig = createHmac('sha256', secret()).update(`public:${payload}`).digest('base64url')
  return `${payload}.${sig}`
}

export function verifyPublicPageToken(token: string): string | null {
  const [payload, sig] = token.split('.')
  if (!payload || !sig) return null
  const expected = createHmac('sha256', secret()).update(`public:${payload}`).digest('base64url')
  const a = Buffer.from(expected)
  const b = Buffer.from(sig)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null
  try {
    return Buffer.from(payload, 'base64url').toString('utf8')
  } catch {
    return null
  }
}

export function randomToken(prefix = 'cp'): string { return `${prefix}-${randomBytes(12).toString('hex')}` }
