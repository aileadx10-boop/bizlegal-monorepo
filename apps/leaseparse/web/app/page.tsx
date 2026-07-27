import type { CSSProperties } from 'react'

const section: CSSProperties = {
  maxWidth: 960,
  margin: '0 auto',
  padding: '0 20px',
  boxSizing: 'border-box',
}

const card: CSSProperties = {
  background: '#161b22',
  border: '1px solid #21262d',
  borderRadius: 10,
  padding: '20px 22px',
  flex: '1 1 260px',
}

const FEATURES = [
  {
    title: 'Clause extraction',
    body: 'Base rent, escalations, CAM, percentage rent, options — pulled from the PDF into a structured abstract you can actually search.',
  },
  {
    title: 'Critical-date radar',
    body: 'Renewal notices, kick-outs, breakpoints, expirations — tracked with 90/60/30/7-day alerts so a deadline never surprises you.',
  },
  {
    title: 'Risk flags',
    body: 'Co-tenancy, go-dark, and assignment-restriction clauses surfaced with the exact excerpt, ranked by severity.',
  },
]

export default function LandingPage() {
  return (
    <div>
      <header style={{ ...section, padding: '72px 20px 40px' }}>
        <p style={{ color: '#58a6ff', fontWeight: 600, letterSpacing: 1, fontSize: 13, textTransform: 'uppercase', margin: 0 }}>
          LeaseParse
        </p>
        <h1 style={{ fontSize: 40, lineHeight: 1.15, margin: '12px 0 16px', maxWidth: 720 }}>
          Upload a commercial lease. Get a structured abstract and never miss a critical date.
        </h1>
        <p style={{ fontSize: 18, color: '#8b949e', maxWidth: 640, margin: 0, lineHeight: 1.6 }}>
          AI-extracted lease abstracts — critical dates, financial terms, and risk-flag clauses — delivered async, with
          automated deadline monitoring for your whole portfolio.
        </p>
      </header>

      <section style={{ ...section, display: 'flex', gap: 16, flexWrap: 'wrap', paddingBottom: 40 }}>
        {FEATURES.map((f) => (
          <div key={f.title} style={card}>
            <h2 style={{ fontSize: 17, margin: '0 0 8px' }}>{f.title}</h2>
            <p style={{ margin: 0, color: '#8b949e', fontSize: 14.5, lineHeight: 1.6 }}>{f.body}</p>
          </div>
        ))}
      </section>

      <section style={{ ...section, paddingBottom: 48 }}>
        <div
          style={{
            ...card,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <strong style={{ fontSize: 22 }}>$59</strong>
            <span style={{ color: '#8b949e' }}> per lease abstract — one-time, no subscription required.</span>
          </div>
          <span
            style={{
              border: '1px solid #30363d',
              borderRadius: 8,
              padding: '10px 18px',
              color: '#8b949e',
              fontSize: 14,
            }}
          >
            Checkout opening soon
          </span>
        </div>
        <p style={{ color: '#8b949e', fontSize: 13, lineHeight: 1.6, marginTop: 24 }}>
          LeaseParse is an AI-powered document analysis tool. It does not render legal advice, recommend action, or form
          an attorney-client relationship. Consult qualified counsel before exercising lease rights.
        </p>
      </section>
    </div>
  )
}
