// app/api/leads/route.ts
// Lead capture endpoint — saves to Supabase `leads` table
//
// Required Supabase table (run once in SQL editor):
// CREATE TABLE leads (
//   id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
//   email text NOT NULL,
//   source text,
//   page text,
//   product text,
//   created_at timestamptz DEFAULT now()
// );
// CREATE UNIQUE INDEX leads_email_source_idx ON leads (email, source);

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { logEventAsync } from '@/lib/ops/log'
import { enqueueNurture, type NurtureVertical } from '@/lib/nurture-state'

export const dynamic = 'force-dynamic'

// Map a `product` string from the form payload to a nurture vertical.
// Accepts loose synonyms; falls back to 'generic' so the row still
// gets a welcome email even if the form sent something we don't
// recognize.
function pickVertical(product: string | null | undefined): NurtureVertical {
  if (!product) return 'generic'
  const p = product.toLowerCase()
  if (p.includes('boi')) return 'boi'
  if (p.includes('brai') || p.includes('sanction')) return 'brai'
  if (p.includes('tracr') || p.includes('wallet')) return 'tracr'
  if (p.includes('lexaudit') || p.includes('compliance-monitor')) return 'lexaudit'
  if (p.includes('docai') || p.includes('privacy')) return 'docai'
  if (p.includes('forge')) return 'forge'
  if (p.includes('leadforge')) return 'leadforge'
  if (p.includes('realestate') || p.includes('real-estate')) return 'realestate'
  return 'generic'
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, name, company, jurisdiction, source, page, product } = body

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_KEY
    if (!url || !key) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
    }

    const sb = createClient(url, key)
    const { error } = await sb.from('leads').insert({
      email: email.toLowerCase().trim(),
      name: name ?? null,
      company: company ?? null,
      jurisdiction: jurisdiction ?? null,
      source: source ?? 'unknown',
      page: page ?? '/',
      product: product ?? null,
    })

    // Silently ignore duplicate key errors — don't punish returning users
    if (error && !error.message.includes('duplicate') && !error.message.includes('unique')) {
      console.error('[leads] Supabase error:', error.message)
      return NextResponse.json({ error: 'Failed to save lead' }, { status: 500 })
    }

    logEventAsync({
      type: 'lead.inbound',
      source: 'hub',
      email: email.toLowerCase().trim(),
      status: 'ok',
      metadata: { source: source ?? 'unknown', page, product, jurisdiction, company },
    })

    // Phase AA V3 — enqueue into lead_nurture_state so the CF Worker
    // sends a welcome email in 5 min and runs the 4-step cadence.
    // Fire-and-forget; a Supabase blip on the nurture table must not
    // fail the lead-capture POST.
    const normalizedEmail = email.toLowerCase().trim()
    void enqueueNurture({
      lead_id: `hub-${normalizedEmail}-${source ?? 'unknown'}`,
      email: normalizedEmail,
      vertical: pickVertical(product),
      source: `hub:${source ?? 'unknown'}`,
      lead_classification: { name, company, jurisdiction, page, product },
    }).catch((err) => console.warn('[leads] nurture enqueue failed:', err))

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[leads] Unexpected error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
