'use client'
import { useState } from 'react'

const FAQS = [
  {
    q: 'What is MiCA and who does it apply to?',
    a: 'Markets in Crypto-Assets Regulation (MiCA) is the EU\'s comprehensive regulatory framework for digital assets, effective from December 2024. It applies to issuers of asset-referenced tokens (ARTs) and e-money tokens (EMTs), as well as crypto-asset service providers (CASPs) offering services to EU clients — regardless of where the issuer is domiciled.',
  },
  {
    q: 'How is a GDPR fine calculated?',
    a: 'GDPR fines are calculated on two tracks under Article 83. Lower-tier violations (Article 83.4) carry fines up to €10M or 2% of global annual turnover, whichever is higher. Upper-tier violations (Article 83.5) — including unlawful processing and data subject rights infringements — carry fines up to €20M or 4% of global turnover. Supervisory authorities consider aggravating factors including intentionality, cooperation, and prior infringements.',
  },
  {
    q: 'Do I need a VARA licence to operate in Dubai?',
    a: 'Yes. Any business conducting virtual asset activities in or from Dubai — including exchange, brokerage, custody, and advisory services — requires a VARA licence. VARA operates four licence categories based on activity type. Operating without a licence constitutes unauthorised financial business under UAE law and subjects operators to immediate suspension and referral to the Public Prosecution.',
  },
  {
    q: 'What is the Howey Test for crypto tokens?',
    a: 'The Howey Test, derived from SEC v. W.J. Howey Co. (1946), determines whether a digital asset constitutes a security. Under the test, an asset is a security if it involves: (1) an investment of money; (2) in a common enterprise; (3) with an expectation of profits; (4) derived primarily from the efforts of others. The SEC has applied this test to dozens of token projects since 2017.',
  },
  {
    q: 'When does GDPR require a Data Protection Officer?',
    a: 'Article 37 GDPR mandates DPO appointment in three scenarios: (1) the organisation is a public authority or body; (2) core activities consist of large-scale, systematic monitoring of data subjects; or (3) core activities involve large-scale processing of special category data or criminal conviction data. The DPO must be appointed formally and their contact details published to the supervisory authority.',
  },
  {
    q: 'What are the AML requirements for crypto exchanges?',
    a: 'Crypto exchanges must comply with FATF Recommendation 16 (the "Travel Rule"), requiring transfer of beneficiary information for transactions above USD 1,000. Core obligations include: Customer Due Diligence (CDD), Enhanced Due Diligence (EDD) for high-risk clients, ongoing transaction monitoring, Suspicious Activity Report (SAR) filing, and documented AML/CFT policies. EU-based exchanges must also comply with 6AMLD.',
  },
]

export default function FaqBlock() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section style={{ padding: '64px 32px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <span className="section-label">Common Questions</span>
        <h2 style={{ marginBottom: 32 }}>Regulatory FAQ</h2>
        <div>
          {FAQS.map((faq, i) => (
            <div key={i} style={{ borderBottom: '0.5px solid var(--outline-var)' }}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  padding: '18px 0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  textAlign: 'left',
                  gap: 16,
                }}
              >
                <span style={{ fontFamily: 'Newsreader, serif', fontSize: 17, fontWeight: 700, color: 'var(--on-surface)', lineHeight: 1.3 }}>{faq.q}</span>
                <span style={{ color: 'var(--primary)', fontSize: 18, flexShrink: 0, transition: 'transform 0.2s', transform: open === i ? 'rotate(45deg)' : 'none' }}>+</span>
              </button>
              <div className={`accordion-content${open === i ? ' open' : ''}`}>
                <p style={{ paddingBottom: 18, color: 'var(--on-surface-var)', lineHeight: 1.7, fontSize: 14 }}>{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
