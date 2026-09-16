import Link from 'next/link'
import { getSubscriber } from '@/lib/access'
import { sql } from '@/lib/neon'
import type { BriefStatus } from '@/lib/radar/types'

export const dynamic = 'force-dynamic'

interface Row {
  id: string
  opportunity_name: string
  status: BriefStatus
  requested_at: string
  ready_at: string | null
}

const STATUS_LABEL: Record<BriefStatus, string> = {
  requested: 'Requested',
  in_progress: 'In progress',
  ready: 'Ready',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

export default async function BriefsPage() {
  const subscriber = await getSubscriber()
  if (!subscriber) return null

  const rows = (await sql()`
    select p.id, o.name as opportunity_name, p.status, p.requested_at, p.ready_at
    from products p join opportunities o on o.id = p.opportunity_id
    where p.subscriber_id = ${subscriber.id}::uuid
    order by p.requested_at desc
  `) as unknown as Row[]

  return (
    <div className="bx-container" style={{ maxWidth: 760 }}>
      <h1 className="bx-h2" style={{ fontSize: 26, marginBottom: 20 }}>BUILD THIS briefs</h1>
      {rows.length === 0 ? (
        <p className="bx-muted">No briefs requested yet. Open an opportunity on your <Link href="/radar" className="bx-link">radar</Link> and request BUILD THIS.</p>
      ) : (
        <div className="bx-grid" style={{ gap: 12 }}>
          {rows.map((r) => (
            <Link key={r.id} href={`/radar/briefs/${r.id}`} className="bx-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', textDecoration: 'none' }}>
              <div>
                <p style={{ fontWeight: 600, marginBottom: 4 }}>{r.opportunity_name}</p>
                <p className="bx-eyebrow">Requested {new Date(r.requested_at).toLocaleDateString('en-US')}</p>
              </div>
              <span className="bx-chip">{STATUS_LABEL[r.status]}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
