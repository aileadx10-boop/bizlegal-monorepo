interface Props {
  score: number
  label?: string
  showBar?: boolean
}

function levelColor(score: number) {
  if (score >= 90) return 'var(--accent)'
  if (score >= 70) return 'var(--warning)'
  return 'var(--danger)'
}

function levelLabel(score: number) {
  if (score >= 90) return 'Verified'
  if (score >= 70) return 'Review Recommended'
  return 'Expert Review Required'
}

export default function ConfidenceScore({ score, label, showBar = true }: Props) {
  const color = levelColor(score)
  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 4, minWidth: 120 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span style={{ fontFamily: 'Newsreader, serif', fontSize: 28, fontWeight: 700, color, lineHeight: 1 }}>
          {score}%
        </span>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color }}>
          {label ?? levelLabel(score)}
        </span>
      </div>
      {showBar && (
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${score}%`, background: color }} />
        </div>
      )}
    </div>
  )
}
