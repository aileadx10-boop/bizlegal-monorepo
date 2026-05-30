import { createServerClient as createSSRClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getSupabaseAdmin } from './supabase'

type CookieStore = ReturnType<typeof cookies>

export function createServerClient(cookieStore: CookieStore) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return createSSRClient(url, anon, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        try { cookieStore.set({ name, value, ...options }) } catch { /* read-only in RSC */ }
      },
      remove(name: string, options: CookieOptions) {
        try { cookieStore.set({ name, value: '', ...options }) } catch { /* read-only in RSC */ }
      },
    },
  })
}

export interface SessionResult {
  user: { id: string; email: string }
  session: unknown
}

export async function getSession(): Promise<SessionResult | null> {
  const supabase = createServerClient(cookies())
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error || !session?.user?.email) return null
  return { user: { id: session.user.id, email: session.user.email }, session }
}

export async function requireSession(): Promise<SessionResult> {
  const result = await getSession()
  if (!result) throw new Response('Unauthorized', { status: 401 })
  return result
}

export interface ConductorProfile {
  id: string
  email: string
  display_name: string | null
  tier: 'solo' | 'team' | 'firm'
  firm_name: string | null
  seats_used: number
  seats_max: number
  scans_this_month: number
  drafts_this_month: number
  billing_cycle_start: string
}

export async function getUserProfile(userId: string): Promise<ConductorProfile | null> {
  const admin = getSupabaseAdmin()
  const { data, error } = await admin
    .from('conductor_profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error || !data) return null
  return data as ConductorProfile
}

type TierName = 'solo' | 'team' | 'firm'

const SEATS_MAX_BY_TIER: Record<TierName, number> = { solo: 1, team: 5, firm: 999 }

/**
 * Derive the entitled tier from the shared payment_orders ledger that the
 * hub checkout writes (product='conductor'). This is a read-through grant:
 * a paid Conductor subscription lifts the tier at next login. We deliberately
 * do NOT mutate the hub payment webhook — entitlement is derived, not pushed,
 * so the live payment flow stays untouched. Falls back to 'solo' on any error.
 */
async function resolveEntitledTier(email: string): Promise<TierName> {
  try {
    const admin = getSupabaseAdmin()
    const { data } = await admin
      .from('payment_orders')
      .select('tier')
      .ilike('user_email', email)
      .eq('product', 'conductor')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle<{ tier: string | null }>()
    const tier = data?.tier
    return tier === 'team' || tier === 'firm' ? tier : 'solo'
  } catch {
    return 'solo'
  }
}

export async function ensureProfile(user: { id: string; email: string }): Promise<ConductorProfile> {
  const admin = getSupabaseAdmin()
  const tier = await resolveEntitledTier(user.email)

  const { data, error } = await admin
    .from('conductor_profiles')
    .upsert(
      { id: user.id, email: user.email, tier, seats_max: SEATS_MAX_BY_TIER[tier], updated_at: new Date().toISOString() },
      { onConflict: 'id' }
    )
    .select('*')
    .single()

  if (error) {
    const existing = await getUserProfile(user.id)
    if (existing) return existing
    throw new Error(`Failed to ensure profile: ${error.message}`)
  }
  return data as ConductorProfile
}
