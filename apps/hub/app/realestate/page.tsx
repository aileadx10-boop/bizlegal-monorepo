import type { Metadata } from 'next'
import { RealEstateForm } from './RealEstateForm'

export const metadata: Metadata = {
  title: 'Real-Estate Intelligence | BizLegal AI',
  description:
    'High-ticket cross-border real-estate matters — DIFC SPV, Reg D 506(c) syndication, MAS family office, EU AIF — routed to vetted partners on a finder-fee basis with full disclosure.',
  alternates: { canonical: 'https://bizlegal-ai.com/realestate' },
  openGraph: {
    title: 'Real-Estate Intelligence | BizLegal AI',
    description:
      'High-ticket cross-border real-estate matters routed to vetted partners.',
    url: 'https://bizlegal-ai.com/realestate',
    siteName: 'BizLegal AI',
    type: 'website',
  },
  robots: { index: true, follow: true },
}

export default function RealEstatePage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <section style={{ padding: '80px 32px 48px', maxWidth: 880, margin: '0 auto' }}>
        <span className="section-label">Cross-Border Real-Estate Intelligence</span>
        <h1 style={{ marginBottom: 20 }}>
          High-ticket real-estate. Routed to the right partner.
        </h1>
        <p style={{ fontSize: 16, lineHeight: 1.8, maxWidth: 640 }}>
          BizLegal-AI Intelligence is the routing layer for institutional real-estate
          matters: DIFC SPV setups, Reg D 506(c) syndications, MAS family office
          structures, EU AIF feeders, and tokenized real-estate JVs. We classify the
          opportunity, match it to a vetted realtor, lawyer, or structuring advisor,
          and introduce on a finder-fee basis under written disclosure.
        </p>
        <p style={{ fontSize: 14, lineHeight: 1.7, maxWidth: 640, marginTop: 16, color: 'var(--secondary)' }}>
          We do not act as your legal counsel for the underlying matter. You retain
          full authority over engagement, fees, and scope with the introduced partner.
        </p>
      </section>

      <section style={{ maxWidth: 880, margin: '0 auto', padding: '0 32px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, marginBottom: 56 }}>
          <Tile label="Primary vertical" value="UAE" sub="DIFC, DMCC, ADGM, RERA" />
          <Tile label="Secondary" value="SG / US / EU" sub="MAS, Reg D, AIFMD" />
          <Tile label="Deal size" value="$500K–$5M+" sub="Family office, syndication" />
          <Tile label="Fee basis" value="Disclosed" sub="Finder fee, written disclosure" />
        </div>
      </section>

      <section style={{ maxWidth: 880, margin: '0 auto', padding: '0 32px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 48, alignItems: 'start' }}>
          <RealEstateForm />

          <aside style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <div className="section-label">What happens next</div>
              <ol style={{ fontSize: 14, lineHeight: 1.8, paddingLeft: 18, marginTop: 8 }}>
                <li>We classify the matter (typically within an hour during business days).</li>
                <li>If we have a partner whose practice fits, we introduce by email and CC you.</li>
                <li>If your matter is research-stage, we may suggest a paid scoping memo instead.</li>
                <li>You decide whether to engage the partner. We are not in the path of fees you pay them.</li>
              </ol>
            </div>
            <div>
              <div className="section-label">What we do not do</div>
              <ul style={{ fontSize: 14, lineHeight: 1.8, paddingLeft: 18, marginTop: 8 }}>
                <li>Retail conveyancing or single-home purchases.</li>
                <li>Generic legal advice or contract drafting (see DocAI).</li>
                <li>Acting as your counsel for the matter we route.</li>
              </ul>
            </div>
            <div>
              <div className="section-label">Disclosure</div>
              <p style={{ fontSize: 13, lineHeight: 1.7 }}>
                Operated by DOR INNOVATIONS. Referrals are made under written
                disclosure consistent with IL Bar §50, UAE Federal Law 23/1991,
                US Model Rule 7.2(b), and Singapore LPA §83. Disclosure version
                v1.0.0-p1.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </div>
  )
}

function Tile({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div
      style={{
        border: '1px solid var(--border)',
        padding: '20px 18px',
        background: 'var(--surface)',
        borderRadius: 4,
      }}
    >
      <div className="section-label" style={{ marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--on-surface)' }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--secondary)', marginTop: 4 }}>{sub}</div>
    </div>
  )
}
