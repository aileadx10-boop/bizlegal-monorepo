import { sql } from '@/lib/neon'
import Hero from '@/app/components/marketing/Hero'
import HowItWorks from '@/app/components/marketing/HowItWorks'
import ScoreExplainer from '@/app/components/marketing/ScoreExplainer'
import FaqList, { HOME_FAQ } from '@/app/components/marketing/FaqList'
import EmailCapture from '@/app/components/marketing/EmailCapture'
import DisclaimerBlock from '@/app/components/radar/DisclaimerBlock'
import OpportunityCard from '@/app/components/radar/OpportunityCard'
import { SAMPLE_OPPORTUNITIES } from '@/lib/fixtures/sample'
import { fromFixture } from '@/lib/radar/map'
import Link from 'next/link'

// A marketing page, not the dashboard — cached and revalidated rather than
// force-dynamic, since the one live figure it shows (the last radar run
// timestamp) changes on a weekly cadence, not per-request.
export const revalidate = 300

async function lastRunAt(): Promise<string | null> {
  try {
    const rows = (await sql()`select finished_at from research_runs where status = 'completed' order by finished_at desc limit 1`) as unknown as Array<{ finished_at: string | null }>
    return rows?.[0]?.finished_at ?? null
  } catch {
    return null
  }
}

const TRUST = [
  { label: 'Weekly radar', body: 'Not continuous, not 24/7 — a real operator-run scan, every week, with a timestamp you can check.' },
  { label: 'Source-linked', body: 'Every opportunity carries at least 3 independently verified public sources.' },
  { label: 'Opportunity-first', body: 'Signals are converted into a commercial action, not left as a feed to read.' },
  { label: 'Human-reviewed', body: 'AI assists the research; a human stays responsible for what gets published.' },
] as const

export default async function HomePage() {
  const runAt = await lastRunAt()
  const preview = SAMPLE_OPPORTUNITIES.slice(0, 3).map(fromFixture)

  return (
    <>
      <Hero lastRunAt={runAt} />

      <section className="bx-container" style={{ paddingBlock: 'var(--bl-space-block)' }}>
        <div className="bx-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18 }}>
          {TRUST.map((t) => (
            <div key={t.label} className="bx-card bx-card--flat">
              <p className="bx-label" style={{ marginBottom: 8 }}>{t.label}</p>
              <p className="bx-muted" style={{ fontSize: 13, lineHeight: 1.6 }}>{t.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bx-container" style={{ paddingBlock: 'var(--bl-space-block)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <h2 className="bx-h2" style={{ fontSize: 26 }}>What an opportunity looks like</h2>
          <Link href="/sample" className="bx-link" style={{ fontSize: 14 }}>See the full sample radar →</Link>
        </div>
        <div className="bx-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
          {preview.map((o) => <OpportunityCard key={o.id} o={o} href={`/sample/${o.slug}`} />)}
        </div>
      </section>

      <HowItWorks />
      <ScoreExplainer />

      <section className="bx-container-narrow" style={{ paddingBlock: 'var(--bl-space-block)' }}>
        <EmailCapture source="home" />
      </section>

      <section className="bx-container" style={{ paddingBlock: 'var(--bl-space-section)' }}>
        <p className="bx-label" style={{ marginBottom: 20 }}>Questions</p>
        <FaqList items={HOME_FAQ} />
      </section>

      <section className="bx-container-narrow" style={{ paddingBottom: 'var(--bl-space-block)' }}>
        <DisclaimerBlock />
      </section>
    </>
  )
}
