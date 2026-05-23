import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let _service: SupabaseClient | null = null

/** Service-role client. Server-only. Use for writes + RLS-bypassing reads. */
export function serviceSupabase(): SupabaseClient {
  if (_service) return _service
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase env not configured (NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_KEY)')
  _service = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  return _service
}

export const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET ?? 'funnel-uploads'
