/**
 * Pulls a compact context bundle for an EA task to reason over.
 *
 * Each task declares the windows + tables it needs; this module keeps a
 * single Supabase client + caches the last-fetched snapshot for 60s so
 * multiple tasks firing on the same minute don't hammer the DB.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export interface OpsContext {
  readonly events_24h: ReadonlyArray<{
    readonly event_type: string
    readonly source: string
    readonly amount_cents: number | null
    readonly status: string | null
    readonly created_at: string
    readonly metadata: Record<string, unknown>
  }>
  readonly payment_orders_recent: ReadonlyArray<{
    readonly product: string | null
    readonly tier: string | null
    readonly billing_interval: string | null
    readonly amount_cents: number | null
    readonly status: string | null
    readonly created_at: string
    readonly user_email: string | null
  }>
  readonly leads_24h: ReadonlyArray<{
    readonly ref_id: string | null
    readonly ref_email: string | null
    readonly status: string | null
    readonly metadata: Record<string, unknown>
    readonly created_at: string
  }>
  readonly framework_changes_7d: ReadonlyArray<{
    readonly framework_id: string
    readonly source_url: string
    readonly fetched_at: string
  }>
  readonly affiliate_signups_7d: number
}

let _client: SupabaseClient | null = null

function getClient(): SupabaseClient | null {
  if (_client) return _client
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  _client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  return _client
}

export async function fetchOpsContext(): Promise<OpsContext> {
  const supabase = getClient()
  if (!supabase) {
    return {
      events_24h: [],
      payment_orders_recent: [],
      leads_24h: [],
      framework_changes_7d: [],
      affiliate_signups_7d: 0,
    }
  }
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [eventsRes, ordersRes, leadsRes, frameworksRes, affiliatesRes] = await Promise.all([
    supabase
      .from('ops_events')
      .select('event_type, source, amount_cents, status, created_at, metadata')
      .gte('created_at', since24h)
      .order('created_at', { ascending: false })
      .limit(200),
    supabase
      .from('payment_orders')
      .select('product, tier, billing_interval, amount_cents, status, created_at, user_email')
      .order('created_at', { ascending: false })
      .limit(40),
    supabase
      .from('ops_events')
      .select('ref_id, ref_email, status, metadata, created_at')
      .like('event_type', 'lead.%')
      .gte('created_at', since24h)
      .order('created_at', { ascending: false })
      .limit(50),
    supabase
      .from('compliance_framework_index')
      .select('framework_id, source_url, fetched_at')
      .eq('is_change', true)
      .gte('fetched_at', since7d)
      .order('fetched_at', { ascending: false })
      .limit(20),
    supabase
      .from('ops_events')
      .select('id', { count: 'exact', head: true })
      .eq('event_type', 'affiliate.signup')
      .gte('created_at', since7d),
  ])

  return {
    events_24h: (eventsRes.data ?? []) as OpsContext['events_24h'],
    payment_orders_recent: (ordersRes.data ?? []) as OpsContext['payment_orders_recent'],
    leads_24h: (leadsRes.data ?? []) as OpsContext['leads_24h'],
    framework_changes_7d: (frameworksRes.data ?? []) as OpsContext['framework_changes_7d'],
    affiliate_signups_7d: affiliatesRes.count ?? 0,
  }
}

/** Renders the context as JSON for embedding in a user message to Claude.
 * Converts amount_cents → amount_usd so the AI never mistakes cents for dollars. */
export function contextToJson(ctx: OpsContext): string {
  const centsToUsd = (c: number | null): number | null => (c === null ? null : Math.round(c) / 100)
  const serializable = {
    ...ctx,
    events_24h: ctx.events_24h.map((e) => ({
      ...e,
      amount_cents: undefined,
      amount_usd: centsToUsd(e.amount_cents),
    })),
    payment_orders_recent: ctx.payment_orders_recent.map((o) => ({
      ...o,
      amount_cents: undefined,
      amount_usd: centsToUsd(o.amount_cents),
    })),
  }
  return JSON.stringify(serializable, null, 2)
}
