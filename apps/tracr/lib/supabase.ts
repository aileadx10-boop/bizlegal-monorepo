import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Lazy singleton — avoids build-time errors when env vars are not present
let _supabase: SupabaseClient | null = null
let _supabaseAdmin: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return _supabase
}

export function getSupabaseAdmin(): SupabaseClient {
  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  return _supabaseAdmin
}

// Eager exports — only used client-side where NEXT_PUBLIC_ vars are available at build time
export const supabase = {
  from: (...args: Parameters<SupabaseClient['from']>) => getSupabase().from(...args),
  auth: new Proxy({} as SupabaseClient['auth'], {
    get: (_t, prop) => (...a: unknown[]) => (getSupabase().auth as unknown as Record<string, (...args: unknown[]) => unknown>)[prop as string](...a),
  }),
}

export const supabaseAdmin = {
  from: (...args: Parameters<SupabaseClient['from']>) => getSupabaseAdmin().from(...args),
  storage: new Proxy({} as SupabaseClient['storage'], {
    get: (_t, prop) => (...a: unknown[]) => (getSupabaseAdmin().storage as unknown as Record<string, (...args: unknown[]) => unknown>)[prop as string](...a),
  }),
}

// Re-export CRM helpers for backward compatibility
export * from './crm-helpers'
