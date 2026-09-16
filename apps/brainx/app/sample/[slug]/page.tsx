import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { SAMPLE_OPPORTUNITIES, SAMPLE_VERIFIED_AT } from '@/lib/fixtures/sample'
import { fromFixture } from '@/lib/radar/map'
import OpportunityDetail from '@/app/components/radar/OpportunityDetail'
import SampleBanner from '@/app/components/radar/SampleBanner'

interface Params {
  params: { slug: string }
}

export function generateStaticParams() {
  return SAMPLE_OPPORTUNITIES.map((o) => ({ slug: o.slug }))
}

export function generateMetadata({ params }: Params): Metadata {
  const fixture = SAMPLE_OPPORTUNITIES.find((o) => o.slug === params.slug)
  if (!fixture) return {}
  return {
    title: fixture.name,
    description: fixture.problem.slice(0, 155),
    // Individual sample cards are illustrative, not a durable indexable
    // surface — the sample RADAR (/sample) is the page meant to rank.
    robots: { index: false, follow: true },
  }
}

export default function SampleDetailPage({ params }: Params) {
  const fixture = SAMPLE_OPPORTUNITIES.find((o) => o.slug === params.slug)
  if (!fixture) notFound()
  const o = fromFixture(fixture)

  return (
    <div className="bx-container" style={{ paddingBlock: 'var(--bl-space-section)', maxWidth: 820 }}>
      <p style={{ marginBottom: 20 }}>
        <Link href="/sample" className="bx-link" style={{ fontSize: 13 }}>← Back to sample radar</Link>
      </p>
      <div style={{ marginBottom: 20 }}>
        <SampleBanner verifiedAt={SAMPLE_VERIFIED_AT} />
      </div>
      <OpportunityDetail
        o={o}
        buildSlot={
          <div className="bx-card">
            <p style={{ fontSize: 14, marginBottom: 12 }}>
              BUILD THIS turns any opportunity on your live radar into a full brief — offer,
              buyer, deliverable, pricing hypothesis, sales angle, landing-page brief,
              delivery workflow, evidence pack and next actions.
            </p>
            <Link href="/pricing" className="bx-btn-primary">See pricing →</Link>
          </div>
        }
      />
    </div>
  )
}
