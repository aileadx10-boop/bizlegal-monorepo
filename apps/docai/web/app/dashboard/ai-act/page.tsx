import QuestionnaireClient from './QuestionnaireClient'

export default function AiActVertical() {
  return (
    <div>
      <h1 style={{
        fontFamily: 'var(--bl-font-display, Fraunces, serif)',
        fontSize: '1.5rem',
        fontWeight: 700,
        marginBottom: '0.5rem',
      }}>
        EU AI Act Compliance
      </h1>
      <p style={{ color: 'var(--bl-text-muted, #888)', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
        Classify your AI system&apos;s risk tier and identify compliance gaps before the <strong>2 August 2026</strong> deadline.
      </p>
      <p style={{
        color: 'var(--bl-danger, #dc2626)',
        fontSize: '0.85rem',
        fontWeight: 600,
        marginBottom: '2rem',
        padding: '0.5rem 1rem',
        background: '#fef2f2',
        borderRadius: 6,
        display: 'inline-block',
      }}>
        Deadline: High-risk AI obligations apply from 2 August 2026. Fines up to &euro;35M / 7% turnover.
      </p>

      <QuestionnaireClient />
    </div>
  )
}
