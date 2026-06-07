import IntakeClient from './IntakeClient'

export default function ImmigrationVertical() {
  return (
    <div>
      <h1 style={{
        fontFamily: 'var(--bl-font-display, Fraunces, serif)',
        fontSize: '1.5rem',
        fontWeight: 700,
        marginBottom: '0.5rem',
      }}>
        Immigration Process Automation
      </h1>
      <p style={{ color: 'var(--bl-text-muted, #888)', marginBottom: '2rem', fontSize: '0.95rem' }}>
        Select a visa type, fill the intake form, and get an AI-drafted petition with INA/CFR citations.
      </p>
      <IntakeClient />
    </div>
  )
}
