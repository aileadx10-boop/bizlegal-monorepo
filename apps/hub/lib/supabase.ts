import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Lazy-initialized clients. Module-top eager init + throw broke
// Next.js's build-time "Collecting page data" pass when env vars
// weren't injected. Now we defer init until first property access:
// during build the proxy is never accessed, so build succeeds; at
// request time the proxy lazily creates the real client and any
// missing env throws then (where it's actually relevant).
function lazyClient(keyResolver: () => string | undefined): SupabaseClient {
  let real: SupabaseClient | null = null
  const init = (): SupabaseClient => {
    if (real) return real
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = keyResolver()
    if (!url || !key) {
      throw new Error('Missing required Supabase environment variables (runtime)')
    }
    real = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
    return real
  }
  return new Proxy({} as SupabaseClient, {
    get(_target, prop) {
      const client = init()
      const value = (client as unknown as Record<string | symbol, unknown>)[prop]
      return typeof value === 'function' ? (value as (...a: unknown[]) => unknown).bind(client) : value
    },
  }) as SupabaseClient
}

export const supabase = lazyClient(() => process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
export const supabaseAdmin = lazyClient(() => process.env.SUPABASE_SERVICE_KEY)
