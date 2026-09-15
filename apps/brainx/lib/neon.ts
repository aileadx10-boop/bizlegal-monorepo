import { neon } from '@neondatabase/serverless'
import type { NeonHttpDatabase, NeonQueryFunction } from '@neondatabase/serverless'

// BrainX uses Neon Postgres exclusively — no Supabase.
// Server-only connection; never imported from client components.
// Lazy-init so the Next.js build doesn't need DATABASE_URL present.
let _sql: NeonQueryFunction<false, boolean> | null = null

export function sql() {
  if (_sql) return _sql
  const url = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL
  if (!url) throw new Error('BrainX: missing DATABASE_URL / NEON_DATABASE_URL (server boot)')
  _sql = neon(url)
  return _sql
}

export async function healthCheck(): Promise<boolean> {
  const rows = await sql()`select 1 as ok`
  return rows?.[0]?.ok === 1
}

export type BrainXDb = NeonHttpDatabase
