/**
 * /api/properties
 *
 * POST — create a trio_properties row (the shared spine for leases + closings)
 * GET  — list properties for an email (query ?email=)
 *
 * No auth yet — email is the identity. A later login pass will backfill
 * user_id. Do not add NOT NULL to user_id.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/db/client'
import { logEventAsync } from '@/lib/ops/log'

export const dynamic = 'force-dynamic'
export const maxDuration = 15

const STATE_RE = /^[A-Z]{2}$/
const ZIP_RE = /^[0-9]{5}(-[0-9]{4})?$/

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const { email, address, city, state, zip } = body as Record<string, unknown>

  if (typeof email !== 'string' || !email.includes('@')) {
    return NextResponse.json({ error: 'email_required' }, { status: 400 })
  }
  if (typeof address !== 'string' || address.trim().length < 5) {
    return NextResponse.json({ error: 'address_required' }, { status: 400 })
  }
  if (state !== undefined && (typeof state !== 'string' || !STATE_RE.test(state))) {
    return NextResponse.json({ error: 'state_must_be_2_letter_uppercase' }, { status: 400 })
  }
  if (zip !== undefined && (typeof zip !== 'string' || !ZIP_RE.test(zip))) {
    return NextResponse.json({ error: 'zip_must_be_5_or_9_digit' }, { status: 400 })
  }

  const db = getServiceClient()
  const { data, error } = await db
    .from('trio_properties')
    .insert({
      email: email.toLowerCase(),
      address: address.trim(),
      city: typeof city === 'string' ? city.trim() || null : null,
      state: typeof state === 'string' ? state : null,
      zip: typeof zip === 'string' ? zip : null,
    })
    .select()
    .single()

  if (error || !data) {
    console.error('[properties] insert failed', error?.message)
    return NextResponse.json({ error: 'db_error' }, { status: 500 })
  }

  logEventAsync({
    type: 'lead.inbound',
    source: 'leaseparse',
    ref_id: data.id,
    email: email.toLowerCase(),
    status: 'ok',
    metadata: { step: 'property_created', address: address.trim() },
  })

  return NextResponse.json({ ok: true, property: data }, { status: 201 })
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const email = req.nextUrl.searchParams.get('email')
  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'email_query_required' }, { status: 400 })
  }

  const db = getServiceClient()
  const { data, error } = await db
    .from('trio_properties')
    .select(`
      id, address, city, state, zip, created_at,
      leaseparse_leases (id, lease_type, confidence_score, engine, parsed_at, created_at),
      closeflow_transactions (id, transaction_type, closing_date, status, created_at)
    `)
    .eq('email', email.toLowerCase())
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('[properties] select failed', error.message)
    return NextResponse.json({ error: 'db_error' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, properties: data ?? [] })
}
