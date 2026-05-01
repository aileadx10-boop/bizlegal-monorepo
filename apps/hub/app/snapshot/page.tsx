import type { Metadata } from 'next'
import { SnapshotPanel } from '@/components/conversion/SnapshotPanel'

export const metadata: Metadata = {
  title: 'Free Jurisdiction Risk Snapshot — BizLegal AI',
  description:
    'Compare two jurisdictions across six dimensions for your regulated activity. Delivered in under 5 minutes. Free. Intelligence — not legal advice.',
  alternates: { canonical: 'https://bizlegal-ai.com/snapshot' },
  openGraph: {
    type: 'website',
    url: 'https://bizlegal-ai.com/snapshot',
    title: 'Free Jurisdiction Risk Snapshot — BizLegal AI',
    description:
      'Compare two jurisdictions across six dimensions. Delivered in under 5 minutes.',
  },
}

const PILLARS: ReadonlyArray<readonly [string, string]> = [
  ['Regulatory posture', 'Supportive, neutral, hostile — by activity, not by jurisdiction.'],
  ['Licensing', 'Named licences, regulator, typical timeline, cost range.'],
  ['Tax + banking', 'Corporate rate, VAT/GST, crypto-specific treatment, banking accessibility rating.'],
  ['Enforcement + deadlines', 'Recent regulator actions and upcoming filing deadlines for the next 12 months.'],
]

export default function SnapshotPage() {
  return (
    <>
      <section
        className="bl-hero-bg"
        style={{
          paddingTop: 'clamp(4rem, 2rem + 4vw, 6rem)',
          paddingBottom: 'clamp(2rem, 1.5rem + 1.5vw, 3rem)',
        }}
      >
        <div className="bl-container" style={{ maxWidth: 900 }}>
          <span className="bl-tag" style={{ marginBottom: '1rem' }}>
            Free · 1-minute · Delivered in under 5 min
          </span>
          <h1
            style={{
              fontFamily: 'var(--bl-font-display)',
              fontSize: 'var(--bl-text-h1)',
              fontWeight: 800,
              letterSpacing: '-0.025em',
              lineHeight: 1.05,
              color: 'var(--bl-text)',
              margin: '1.5rem 0 1rem',
            }}
          >
            Compare two jurisdictions{' '}
            <span className="bl-grad-text">before your next filing.</span>
          </h1>
          <p
            style={{
              fontSize: 'clamp(1.05rem, 0.95rem + 0.4vw, 1.2rem)',
              color: 'var(--bl-text-muted)',
              lineHeight: 1.6,
              margin: 0,
              maxWidth: 720,
            }}
          >
            Tell us your activity and pick two jurisdictions. Our intelligence
            desk returns a snapshot of regulatory posture, licensing, tax,
            banking access, recent enforcement, and upcoming deadlines — side
            by side. Intelligence, not legal advice.
          </p>
        </div>
      </section>

      <section className="bl-section" style={{ paddingTop: 'clamp(2rem, 1.5rem + 1vw, 3rem)' }}>
        <div className="bl-container" style={{ maxWidth: 1100 }}>
          <div
            style={{
              display: 'grid',
              gap: 'clamp(1.5rem, 1rem + 2vw, 3rem)',
              gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.1fr)',
            }}
            className="snapshot-layout"
          >
            {/* Pillars */}
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 12, alignSelf: 'start' }}>
              {PILLARS.map(([title, body]) => (
                <li
                  key={title}
                  className="bl-card"
                  style={{ padding: '16px 20px' }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--bl-font-mono)',
                      fontSize: 10,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: 'var(--bl-accent)',
                      fontWeight: 700,
                      marginBottom: 6,
                    }}
                  >
                    {title}
                  </div>
                  <div style={{ fontSize: 'var(--bl-text-small)', color: 'var(--bl-text-muted)', lineHeight: 1.6 }}>
                    {body}
                  </div>
                </li>
              ))}
            </ul>

            {/* Form (existing SnapshotPanel — already error-handled with mailto fallback) */}
            <div>
              <SnapshotPanel />
            </div>
          </div>

          <p
            style={{
              marginTop: 'clamp(2rem, 1.5rem + 1vw, 3rem)',
              fontSize: 'var(--bl-text-small)',
              color: 'var(--bl-text-subtle)',
              lineHeight: 1.7,
              maxWidth: 720,
              marginInline: 'auto',
              textAlign: 'center',
            }}
          >
            Outputs are regulatory intelligence produced by automated systems
            with human-in-the-loop review. No attorney-client relationship is
            formed. We do not file, certify, or guarantee outcomes. By
            submitting, you agree to receive the snapshot by email and
            occasional regulatory alerts (unsubscribe anytime).
          </p>
        </div>
      </section>

      <style>{`
        @media (max-width: 760px) {
          .snapshot-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  )
}
