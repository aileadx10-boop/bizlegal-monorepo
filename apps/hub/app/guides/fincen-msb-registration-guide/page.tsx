import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'FinCEN MSB Registration Guide for Crypto and Fintech Startups (2025) | BizLegal AI',
  description: 'When your crypto exchange, wallet, or payments product qualifies as a Money Services Business, how to register with FinCEN, state money transmitter license requirements, and the AML program obligations MSBs must maintain.',
  alternates: { canonical: 'https://bizlegal-ai.com/guides/fincen-msb-registration-guide' },
  openGraph: {
    title: 'FinCEN MSB Registration Guide — BizLegal AI',
    description: 'MSB definition, 6 triggering activities, FinCEN registration process, state MTL requirements, VASP designation, and what happens if you operate without registration.',
    url: 'https://bizlegal-ai.com/guides/fincen-msb-registration-guide',
    type: 'article',
  },
}

const FAQS = [
  {
    q: 'What is a Money Services Business and do I need to register with FinCEN?',
    a: 'A Money Services Business (MSB) is any person doing business in the United States in one or more of six defined categories: (1) Currency dealer or exchanger; (2) Check casher; (3) Issuer of traveler\'s checks, money orders, or stored value; (4) Seller or redeemer of traveler\'s checks, money orders, or stored value; (5) Money transmitter; or (6) US Postal Service. The sixth category aside, the most relevant to crypto and fintech startups are currency dealer/exchanger and money transmitter. A "money transmitter" is anyone who accepts currency, funds, or other value that substitutes for currency and transmits that value to another location or person by any means. FinCEN\'s guidance (FIN-2013-G001, 2013) established that convertible virtual currency (cryptocurrency) counts as "other value that substitutes for currency" — making crypto exchanges, crypto wallets, and crypto payment processors money transmitters subject to MSB registration. The $1,000 per-person per-day threshold: if your business has an aggregate total of more than $1,000 in currency or currency equivalents in transactions with any person on a single day, you are an MSB. This threshold catches virtually all operating crypto and payments businesses. Two-part test: MSB status requires (1) doing business in the United States AND (2) conducting one of the six covered activities. "Doing business in the United States" includes any company that accepts US customers or processes transactions of US persons, even if the company is incorporated outside the US. FinCEN has explicitly stated that a foreign company may qualify as an MSB subject to BSA obligations if it accepts US persons as customers, even without a US office.',
  },
  {
    q: 'What is the FinCEN MSB registration process and how long does it take?',
    a: 'FinCEN MSB registration is completed online through the BSA E-Filing System at bsaefiling.fincen.treas.gov. The registration form is FinCEN Form 107 (Registration of Money Services Business). Key registration requirements: (1) Principal owners and controlling persons: Individuals with 25%+ ownership interest must be identified. (2) State-by-state operations: You must list every state where you do business, including states where agents/partners conduct MSB activities on your behalf. (3) Agent list (for large MSBs): If you have agents conducting MSB activities (e.g., a payments company with merchant-of-record arrangements), you must maintain and submit a list of agents in states where you transact more than $5M in currency annually. (4) Business description and transaction types covered. Timeline: FinCEN registration is immediate upon filing — the E-Filing system generates a confirmation and assigns an MSB registration number. There is no waiting period or approval process. However, FinCEN registration does not authorize you to operate — it is a registration, not a license. State money transmitter licenses are required separately and have approval timelines of 6-24 months per state. Renewal: MSBs must re-register every two years, or within 180 days of a change in ownership or control, or within 90 days of becoming an MSB. The registration number generated at initial filing must be included in Currency Transaction Reports (CTRs) and Suspicious Activity Reports (SARs). Cost: FinCEN registration itself has no fee. State money transmitter licensing fees vary from $100-$5,000 per state application, with surety bond requirements of $25,000-$1M+.',
  },
  {
    q: 'Does my crypto exchange need state money transmitter licenses in addition to FinCEN registration?',
    a: 'Yes, in most cases. FinCEN MSB registration covers federal Bank Secrecy Act (BSA) compliance, but money transmission in the US is also regulated at the state level. 49 states plus DC and several territories have money transmitter license (MTL) laws, and most of them require a license before you operate in that state — regardless of FinCEN registration. State MTL requirements vary significantly: (1) States that require a license: Most states require an MTL for transmitting money, value, or cryptocurrency within or to/from the state. This includes California, New York (BitLicense — see below), Texas, Florida, and most others. (2) States with exemptions or simplified processes: Montana has no MTL law. Wyoming has crypto-friendly statutes including special purpose depository institution (SPDI) charters as an alternative. (3) New York BitLicense: New York requires a separate virtual currency business activity license (BitLicense, 23 NYCRR 200) in addition to, or instead of, the traditional MTL. The BitLicense is among the most demanding state-level requirements: $5,000 application fee, surety bond or trust fund of $100K minimum, extensive AML/KYC requirements, and approval taking 12-18+ months on average. (4) FinCEN registration exemption for state-licensed MTLs: In most states, possessing a valid state MTL satisfies state law. FinCEN registration is still required federally. Multistate licensing: Operating nationwide requires MTLs in all states where you have customers, unless you qualify for an exemption or use a licensed partner under a money-services agreement. Multistate licensing applications are typically managed through NMLS (Nationwide Multistate Licensing System), which streamlines applications. National average for full multistate licensing: 12-18 months, $200,000-$500,000 in fees, bonds, and legal costs.',
  },
  {
    q: 'What is the difference between FinCEN VASP designation and MSB registration?',
    a: 'VASP (Virtual Asset Service Provider) is a FATF (Financial Action Task Force) terminology used in international regulatory frameworks, not a US domestic registration category. In the US, the relevant registration category is MSB (Money Services Business) with FinCEN. However, VASP status matters for US crypto companies in two ways: (1) FATF Travel Rule compliance: The FATF Travel Rule requires VASPs to collect, verify, and transmit originator and beneficiary information for crypto transactions exceeding $3,000. FinCEN has implemented the Travel Rule through 31 CFR § 103.33(g), which requires MSBs to transmit specified information alongside transmittals of funds exceeding $3,000. For crypto, this means collecting KYC information on senders and recipients of crypto transactions above the threshold and transmitting that information to the receiving VASP. (2) International counterpart requirements: If your US crypto company transacts with non-US crypto exchanges or wallets (foreign VASPs), those foreign entities may require VASP verification under their domestic regulations (MiCA in the EU, VARA in Dubai, etc.). Failure to be a compliant VASP under applicable foreign law can result in transaction blocking by foreign counterparties. FinCEN has proposed extending the FATF Travel Rule more comprehensively to unhosted wallets (transactions sent to non-custodial wallet addresses) but has not finalized these rules as of mid-2026. The proposed rule would require CDD on recipients at crypto exchanges even for peer-to-peer transactions above certain thresholds.',
  },
  {
    q: 'What AML program must an MSB maintain after registering with FinCEN?',
    a: 'FinCEN requires every MSB to develop and implement a written Anti-Money Laundering (AML) program under 31 CFR § 1022.210. The program must be reasonably designed to prevent the MSB from being used to facilitate money laundering and the financing of terrorism. The four pillars of a BSA-compliant MSB AML program: (1) Written policies, procedures, and internal controls: A documented program covering customer identification, transaction monitoring, high-risk customer and transaction screening, and SAR filing procedures. For crypto MSBs, this includes blockchain analytics integration, wallet screening policies, and Travel Rule implementation. (2) Compliance officer: A designated individual responsible for day-to-day AML compliance, who coordinates with FinCEN examinations and law enforcement requests. Must be knowledgeable about BSA obligations, have adequate authority, and receive ongoing training. (3) Employee training: Annual AML training for all personnel who handle transactions or interact with customers — covering red flags, SAR filing procedures, and regulatory requirements. (4) Independent audit: Annual review by an independent party (internal audit function or external auditor) assessing the effectiveness of the AML program and identifying gaps. For crypto MSBs, the AML program must also address: Blockchain analytics and transaction monitoring (using tools like Chainalysis, Elliptic, or TRM Labs); Sanctions screening (OFAC SDN list, OFAC\'s Specially Designated Nationals list — FinCEN and OFAC have brought joint enforcement against crypto entities for both AML failures and sanctions violations); Travel Rule transmission procedures; Enhanced due diligence (EDD) for high-risk customers, including PEPs, jurisdictions on FATF high-risk lists, and customers transacting with mixing services or darknet markets.',
  },
  {
    q: 'What are the penalties for operating as an unregistered MSB?',
    a: 'Operating as an unregistered MSB is a federal criminal violation under 18 U.S.C. § 1960 (Prohibition of Unlicensed Money Transmitting Businesses). This is distinct from BSA/AML violations — § 1960 criminalizes the operation itself, regardless of whether any money laundering occurred. Criminal penalties under 18 U.S.C. § 1960: up to 5 years imprisonment per count; no minimum sentence, but federal sentencing guidelines produce significant sentences for large-scale operations. The statute does not require proof of criminal intent beyond knowledge that state licensing was required and failure to comply — "willfulness" for the criminal penalty is satisfied by operating without a license while knowing a license requirement exists. Major enforcement examples: (1) Liberty Reserve (2013): $6B money laundering operation; founder sentenced to 20 years. (2) BitMEX founders (2022-2023): Pled guilty, received probation/fines; CFTC parallel enforcement totaled $100M. (3) Binance/CZ (2023): DOJ BSA/AML charges; CZ pled guilty, sentenced to 4 months imprisonment and $50M personal fine; Binance entity paid $4B+ across DOJ, CFTC, and FinCEN. (4) Helix/Bitcoin Fog mixers: Operators sentenced to 12 and 4.5 years respectively for unlicensed money transmission. Civil penalties: FinCEN may assess civil money penalties under 31 USC § 5321 of up to $1M per day per willful violation. The combination of BSA/AML civil penalties and criminal prosecution under § 1960 creates a two-track enforcement risk. Key point: FinCEN registration is the easy step — it takes 20 minutes. State MTL licensing is the long path. Operating without state licenses is a significant risk, but operating without even FinCEN registration while serving US customers is criminal exposure that no startup should take.',
  },
]

export default function FinCENMSBGuidePage() {
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'FinCEN MSB Registration Guide for Crypto and Fintech Startups (2025)',
    description: 'MSB definition, 6 triggering categories, FinCEN registration process, state MTL requirements, VASP designation, Travel Rule compliance, AML program requirements, and criminal penalties for unregistered operation.',
    url: 'https://bizlegal-ai.com/guides/fincen-msb-registration-guide',
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
      { '@type': 'ListItem', position: 3, name: 'FinCEN MSB Registration Guide', item: 'https://bizlegal-ai.com/guides/fincen-msb-registration-guide' },
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
          FinCEN MSB Registration
        </nav>

        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5 }}>
          US Financial Regulation
        </span>

        <h1 style={{ fontSize: 'clamp(1.7rem, 4vw, 2.5rem)', fontWeight: 700, lineHeight: 1.2, margin: '0.75rem 0 1.25rem' }}>
          FinCEN MSB Registration Guide for Crypto and Fintech Startups (2025)
        </h1>

        <p style={{ fontSize: '1.05rem', lineHeight: 1.75, opacity: 0.85, marginBottom: '2.5rem' }}>
          Operating a crypto exchange, wallet, or money transmission product in the US without registering as a Money Services Business with FinCEN is a federal crime under 18 U.S.C. § 1960 — up to 5 years imprisonment per count. Registration itself takes 20 minutes and costs nothing. State money transmitter licenses take longer and cost more. This guide covers when you qualify, how to register, what state licenses you need, and what your AML program must include.
        </p>

        <div style={{ padding: '1rem 1.25rem', background: '#dc262608', border: '1px solid #dc262630', borderRadius: '8px', marginBottom: '2rem' }}>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.7, margin: 0 }}>
            <strong>Criminal exposure:</strong> Unregistered MSB operation is not a technical violation — it is a federal felony. The DOJ has prosecuted foreign and domestic crypto founders under 18 U.S.C. § 1960 regardless of where the company was incorporated. If you accept US customers and transmit value, get this right first.
          </p>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border, #e5e7eb)', marginBottom: '2.5rem' }} />

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>The 6 MSB Categories: Which One Applies to Your Business?</h2>
          <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Category</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Applies to</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Crypto/fintech relevance</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Currency dealer/exchanger', 'Anyone who exchanges currency for customers at a profit', 'Crypto exchanges (BTC ↔ USD, ETH ↔ USD, etc.)'],
                  ['Check casher', 'Entities that exchange checks, drafts, or money orders for currency', 'Limited crypto relevance'],
                  ['Issuer of stored value', 'Companies that issue prepaid cards or stored value instruments', 'Stablecoin issuers, prepaid fintech cards'],
                  ['Seller/redeemer of stored value', 'Entities that redeem or resell stored value instruments', 'Gift card marketplaces, stablecoin redemption'],
                  ['Money transmitter', 'Anyone who accepts and transmits funds or value to another location or person', 'Crypto wallets, cross-border payments, DeFi protocols, payment processors'],
                  ['US Postal Service', 'Specific to USPS', 'N/A'],
                ].map(([cat, applies, relevance]) => (
                  <tr key={cat} style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600 }}>{cat}</td>
                    <td style={{ padding: '10px 12px', opacity: 0.8 }}>{applies}</td>
                    <td style={{ padding: '10px 12px', opacity: 0.8, fontStyle: 'italic' }}>{relevance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ lineHeight: 1.75 }}>
            Most crypto startups fall into the "money transmitter" category. The critical element: "accepts and transmits." If your product accepts funds from User A and transmits them to User B — even on-chain, even using smart contracts — you are likely a money transmitter. The 2019 FinCEN guidance on digital assets explicitly addressed DeFi protocols, stating that software developers who have control or sufficient influence over the protocol they developed may be money transmitters even if the protocol is non-custodial.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>MSB Exemptions: Who Does NOT Need to Register</h2>
          <p style={{ lineHeight: 1.75, marginBottom: '0.75rem' }}>
            FinCEN regulations include several exemptions from MSB status. The most relevant for crypto/fintech:
          </p>
          <ul style={{ paddingLeft: '1.5rem', lineHeight: 1.9 }}>
            <li><strong>Banks and credit unions:</strong> Federally insured depository institutions are subject to BSA directly through their primary regulators (OCC, FDIC, Federal Reserve) — not through FinCEN MSB registration.</li>
            <li><strong>Payment processors acting as intermediaries:</strong> Companies that provide clearing or settlement services through licensed intermediaries, where they never receive customer funds in their own accounts, may be exempt under the payment processor exemption. This exemption is narrow and fact-specific — consult counsel before relying on it.</li>
            <li><strong>Brokers and dealers in securities:</strong> Registered broker-dealers under the Exchange Act are exempt from MSB registration for activities regulated by the SEC, but may still be MSBs for non-securities activities.</li>
            <li><strong>Natural persons:</strong> Individuals who transmit value only for personal (non-business) purposes are exempt. Peer-to-peer crypto transfers between individuals are not MSB activity.</li>
            <li><strong>Intracompany transfers:</strong> Transfers of funds between entities within the same corporate group (parent, subsidiaries) are exempt if conducted solely for internal purposes with no third-party involvement.</li>
          </ul>
          <p style={{ lineHeight: 1.75, marginTop: '1rem', padding: '1rem', background: 'var(--color-bg-secondary, #f9fafb)', borderRadius: '8px', borderLeft: '3px solid #f59e0b' }}>
            <strong>The DEX question:</strong> FinCEN has not conclusively ruled on whether all DEX operators are MSBs, but its 2019 guidance indicates that "control or sufficient influence" over a protocol can create MSB status. DEX operators who can update the protocol, collect fees, have admin keys, or otherwise control user funds face the highest risk. Pure smart contracts with no developer control are a different analysis.
          </p>
        </section>

        {/* DocAI CTA */}
        <div style={{ margin: '2.5rem 0', padding: '1.5rem', background: 'linear-gradient(135deg, #1a56db08, #1a56db14)', border: '1px solid #1a56db30', borderRadius: '10px' }}>
          <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6, marginBottom: '0.5rem' }}>Contract Risk — $97</p>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.75rem' }}>Review Your User Agreement for MSB-Triggering Language in 60 Seconds</h3>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.7, opacity: 0.85, marginBottom: '1.25rem' }}>
            Terms of service, user agreements, and product descriptions often inadvertently describe money transmission activity in ways that trigger FinCEN MSB registration and state MTL requirements. BizLegal AI scans your platform terms for money-transmission language, liability disclaimers that conflict with MSB obligations, and missing AML-required disclosures — before FinCEN or a state banking examiner reviews them first.
          </p>
          <a href="https://docai.bizlegal-ai.com" style={{ display: 'inline-block', padding: '0.6rem 1.25rem', background: '#1a56db', color: '#fff', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>
            Scan Your Platform Terms →
          </a>
        </div>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1.25rem' }}>Frequently Asked Questions</h2>
          {FAQS.map((faq, i) => (
            <div key={i} style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: i < FAQS.length - 1 ? '1px solid var(--color-border, #e5e7eb)' : 'none' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', lineHeight: 1.4 }}>{faq.q}</h3>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.75, opacity: 0.85, margin: 0 }}>{faq.a}</p>
            </div>
          ))}
        </section>

        <div style={{ borderTop: '1px solid var(--color-border, #e5e7eb)', paddingTop: '2rem', marginTop: '2rem', marginBottom: '2rem' }}>
          <p style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: '1rem' }}>Related compliance resources</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            <Link href="/guides/aml-kyc-compliance-crypto" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>AML & KYC for Crypto →</Link>
            <Link href="/guides/sec-crypto-compliance-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>SEC Crypto Compliance →</Link>
            <Link href="/guides/cftc-crypto-regulation-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>CFTC Commodity Guide →</Link>
            <Link href="/guides/vara-licensing-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>VARA Licensing (Dubai) →</Link>
            <Link href="/guides" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>All Compliance Guides →</Link>
          </div>
        </div>

        <footer style={{ borderTop: '1px solid var(--color-border, #e5e7eb)', paddingTop: '1.5rem', fontSize: '0.8rem', opacity: 0.5 }}>
          <p style={{ margin: 0, lineHeight: 1.7 }}>
            This guide is for informational purposes only and does not constitute legal advice. MSB classification and state money transmitter licensing requirements are highly fact-specific. FinCEN interpretive rulings change as new financial products emerge. The DEX and DeFi analysis in this guide reflects FinCEN\'s 2019 guidance but is subject to further regulatory and judicial development. Consult qualified financial regulatory counsel before launching any product that transmits value on behalf of users.
          </p>
        </footer>

      </main>
    </>
  )
}
