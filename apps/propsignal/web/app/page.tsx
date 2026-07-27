import type { CSSProperties } from 'react'

const FEATURES: ReadonlyArray<{ title: string; body: string }> = [
  {
    title: 'Flood & environmental screen',
    body: 'FEMA flood-zone designation plus EPA Superfund, brownfield, and toxics-release proximity — the two silent deal-killers, checked first.',
  },
  {
    title: 'Open-data signals',
    body: 'Code violations, permits, and recorded liens wherever the city publishes them. We organize what the county clerk already made public.',
  },
  {
    title: 'Deterministic risk score',
    body: 'Every signal feeds one documented scoring formula. Same inputs, same score, every time — no black box, no opinion.',
  },
]

const cardStyle: CSSProperties = {
  background: '#101a30',
  border: '1px solid #1e2a44',
  borderRadius: 12,
  padding: '20px 22px',
  flex: '1 1 260px',
}

export default function LandingPage() {
  return (
    <main
      style={{
        maxWidth: 960,
        margin: '0 auto',
        padding: '64px 20px 48px',
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: 13,
          letterSpacing: 2,
          textTransform: 'uppercase',
          color: '#5b8def',
          fontWeight: 600,
        }}
      >
        PropSignal
      </p>
      <h1 style={{ fontSize: 42, lineHeight: 1.15, margin: '12px 0 16px' }}>
        Any US address → a property risk score built from public records.
      </h1>
      <p style={{ fontSize: 18, lineHeight: 1.6, color: '#b9c6dd', maxWidth: 640 }}>
        Paste an address. PropSignal pulls flood zones, environmental screening, and
        municipal open data, runs a deterministic scoring engine, and emails you a
        narrative PDF — fully automated, delivered async.
      </p>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', margin: '40px 0' }}>
        {FEATURES.map((f) => (
          <section key={f.title} style={cardStyle}>
            <h2 style={{ fontSize: 17, margin: '0 0 8px' }}>{f.title}</h2>
            <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.6, color: '#b9c6dd' }}>
              {f.body}
            </p>
          </section>
        ))}
      </div>

      <section
        style={{
          ...cardStyle,
          display: 'flex',
          alignItems: 'baseline',
          gap: 16,
          flexWrap: 'wrap',
          borderColor: '#2b4370',
        }}
      >
        <span style={{ fontSize: 32, fontWeight: 700 }}>$49</span>
        <span style={{ fontSize: 15, color: '#b9c6dd' }}>
          per report, one-time — checkout opening soon.
        </span>
      </section>

      <section style={{ marginTop: 40, fontSize: 13.5, lineHeight: 1.7, color: '#8fa1c0' }}>
        <strong style={{ color: '#b9c6dd' }}>What PropSignal is not:</strong> raw
        public-data aggregation for informational purposes only. Not a substitute for
        physical inspection, appraisal, title opinion, or legal counsel. We report what
        public sources publish; you decide what to do with it.
      </section>
    </main>
  )
}
