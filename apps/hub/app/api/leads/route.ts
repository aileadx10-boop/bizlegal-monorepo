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
import { type NurtureVertical } from '@/lib/nurture-state'
import { startDoubleOptIn, originFromHeaders } from '@/lib/newsletter-optin'

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

    // Consent gate (2026-08-14). This used to enqueue the 4-step nurture
    // cadence directly, so filling in any lead form started a sequence of
    // marketing emails the person never agreed to. The cadence is now armed
    // by /api/newsletter/confirm — see activatePendingSubscriptions there,
    // which keys off this `lead:` source prefix.
    const normalizedEmail = email.toLowerCase().trim()
    const leadIdSuffix = source ?? page ?? 'unknown'
    void startDoubleOptIn({
      sb,
      email: normalizedEmail,
      source: `lead:${leadIdSuffix}`,
      verticalInterest: pickVertical(product),
      origin: originFromHeaders(req.headers),
    }).catch((err) => console.warn('[leads] opt-in start failed:', err))

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[leads] Unexpected error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
