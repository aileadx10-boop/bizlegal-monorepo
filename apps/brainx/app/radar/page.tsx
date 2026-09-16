import { getSubscriber } from '@/lib/access'
import { listOpportunities } from '@/lib/radar/queries'
import OpportunityCard from '@/app/components/radar/OpportunityCard'
import VerticalTabs from '@/app/components/radar/VerticalTabs'
import RunStamp from '@/app/components/radar/RunStamp'
import type { Vertical } from '@/lib/radar/types'

export const dynamic = 'force-dynamic'

const VALID_VERTICALS: readonly Vertical[] = ['real_estate', 'legal_compliance', 'ai_fintech_regulation']

function isVertical(v: unknown): v is Vertical {
  return typeof v === 'string' && (VALID_VERTICALS as readonly string[]).includes(v)
}

export default async function RadarPage({ searchParams }: { searchParams: { vertical?: string } }) {
  const subscriber = await getSubscriber()
  if (!subscriber) return null // layout already redirects; defensive

  const vertical = isVertical(searchParams?.vertical) ? searchParams.vertical : undefined
  const { opportunities, run } = await listOpportunities({ subscriberId: subscriber.id, tier: subscriber.tier, vertical })

  return (
    <div className="bx-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div>
          <h1 className="bx-h2" style={{ fontSize: 26 }}>Your radar</h1>
          <div style={{ marginTop: 8 }}><RunStamp finishedAt={run?.finished_at ?? null} /></div>
        </div>
        <VerticalTabs active={vertical ?? 'all'} counts={{ all: opportunities.length }} basePath="/radar" />
      </div>

      {opportunities.length === 0 ? (
        <div className="bx-card" style={{ maxWidth: 520 }}>
          <p style={{ fontSize: 14, marginBottom: 8 }}>
            {run ? 'No opportunities crossed the watch threshold on the most recent run.' : 'First radar run pending — scheduled weekly.'}
          </p>
          <p className="bx-muted" style={{ fontSize: 13 }}>
            In the meantime, see what an opportunity looks like on the <a href="/sample" className="bx-link">sample radar</a>.
          </p>
        </div>
      ) : (
        <div className="bx-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          {opportunities.map((o) => (
            <OpportunityCard key={o.id} o={o} href={`/radar/o/${o.slug}`} />
          ))}
        </div>
      )}
    </div>
  )
}
