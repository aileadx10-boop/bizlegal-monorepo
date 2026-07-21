import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AML & KYC Compliance Checklist for Crypto Companies (2025)',
  description: 'Anti-money laundering and know-your-customer requirements for crypto companies. FATF Travel Rule, FinCEN registration, EU AMLD obligations, and the KYC process for crypto-asset service providers.',
  alternates: { canonical: 'https://bizlegal-ai.com/guides/aml-kyc-compliance-crypto' },
  openGraph: {
    title: 'AML & KYC Compliance Checklist for Crypto Companies (2025)',
    description: 'What AML/KYC compliance requires for crypto exchanges, DeFi protocols, and VASPs. FATF Travel Rule, FinCEN MSB registration, EU AMLD6, and counterparty due diligence.',
    url: 'https://bizlegal-ai.com/guides/aml-kyc-compliance-crypto',
    type: 'article',
  },
}

const FAQS = [
  {
    q: 'Which AML regulations apply to crypto companies?',
    a: 'Crypto companies face AML obligations from multiple jurisdictions depending on where they operate and where their customers are located. Key frameworks: FinCEN (US) — crypto exchanges and custodians are Money Services Businesses (MSBs) required to register and implement AML programs; EU AMLD6 — CASPs authorized under MiCA are subject to EU AML requirements including the Transfer of Funds Regulation (TFR); FATF Recommendations — the global standard that most national regulators implement, including the Travel Rule for transfers above $1,000/€1,000; UK FCA — crypto firms must register with the FCA under the Money Laundering Regulations 2017.',
  },
  {
    q: 'What does the FATF Travel Rule require for crypto?',
    a: 'The FATF Travel Rule (Recommendation 16, extended to virtual assets) requires Virtual Asset Service Providers (VASPs) to collect, verify, and transmit originator and beneficiary information for crypto transfers above $1,000/€1,000. The required information: originator name, account number (crypto address), physical address or national identity number or date and place of birth; beneficiary name and account number. VASPs must have technical capability to send and receive this data with counterparty VASPs — compliance requires integration with Travel Rule solutions (Notabene, Sygna Bridge, TRM, etc.).',
  },
  {
    q: 'Does my DeFi protocol need to implement KYC?',
    a: 'DeFi protocols face regulatory uncertainty, but regulators are actively closing the gap. The FATF 2021 updated guidance suggests that DeFi protocols with controlling developers or founders may be treated as VASPs. US regulators (FinCEN, OFAC) have taken enforcement action against DeFi protocols (Tornado Cash) and have signaled that "DAPP" developers can bear compliance obligations. EU MiCA does not directly regulate truly decentralized protocols, but its definition of "decentralized" is narrow. If your protocol has admin keys, upgrade rights, fee collection, or governance power concentrated among identifiable parties, you likely have compliance obligations.',
  },
  {
    q: 'What does a KYC process for a crypto company look like?',
    a: 'A standard crypto company KYC process: (1) Identity verification — collect government-issued ID (passport, national ID), proof of address, selfie/liveness check. (2) Document verification — automated or manual review of documents against document databases for fraud signals. (3) Sanctions screening — check name against OFAC SDN, EU consolidated list, UN sanctions, and other relevant lists before onboarding. (4) PEP screening — check if the individual is a Politically Exposed Person, which triggers enhanced due diligence. (5) Risk scoring — assign a risk tier (low/medium/high) based on jurisdiction, transaction patterns, PEP/sanctions status. (6) Ongoing monitoring — transaction monitoring for suspicious patterns; periodic re-verification (annual for high-risk, biennial for standard). (7) SAR filing — file a Suspicious Activity Report when suspicious activity is detected above thresholds.',
  },
  {
    q: 'What is Enhanced Due Diligence (EDD) and when is it required?',
    a: 'Enhanced Due Diligence is an intensified version of standard KYC applied to high-risk customers. EDD triggers: customers from high-risk jurisdictions (FATF grey/blacklist countries, or countries with weak AML regimes); Politically Exposed Persons (government officials and their close associates); customers with unusual transaction patterns or unexplained wealth; customers in high-risk business categories (gambling, cash-intensive businesses, arms dealing). EDD process typically includes: source-of-funds documentation; source-of-wealth documentation; senior management approval for onboarding; more frequent periodic reviews; enhanced transaction monitoring with lower alert thresholds.',
  },
  {
    q: 'What are the penalties for AML non-compliance in crypto?',
    a: 'AML penalties in crypto are severe and increasing. US examples: BitMEX — $100M DOJ settlement + $100M CFTC penalty for failing to implement AML/KYC; Binance — $4.3B DOJ settlement (2023) for systematic AML failures; Coinbase — $100M settlement with NYDFS for KYC failures. EU: MiCA + AMLA will allow fines up to €5M or 10% of annual revenue for serious AML violations. Beyond fines: criminal prosecution of founders and executives, license revocation, and reputational damage that destroys institutional partnerships.',
  },
]

export default function AMLKYCGuidePage() {
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'AML & KYC Compliance Checklist for Crypto Companies (2025)',
    description: 'AML and KYC requirements for crypto exchanges, DeFi protocols, and VASPs — FATF Travel Rule, FinCEN registration, EU AMLD, and counterparty screening.',
    url: 'https://bizlegal-ai.com/guides/aml-kyc-compliance-crypto',
    publisher: { '@type': 'Organization', name: 'BizLegal AI', url: 'https://bizlegal-ai.com' },
    author: { '@type': 'Organization', name: 'BizLegal AI' },
    inLanguage: 'en-US',
    datePublished: '2026-01-01',
    dateModified: '2026-07-22',
  }

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bizlegal-ai.com' },
      { '@type': 'ListItem', position: 2, name: 'Guides', item: 'https://bizlegal-ai.com/guides' },
      { '@type': 'ListItem', position: 3, name: 'AML & KYC for Crypto', item: 'https://bizlegal-ai.com/guides/aml-kyc-compliance-crypto' },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <main style={{ maxWidth: '760px', margin: '0 auto', padding: '3rem 1.5rem' }}>

        <nav style={{ fontSize: '0.8rem', opacity: 0.55, marginBottom: '2rem' }}>
          <a href="/" style={{ color: 'inherit' }}>Home</a>
          {' → '}
          <a href="/guides" style={{ color: 'inherit' }}>Guides</a>
          {' → '}
          AML & KYC for Crypto
        </nav>

        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5 }}>
          Crypto Compliance
        </span>

        <h1 style={{ fontSize: 'clamp(1.7rem, 4vw, 2.5rem)', fontWeight: 700, lineHeight: 1.2, margin: '0.75rem 0 1.25rem' }}>
          AML & KYC Compliance for Crypto Companies: 2025 Checklist
        </h1>

        <p style={{ fontSize: '1.05rem', lineHeight: 1.75, opacity: 0.85, marginBottom: '2.5rem' }}>
          Crypto companies face AML and KYC obligations across multiple jurisdictions simultaneously. Regulators have moved from enforcement ambiguity to aggressive action — the Binance $4.3B settlement, BitMEX convictions, and ongoing OFAC enforcement against crypto protocols make this clear. This guide explains what your crypto company must have in place and what auditors and regulators will look for.
        </p>

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border, #e5e7eb)', marginBottom: '2.5rem' }} />

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>The AML Obligation Map: Which Regulator Controls You</h2>
          <p style={{ lineHeight: 1.75, marginBottom: '1rem' }}>
            A crypto company's AML obligations depend on where it is incorporated, where it operates, and where its customers are located. This creates multi-jurisdictional exposure for most growth-stage crypto companies.
          </p>
          <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Jurisdiction</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Regulator</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Regime</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Key Trigger</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['United States', 'FinCEN / OFAC', 'BSA / MSB registration', 'Serving US customers or operating from US'],
                  ['European Union', 'National FIUs + ECB', 'AMLD6 / MiCA + TFR', 'CASP authorization or serving EU clients'],
                  ['United Kingdom', 'FCA', 'MLR 2017 registration', 'Operating from UK or serving UK clients'],
                  ['UAE (ADGM/DIFC)', 'FSRA / DFSA', 'AML Rules for VASPs', 'VASP license or serving UAE clients'],
                  ['Singapore', 'MAS', 'PSA license', 'DPT services to Singapore users'],
                  ['Global', 'FATF', 'Travel Rule (Rec. 16)', 'Transfers ≥$1,000/€1,000 between VASPs'],
                ].map(([j, r, reg, t]) => (
                  <tr key={j} style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600 }}>{j}</td>
                    <td style={{ padding: '10px 12px' }}>{r}</td>
                    <td style={{ padding: '10px 12px', opacity: 0.8 }}>{reg}</td>
                    <td style={{ padding: '10px 12px', opacity: 0.7 }}>{t}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>The AML Program: Five Required Components</h2>
          <p style={{ lineHeight: 1.75, marginBottom: '1rem' }}>
            Most national AML frameworks (derived from FATF Recommendations) require a written AML program with five components:
          </p>
          <ul style={{ paddingLeft: '1.5rem', lineHeight: 1.9 }}>
            <li><strong>Policies and procedures:</strong> Written AML policies covering customer onboarding, transaction monitoring, SAR filing, record-keeping, and staff training. Must be approved by senior management and reviewed annually.</li>
            <li><strong>Designated compliance officer:</strong> A named individual responsible for AML compliance. For small companies, this is often the CEO or CFO initially, but the role must be clearly assigned and have the authority and budget to act.</li>
            <li><strong>Ongoing employee training:</strong> AML training for all employees who interact with customers or transactions, documented with completion records. Must cover red flags, reporting obligations, and consequences of non-compliance.</li>
            <li><strong>Independent testing:</strong> Annual review of the AML program by an independent party (internal audit, external consultant, or external auditor) to assess effectiveness and identify gaps. This is separate from the compliance officer's ongoing monitoring.</li>
            <li><strong>Customer due diligence (CDD):</strong> Procedures for verifying customer identity at onboarding (KYC), ongoing monitoring, and enhanced due diligence for high-risk customers. Includes beneficial ownership verification for corporate customers.</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>FATF Travel Rule Implementation</h2>
          <p style={{ lineHeight: 1.75, marginBottom: '1rem' }}>
            The FATF Travel Rule requires VASPs to pass originator and beneficiary information alongside crypto transfers above the threshold. Implementation requires:
          </p>
          <ul style={{ paddingLeft: '1.5rem', lineHeight: 1.9 }}>
            <li><strong>Data collection:</strong> Collect and verify originator and beneficiary information at account creation and at the time of each covered transfer</li>
            <li><strong>Counterparty VASP identification:</strong> Determine whether the receiving address belongs to a VASP (using VASP directories, blockchain analytics, or IP/domain analysis) — you can only send Travel Rule data to another VASP</li>
            <li><strong>Data transmission:</strong> Integrate with a Travel Rule solution (Notabene, Sygna Bridge, OpenVASP, TRM Sunrise, Shyft Network) to send structured data securely to counterparty VASPs</li>
            <li><strong>Receiving and screening:</strong> Receive incoming Travel Rule data from counterparty VASPs and screen against sanctions lists before processing the transfer</li>
            <li><strong>Unhosted wallet handling:</strong> When the receiving address is an unhosted (self-custodied) wallet, most jurisdictions require collecting beneficial owner information above enhanced thresholds</li>
            <li><strong>Record-keeping:</strong> Retain Travel Rule records for the mandated period (5 years under FATF recommendations; specific retention periods vary by jurisdiction)</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>Transaction Monitoring: What to Watch For</h2>
          <p style={{ lineHeight: 1.75, marginBottom: '1rem' }}>
            Transaction monitoring is the operational core of ongoing AML compliance. Effective systems flag patterns including:
          </p>
          <ul style={{ paddingLeft: '1.5rem', lineHeight: 1.9 }}>
            <li>Structuring — multiple transactions just below reporting thresholds</li>
            <li>Rapid movement — funds received and immediately withdrawn or transferred to external wallets</li>
            <li>High-risk counterparties — transactions involving addresses associated with darknet markets, mixers, or sanctions targets (blockchain analytics required)</li>
            <li>Unusual geography — transactions inconsistent with the customer's stated location or risk profile</li>
            <li>Activity inconsistent with profile — large volumes inconsistent with the customer's stated purpose or financial profile</li>
            <li>Interaction with sanctioned addresses — any interaction with OFAC-listed addresses triggers mandatory blocking and reporting</li>
          </ul>
          <p style={{ lineHeight: 1.75, marginTop: '1rem' }}>
            Blockchain analytics tools (Chainalysis, Elliptic, TRM Labs) automate on-chain counterparty screening. These are no longer optional for regulated crypto businesses — they are expected by regulators as part of a reasonable transaction monitoring program.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>Counterparty Due Diligence: Contracts and On-Chain Screening</h2>
          <p style={{ lineHeight: 1.75, marginBottom: '1rem' }}>
            Beyond individual customer KYC, crypto companies transacting with institutional counterparties need to verify that the counterparty entity is itself compliant:
          </p>
          <ul style={{ paddingLeft: '1.5rem', lineHeight: 1.9 }}>
            <li>Obtain copies of the counterparty's AML program policies and VASP registration/license</li>
            <li>Verify the counterparty appears in FATF-equivalent jurisdiction and is not subject to sanctions</li>
            <li>Screen the counterparty's wallet addresses against blockchain analytics before large transfers</li>
            <li>Execute a written counterparty agreement that includes AML representations and audit rights</li>
            <li>Review counterparty on an annual basis or upon material changes to the relationship</li>
          </ul>
        </section>

        <section
          style={{
            background: 'var(--surface, #f9fafb)',
            border: '1px solid var(--color-border, #e5e7eb)',
            borderRadius: '12px',
            padding: '1.75rem',
            marginBottom: '2rem',
          }}
        >
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.75rem' }}>Get a counterparty risk assessment — BRAI</h2>
          <p style={{ lineHeight: 1.7, marginBottom: '1.25rem', opacity: 0.85 }}>
            BRAI generates counterparty risk reports covering AML/KYC posture, regulatory exposure across MiCA, VARA, and FinCEN frameworks, and sanctions screening. Used by crypto GCs and compliance officers before institutional transactions. Reports from $149.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <a
              href="https://brai.bizlegal-ai.com"
              style={{
                display: 'inline-block',
                padding: '0.75rem 1.75rem',
                background: 'var(--primary, #1a56db)',
                color: '#fff',
                borderRadius: '8px',
                fontWeight: 600,
                textDecoration: 'none',
                fontSize: '0.95rem',
              }}
            >
              Get a BRAI Report
            </a>
            <a
              href="https://docai.bizlegal-ai.com"
              style={{
                display: 'inline-block',
                padding: '0.75rem 1.75rem',
                border: '1px solid var(--color-border, #e5e7eb)',
                borderRadius: '8px',
                fontWeight: 600,
                textDecoration: 'none',
                fontSize: '0.95rem',
                color: 'inherit',
              }}
            >
              Scan an AML Contract — $97
            </a>
          </div>
        </section>

        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1.5rem' }}>Frequently Asked Questions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {FAQS.map(({ q, a }) => (
              <div key={q}>
                <p style={{ fontWeight: 600, marginBottom: '0.4rem' }}>{q}</p>
                <p style={{ lineHeight: 1.75, opacity: 0.85, margin: 0 }}>{a}</p>
              </div>
            ))}
          </div>
        </section>

        <div style={{ marginBottom: '2rem', padding: '1rem', background: 'var(--surface, #f9fafb)', borderRadius: '8px' }}>
          <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8 }}>
            Related: <a href="/regulations/aml" style={{ color: 'var(--primary, #1a56db)' }}>AML Regulation Hub →</a> enforcement history, penalty tracker, and compliance checklist
          </p>
        </div>

        <footer style={{ borderTop: '1px solid var(--color-border, #e5e7eb)', paddingTop: '1.5rem', fontSize: '0.8rem', opacity: 0.5 }}>
          <p>This guide is for informational purposes only and does not constitute legal advice. AML regulations vary significantly by jurisdiction and evolve frequently. Engage qualified legal counsel and a licensed compliance officer for advice specific to your situation and jurisdiction.</p>
        </footer>
      </main>
    </>
  )
}
