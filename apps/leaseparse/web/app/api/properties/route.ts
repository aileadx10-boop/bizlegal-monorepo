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

const COUNTRY_RE = /^[A-Z]{2}$/
// US callers may keep sending state/zip; they map onto region/postcode. Both
// are free-form now because Dubai — the first jurisdiction pack — has neither a
// 2-letter state nor a numeric postcode.
const US_STATE_RE = /^[A-Z]{2}$/
const US_ZIP_RE = /^[0-9]{5}(-[0-9]{4})?$/

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const b = body as Record<string, unknown>
  const { email, address, city } = b
  // `state`/`zip` are the legacy US field names; `region`/`postcode` are the
  // jurisdiction-neutral ones. Accept either.
  const region = b.region ?? b.state
  const postcode = b.postcode ?? b.zip
  const country = typeof b.country === 'string' ? b.country.toUpperCase() : 'US'

  if (typeof email !== 'string' || !email.includes('@')) {
    return NextResponse.json({ error: 'email_required' }, { status: 400 })
  }
  if (typeof address !== 'string' || address.trim().length < 5) {
    return NextResponse.json({ error: 'address_required' }, { status: 400 })
  }
  if (!COUNTRY_RE.test(country)) {
    return NextResponse.json({ error: 'country_must_be_iso_3166_alpha_2' }, { status: 400 })
  }
  if (region !== undefined && typeof region !== 'string') {
    return NextResponse.json({ error: 'region_must_be_string' }, { status: 400 })
  }
  if (postcode !== undefined && typeof postcode !== 'string') {
    return NextResponse.json({ error: 'postcode_must_be_string' }, { status: 400 })
  }
  // Shape is only enforced for US addresses, where it is meaningful. A Dubai
  // property has no state and no postcode, and must not be rejected for it.
  if (country === 'US') {
    if (typeof region === 'string' && !US_STATE_RE.test(region)) {
      return NextResponse.json({ error: 'us_state_must_be_2_letter_uppercase' }, { status: 400 })
    }
    if (typeof postcode === 'string' && !US_ZIP_RE.test(postcode)) {
      return NextResponse.json({ error: 'us_zip_must_be_5_or_9_digit' }, { status: 400 })
    }
  }

  const db = getServiceClient()
  const { data, error } = await db
    .from('trio_properties')
    .insert({
      email: email.toLowerCase(),
      address: address.trim(),
      city: typeof city === 'string' ? city.trim() || null : null,
      country,
      region: typeof region === 'string' ? region.trim() || null : null,
      postcode: typeof postcode === 'string' ? postcode.trim() || null : null,
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
      id, address, city, country, region, postcode, created_at,
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
