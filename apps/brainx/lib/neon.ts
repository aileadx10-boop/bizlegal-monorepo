import { neon } from '@neondatabase/serverless'
import type { NeonQueryFunction } from '@neondatabase/serverless'

// BrainX server-only Neon client.
// Lazy-init: Next build works without DATABASE_URL; requests need it.
let _sql: NeonQueryFunction<false, boolean> | null = null

export function sql() {
  if (_sql) return _sql
  const url = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL
  if (!url) throw new Error('BrainX: DATABASE_URL / NEON_DATABASE_URL missing')
  _sql = neon(url)
  return _sql
}

export async function dbHealth(): Promise<{ ok: boolean; db?: string; error?: string }> {
  try {
    const rows = (await sql())`select current_database() as db` as unknown as Array<{ db: string }>
    return { ok: true, db: rows?.[0]?.db }
  } catch (err) {
    return { ok: false, error: String(err).slice(0, 120) }
  }
}
