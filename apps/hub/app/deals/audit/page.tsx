import type { Metadata } from 'next'
import { DealAuditForm } from './DealAuditForm'

export const metadata: Metadata = {
  title: 'Free Dubai Deal Audit | BizLegal AI',
  description:
    'Enter the facts of your Dubai residential purchase and get a free, deterministic audit against the checklist a practising Dubai lawyer runs before closing.',
  alternates: { canonical: 'https://bizlegal-ai.com/deals/audit' },
  openGraph: {
    title: 'Free Dubai Deal Audit | BizLegal AI',
    description:
      'The checklist a practising Dubai lawyer runs before closing — missing documents, expiring certificates, facts that disagree.',
    url: 'https://bizlegal-ai.com/deals/audit',
    siteName: 'BizLegal AI',
    type: 'website',
  },
  robots: { index: true, follow: true },
}

const CHECKLIST = [
  { label: 'Form F / MOU', note: 'The unified sale contract — the spine of the deal.' },
  { label: 'Title Deed', note: 'Ownership must be clean and current.' },
  { label: 'Developer NOC', note: 'No-objection to transfer — often time-limited.' },
  { label: 'Passport / Emirates ID', note: 'Parties must match the register.' },
  { label: 'Mortgage letter', note: 'Pre-approval or liability letter, if financed.' },
  { label: 'Oqood', note: 'Off-plan registration, when applicable.' },
  { label: 'Service charge', note: 'Clearance before transfer.' },
  { label: 'Trakheesi', note: 'Broker listing permit.' },
]

export default function DealAuditPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <section style={{ padding: '80px 32px 40px', maxWidth: 880, margin: '0 auto' }}>
        <span className="section-label">Free Deal Audit — Dubai Residential</span>
        <h1 style={{ marginBottom: 20, maxWidth: 720 }}>
          What a practising Dubai lawyer checks before closing.
        </h1>
        <p style={{ fontSize: 16, lineHeight: 1.8, maxWidth: 640 }}>
          Enter the facts of your purchase. The audit runs them against the
          checklist a Dubai real-estate lawyer runs before transfer day —
          missing documents, expiring certificates, and facts that disagree
          across your paperwork.
        </p>
        <p style={{ fontSize: 13, lineHeight: 1.7, maxWidth: 640, marginTop: 12, color: 'var(--secondary)' }}>
          This is a deterministic check, not legal advice. It flags what needs a
          human look; it does not tell you whether to close.
        </p>
      </section>

      <section style={{ maxWidth: 880, margin: '0 auto', padding: '0 32px 40px' }}>
        <DealAuditForm />
      </section>

      <section style={{ maxWidth: 880, margin: '0 auto', padding: '0 32px 80px' }}>
        <div style={{ borderTop: '0.5px solid var(--outline-var)', paddingTop: 40 }}>
          <span className="section-label">The practitioner&apos;s checklist</span>
          <p style={{ fontSize: 14, lineHeight: 1.7, maxWidth: 640, marginBottom: 24 }}>
            The audit checks the facts you enter against the documents a Dubai
            lawyer expects to see before transfer. Each has a freshness window —
            a certificate that expires before closing is a real problem.
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 12,
            }}
          >
            {CHECKLIST.map((item) => (
              <div
                key={item.label}
                style={{
                  background: 'var(--bg-low)',
                  border: '0.5px solid var(--outline-var)',
                  padding: '14px 16px',
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--on-surface)' }}>
                  {item.label}
                </div>
                <div style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--on-surface-var)', marginTop: 4 }}>
                  {item.note}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
