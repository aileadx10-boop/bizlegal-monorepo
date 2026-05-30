import { getSupabaseAdmin } from './supabase'
import type { ConductorProfile } from './auth'

export const TIER_LIMITS = {
  solo: { scans_per_month: 10, drafts_per_month: 5, seats: 1 },
  team: { scans_per_month: 50, drafts_per_month: 50, seats: 50 },
  firm: { scans_per_month: Infinity, drafts_per_month: Infinity, seats: Infinity },
} as const

export type TierName = keyof typeof TIER_LIMITS

export interface TierCheckResult {
  allowed: boolean
  remaining: number
  tier: TierName
  limit: number
  used: number
}

export async function checkTierAccess(
  userId: string,
  action: 'scan' | 'draft'
): Promise<TierCheckResult> {
  const admin = getSupabaseAdmin()
  const { data: profile } = await admin
    .from('conductor_profiles')
    .select('tier, scans_this_month, drafts_this_month')
    .eq('id', userId)
    .single()

  if (!profile) {
    return { allowed: false, remaining: 0, tier: 'solo', limit: 0, used: 0 }
  }

  const tier = profile.tier as TierName
  const limits = TIER_LIMITS[tier]
  const limitKey = action === 'scan' ? 'scans_per_month' : 'drafts_per_month'
  const usedKey = action === 'scan' ? 'scans_this_month' : 'drafts_this_month'
  const limit = limits[limitKey]
  const used = profile[usedKey] as number
  const remaining = Math.max(0, limit - used)

  return { allowed: used < limit, remaining, tier, limit, used }
}

export async function incrementUsage(userId: string, action: 'scan' | 'draft'): Promise<void> {
  const admin = getSupabaseAdmin()
  const column = action === 'scan' ? 'scans_this_month' : 'drafts_this_month'

  const { data: profile } = await admin
    .from('conductor_profiles')
    .select(column)
    .eq('id', userId)
    .single<Record<string, number>>()

  if (!profile) return

  await admin
    .from('conductor_profiles')
    .update({ [column]: (profile[column] ?? 0) + 1, updated_at: new Date().toISOString() })
    .eq('id', userId)
}

const TIER_RANK: Record<TierName, number> = { solo: 0, team: 1, firm: 2 }

export async function requireTier(userId: string, minTier: TierName): Promise<ConductorProfile> {
  const admin = getSupabaseAdmin()
  const { data: profile } = await admin
    .from('conductor_profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (!profile) throw new Response('Profile not found', { status: 404 })

  const currentRank = TIER_RANK[profile.tier as TierName] ?? 0
  const requiredRank = TIER_RANK[minTier]
  if (currentRank < requiredRank) {
    throw new Response(
      JSON.stringify({ error: 'tier_insufficient', required: minTier, current: profile.tier }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    )
  }
  return profile as ConductorProfile
}

export async function resetMonthlyUsage(): Promise<number> {
  const admin = getSupabaseAdmin()
  const { data, error } = await admin
    .from('conductor_profiles')
    .update({
      scans_this_month: 0,
      drafts_this_month: 0,
      billing_cycle_start: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .lt('billing_cycle_start', new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString())
    .select('id')

  if (error) throw error
  return data?.length ?? 0
}
