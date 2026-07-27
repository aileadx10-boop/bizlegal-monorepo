import type { CSSProperties } from 'react'

interface Feature {
  title: string
  body: string
}

const FEATURES: readonly Feature[] = [
  {
    title: 'Checklist engine',
    body: 'Jurisdiction-aware task lists for purchases, refis, commercial deals, and 1031 exchanges — every task dated backwards from your closing date in business days.',
  },
  {
    title: 'Deadline radar',
    body: 'Automated reminders at 7, 3, and 1 days out, with overdue escalation to the responsible party. Nothing slips because nobody was watching.',
  },
  {
    title: 'Document tracker',
    body: 'Know exactly which documents are in, which are missing, and who owes them — with automatic nag emails so you never chase paper manually.',
  },
]

const card: CSSProperties = {
  border: '1px solid #21262d',
  borderRadius: 10,
  padding: '20px 22px',
  background: '#161b22',
  flex: '1 1 240px',
  minWidth: 240,
}

export default function LandingPage() {
  return (
    <main style={{ maxWidth: 880, margin: '0 auto', padding: '64px 16px 48px' }}>
      <p style={{ color: '#58a6ff', fontWeight: 600, letterSpacing: 1, fontSize: 13, margin: 0 }}>
        CLOSEFLOW · BIZLEGAL AI
      </p>
      <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', lineHeight: 1.15, margin: '12px 0 16px' }}>
        Every closing deadline, calculated and chased — automatically.
      </h1>
      <p style={{ fontSize: 18, lineHeight: 1.6, color: '#8b949e', maxWidth: 640, margin: '0 0 40px' }}>
        Enter the property, the parties, and the closing date. CloseFlow generates the full
        critical path for your transaction type, tracks every document, and reminds the right
        person at the right time. 100% async — no calls, no meetings.
      </p>

      <section style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 48 }}>
        {FEATURES.map((f) => (
          <div key={f.title} style={card}>
            <h2 style={{ fontSize: 17, margin: '0 0 8px' }}>{f.title}</h2>
            <p style={{ fontSize: 14.5, lineHeight: 1.6, color: '#8b949e', margin: 0 }}>{f.body}</p>
          </div>
        ))}
      </section>

      <section
        style={{
          border: '1px solid #30363d',
          borderRadius: 10,
          padding: '24px 26px',
          background: '#161b22',
          marginBottom: 40,
        }}
      >
        <h2 style={{ fontSize: 20, margin: '0 0 6px' }}>
          $39 per transaction <span style={{ color: '#8b949e', fontWeight: 400 }}>· one-time</span>
        </h2>
        <p style={{ color: '#8b949e', fontSize: 15, lineHeight: 1.6, margin: '0 0 4px' }}>
          Full checklist, deadline tracking, and reminders for one closing. Investor and team
          subscriptions coming next.
        </p>
        <p style={{ color: '#d29922', fontSize: 14, margin: 0 }}>Checkout opening soon.</p>
      </section>

      <section style={{ fontSize: 13.5, lineHeight: 1.7, color: '#8b949e' }}>
        <h3 style={{ fontSize: 14, color: '#e6edf3', margin: '0 0 6px' }}>What CloseFlow is — and is not</h3>
        <p style={{ margin: 0 }}>
          CloseFlow is checklist and project-management software built from public procedural
          knowledge. It does not prepare or review legal documents, provide title, escrow, brokerage,
          or legal services, and no attorney-client relationship is formed by using it. Deadlines are
          computed estimates — always verify dates against your contract and local rules.
        </p>
      </section>
    </main>
  )
}
