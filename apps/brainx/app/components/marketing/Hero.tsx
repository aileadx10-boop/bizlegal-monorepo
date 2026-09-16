import Link from 'next/link'
import RunStamp from '@/app/components/radar/RunStamp'

export default function Hero({ lastRunAt }: { lastRunAt: string | null }): JSX.Element {
  return (
    <section className="bx-hero-bg bx-grid-bg" style={{ position: 'relative', overflow: 'hidden' }}>
      <div className="bx-radar" aria-hidden="true" />
      <div className="bx-container" style={{ paddingBlock: 'clamp(4rem, 3rem + 6vw, 8rem)', position: 'relative' }}>
        <p className="bx-eyebrow" style={{ marginBottom: 18 }}>
          Weekly opportunity radar for legal, real estate &amp; AI-fintech compliance
        </p>
        <h1 className="bx-h1" style={{ maxWidth: 820 }}>Find the next thing worth selling.</h1>
        <p className="bx-lede" style={{ maxWidth: 620, marginTop: 22 }}>
          BrainX scans customer pain, market demand, competitor moves and regulatory
          change — then turns the strongest signals into evidence-backed opportunities
          you can build, package or sell. Every source is verifiable. Every score is
          shown, not asserted.
        </p>
        <div style={{ display: 'flex', gap: 14, marginTop: 32, flexWrap: 'wrap' }}>
          <Link href="/sample" className="bx-btn-primary">See a real opportunity</Link>
          <Link href="/pricing" className="bx-btn-ghost">See pricing</Link>
        </div>
        <div style={{ marginTop: 28 }}>
          <RunStamp finishedAt={lastRunAt} />
        </div>
      </div>
    </section>
  )
}
