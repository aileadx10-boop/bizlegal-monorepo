import { createHmac, randomBytes } from 'node:crypto'
export interface Session { email: string; firmName: string; issuedAt: string }
const SECRET = process.env.BIZLEGAL_INBOUND_SECRET ?? 'demo-local-secret-do-not-use-prod'
export function issueToken(session: Session): string {
  const payload = Buffer.from(JSON.stringify(session)).toString('base64url')
  const sig = createHmac('sha256', SECRET).update(payload).digest('base64url')
  return `${payload}.${sig}`
}
export function verifyToken(token: string): Session | null {
  const [payload, sig] = token.split('.')
  if (!payload || !sig) return null
  const expected = createHmac('sha256', SECRET).update(payload).digest('base64url')
  if (expected !== sig) return null
  try { return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) } catch { return null }
}
export function randomToken(prefix = 'cp'): string { return `${prefix}-${randomBytes(12).toString('hex')}` }
