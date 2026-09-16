import { NextRequest, NextResponse } from 'next/server'
import { getSubscriber } from '@/lib/access'
import { sql } from '@/lib/neon'

export const dynamic = 'force-dynamic'

const MAX_PROFILES = 5

interface CreateBody {
  market_slug?: unknown
  label?: unknown
  keywords?: unknown
}

export async function GET(): Promise<NextResponse> {
  const subscriber = await getSubscriber()
  if (!subscriber) return NextResponse.json({ ok: false, error: 'not_authenticated' }, { status: 401 })

  const rows = (await sql()`
    select p.id, m.slug as market_slug, m.name as market_name, p.label, p.keywords
    from radar_profiles p join markets m on m.id = p.market_id
    where p.subscriber_id = ${subscriber.id}::uuid
    order by p.created_at asc
  `) as unknown as Array<{ id: string; market_slug: string; market_name: string; label: string; keywords: string[] }>

  return NextResponse.json({ ok: true, profiles: rows, limit: MAX_PROFILES })
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const subscriber = await getSubscriber()
  if (!subscriber) return NextResponse.json({ ok: false, error: 'not_authenticated' }, { status: 401 })

  let body: CreateBody
  try {
    body = (await req.json()) as CreateBody
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 })
  }
  const marketSlug = typeof body.market_slug === 'string' ? body.market_slug : ''
  const label = typeof body.label === 'string' ? body.label.trim().slice(0, 120) : ''
  const keywords = Array.isArray(body.keywords) ? body.keywords.filter((k): k is string => typeof k === 'string').slice(0, 10) : []
  if (!marketSlug || !label) return NextResponse.json({ ok: false, error: 'market_slug and label required' }, { status: 400 })

  const countRows = (await sql()`select count(*)::int as n from radar_profiles where subscriber_id = ${subscriber.id}::uuid`) as unknown as Array<{ n: number }>
  if ((countRows?.[0]?.n ?? 0) >= MAX_PROFILES) {
    return NextResponse.json({ ok: false, error: 'profile_limit_reached', limit: MAX_PROFILES }, { status: 402 })
  }

  const marketRows = (await sql()`select id from markets where slug = ${marketSlug} limit 1`) as unknown as Array<{ id: string }>
  const marketId = marketRows?.[0]?.id
  if (!marketId) return NextResponse.json({ ok: false, error: 'unknown_market' }, { status: 400 })

  try {
    const rows = (await sql()`
      insert into radar_profiles (subscriber_id, market_id, label, keywords)
      values (${subscriber.id}::uuid, ${marketId}::uuid, ${label}, ${keywords})
      returning id
    `) as unknown as Array<{ id: string }>
    return NextResponse.json({ ok: true, id: rows[0]!.id }, { status: 201 })
  } catch (err) {
    const code = (err as { code?: string })?.code
    if (code === '23505') return NextResponse.json({ ok: false, error: 'duplicate_profile' }, { status: 409 })
    throw err
  }
}
