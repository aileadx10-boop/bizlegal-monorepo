import { WEIGHTS } from '@bizlegal/scoring'
import { FACTOR_LABEL, FACTOR_ORDER } from '@/lib/radar/types'

const MAX_WEIGHT = Math.max(...Object.values(WEIGHTS))

export default function ScoreExplainer(): JSX.Element {
  return (
    <section id="score" className="bx-section bx-container-narrow">
      <p className="bx-label" style={{ marginBottom: 10 }}>Transparent scoring</p>
      <h2 className="bx-h2" style={{ marginBottom: 16 }}>BrainX Decision Score v1</h2>
      <p className="bx-lede" style={{ marginBottom: 28 }}>
        A weighted decision aid based on the evidence attached to an opportunity — not a
        claim of mathematical certainty. Missing evidence is not treated as negative
        evidence; it is scored conservatively by the analyst and shown as-is.
      </p>
      <div className="bx-grid" style={{ gap: 10, marginBottom: 24 }}>
        {FACTOR_ORDER.map((k) => (
          <div key={k} className="bx-bar-row" style={{ gridTemplateColumns: '180px 1fr 46px' }}>
            <span className="bx-bar-label">{FACTOR_LABEL[k]}</span>
            <span className="bx-bar-track"><span className="bx-bar-fill" style={{ width: `${(WEIGHTS[k] / MAX_WEIGHT) * 100}%` }} /></span>
            <span className="bx-bar-weight">{Math.round(WEIGHTS[k] * 100)}%</span>
          </div>
        ))}
      </div>
      <p className="bx-muted" style={{ fontSize: 13, lineHeight: 1.7 }}>
        Total ≥ 80 → <strong style={{ color: 'var(--bl-text)' }}>Build</strong>. ≥ 65 →{' '}
        <strong style={{ color: 'var(--bl-text)' }}>Validate</strong>. ≥ 50 →{' '}
        <strong style={{ color: 'var(--bl-text)' }}>Watch</strong>. Below that,{' '}
        <strong style={{ color: 'var(--bl-text)' }}>Ignore</strong>. All seven dimensions are
        scored on every opportunity — the score you see on any card is exactly this
        formula, computed live from the factors shown on its detail page.
      </p>
    </section>
  )
}
