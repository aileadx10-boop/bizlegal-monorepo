import type { Metadata } from 'next'
import Link from 'next/link'
import {
  computeEngagementMetrics,
  type ScoredEvaluation,
} from '@/lib/rubric-engine'

export const metadata: Metadata = {
  title: 'Sample report',
  description:
    'What a Bench measurement report looks like: accuracy score, hallucination rate, error taxonomy, jurisdictional breakdown, and gold-standard corrections — anonymized sample.',
  alternates: { canonical: '/sample' },
}

/**
 * ILLUSTRATIVE evaluation rows — a worked example of report structure, run
 * through the real rubric engine so every number on this page is computed by
 * the same code that computes client reports. This is NOT data about any real
 * product. The self-benchmark of our own DocAI surface replaces this dataset
 * once its run completes (wf_self_benchmark).
 */
const SAMPLE_EVALS: readonly ScoredEvaluation[] = [
  { itemId: 's-01', practiceArea: 'scope', severity: 'none', taxonomy: [], scores: { jurisdictional: 5, correctness: 5, completeness: 4, reasoning: 5, hallucination: 5 } },
  { itemId: 's-02', practiceArea: 'scope', severity: 'medium', taxonomy: ['omission'], scores: { jurisdictional: 5, correctness: 4, completeness: 2, reasoning: 4, hallucination: 5 } },
  { itemId: 's-03', practiceArea: 'whitepaper', severity: 'high', taxonomy: ['misstatement'], scores: { jurisdictional: 4, correctness: 1, completeness: 3, reasoning: 3, hallucination: 4 } },
  { itemId: 's-04', practiceArea: 'whitepaper', severity: 'none', taxonomy: [], scores: { jurisdictional: 5, correctness: 4, completeness: 4, reasoning: 4, hallucination: 5 } },
  { itemId: 's-05', practiceArea: 'stablecoin_reserves', severity: 'critical', taxonomy: ['hallucinated_authority'], scores: { jurisdictional: 4, correctness: 2, completeness: 3, reasoning: 3, hallucination: 0 } },
  { itemId: 's-06', practiceArea: 'stablecoin_reserves', severity: 'medium', taxonomy: ['omission'], scores: { jurisdictional: 5, correctness: 4, completeness: 2, reasoning: 4, hallucination: 4 } },
  { itemId: 's-07', practiceArea: 'casp', severity: 'high', taxonomy: ['wrong_jurisdiction'], scores: { jurisdictional: 1, correctness: 3, completeness: 3, reasoning: 2, hallucination: 4 } },
  { itemId: 's-08', practiceArea: 'casp', severity: 'none', taxonomy: [], scores: { jurisdictional: 5, correctness: 5, completeness: 5, reasoning: 4, hallucination: 5 } },
  { itemId: 's-09', practiceArea: 'casp', severity: 'low', taxonomy: ['unreliable_citation'], scores: { jurisdictional: 4, correctness: 4, completeness: 4, reasoning: 4, hallucination: 3 } },
  { itemId: 's-10', practiceArea: 'market_abuse', severity: 'critical', taxonomy: ['hallucinated_authority', 'bad_reasoning'], scores: { jurisdictional: 3, correctness: 1, completeness: 2, reasoning: 1, hallucination: 1 } },
]

const TAG_LABELS: Record<string, string> = {
  hallucinated_authority: 'Hallucinated authority',
  misstatement: 'Misstatement',
  omission: 'Omission',
  wrong_jurisdiction: 'Wrong jurisdiction',
  bad_reasoning: 'Bad reasoning',
  unreliable_citation: 'Unreliable citation',
}

export default function SamplePage() {
  const m = computeEngagementMetrics(SAMPLE_EVALS)
  const maxTag = Math.max(...m.taxonomyHistogram.map((t) => t.count), 1)

  return (
    <>
      <section className="graph-paper">
        <div className="shell" style={{ padding: 'clamp(3.5rem, 7vw, 6rem) clamp(1.25rem, 4vw, 2.5rem)' }}>
          <p className="eyebrow">Sample measurement report · anonymized</p>
          <h1 className="display" style={{ fontSize: 'clamp(2.2rem, 1.3rem + 3.6vw, 4rem)' }}>
            What you receive.
          </h1>
          <p className="lede">
            The structure below is a full Bench report in miniature — computed
            by the same deterministic engine that produces client reports, on a
            worked example of ten evaluations. Named results are always private;
            published data is aggregated or anonymized.
          </p>
          <p style={{ marginTop: '1.25rem' }}>
            <span className="chip chip--warn">
              Illustrative dataset — replaced by our own self-benchmark after its first run
            </span>
          </p>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <p className="eyebrow">Headline metrics · {m.itemsScored} evaluations</p>
          <div className="metric-grid" style={{ marginTop: '1.5rem' }}>
            <div className="metric">
              <div className="metric__value">{m.meanTotal}<span className="faint" style={{ fontSize: '0.55em' }}>/25</span></div>
              <div className="metric__label">Mean rubric score</div>
            </div>
            <div className="metric">
              <div className="metric__value metric__value--accent">{m.accuracyPct}%</div>
              <div className="metric__label">Accuracy</div>
            </div>
            <div className="metric">
              <div className="metric__value metric__value--crit">{m.hallucinationRatePct}%</div>
              <div className="metric__label">Hallucination rate</div>
            </div>
            <div className="metric">
              <div className="metric__value metric__value--warn">{m.criticalErrorRatePct}%</div>
              <div className="metric__label">Critical errors</div>
            </div>
            <div className="metric">
              <div className="metric__value">{m.citationReliabilityPct}%</div>
              <div className="metric__label">Citation reliability</div>
            </div>
            <div className="metric">
              <div className="metric__value">{m.missingLawRatePct}%</div>
              <div className="metric__label">Missing-law rate</div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="split">
            <div>
              <p className="eyebrow">Error taxonomy</p>
              <h2 className="heading">Where it fails, classified.</h2>
              <div className="bars" style={{ marginTop: '1.5rem' }}>
                {m.taxonomyHistogram.map((t) => (
                  <div key={t.tag} className="bars__row">
                    <span className="faint">{TAG_LABELS[t.tag] ?? t.tag}</span>
                    <span className="bars__track">
                      <span
                        className={
                          t.tag === 'hallucinated_authority'
                            ? 'bars__fill bars__fill--crit'
                            : t.tag === 'misstatement' || t.tag === 'wrong_jurisdiction'
                              ? 'bars__fill bars__fill--warn'
                              : 'bars__fill'
                        }
                        style={{ width: `${(t.count / maxTag) * 100}%` }}
                      />
                    </span>
                    <span className="bars__num">{t.count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="eyebrow">Dimension means · 0–5</p>
              <h2 className="heading">The shape of the system.</h2>
              <div className="bars" style={{ marginTop: '1.5rem' }}>
                {m.dimensions.map((d) => (
                  <div key={d.dimension} className="bars__row">
                    <span className="faint" style={{ textTransform: 'capitalize' }}>{d.dimension}</span>
                    <span className="bars__track">
                      <span
                        className={d.mean >= 4 ? 'bars__fill bars__fill--ok' : d.mean >= 3 ? 'bars__fill' : 'bars__fill bars__fill--warn'}
                        style={{ width: `${(d.mean / 5) * 100}%` }}
                      />
                    </span>
                    <span className="bars__num">{d.mean.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <p className="eyebrow">Per-area breakdown</p>
          <h2 className="heading">Jurisdictional accuracy by practice area.</h2>
          <div className="table-scroll" style={{ marginTop: '1.5rem' }}>
            <table className="data">
              <thead>
                <tr>
                  <th scope="col">Practice area</th>
                  <th scope="col">Items</th>
                  <th scope="col">Mean score (0–25)</th>
                </tr>
              </thead>
              <tbody>
                {m.byPracticeArea.map((row) => (
                  <tr key={row.practiceArea}>
                    <td style={{ textTransform: 'capitalize' }}>{row.practiceArea.replaceAll('_', ' ')}</td>
                    <td className="mono">{row.items}</td>
                    <td className="mono">{row.meanTotal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <p className="eyebrow">Corrections</p>
          <h2 className="heading">Every failure comes back fixed.</h2>
          <article className="readout" style={{ marginTop: '1.5rem', maxWidth: '860px' }}>
            <p className="readout__title">
              <span>Excerpt · item s-05 · severity: critical</span>
              <span className="chip chip--warn">illustrative</span>
            </p>
            <p className="small" style={{ margin: '0 0 0.9rem', color: 'var(--ink-soft)' }}>
              <strong style={{ color: 'var(--crit)' }}>Finding: </strong>
              The output cited a &ldquo;MiCA Article 112 reserve attestation
              regime&rdquo; that does not exist, presented with an invented EBA
              guideline number.
            </p>
            <p className="small" style={{ margin: 0, color: 'var(--ink-soft)' }}>
              <strong style={{ color: 'var(--ink)' }}>Gold-standard correction: </strong>
              Reserve-of-assets obligations for ART issuers sit in Articles
              36–38 of Regulation (EU) 2023/1114 — composition, custody and
              segregation of the reserve — with own-funds requirements in
              Article 35. The correction states the applicable articles and the
              operative rule, verified by an EU-regulatory practitioner.
            </p>
          </article>
          <div style={{ display: 'flex', gap: '0.9rem', marginTop: '2.5rem', flexWrap: 'wrap' }}>
            <Link href="/audit/request" className="btn btn--primary">Request your measurement</Link>
            <Link href="/methodology" className="btn">How these numbers are computed</Link>
          </div>
        </div>
      </section>
    </>
  )
}
