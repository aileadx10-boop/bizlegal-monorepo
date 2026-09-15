import { neon } from '@neondatabase/serverless'
import type { NeonHttpDatabase } from '@neondatabase/serverless'

// BrainX uses Neon Postgres exclusively — no Supabase.
// Server-only connection; never imported from client components.
// DATABASE_URL must be a Neon pooled/session connection string.
const connectionString = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL
if (!connectionString) {
  throw new Error('BrainX: missing DATABASE_URL / NEON_DATABASE_URL (server boot)')
}

export const sql = neon(connectionString)

let _proxy: NeonHttpDatabase | null = null
export function getDb(): NeonHttpDatabase {
  if (_proxy) return _proxy
  _proxy = {} as NeonHttpDatabase
  return _proxy
}

export async function healthCheck(): Promise<boolean> {
  const rows = await sql`select 1 as ok`
  return rows?.[0]?.ok === 1
}

export type BrainXApiKeyHeader =
  | { authorization?: string }
  | { 'x-internal-key'?: string }
