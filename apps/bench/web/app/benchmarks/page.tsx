import type { Metadata } from 'next'
import Link from 'next/link'
import { BENCHMARKS, heldOutCount, releasedItems } from '@/lib/benchmarks'

export const metadata: Metadata = {
  title: 'Benchmarks',
  description:
    'Jurisdiction-specific legal AI benchmarks: MiCA-Bench (EU), DPA-Bench (UK), VARA-Bench (UAE). Expert-labeled gold standards, versioned, with held-out evaluation sets.',
  alternates: { canonical: '/benchmarks' },
}

export default function BenchmarksIndex() {
  return (
    <section className="section section--flush">
      <div className="shell" style={{ paddingTop: 'var(--space-section)' }}>
        <p className="eyebrow">Benchmark registry</p>
        <h1 className="title">Benchmarks</h1>
        <p className="lede" style={{ marginBottom: '3rem' }}>
          Each benchmark is a versioned set of jurisdiction-specific legal
          questions with expert-labeled gold standards. A small sample is
          released publicly; the majority is held out and used only inside paid
          engagements, so systems can&apos;t train on the test.
        </p>

        <div className="ledger">
          {BENCHMARKS.map((b) => (
            <Link key={b.slug} href={`/benchmarks/${b.slug}`} className="ledger__row">
              <span className="ledger__name">
                {b.name}
                <span className="chip chip--accent">{b.jurisdiction}</span>
                <span className="chip">v{b.version}</span>
                {b.status === 'draft' ? <span className="chip chip--warn">draft — under legal review</span> : null}
              </span>
              <span className="ledger__desc">
                {b.claim} Covers: {b.practice_areas.join(', ')}.
              </span>
              <span className="ledger__meta">
                {b.items.length} items · {releasedItems(b).length} released · {heldOutCount(b)} held out
              </span>
            </Link>
          ))}
        </div>

        <p className="footnote" style={{ marginTop: '2.5rem' }}>
          Benchmarks marked draft are Claude-drafted and pending review by a
          practising lawyer before use in any paid engagement — the review gate
          is part of the published methodology. Versions are immutable once
          released; changes ship as a new version.
        </p>
      </div>
    </section>
  )
}
