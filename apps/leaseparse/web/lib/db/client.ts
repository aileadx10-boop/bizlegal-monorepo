/**
 * Supabase service-role client for LeaseParse server routes.
 *
 * Uses SUPABASE_SERVICE_KEY (not the anon key) so RLS is bypassed at the
 * server level — all user-scoping is done explicitly in queries.
 *
 * NEVER import this in client components or expose the service key to
 * the browser. Server-side (route handlers + Server Components) only.
 *
 * Required envs: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_KEY
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | null = null

export function getServiceClient(): SupabaseClient {
  if (_client) return _client
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('supabase_unconfigured: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY missing')
  }
  _client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return _client
}

// ─── Row types matching migrations ─────────────────────────────────────────

export interface DdProperty {
  id: string
  user_id: string | null
  email: string | null
  address: string
  city: string | null
  state: string | null
  zip: string | null
  lat: number | null
  lon: number | null
  created_at: string
}

export interface DdLease {
  id: string
  property_id: string | null
  user_id: string | null
  email: string | null
  pdf_url: string | null
  lease_type: 'retail' | 'office' | 'industrial' | 'other' | null
  extracted_json: unknown | null
  confidence_score: number | null
  engine: 'hermes' | 'claude' | null
  critical_dates: unknown[]
  risk_flags: unknown[]
  parsed_at: string | null
  created_at: string
}

export interface DdTransaction {
  id: string
  property_id: string | null
  user_id: string | null
  email: string | null
  transaction_type: 'residential_purchase' | 'residential_refi' | 'commercial' | 'exchange_1031'
  closing_date: string
  status: 'active' | 'closed' | 'cancelled' | 'archived'
  checklist: unknown[]
  documents_required: unknown[]
  documents_uploaded: unknown[]
  created_at: string
  closed_at: string | null
}
