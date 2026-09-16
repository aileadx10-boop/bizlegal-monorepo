import { notFound } from 'next/navigation'
import { getSubscriber } from '@/lib/access'
import { getOpportunityBySlug } from '@/lib/radar/queries'
import OpportunityDetail from '@/app/components/radar/OpportunityDetail'
import BuildThisButton from '@/app/components/build/BuildThisButton'

export const dynamic = 'force-dynamic'

export default async function RadarOpportunityPage({ params }: { params: { slug: string } }) {
  const subscriber = await getSubscriber()
  if (!subscriber) return null

  const o = await getOpportunityBySlug({ subscriberId: subscriber.id, tier: subscriber.tier, slug: params.slug })
  if (!o) notFound()

  return (
    <div className="bx-container" style={{ maxWidth: 820 }}>
      <OpportunityDetail
        o={o}
        buildSlot={
          <BuildThisButton opportunityId={o.id} requestable={o.build.requestable} existingRequestId={o.build.existing_request_id} />
        }
      />
    </div>
  )
}
