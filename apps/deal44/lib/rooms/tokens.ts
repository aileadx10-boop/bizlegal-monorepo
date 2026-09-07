/**
 * Per-party access tokens.
 *
 * The raw token exists only in the link we email. What the database stores is
 * its SHA-256, so a leak of the table does not hand over access to anyone's
 * transaction. This is the deliberate difference from `deal_rooms.token`, which
 * is stored in the clear and readable by any anon client through a
 * `USING (true)` policy.
 *
 * 192 bits of randomness: guessing is not a threat model, forwarding is.
 */

import crypto from 'node:crypto'

const TOKEN_BYTES = 24

export function mintToken(): string {
  return crypto.randomBytes(TOKEN_BYTES).toString('base64url')
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token, 'utf8').digest('hex')
}

/** Rooms stay readable for a while after delivery, then the link dies. */
export function tokenExpiryFor(closingIso: string | null | undefined, days = 90): string | null {
  if (!closingIso) return null
  const base = new Date(`${closingIso.slice(0, 10)}T00:00:00.000Z`)
  if (Number.isNaN(base.getTime())) return null
  return new Date(base.getTime() + days * 86_400_000).toISOString()
}

export function isExpired(expiresAt: string | null, now: Date = new Date()): boolean {
  if (!expiresAt) return false
  const t = new Date(expiresAt).getTime()
  return !Number.isNaN(t) && t < now.getTime()
}

/**
 * Reversible token storage for the digest cron.
 *
 * The hash above is one-way, which is what we want for lookup — but the daily
 * digest has to rebuild each party's own link, and you cannot un-hash. So the
 * same token is also stored AES-256-GCM encrypted under a key that lives in the
 * environment, never in the database.
 *
 * That keeps the property that actually matters: a dump of `deal_parties` is not
 * enough to enter anyone's room. An attacker needs the row AND the server key.
 *
 * With no key configured, `encryptToken` returns null and the digest simply
 * omits the button. Degrading to "no link in the email" is correct; guessing a
 * link is not.
 */

const CIPHER = 'aes-256-gcm'

function keyBytes(): Buffer | null {
  const raw = process.env.DEAL44_TOKEN_KEY
  if (!raw) return null
  const buf = /^[0-9a-fA-F]{64}$/.test(raw) ? Buffer.from(raw, 'hex') : Buffer.from(raw, 'base64')
  return buf.length === 32 ? buf : null
}

export function encryptToken(token: string): string | null {
  const key = keyBytes()
  if (!key) return null
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv(CIPHER, key, iv)
  const enc = Buffer.concat([cipher.update(token, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return [iv.toString('base64url'), enc.toString('base64url'), tag.toString('base64url')].join('.')
}

export function decryptToken(payload: string | null | undefined): string | null {
  const key = keyBytes()
  if (!key || !payload) return null
  const parts = payload.split('.')
  if (parts.length !== 3) return null
  try {
    const [ivB64, dataB64, tagB64] = parts as [string, string, string]
    const decipher = crypto.createDecipheriv(CIPHER, key, Buffer.from(ivB64, 'base64url'))
    decipher.setAuthTag(Buffer.from(tagB64, 'base64url'))
    const dec = Buffer.concat([decipher.update(Buffer.from(dataB64, 'base64url')), decipher.final()])
    return dec.toString('utf8')
  } catch {
    // A wrong key or a tampered row must look like "no link", never like a
    // usable one.
    return null
  }
}
