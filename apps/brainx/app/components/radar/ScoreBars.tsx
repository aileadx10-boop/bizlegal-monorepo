import type { DecisionScore } from '@/lib/radar/types'
import { FACTOR_LABEL, FACTOR_ORDER } from '@/lib/radar/types'

interface Props {
  readonly score: DecisionScore
  readonly variant?: 'mini' | 'full'
}

/**
 * Renders the real seven `@bizlegal/scoring` dimensions with their actual
 * weights — never a hard-coded list in the UI, so a weight change in the
 * package shows up here automatically. "mini" (card) shows the total only;
 * "full" (detail page) shows all seven bars plus the ladder legend.
 */
export default function ScoreBars({ score, variant = 'full' }: Props): JSX.Element {
  if (variant === 'mini') {
    return (
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span className="bx-score-total" style={{ fontSize: 22 }}>{score.total.toFixed(0)}</span>
        <span className="bx-muted" style={{ fontSize: 11 }}>/ 100</span>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 16 }}>
        <span className="bx-score-total" style={{ fontSize: 40 }}>{score.total.toFixed(0)}</span>
        <div>
          <div className="bx-eyebrow">BrainX Decision Score {score.version}</div>
          <div className="bx-muted" style={{ fontSize: 12 }}>build ≥80 · validate ≥65 · watch ≥50 · else ignore</div>
        </div>
      </div>
      <div className="bx-grid" style={{ gap: 8 }}>
        {FACTOR_ORDER.map((key) => (
          <div key={key} className="bx-bar-row">
            <span className="bx-bar-label">{FACTOR_LABEL[key]}</span>
            <span className="bx-bar-track">
              <span className="bx-bar-fill" style={{ width: `${Math.max(0, Math.min(100, score.factors[key]))}%` }} />
            </span>
            <span className="bx-bar-weight">{Math.round(score.weights[key] * 100)}%</span>
          </div>
        ))}
      </div>
      <p className="bx-muted" style={{ fontSize: 12, marginTop: 14, lineHeight: 1.6 }}>
        All seven dimensions are scored on every opportunity. A dimension the evidence cannot support is scored low by the analyst — it is never left out of the total.
      </p>
    </div>
  )
}
