import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Compliance Guides for SaaS, Fintech & Crypto Startups | BizLegal AI',
  description: 'Practitioner-written compliance guides for founders. BOI, GDPR, MiCA, EU AI Act, DORA, HIPAA, SEC crypto, India DPDPA, SOC 2, AML/KYC, VARA licensing, privacy policy monitoring, marketplace 1099-K, AI governance frameworks, and more.',
  alternates: { canonical: 'https://bizlegal-ai.com/guides' },
  openGraph: {
    title: 'Compliance Guides — BizLegal AI',
    description: 'Step-by-step compliance guides written by practicing attorneys. BOI, GDPR, MiCA, CCO vs retainer, forensic wallet analysis, and more.',
    url: 'https://bizlegal-ai.com/guides',
    type: 'website',
  },
}

const GUIDES = [
  {
    href: '/guides/beneficial-ownership-information-filing',
    title: 'BOI Filing Guide: Beneficial Ownership Information Report (2025)',
    description: 'Who must file, what information is required, filing deadlines, the 23 exemptions, and penalties for non-compliance.',
    tag: 'Corporate Compliance',
    product: null,
  },
  {
    href: '/guides/gdpr-compliance-checklist-saas',
    title: 'GDPR Compliance Checklist for SaaS Startups (2025)',
    description: 'Legal bases for processing, privacy notices, data processor agreements, breach notification, and international transfers — all 7 phases.',
    tag: 'Privacy & Data',
    product: null,
  },
  {
    href: '/guides/mica-regulation-crypto-compliance',
    title: 'MiCA Regulation: What Crypto Startups Must Do',
    description: 'CASP authorization requirements, token whitepaper rules, ART/EMT obligations, and MiCA extraterritorial reach for non-EU companies.',
    tag: 'Crypto Regulation',
    product: null,
  },
  {
    href: '/guides/fractional-cco-vs-compliance-retainer',
    title: 'Fractional CCO vs Compliance Retainer: Which Do You Need?',
    description: 'Cost comparison, use-case matrix, and when each model fits — for pre-Series B teams with real compliance obligations but not enough for a full-time hire.',
    tag: 'Compliance Strategy',
    product: null,
  },
  {
    href: '/guides/blockchain-wallet-investigation',
    title: 'How to Investigate a Crypto Wallet: Forensic Analysis Guide',
    description: 'What on-chain forensics reveals, when to commission a blockchain investigation, what data sources are used, and how to use wallet reports for legal proceedings.',
    tag: 'Crypto Forensics',
    product: null,
  },
  {
    href: '/guides/compliance-health-score-saas',
    title: 'Compliance Health Score for SaaS Startups: What It Means',
    description: 'What a compliance health score measures, why enterprise customers ask for it, which frameworks it covers, and how to improve your score before an audit.',
    tag: 'Compliance Posture',
    product: null,
  },
  {
    href: '/guides/soc2-compliance-checklist-saas',
    title: 'SOC 2 Compliance Checklist for SaaS Startups (2025)',
    description: 'Type I vs Type II, the five Trust Service Criteria, what auditors collect as evidence, the timeline from zero to report, and the controls most SaaS companies are missing.',
    tag: 'Security & Compliance',
    product: null,
  },
  {
    href: '/guides/aml-kyc-compliance-crypto',
    title: 'AML & KYC Compliance Checklist for Crypto Companies (2025)',
    description: 'FATF Travel Rule implementation, FinCEN MSB registration, EU AMLD obligations, transaction monitoring red flags, and the AML program components regulators require.',
    tag: 'Crypto Compliance',
    product: null,
  },
  {
    href: '/guides/vara-licensing-guide',
    title: 'VARA Licensing Guide: Getting Licensed in Dubai for Crypto (2025)',
    description: 'VARA license categories, capital requirements, the three-stage application process, mandatory insurance, and how VARA compares to MiCA and ADGM for crypto businesses.',
    tag: 'Crypto Licensing',
    product: null,
  },
  {
    href: '/guides/eu-ai-act-compliance-guide',
    title: 'EU AI Act Compliance Guide for SaaS & AI Companies (2025)',
    description: 'Article 6 + Annex III risk classification, GPAI model obligations, the 10 high-risk system requirements, conformity assessment, and the 2026-08-02 deadline — for SaaS founders and AI product teams.',
    tag: 'AI Regulation',
    product: null,
  },
  {
    href: '/guides/india-dpdpa-compliance-guide',
    title: 'India DPDPA Compliance Guide for B2B SaaS (2025)',
    description: 'Does DPDPA apply to you? Notice + consent requirements, data principal rights, Significant Data Fiduciary criteria, and the ₹250 crore fine schedule — for SaaS with India-resident users.',
    tag: 'Privacy Law',
    product: null,
  },
  {
    href: '/guides/privacy-policy-compliance-guide',
    title: 'Privacy Policy Compliance Guide for SaaS Startups (2025)',
    description: '7 frameworks, 6 policy sections, 6 events that make your policy stale immediately. GDPR, CCPA, CPRA, Quebec Law 25, Colorado, Connecticut, Texas DPSA. Real enforcement cases, real fines.',
    tag: 'Privacy & Data',
    product: null,
  },
  {
    href: '/guides/marketplace-tax-compliance-guide',
    title: 'Marketplace Tax & 1099-K Compliance Guide for Platforms (2025)',
    description: '1099-K threshold drops to $600 in 2025. Platform-by-platform reporting rules, marketplace facilitator laws in 45 states, and the per-form penalty schedule for getting it wrong.',
    tag: 'Tax Compliance',
    product: null,
  },
  {
    href: '/guides/ai-governance-framework-guide',
    title: 'AI Governance Framework Guide for SaaS & Enterprises (2025)',
    description: 'NIST AI RMF vs ISO/IEC 42001 vs EU AI Act: who needs what, the 6-component governance program, the 8 high-risk use cases, and penalty comparison across all three frameworks.',
    tag: 'AI Regulation',
    product: null,
  },
  {
    href: '/guides/contract-risk-analysis-guide',
    title: 'Contract Risk Analysis Guide: 7 Red Flags in Every Vendor Agreement (2025)',
    description: 'Unlimited liability, unilateral modification, auto-renewal traps, perpetual data license grants. The 7 clauses that destroy startups — and the counter-position for each.',
    tag: 'Contracts',
    product: null,
  },
  {
    href: '/guides/iso-27001-vs-soc2-guide',
    title: 'ISO 27001 vs SOC 2: Which Does Your SaaS Startup Need? (2025)',
    description: 'ISO 27001 takes 9-18 months and costs $40-80K. SOC 2 takes 4-9 months and costs $20-50K. Which one enterprise customers actually require — and when you need both.',
    tag: 'Security & Compliance',
    product: null,
  },
  {
    href: '/guides/startup-compliance-program-guide',
    title: 'Startup Compliance Program Guide: When You Need One and How to Build It (2025)',
    description: '6 triggers that make a compliance program non-negotiable. 7 program components. 4 staffing models. The 12-month compliance calendar every fintech founder needs.',
    tag: 'Compliance Strategy',
    product: null,
  },
  {
    href: '/guides/hipaa-compliance-checklist-saas',
    title: 'HIPAA Compliance Checklist for Healthcare SaaS (2025)',
    description: 'The three HIPAA rules, Business Associate Agreement requirements, ePHI technical safeguards, breach notification timelines, and the 2024 HIPAA Safe Harbor for cybersecurity frameworks.',
    tag: 'Healthcare Privacy',
    product: null,
  },
  {
    href: '/guides/dora-ict-compliance-guide',
    title: 'DORA Compliance Guide for ICT Vendors and EU Financial Entities (2025)',
    description: 'Five DORA pillars, Article 30 contract checklist (audit rights, incident notification, exit strategies), 4h/72h/1-month incident reporting, CTPP designation, and TLPT obligations.',
    tag: 'EU Financial Regulation',
    product: null,
  },
  {
    href: '/guides/sec-crypto-compliance-guide',
    title: 'SEC Crypto Compliance Guide for Token Issuers and Web3 Startups (2025)',
    description: 'Howey Test token classification, Reg D / Reg S / Reg CF exemptions, SAFT structures, broker-dealer registration triggers, and the post-Ripple SEC enforcement landscape for crypto founders.',
    tag: 'US Securities Law',
    product: null,
  },
  {
    href: '/guides/pci-dss-compliance-guide-saas',
    title: 'PCI DSS Compliance Guide for SaaS Startups (2025)',
    description: 'Merchant level tiers, SAQ A vs SAQ D scope, PCI DSS v4.0 changes (script integrity, MFA requirements), tokenization scope reduction, and what your merchant service agreement says about breach liability.',
    tag: 'Payment Security',
    product: null,
  },
  {
    href: '/guides/cftc-crypto-regulation-guide',
    title: 'CFTC Crypto Regulation Guide: Commodity vs Security Classification (2025)',
    description: 'CFTC jurisdiction over Bitcoin and Ethereum, crypto derivatives exchange registration (DCM, SEF), ECP requirements, CFTC enforcement record (BitMEX, Binance), and the FIT21 digital commodity framework.',
    tag: 'US Commodities Law',
    product: null,
  },
  {
    href: '/guides/gdpr-data-processing-agreement-guide',
    title: 'GDPR Data Processing Agreement (DPA) Guide: Article 28 Requirements (2025)',
    description: 'The 12 mandatory DPA terms under Article 28 GDPR, controller-processor role analysis, sub-processor chain management, SCC integration for international transfers, and enterprise DPA negotiation strategy.',
    tag: 'Privacy & Data',
    product: null,
  },
  {
    href: '/guides/fincen-msb-registration-guide',
    title: 'FinCEN MSB Registration Guide for Crypto and Fintech Startups (2025)',
    description: 'When your crypto exchange, wallet, or payments product qualifies as a Money Services Business, FinCEN Form 107 registration, state money transmitter licenses, VASP/Travel Rule obligations, and criminal penalties for unregistered operation.',
    tag: 'US Financial Regulation',
    product: null,
  },
  {
    href: '/guides/saas-vendor-agreement-review-guide',
    title: 'SaaS Vendor Agreement Review Guide: What to Check Before Signing (2025)',
    description: 'Uncapped liability exposure, broad AI training data rights, auto-renewal traps, IP ownership of work product, uptime SLA gaps, and termination rights — the 10 highest-risk clauses in SaaS vendor agreements and how to negotiate each one.',
    tag: 'Contract Risk',
    product: null,
  },
  {
    href: '/guides/nda-review-guide',
    title: 'NDA Review Guide: Red Flags and What to Negotiate Before Signing (2025)',
    description: 'One-way vs mutual NDAs, overbroad confidentiality scope, perpetual duration, residuals clauses, uncapped liquidated damages, permitted disclosure gaps, and the 8 provisions every legal team should check before signing a non-disclosure agreement.',
    tag: 'Contract Risk',
    product: null,
  },
  {
    href: '/guides/contractor-agreement-guide',
    title: 'Independent Contractor Agreement Guide: Avoiding Misclassification (2025)',
    description: 'The ABC test (California AB5), IRS 20-factor test, UK IR35, and EU Platform Work Directive — misclassification penalties and the 5 contractor agreement clauses that most often trigger reclassification findings.',
    tag: 'Employment Law',
    product: null,
  },
  {
    href: '/guides/terms-of-service-guide-saas',
    title: 'Terms of Service Compliance Guide for SaaS Startups (2025)',
    description: 'FTC Click-to-Cancel rule (2024), limitation of liability caps, DMCA safe harbor registration, class action waiver enforceability, EU Digital Services Act obligations, and clickwrap vs. browsewrap assent — the 14 ToS provisions every SaaS company must address.',
    tag: 'Contract Risk',
    product: null,
  },
  {
    href: '/guides/ccpa-cpra-compliance-checklist',
    title: 'CCPA / CPRA Compliance Checklist for SaaS Startups (2025)',
    description: 'CCPA applicability thresholds ($25M revenue / 100K consumers), 6 consumer rights (including CPRA right to correct and sensitive PI limits), service provider DPA requirements, GPC signal compliance, and CPPA $7,500-per-violation enforcement powers.',
    tag: 'Privacy Law',
    product: null,
  },
  {
    href: '/guides/data-breach-response-guide',
    title: 'Data Breach Response Guide: Notification Timelines and Legal Obligations (2025)',
    description: 'GDPR 72-hour supervisory authority notification, HIPAA 60-day breach reporting, CCPA breach obligations, 50-state notification laws (30-90 day patchwork), DPA breach clauses, and the first 72-hour legal response playbook.',
    tag: 'Incident Response',
    product: null,
  },
]

export default function GuidesIndexPage() {
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bizlegal-ai.com' },
      { '@type': 'ListItem', position: 2, name: 'Guides', item: 'https://bizlegal-ai.com/guides' },
    ],
  }

  const collectionLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'BizLegal AI Compliance Guides',
    description: 'Practitioner-written compliance guides for SaaS, fintech, and crypto startups',
    url: 'https://bizlegal-ai.com/guides',
    numberOfItems: GUIDES.length,
    itemListElement: GUIDES.map((g, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: g.title,
      url: `https://bizlegal-ai.com${g.href}`,
      description: g.description,
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }} />

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem 1.5rem' }}>

        <nav style={{ fontSize: '0.8rem', opacity: 0.55, marginBottom: '2rem' }}>
          <a href="/" style={{ color: 'inherit' }}>Home</a>
          {' → '}
          Guides
        </nav>

        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.75rem)', fontWeight: 700, lineHeight: 1.2, marginBottom: '1rem' }}>
          Compliance Guides
        </h1>

        <p style={{ fontSize: '1.05rem', lineHeight: 1.75, opacity: 0.8, marginBottom: '3rem' }}>
          Practical, practitioner-written guides for founders and compliance teams navigating BOI filing, GDPR, MiCA, crypto forensics, and compliance program structure. No jargon without explanation. No advice without context.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '1.5rem',
            marginBottom: '3rem',
          }}
        >
          {GUIDES.map((guide) => (
            <a
              key={guide.href}
              href={guide.href}
              style={{
                display: 'block',
                border: '1px solid var(--color-border, #e5e7eb)',
                borderRadius: '12px',
                padding: '1.5rem',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'border-color 0.15s',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  fontWeight: 600,
                  opacity: 0.5,
                  marginBottom: '0.6rem',
                }}
              >
                {guide.tag}
              </span>
              <h2
                style={{
                  fontSize: '1rem',
                  fontWeight: 700,
                  lineHeight: 1.4,
                  marginBottom: '0.6rem',
                  marginTop: 0,
                }}
              >
                {guide.title}
              </h2>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.65, opacity: 0.7, margin: 0 }}>
                {guide.description}
              </p>
            </a>
          ))}
        </div>

        <div
          style={{
            borderTop: '1px solid var(--color-border, #e5e7eb)',
            paddingTop: '2rem',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1.5rem',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <p style={{ margin: 0, opacity: 0.65, fontSize: '0.9rem' }}>
            Need compliance support beyond what a guide can provide?
          </p>
          <a
            href="https://docai.bizlegal-ai.com"
            style={{
              padding: '0.65rem 1.5rem',
              background: 'var(--primary, #1a56db)',
              color: '#fff',
              borderRadius: '8px',
              fontWeight: 600,
              textDecoration: 'none',
              fontSize: '0.9rem',
              whiteSpace: 'nowrap',
            }}
          >
            Scan a Contract — $97
          </a>
        </div>
      </main>
    </>
  )
}
