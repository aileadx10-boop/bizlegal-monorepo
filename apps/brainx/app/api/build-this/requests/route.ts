import { NextResponse } from 'next/server'
import { getSubscriber } from '@/lib/access'
import { sql } from '@/lib/neon'
import type { BriefStatus } from '@/lib/radar/types'

export const dynamic = 'force-dynamic'

interface RequestRow {
  id: string
  opportunity_id: string
  opportunity_name: string
  opportunity_slug: string | null
  status: BriefStatus
  requested_at: string
  ready_at: string | null
  turnaround_note: string | null
}

export async function GET(): Promise<NextResponse> {
  const subscriber = await getSubscriber()
  if (!subscriber) return NextResponse.json({ ok: false, error: 'not_authenticated' }, { status: 401 })

  const rows = (await sql()`
    select p.id, p.opportunity_id, o.name as opportunity_name, o.slug as opportunity_slug,
           p.status, p.requested_at, p.ready_at, p.turnaround_note
    from products p join opportunities o on o.id = p.opportunity_id
    where p.subscriber_id = ${subscriber.id}::uuid
    order by p.requested_at desc
  `) as unknown as RequestRow[]

  return NextResponse.json({ ok: true, requests: rows })
}
