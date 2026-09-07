/**
 * Supabase service-role client. Server-side only.
 *
 * RLS on the DEAL44 tables is service_role plus an owner SELECT, and there is
 * deliberately NO anon policy — party access is resolved here, by hashing the
 * link token and looking it up. Never import this from a client component.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null

export function getServiceClient(): SupabaseClient {
  if (client) return client
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('supabase_unconfigured: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY missing')
  }
  client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  return client
}

export interface DealRow {
  id: string
  title: string | null
  locale: string
  currency: string
  jurisdiction: string
  deal_type: string
  template_id: string | null
  anchors: Record<string, string>
  status: string
  email: string | null
  user_id: string | null
  activated_at: string | null
  paid_order_id: string | null
  created_at: string
}

export interface PartyRow {
  id: string
  deal_id: string
  role: string
  display_name: string
  email: string
  locale: string
  token_hash: string
  token_cipher: string | null
  token_expires_at: string | null
  alerts_enabled: boolean
  invited_at: string | null
  last_seen_at: string | null
}

export interface TaskRow {
  id: string
  deal_id: string
  key: string
  label_key: string | null
  label_text: string | null
  phase: string
  assignee_role: string
  anchor: string | null
  offset_days: number | null
  day_type: 'business' | 'calendar'
  due_date: string | null
  statutory: boolean
  origin: 'template' | 'manual' | 'extracted'
  status: 'open' | 'done' | 'suggested' | 'dismissed'
  completed_at: string | null
  completed_by: string | null
  sort_order: number
}
