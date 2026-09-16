import type { Metadata } from 'next'
import Link from 'next/link'
import { SAMPLE_OPPORTUNITIES, SAMPLE_VERIFIED_AT } from '@/lib/fixtures/sample'
import { fromFixture } from '@/lib/radar/map'
import OpportunityCard from '@/app/components/radar/OpportunityCard'
import SampleBanner from '@/app/components/radar/SampleBanner'
import ScoreExplainer from '@/app/components/marketing/ScoreExplainer'
import EmailCapture from '@/app/components/marketing/EmailCapture'
import DisclaimerBlock from '@/app/components/radar/DisclaimerBlock'

export const metadata: Metadata = {
  title: 'Sample radar',
  description: 'Five real, evidence-verified opportunities across real estate compliance, legal practice growth, and AI/fintech regulation. No signup required.',
  alternates: { canonical: '/sample' },
}

export default function SamplePage() {
  const opportunities = SAMPLE_OPPORTUNITIES.map(fromFixture)

  return (
    <div className="bx-container" style={{ paddingBlock: 'var(--bl-space-section)' }}>
      <SampleBanner verifiedAt={SAMPLE_VERIFIED_AT} />
      <h1 className="bx-h2" style={{ marginTop: 18, marginBottom: 12, maxWidth: 700 }}>
        What BrainX finds — five real opportunities, evidence included.
      </h1>
      <p className="bx-lede" style={{ maxWidth: 620, marginBottom: 36 }}>
        No signup. Every source below was independently opened and verified. This is the
        exact format a subscriber&apos;s live radar renders — these five are a hand-picked
        selection, not a random sample of everything BrainX finds.
      </p>

      <div className="bx-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 'var(--bl-space-block)' }}>
        {opportunities.map((o) => (
          <OpportunityCard key={o.id} o={o} href={`/sample/${o.slug}`} />
        ))}
      </div>

      <div style={{ marginBottom: 'var(--bl-space-block)' }}>
        <ScoreExplainer />
      </div>

      <div className="bx-container-narrow" style={{ paddingInline: 0, marginBottom: 'var(--bl-space-block)' }}>
        <EmailCapture source="sample" />
      </div>

      <p style={{ marginBottom: 24 }}>
        <Link href="/pricing" className="bx-btn-primary">See pricing →</Link>
      </p>

      <DisclaimerBlock />
    </div>
  )
}
