import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'UK FCA Crypto Compliance Guide (2025): Financial Promotions, VASP Registration, PSR 2024 | BizLegal AI',
  description: 'UK Financial Promotions Regime for crypto assets (October 2023), FCA crypto asset business registration, PSR 2024 Travel Rule requirements, Section 21 approval, risk warnings format, and what non-UK companies must do to market to UK retail users.',
  alternates: { canonical: 'https://bizlegal-ai.com/guides/uk-fca-crypto-compliance-guide' },
  openGraph: {
    title: 'UK FCA Crypto Compliance Guide — BizLegal AI',
    description: 'UK Financial Promotions Regime 2023 enforcement, FCA VASP registration, PSR Travel Rule, Section 21 approval process, and what crypto companies must do to legally market to UK retail users.',
    url: 'https://bizlegal-ai.com/guides/uk-fca-crypto-compliance-guide',
    type: 'article',
  },
}

const FAQS = [
  {
    q: 'What is the UK Financial Promotions Regime for crypto assets and when did it become enforceable?',
    a: 'The UK Financial Promotions Regime was extended to cover qualifying crypto assets on 8 October 2023. From that date, any person communicating — or causing the communication of — a financial promotion relating to a qualifying crypto asset to a person in the United Kingdom must either: (a) be an FCA-authorised person; (b) have the promotion approved by an FCA-authorised person under Section 21 of the Financial Services and Markets Act 2000 (FSMA); or (c) rely on a statutory exemption. This applies to all forms of promotion, including: websites and landing pages, social media posts, paid advertising, email marketing, influencer content, podcasts, YouTube videos, X (Twitter) posts, press releases, and app store listings — regardless of whether the business is UK-based. Non-UK companies targeting UK retail users fall squarely within the regime. Qualifying crypto assets are defined as cryptographically secured digital representations of value or contractual rights that are transferable and fungible — broadly capturing Bitcoin, Ethereum, and most altcoins, stablecoins, and tokens. Security tokens that are already regulated as financial instruments under the UK FPO are not separately caught by the crypto extension. NFTs that are unique, non-fungible, and not used as investments are generally excluded, though the FCA has cautioned that fractionalized NFTs or those marketed as investments may fall within scope. Who enforces it: the Financial Conduct Authority (FCA). Penalties: Section 25 FSMA — criminal offences for communicating an unlawful financial promotion carry up to 2 years imprisonment and/or an unlimited fine. The FCA also has civil enforcement powers and can require firms to withdraw promotions. The FCA has already issued several warning notices and taken action against non-UK platforms continuing to market to UK retail users without compliance.',
  },
  {
    q: 'What is FCA Section 21 approval and how does it work for crypto promotions?',
    a: 'Section 21 of FSMA prohibits any person from communicating a financial promotion in the course of business unless they are FCA-authorised or the promotion is approved by an FCA-authorised person. For crypto companies that are not themselves FCA-authorised, Section 21 approval by an authorised firm is the principal pathway to lawfully marketing to UK retail users. The approval process: the crypto company (the "originator") prepares its promotional materials and submits them to an FCA-authorised Section 21 approver. The approver reviews the promotion for compliance with the FCA\'s financial promotion rules, including PS22/10 (the policy statement implementing the crypto financial promotions regime), COBS 4.12B (the crypto-specific financial promotions conduct rules), and the Consumer Duty (for promotions directed at retail clients). The approver, if satisfied, formally approves the promotion by signing or countersigning the materials. The originator can then communicate the approved promotion to UK retail users. Who can be a Section 21 approver: only FCA-authorised firms with the specific regulatory permissions to approve financial promotions. Importantly, since January 2024, not all FCA-authorised firms can approve crypto promotions — the FCA introduced a dedicated crypto asset financial promotion permission (CAFP) that approvers must specifically hold. A firm with general Section 21 approval permissions but no CAFP cannot approve crypto promotions. Key Section 21 requirements for approved crypto promotions: (1) Clear and prominent risk warning in the prescribed FCA format (see FAQ 3); (2) 24-hour cooling-off period before retail clients can first invest (first-time investors must wait 24 hours after initial contact before completing a transaction); (3) Personalised risk warning for first-time investors; (4) Incentives ban — no "refer a friend" bonuses, sign-up bonuses, or other incentives to invest; (5) Accurate, fair, and not misleading content throughout. Liability for approvals: the Section 21 approver takes legal responsibility for the compliance of the approved promotion. This means approvers conduct substantive due diligence and typically charge fees of £500-£5,000+ per promotion approval. Ongoing monitoring: promotions must be periodically reviewed (typically every 3-6 months) for continued accuracy; material changes require reapproval.',
  },
  {
    q: 'What risk warnings are required for UK crypto financial promotions?',
    a: 'The FCA mandates specific risk warning language and formats for qualifying crypto asset financial promotions under COBS 4.12B and PS22/10. The risk warnings are non-negotiable — the exact prescribed text must be used. Required risk warning elements: (1) Headline warning (mandatory for all promotions): "Don\'t invest unless you\'re prepared to lose all the money you invest. This is a high-risk investment and you are unlikely to be protected if something goes wrong." This exact text must appear prominently in the promotion. (2) Risk summary (required for certain media): "Take 2 mins to learn more." with a link to a dedicated risk page. The FCA specifies the required content of the risk page. (3) For first-time investors (personalized risk warning): the crypto firm must present a personalized risk warning to first-time investors confirming they understand the risks. (4) The 24-hour cooling-off: after presenting the personalized risk warning to a first-time investor, the firm cannot accept an investment instruction from that investor until 24 hours have elapsed. This is a firm operational requirement, not just a disclosure. Format requirements: the risk warning must appear with adequate prominence — the FCA considers font size, color contrast, and positioning on screen/page. A risk warning buried in small print at the bottom of a landing page does not comply. For images and video: the risk warning must be visible on the image or in the video — a separate link is not sufficient for image-based promotions. For social media (Twitter/X, Instagram, Facebook): the character limit creates practical challenges. The FCA guidance states that if a full risk warning cannot fit in a social media post, the promotion must include a prominent link to the full promotion with the risk warning — the truncated post must itself not constitute a misleading promotion. Practically, most compliant crypto social posts include a version of the risk warning within the post itself plus a link to the full promotion page. Prohibited content: promotions must not: (a) reference past performance without mandated past performance disclaimers; (b) include testimonials or endorsements by celebrities or influencers unless those individuals are FCA-authorised; (c) use urgency tactics or artificial scarcity language; (d) include any incentive to acquire a crypto asset. The incentives ban is absolute — no referral bonuses, no sign-up rewards, no "limited time offer" discounts on trading fees.',
  },
  {
    q: 'What is required under the UK Payment Services Regulations Travel Rule for crypto transfers?',
    a: 'The UK Travel Rule for crypto assets came into force on 1 September 2023 under The Money Laundering and Terrorist Financing (Amendment) (No. 2) Regulations 2022, amending the Payment Services Regulations 2017 (PSR 2017). The UK Travel Rule broadly mirrors the FATF Travel Rule and the EU\'s Transfer of Funds Regulation (TFR) extended to crypto assets. What it requires: when a UK-registered Crypto Asset Service Provider (CASP) transfers crypto assets on behalf of a customer, it must collect, verify, and transmit specified information about the originator and beneficiary to the receiving CASP. Required originator information: name, account number (crypto wallet address), physical address or national identity number or date and place of birth, and the amount and currency of the transfer. Required beneficiary information: name and account number (wallet address). Transmission: the originator CASP must pass this information to the beneficiary CASP simultaneously with the transfer and make it available on request to law enforcement. Thresholds: the UK Travel Rule applies to ALL transfers (there is no de minimis threshold — even a £0.01 transfer triggers the obligation, unlike the EU\'s previous €1,000 threshold approach). Unhosted wallets: transfers to or from unhosted (self-custody) wallets require the CASP to collect and retain originator information, and to assess the risk of the unhosted wallet receiving or sending funds. The FCA has not prescribed exactly what risk assessment must be conducted, but in practice CASPs conduct enhanced due diligence on unhosted wallet transfers above certain thresholds. Sunrise period ended: there was a limited grace period for the travel rule. As of September 2023, full compliance is required. The FCA has stated it will take enforcement action against non-compliant CASPs. VASP-to-VASP messaging protocols: the Travel Rule requires a secure messaging infrastructure to transmit originator/beneficiary data. Common solutions include TRISA (Travel Rule Information Sharing Architecture), Sygna Bridge, Notabene, and VerifyVASP. These platforms handle cryptographically verified peer-to-peer information exchange between CASPs. Failure to verify: a UK CASP cannot process a transfer if it receives a transfer from a CASP that cannot or will not provide Travel Rule-compliant information.',
  },
  {
    q: 'What is FCA crypto asset business registration and what is required to obtain it?',
    a: 'Under the Money Laundering, Terrorist Financing and Transfer of Funds (Information on the Payer) Regulations 2017 (MLRs) as amended, businesses carrying on "crypto asset exchange activity" or "custodian wallet provider" activity in the UK must register with the FCA. This registration is not the same as FCA authorisation — it is an anti-money laundering and counter-terrorism financing (AML/CTF) registration, not a full regulatory permission. Who must register: (1) Crypto exchange businesses — firms that exchange fiat currency for crypto assets or vice versa, or exchange one crypto asset for another, and that provide these services to customers; (2) Custodian wallet providers — firms that safeguard or administer crypto assets or private cryptographic keys on behalf of customers. The registration requirement applies to UK-established businesses. Non-UK companies with no UK establishment do not need MLR registration (but do need Section 21 approval for financial promotions — see FAQ 1). Status as of 2024: the FCA Temporary Registration Regime (TRR), which allowed existing crypto businesses to continue operating while their registration applications were assessed, closed on 31 January 2022. All crypto businesses operating in the UK must now be either fully registered under the MLRs or have received a rejection. The FCA published a list of registered firms and a list of rejected/withdrawn applicants. A firm that has not registered and continues to operate as a crypto exchange or custodian wallet provider is doing so illegally. What the FCA assesses in registration: (1) AML/CTF systems and controls — policies, procedures, risk assessment, transaction monitoring, suspicious activity reporting; (2) Customer due diligence (CDD) procedures — KYC for individuals and businesses; (3) Enhanced due diligence (EDD) procedures for high-risk customers; (4) Travel Rule compliance (post-September 2023); (5) "Fit and proper" assessment of beneficial owners, officers, and managers. The FCA rejects applicants where it has concerns about the quality of AML/CTF systems, criminal history of controllers, or inadequate governance. What comes next — the crypto authorisation regime: the UK is implementing a broader regulatory framework for crypto assets (the Financial Services and Markets Act 2023 contains powers for HM Treasury and the FCA to extend the regulated activities regime to crypto). Secondary legislation and FCA rules under the FSMA crypto framework are expected to come into force in 2025-2026. Businesses with existing MLR registration will need to seek full authorisation when the new regime comes into force.',
  },
  {
    q: 'How does UK FCA crypto regulation compare to EU MiCA and what do companies with both EU and UK users need to do?',
    a: 'UK and EU crypto regulation now diverge significantly following Brexit. Companies serving both markets must satisfy two distinct regulatory frameworks: EU MiCA vs. UK Financial Promotions + MLR registration: MiCA (Markets in Crypto-Assets Regulation, fully applicable from December 2024) is a comprehensive product authorization and market conduct regime. It requires CASPs to obtain authorization in one EU member state and then passport across the EU (single passport mechanism). MiCA imposes consumer protection rules, whitepaper requirements, capital requirements, and AML obligations. UK MLR registration, by contrast, is AML-focused only. UK financial promotions compliance is marketing-focused. The UK does not yet have a MiCA-equivalent product authorization regime (the FSMA 2023 regime is in development, expected 2025-2026). This creates an asymmetry: a company can operate in the UK with only MLR registration and Section 21-approved financial promotions; in the EU under MiCA, it needs CASP authorization covering each activity type. Passporting: the UK is outside the EU single market. A MiCA authorization from an EU member state does NOT passport to the UK. A company serving both EU and UK retail customers needs: (1) MiCA CASP authorization in one EU member state (or ongoing service under Article 60 transitional provisions until mid-2026); (2) FCA MLR registration for UK operations; (3) UK-compliant financial promotions for any marketing to UK users. Practical implications for a global crypto platform: (a) If currently operating in the EU under national law transitional provisions: need to file for MiCA authorization before the transition deadline applicable to your member state (no later than July 2026). (b) For the UK: if providing exchange or custodian wallet services: must be FCA MLR registered; (c) For all marketing to UK retail users (regardless of where the company is established): financial promotions regime compliance is mandatory, including Section 21 approval or FCA authorization of the firm. Key differences in substance: MiCA requires whitepapers for all CAS offerings (except exempted tokens); UK does not yet have an equivalent whitepaper requirement. MiCA requires segregation of client assets for CASPs; UK MLR registration does not impose this directly (the forthcoming FSMA 2023 regime will). MiCA caps stablecoin transaction volumes; UK has not implemented equivalent stablecoin restrictions yet. AML/CTF requirements are functionally similar in both regimes (both implement FATF standards including the Travel Rule).',
  },
]

export default function UKFCACryptoGuide() {
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'UK FCA Crypto Compliance Guide (2025): Financial Promotions, VASP Registration, PSR Travel Rule',
    description: 'UK Financial Promotions Regime for crypto assets (October 2023), FCA VASP registration status, PSR 2024 Travel Rule, Section 21 approval process, mandatory risk warnings, and comparison with EU MiCA.',
    url: 'https://bizlegal-ai.com/guides/uk-fca-crypto-compliance-guide',
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
      { '@type': 'ListItem', position: 3, name: 'UK FCA Crypto Compliance Guide', item: 'https://bizlegal-ai.com/guides/uk-fca-crypto-compliance-guide' },
    ],
  }

  const OBLIGATION_TABLE = [
    { obligation: 'FCA MLR Registration (crypto exchange / custodian wallet)', when: 'If providing exchange or custody services in the UK', deadline: 'Immediate — TRR closed Jan 2022', penalty: 'Criminal offence; unlimited fine; 2yr imprisonment', nonUk: 'No — only UK-established firms' },
    { obligation: 'Financial Promotions Regime', when: 'Any promotion of qualifying crypto to UK persons', deadline: 'In force since 8 October 2023', penalty: '2yr imprisonment; unlimited fine per Section 25 FSMA', nonUk: 'Yes — applies regardless of where company is based' },
    { obligation: 'Section 21 Approval', when: 'If not FCA-authorised and promoting to UK retail', deadline: 'Required before any UK promotion', penalty: 'Criminal liability for uncompliant promotions', nonUk: 'Yes — non-UK companies must obtain approval from UK-authorised approver with CAFP' },
    { obligation: 'Prescribed Risk Warnings', when: 'All qualifying crypto promotions to UK persons', deadline: 'Since 8 October 2023', penalty: 'Promotion treated as unlawful; regulatory action', nonUk: 'Yes — content requirement applies to all promotions to UK persons' },
    { obligation: '24-Hour Cooling-Off Period', when: 'First-time investors in qualifying crypto via the firm', deadline: 'Since 8 October 2023', penalty: 'Transaction may be voidable; regulatory action', nonUk: 'Yes — operational requirement for any firm serving UK retail first-timers' },
    { obligation: 'Travel Rule (PSR 2017 amended)', when: 'All crypto transfers by UK-registered CASPs', deadline: 'Since 1 September 2023 (no threshold)', penalty: 'MLR non-compliance; FCA enforcement; criminal liability', nonUk: 'No — applies to UK-registered CASPs; non-UK CASPs sending to UK must comply at counterparty level' },
    { obligation: 'Incentives Ban', when: 'Any qualifying crypto promotion to UK persons', deadline: 'Since 8 October 2023', penalty: 'Promotion unlawful; regulatory action', nonUk: 'Yes — absolute ban on referral bonuses, sign-up bonuses for qualifying crypto' },
  ]

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
          UK FCA Crypto Compliance Guide
        </nav>

        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5 }}>
          Crypto Regulation
        </span>

        <h1 style={{ fontSize: 'clamp(1.7rem, 4vw, 2.5rem)', fontWeight: 700, lineHeight: 1.2, margin: '0.75rem 0 1.25rem' }}>
          UK FCA Crypto Compliance Guide (2025): Financial Promotions Regime, VASP Registration, PSR Travel Rule
        </h1>

        <p style={{ fontSize: '1.05rem', lineHeight: 1.75, opacity: 0.85, marginBottom: '2.5rem' }}>
          Since 8 October 2023, any person marketing qualifying crypto assets to UK users must comply with the FCA's Financial Promotions Regime — including non-UK companies with no UK establishment. The prescribed risk warnings are mandatory. The 24-hour cooling-off period for first-time investors is operational, not just a disclosure. The incentives ban is absolute. Non-compliance is a criminal offence.
        </p>

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border, #e5e7eb)', marginBottom: '2.5rem' }} />

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>UK Crypto Compliance Obligations Matrix</h2>
          <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', minWidth: '620px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                  <th style={{ textAlign: 'left', padding: '9px 10px', fontWeight: 600 }}>Obligation</th>
                  <th style={{ textAlign: 'left', padding: '9px 10px', fontWeight: 600 }}>Triggered When</th>
                  <th style={{ textAlign: 'left', padding: '9px 10px', fontWeight: 600, color: '#dc2626' }}>Penalty</th>
                  <th style={{ textAlign: 'left', padding: '9px 10px', fontWeight: 600 }}>Applies to Non-UK Co?</th>
                </tr>
              </thead>
              <tbody>
                {OBLIGATION_TABLE.map(({ obligation, when, penalty, nonUk }) => (
                  <tr key={obligation} style={{ borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                    <td style={{ padding: '9px 10px', fontWeight: 600 }}>{obligation}</td>
                    <td style={{ padding: '9px 10px', opacity: 0.8, fontSize: '0.8rem' }}>{when}</td>
                    <td style={{ padding: '9px 10px', opacity: 0.85, fontSize: '0.8rem', color: '#dc2626' }}>{penalty}</td>
                    <td style={{ padding: '9px 10px', fontWeight: 700, color: nonUk.startsWith('Yes') ? '#dc2626' : '#6b7280' }}>{nonUk}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section style={{ marginBottom: '2.5rem', padding: '1.25rem', background: 'rgba(220,38,38,0.05)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '8px' }}>
          <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.7, fontWeight: 600, color: '#dc2626' }}>
            ⚠ The mandatory UK risk warning text (must appear in every qualifying crypto promotion): "Don't invest unless you're prepared to lose all the money you invest. This is a high-risk investment and you are unlikely to be protected if something goes wrong." — This exact text is required by COBS 4.12B. You cannot paraphrase or modify it.
          </p>
        </section>

        {/* DocAI CTA */}
        <div style={{ margin: '2.5rem 0', padding: '1.5rem', background: 'linear-gradient(135deg, #1a56db08, #1a56db14)', border: '1px solid #1a56db30', borderRadius: '10px' }}>
          <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6, marginBottom: '0.5rem' }}>Contract Risk — $97</p>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.75rem' }}>Scan Your UK Crypto Terms, Agreements, or Marketing Copy for FCA Compliance Gaps</h3>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.7, opacity: 0.85, marginBottom: '1.25rem' }}>
            Upload your UK customer terms, financial promotion materials, or FCA Section 21 approval agreement. BizLegal AI identifies missing prescribed risk warning language, prohibited incentive provisions, absent cooling-off period procedures, Travel Rule gaps in your customer agreements, and FCA registration requirements that apply to your specific activities — before FCA enforcement finds them first.
          </p>
          <a href="https://docai.bizlegal-ai.com" style={{ display: 'inline-block', padding: '0.6rem 1.25rem', background: '#1a56db', color: '#fff', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>
            Scan Your UK Crypto Documents →
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
            <Link href="/guides/mica-regulation-crypto-compliance" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>MiCA Crypto Compliance →</Link>
            <Link href="/guides/aml-kyc-compliance-crypto" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>AML/KYC Crypto Compliance →</Link>
            <Link href="/guides/vara-licensing-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>VARA Licensing Guide (Dubai) →</Link>
            <Link href="/guides/sec-crypto-compliance-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>SEC Crypto Compliance →</Link>
            <Link href="/guides/fincen-msb-registration-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>FinCEN MSB Registration →</Link>
            <Link href="/guides/gdpr-data-processing-agreement-guide" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>GDPR DPA Guide →</Link>
            <Link href="/guides" style={{ padding: '0.4rem 0.9rem', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: '6px', fontSize: '0.85rem', textDecoration: 'none', color: 'inherit' }}>All Guides →</Link>
          </div>
        </div>

        <footer style={{ borderTop: '1px solid var(--color-border, #e5e7eb)', paddingTop: '1.5rem', fontSize: '0.8rem', opacity: 0.5 }}>
          <p style={{ margin: 0, lineHeight: 1.7 }}>
            This guide is for informational purposes only and does not constitute legal advice. UK FCA regulatory requirements, including the Financial Promotions Regime, MLR registration requirements, and PSR Travel Rule obligations, are subject to ongoing development and FCA policy guidance. The forthcoming FSMA 2023 crypto asset regime will materially change authorization requirements. Engage qualified UK financial regulatory counsel before marketing to or providing services to UK users.
          </p>
        </footer>

      </main>
    </>
  )
}
