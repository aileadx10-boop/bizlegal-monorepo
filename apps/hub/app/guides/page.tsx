import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Compliance Guides for SaaS, Fintech & Crypto Startups | BizLegal AI',
  description: 'Practitioner-written compliance guides for founders. BOI filing, GDPR, MiCA, EU AI Act, India DPDPA, SOC 2, AML/KYC for crypto, VARA licensing, CCO vs retainer, wallet investigation, and compliance health scores.',
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
