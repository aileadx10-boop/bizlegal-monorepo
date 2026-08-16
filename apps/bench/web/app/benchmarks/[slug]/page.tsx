import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BENCHMARKS, getBenchmark, heldOutCount, releasedItems } from '@/lib/benchmarks'

interface Params {
  params: { slug: string }
}

export function generateStaticParams(): Array<{ slug: string }> {
  return BENCHMARKS.map((b) => ({ slug: b.slug }))
}

export function generateMetadata({ params }: Params): Metadata {
  const b = getBenchmark(params.slug)
  if (!b) return {}
  return {
    title: b.name,
    description: `${b.claim} ${b.items.length} expert-labeled items, ${b.jurisdiction}.`,
    alternates: { canonical: `/benchmarks/${b.slug}` },
  }
}

export default function BenchmarkPage({ params }: Params) {
  const b = getBenchmark(params.slug)
  if (!b) notFound()

  const released = releasedItems(b)
  const byDifficulty = [1, 2, 3].map((d) => ({
    difficulty: d,
    count: b.items.filter((i) => i.difficulty === d).length,
  }))
  const maxDifficultyCount = Math.max(...byDifficulty.map((r) => r.count), 1)

  return (
    <>
      <section className="graph-paper">
        <div className="shell" style={{ padding: 'clamp(3.5rem, 7vw, 6rem) clamp(1.25rem, 4vw, 2.5rem)' }}>
          <p className="eyebrow">
            Benchmark · {b.jurisdiction} · v{b.version}
          </p>
          <h1 className="display" style={{ fontSize: 'clamp(2.4rem, 1.4rem + 4vw, 4.4rem)' }}>{b.name}</h1>
          <p className="lede">{b.claim}</p>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            <span className="chip">{b.regime}</span>
            {b.status === 'draft' ? <span className="chip chip--warn">draft — under legal review</span> : null}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="split">
            <div>
              <p className="eyebrow">Construction</p>
              <h2 className="heading">How this benchmark is built</h2>
              <div className="prose">
                <p>
                  Every item pairs a realistic prompt with a gold-standard
                  answer grounded in primary authority — statute, regulation, or
                  regulator guidance — plus the failure modes the item is
                  designed to surface (fabricated authority, wrong-jurisdiction
                  transplants, omitted elements, unsound reasoning).
                </p>
                <p>
                  Items are drafted under a documented authoring workflow,
                  authority-checked, and gated behind review by a practising
                  lawyer before any paid use. Versions are immutable; the
                  version you were measured against is named in your report, so
                  results stay comparable over time.
                </p>
                <p>
                  {heldOutCount(b)} of {b.items.length} items are held out and
                  never published. The released sample below shows the format
                  and difficulty, not the test.
                </p>
              </div>
            </div>
            <div>
              <div className="readout">
                <p className="readout__title"><span>Registry data</span><span className="mono">v{b.version}</span></p>
                <div className="metric-grid">
                  <div className="metric">
                    <div className="metric__value">{b.items.length}</div>
                    <div className="metric__label">Items</div>
                  </div>
                  <div className="metric">
                    <div className="metric__value">{heldOutCount(b)}</div>
                    <div className="metric__label">Held out</div>
                  </div>
                  <div className="metric">
                    <div className="metric__value">{b.practice_areas.length}</div>
                    <div className="metric__label">Practice areas</div>
                  </div>
                </div>
                <div style={{ marginTop: '1.4rem' }}>
                  <p className="readout__title" style={{ marginBottom: '0.8rem' }}><span>Difficulty distribution</span></p>
                  <div className="bars">
                    {byDifficulty.map((row) => (
                      <div key={row.difficulty} className="bars__row">
                        <span className="faint">
                          {row.difficulty === 1 ? 'Foundational' : row.difficulty === 2 ? 'Applied' : 'Adversarial'}
                        </span>
                        <span className="bars__track">
                          <span
                            className="bars__fill"
                            style={{ width: `${(row.count / maxDifficultyCount) * 100}%` }}
                          />
                        </span>
                        <span className="bars__num">{row.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <p className="eyebrow">Released sample · {released.length} of {b.items.length} items</p>
          <h2 className="heading">Sample items</h2>
          <div style={{ display: 'grid', gap: '2rem', marginTop: '2rem' }}>
            {released.map((item) => (
              <article key={item.id} className="readout">
                <p className="readout__title">
                  <span>{item.id} · {item.practice_area}</span>
                  <span>
                    difficulty {item.difficulty}/3
                  </span>
                </p>
                <p style={{ margin: '0 0 1rem', fontWeight: 600, maxWidth: '70ch' }}>{item.prompt}</p>
                <p className="small" style={{ margin: 0, color: 'var(--ink-soft)', maxWidth: '78ch' }}>
                  <strong style={{ color: 'var(--ink)' }}>Gold standard: </strong>
                  {item.gold_standard}
                </p>
                <p className="footnote" style={{ marginTop: '1rem' }}>
                  Authority: {item.authority_refs.join(' · ')} — probes:{' '}
                  {item.probes.join(', ').replaceAll('_', ' ')}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <h2 className="heading" style={{ maxWidth: '24ch' }}>
            Measure your system against {b.name}.
          </h2>
          <div style={{ display: 'flex', gap: '0.9rem', marginTop: '1.6rem', flexWrap: 'wrap' }}>
            <Link href="/audit/request" className="btn btn--primary">Request an audit</Link>
            <Link href="/methodology" className="btn">Methodology</Link>
          </div>
          <p className="footnote" style={{ marginTop: '2rem' }}>
            Citing this benchmark: &ldquo;{b.name} v{b.version}, Bench by
            BizLegal AI ({b.created}), bench.bizlegal-ai.com/benchmarks/{b.slug}&rdquo;.
          </p>
        </div>
      </section>
    </>
  )
}
