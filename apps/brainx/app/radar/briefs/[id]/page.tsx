import { notFound } from 'next/navigation'
import { getSubscriber } from '@/lib/access'
import { sql } from '@/lib/neon'
import BriefView from '@/app/components/build-this/BriefView'
import type { BriefVM, BriefStatus, Brief } from '@/lib/radar/types'

export const dynamic = 'force-dynamic'

interface Row {
  id: string
  opportunity_id: string
  opportunity_slug: string | null
  opportunity_name: string
  status: BriefStatus
  requested_at: string
  ready_at: string | null
  turnaround_note: string | null
  brief: Brief | null
  review: { text: string; reviewed_at: string } | null
}

export default async function BriefDetailPage({ params }: { params: { id: string } }) {
  const subscriber = await getSubscriber()
  if (!subscriber) return null
  if (!/^[0-9a-f-]{36}$/i.test(params.id)) notFound()

  const rows = (await sql()`
    select p.id, p.opportunity_id, o.slug as opportunity_slug, o.name as opportunity_name,
           p.status, p.requested_at, p.ready_at, p.turnaround_note, p.brief, p.review
    from products p join opportunities o on o.id = p.opportunity_id
    where p.id = ${params.id}::uuid and p.subscriber_id = ${subscriber.id}::uuid
    limit 1
  `) as unknown as Row[]
  const row = rows?.[0]
  if (!row) notFound()

  const brief: BriefVM = {
    id: row.id,
    opportunity_id: row.opportunity_id,
    opportunity_slug: row.opportunity_slug ?? row.opportunity_id,
    opportunity_name: row.opportunity_name,
    status: row.status,
    requested_at: row.requested_at,
    ready_at: row.ready_at,
    turnaround_note: row.turnaround_note ?? 'Within 3 business days.',
    brief: row.brief,
    review: row.review,
  }

  return (
    <div className="bx-container" style={{ maxWidth: 780 }}>
      <BriefView brief={brief} />
    </div>
  )
}
