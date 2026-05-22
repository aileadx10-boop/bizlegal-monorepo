/**
 * Affiliate attribution helpers — cookie read/write + code generator.
 *
 * Cookie: `bz_aff=<8-char-code>` with 90-day Max-Age, SameSite=Lax,
 * Secure, Path=/. Set on first hit to /api/affiliates/track/<code>;
 * read on every checkout to write `payment_orders.affiliate_code`.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export const AFFILIATE_COOKIE = 'bz_aff'
export const AFFILIATE_COOKIE_MAX_AGE_SEC = 90 * 24 * 60 * 60 // 90 days

let _client: SupabaseClient | null = null

function getClient(): SupabaseClient | null {
  if (_client) return _client
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  _client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  return _client
}

/** 8-char URL-safe code: lowercase alphanumeric (no l/i/o/0/1 to avoid ambiguity) */
export function generateAffiliateCode(): string {
  const alphabet = 'abcdefghjkmnpqrstuvwxyz23456789'
  const bytes = new Uint8Array(8)
  crypto.getRandomValues(bytes)
  let out = ''
  for (let i = 0; i < 8; i++) out += alphabet[bytes[i]! % alphabet.length]
  return out
}

/** Server-side: read affiliate code from request cookies. */
export function readAffiliateCode(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null
  const match = cookieHeader.split(';').find((c) => c.trim().startsWith(`${AFFILIATE_COOKIE}=`))
  if (!match) return null
  const val = match.split('=')[1]?.trim() ?? ''
  return /^[a-z0-9]{8}$/.test(val) ? val : null
}

/** Build the Set-Cookie header string (90-day attribution window). */
export function affiliateCookieHeader(code: string): string {
  return `${AFFILIATE_COOKIE}=${code}; Max-Age=${AFFILIATE_COOKIE_MAX_AGE_SEC}; Path=/; SameSite=Lax; Secure; HttpOnly`
}

/** SHA-256 hex helper for pseudonymous click telemetry (no raw PII). */
export async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input))
  const bytes = new Uint8Array(buf)
  let hex = ''
  for (let i = 0; i < bytes.length; i++) hex += (bytes[i] ?? 0).toString(16).padStart(2, '0')
  return hex
}

export interface AffiliateRow {
  readonly code: string
  readonly email: string
  readonly display_name: string | null
  readonly status: string
  readonly balance_cents: number
  readonly lifetime_paid_cents: number
  readonly rate_pct_first_mo: number
  readonly rate_pct_recurring: number
  readonly rate_pct_onetime: number
  readonly created_at: string
}

export async function getAffiliate(code: string): Promise<AffiliateRow | null> {
  const supabase = getClient()
  if (!supabase) return null
  const { data, error } = await supabase
    .from('affiliates')
    .select('code, email, display_name, status, balance_cents, lifetime_paid_cents, rate_pct_first_mo, rate_pct_recurring, rate_pct_onetime, created_at')
    .eq('code', code)
    .maybeSingle()
  if (error) return null
  return (data ?? null) as AffiliateRow | null
}

export async function createAffiliate(email: string, displayName: string | null, payoutAddress: string | null): Promise<AffiliateRow | null> {
  const supabase = getClient()
  if (!supabase) return null
  // Loop on collision (extremely rare — 31^8 = ~852B codes)
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateAffiliateCode()
    const { data, error } = await supabase
      .from('affiliates')
      .insert({
        code,
        email: email.toLowerCase(),
        display_name: displayName,
        payout_address: payoutAddress,
      })
      .select('code, email, display_name, status, balance_cents, lifetime_paid_cents, rate_pct_first_mo, rate_pct_recurring, rate_pct_onetime, created_at')
      .single()
    if (!error && data) return data as AffiliateRow
    if (error && error.code !== '23505') return null // not unique-violation: real error
  }
  return null
}

export async function recordClick(
  code: string,
  ipHash: string | null,
  uaHash: string | null,
  refererHost: string | null,
  landingPath: string | null,
): Promise<void> {
  const supabase = getClient()
  if (!supabase) return
  await supabase.from('affiliate_clicks').insert({
    code,
    ip_hash: ipHash,
    ua_hash: uaHash,
    referer_host: refererHost,
    landing_path: landingPath,
  })
}

/** Used by the Friday reconciler — sums attributed payments per affiliate. */
export interface AttributedSale {
  readonly affiliate_code: string
  readonly product: string
  readonly tier: string
  readonly billing_interval: string
  readonly amount_cents: number
  readonly created_at: string
  readonly is_first_charge: boolean
}

export async function fetchUnreconciledAttributedSales(sinceIso: string): Promise<ReadonlyArray<AttributedSale>> {
  const supabase = getClient()
  if (!supabase) return []
  const { data } = await supabase
    .from('payment_orders')
    .select('affiliate_code, product, tier, billing_interval, amount_cents, created_at, activated_at, last_charge_at')
    .not('affiliate_code', 'is', null)
    .in('status', ['active', 'paid'])
    .gte('activated_at', sinceIso)
    .order('activated_at', { ascending: false })
    .limit(500)
  if (!data) return []
  return data.map((row) => ({
    affiliate_code: row.affiliate_code as string,
    product: (row.product ?? '') as string,
    tier: (row.tier ?? '') as string,
    billing_interval: (row.billing_interval ?? 'one-time') as string,
    amount_cents: (row.amount_cents ?? 0) as number,
    created_at: (row.activated_at ?? row.created_at) as string,
    is_first_charge: row.activated_at === row.last_charge_at || row.last_charge_at === null,
  }))
}

export function calculateCommissionCents(sale: AttributedSale, aff: AffiliateRow): number {
  if (sale.billing_interval === 'one-time') {
    return Math.floor(sale.amount_cents * Number(aff.rate_pct_onetime) / 100)
  }
  if (sale.is_first_charge) {
    return Math.floor(sale.amount_cents * Number(aff.rate_pct_first_mo) / 100)
  }
  return Math.floor(sale.amount_cents * Number(aff.rate_pct_recurring) / 100)
}
