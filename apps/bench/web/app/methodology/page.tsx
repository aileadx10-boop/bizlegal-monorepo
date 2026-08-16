import type { Metadata } from 'next'
import Link from 'next/link'
import { RUBRIC_DIMENSIONS, MAX_TOTAL_SCORE } from '@/lib/rubric-engine'

export const metadata: Metadata = {
  title: 'Methodology',
  description:
    'How Bench measures legal AI: the five-dimension rubric, error taxonomy, calibration and inter-rater agreement, disagreement resolution, versioning, and expert credential classes.',
  alternates: { canonical: '/methodology' },
}

const DIMENSION_ANCHORS: ReadonlyArray<{ dim: string; label: string; five: string; zero: string }> = [
  {
    dim: 'jurisdictional',
    label: 'Jurisdictional accuracy',
    five: 'Correct legal framework for the target jurisdiction, including free-zone / federal splits',
    zero: 'Answers under another jurisdiction’s law, or transplants foreign doctrine wholesale',
  },
  {
    dim: 'correctness',
    label: 'Legal correctness',
    five: 'The rule is stated as the authority states it, with material conditions intact',
    zero: 'The core rule is misstated in a way that would mislead a competent reader',
  },
  {
    dim: 'completeness',
    label: 'Completeness',
    five: 'All legally required elements, exceptions, and thresholds a practitioner would flag',
    zero: 'A required element is missing and its absence changes the answer',
  },
  {
    dim: 'reasoning',
    label: 'Reasoning quality',
    five: 'Sound application of the right authorities to the facts, in the right order',
    zero: 'Right sources, unsound application — or conclusion asserted without analysis',
  },
  {
    dim: 'hallucination',
    label: 'Hallucination risk',
    five: 'Every cited authority exists, is current, and supports the proposition',
    zero: 'Fabricated statute, case, or guidance presented as real',
  },
]

export default function MethodologyPage() {
  return (
    <>
      <section className="graph-paper">
        <div className="shell" style={{ padding: 'clamp(3.5rem, 7vw, 6rem) clamp(1.25rem, 4vw, 2.5rem)' }}>
          <p className="eyebrow">Methodology · public and versioned</p>
          <h1 className="display" style={{ fontSize: 'clamp(2.4rem, 1.4rem + 4vw, 4.4rem)' }}>
            A score you can defend.
          </h1>
          <p className="lede">
            Every number in a Bench report traces to this page: the rubric that
            produced it, the calibration that validated the raters, and the
            formulas that computed it. If a measurement can&apos;t be defended, it
            shouldn&apos;t be sold.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <p className="eyebrow">The rubric</p>
          <h2 className="heading">Five dimensions, 0–5 each, {MAX_TOTAL_SCORE} points total.</h2>
          <p className="prose" style={{ marginBottom: '2rem' }}>
            Each evaluated output is scored on {RUBRIC_DIMENSIONS.length}{' '}
            dimensions with written anchors. Evaluators also assign a severity
            (critical / high / medium / low / none), classify failures in a
            fixed error taxonomy, and write a gold-standard correction for every
            failed item.
          </p>
          <div className="table-scroll">
            <table className="data">
              <thead>
                <tr>
                  <th scope="col">Dimension</th>
                  <th scope="col">Score 5 anchor</th>
                  <th scope="col">Score 0 anchor</th>
                </tr>
              </thead>
              <tbody>
                {DIMENSION_ANCHORS.map((row) => (
                  <tr key={row.dim}>
                    <td>{row.label}</td>
                    <td>{row.five}</td>
                    <td>{row.zero}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="split">
            <div>
              <p className="eyebrow">Derived metrics</p>
              <h2 className="heading">Deterministic by construction.</h2>
              <div className="prose">
                <p>
                  Report metrics are pure functions of the evaluation rows — no
                  model in the loop, no discretion at report time:
                </p>
              </div>
              <div className="table-scroll" style={{ marginTop: '1.25rem' }}>
                <table className="data">
                  <tbody>
                    <tr><td>Accuracy score</td><td className="mono small">mean(total / 25) × 100</td></tr>
                    <tr><td>Hallucination rate</td><td className="mono small">% items tagged hallucinated-authority, or scoring ≤ 2 on the hallucination dimension</td></tr>
                    <tr><td>Critical-error rate</td><td className="mono small">% items with severity = critical</td></tr>
                    <tr><td>Citation reliability</td><td className="mono small">100 − % items tagged unreliable-citation or hallucinated-authority</td></tr>
                    <tr><td>Missing-law rate</td><td className="mono small">% items tagged omission</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div>
              <p className="eyebrow">Error taxonomy</p>
              <h2 className="heading">Six failure classes.</h2>
              <div className="table-scroll" style={{ marginTop: '1.25rem' }}>
                <table className="data">
                  <tbody>
                    <tr><td>Hallucinated authority</td><td>Fabricated statute, case, or guidance</td></tr>
                    <tr><td>Misstatement</td><td>Real law, wrongly stated</td></tr>
                    <tr><td>Omission</td><td>Legally required element missing</td></tr>
                    <tr><td>Wrong jurisdiction</td><td>Answered under another regime&apos;s law</td></tr>
                    <tr><td>Bad reasoning</td><td>Right sources, unsound application</td></tr>
                    <tr><td>Unreliable citation</td><td>Real authority, wrong proposition</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <p className="eyebrow">Calibration</p>
          <h2 className="heading">Raters are measured before they measure.</h2>
          <div className="split" style={{ marginTop: '1.5rem' }}>
            <div className="prose">
              <p>
                Before an expert&apos;s scores count, they complete a paid
                assessment and a calibration round in which a sample of items is
                independently double-scored by two experts. We compute exact and
                adjacent (±1) agreement per dimension in code. Items with any
                dimension differing by more than one point go to a
                disagreement-resolution step: a third senior reviewer resolves,
                and the rationale is recorded with the item.
              </p>
              <p>
                Ongoing QA follows a published sampling curve: 100% of a new
                expert&apos;s first tasks are reviewed, dropping to 20% after
                sustained quality, then to exception-based review. Admission and
                retention decisions are made by a human, always.
              </p>
            </div>
            <div className="readout">
              <p className="readout__title">
                <span>Inter-rater agreement</span>
                <span className="chip chip--warn">first cycle pending</span>
              </p>
              <div className="metric-grid">
                <div className="metric">
                  <div className="metric__value faint">—</div>
                  <div className="metric__label">Exact agreement</div>
                </div>
                <div className="metric">
                  <div className="metric__value faint">—</div>
                  <div className="metric__label">Adjacent (±1)</div>
                </div>
              </div>
              <p className="footnote" style={{ marginTop: '1rem' }}>
                Published here after the first calibration cycle completes. We
                do not invent this number; an accuracy score from uncalibrated
                raters is noise.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="split">
            <div>
              <p className="eyebrow">Versioning &amp; integrity</p>
              <h2 className="heading">Immutable versions. Held-out sets.</h2>
              <div className="prose">
                <p>
                  Benchmark versions are immutable once released; every report
                  names the exact version measured against. The majority of each
                  benchmark is held out and never published, and released sample
                  items are excluded from paid measurement — a system that
                  memorised our public pages gains nothing.
                </p>
                <p>
                  Named results are private to each client. Published research
                  is aggregated or anonymized, and reports state the measured
                  test set, date, and version — a Bench score is a point-in-time
                  measurement of a defined set, not a warranty of production
                  safety.
                </p>
              </div>
            </div>
            <div>
              <p className="eyebrow">Position in the landscape</p>
              <h2 className="heading">Where Bench differs.</h2>
              <div className="table-scroll" style={{ marginTop: '1.25rem' }}>
                <table className="data">
                  <thead>
                    <tr>
                      <th scope="col">Alternative</th>
                      <th scope="col">Gap Bench covers</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Open academic benchmarks (e.g. LegalBench)</td>
                      <td>US-centric and static; public sets can be trained on; no corrections or remediation</td>
                    </tr>
                    <tr>
                      <td>General eval platforms</td>
                      <td>Measure fluency and generic hallucination, not jurisdiction-specific legal correctness</td>
                    </tr>
                    <tr>
                      <td>Frontier-lab data vendors</td>
                      <td>Serve model labs at lab scale; Bench serves the vendor, the compliance team, and the firm — with EU/UK/UAE regulatory depth and managed corrections</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <h2 className="heading" style={{ maxWidth: '26ch' }}>Read a sample report, then measure your own system.</h2>
          <div style={{ display: 'flex', gap: '0.9rem', marginTop: '1.6rem', flexWrap: 'wrap' }}>
            <Link href="/sample" className="btn">Sample report</Link>
            <Link href="/audit/request" className="btn btn--primary">Request an audit</Link>
          </div>
        </div>
      </section>
    </>
  )
}
