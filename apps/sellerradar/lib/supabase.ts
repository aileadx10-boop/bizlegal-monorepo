import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Lazy singleton — avoids build-time errors when env vars are not present
let _supabaseAdmin: SupabaseClient | null = null

export function getSupabaseAdmin(): SupabaseClient {
  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      (process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY)!
    )
  }
  return _supabaseAdmin
}

// Eager-shaped export — the underlying client is created lazily on first use
export const supabaseAdmin = {
  from: (...args: Parameters<SupabaseClient['from']>) => getSupabaseAdmin().from(...args),
}
