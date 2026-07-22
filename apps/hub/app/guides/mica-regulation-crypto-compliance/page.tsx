import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MiCA Regulation Guide: What Crypto Startups Must Do (2025)',
  description: 'Complete guide to EU MiCA regulation for crypto startups. Who it applies to, CASP authorization requirements, token whitepaper obligations, and how to prepare for compliance.',
  alternates: { canonical: 'https://bizlegal-ai.com/guides/mica-regulation-crypto-compliance' },
  openGraph: {
    title: 'MiCA Regulation Guide: What Crypto Startups Must Do (2025)',
    description: 'MiCA covers crypto-asset service providers and token issuers. CASP authorization was required from December 30, 2024. Here is what you must have in place.',
    url: 'https://bizlegal-ai.com/guides/mica-regulation-crypto-compliance',
    type: 'article',
  },
}

const FAQS = [
  {
    q: 'What does MiCA stand for and when did it take effect?',
    a: 'MiCA stands for Markets in Crypto-Assets Regulation — Regulation (EU) 2023/1114. The regulation entered into force on June 29, 2023. Rules for asset-referenced tokens (ARTs) and e-money tokens (EMTs) became applicable from June 30, 2024. Rules for crypto-asset service providers (CASPs) became applicable from December 30, 2024.',
  },
  {
    q: 'Which businesses does MiCA apply to?',
    a: 'MiCA applies to: (1) crypto-asset service providers (CASPs) — exchanges, custodians, portfolio managers, advisors, transfer services, and placement services for crypto-assets; (2) issuers of asset-referenced tokens (ARTs) and e-money tokens (EMTs) that are offered or traded in the EU. It applies to businesses based in the EU and to those outside the EU seeking to provide services to EU clients.',
  },
  {
    q: 'Do I need a MiCA license (CASP authorization)?',
    a: 'If you operate any of the crypto-asset services listed in MiCA — exchange, custody, execution of orders, reception and transmission of orders, portfolio management, advice, transfer services, or placement — and you serve EU clients, you need CASP authorization from a national competent authority in an EU member state. Without authorization, you cannot lawfully provide these services in the EU.',
  },
  {
    q: 'What is required for a crypto-asset whitepaper under MiCA?',
    a: 'Any public offering of crypto-assets (other than ARTs and EMTs, which have additional requirements) in the EU requires a crypto-asset whitepaper. It must include: description of the issuer, project and asset; rights and obligations attaching to the crypto-asset; technology and protocol description; relevant risks; principal adverse impacts on climate and the environment; and liability provisions. The issuer bears civil liability for the whitepaper.',
  },
  {
    q: 'Are NFTs covered by MiCA?',
    a: 'Generally, NFTs are excluded from MiCA if they are truly unique and non-fungible. However, a series of identical NFTs, or NFTs that share significant characteristics making them functionally fungible, may not qualify for the exclusion. MiCA is also explicit that its asset classification may still apply to NFTs that are otherwise regulated financial instruments under MiFID II.',
  },
  {
    q: 'How does MiCA interact with existing EU financial services regulation?',
    a: 'MiCA explicitly does not apply to financial instruments that already fall under MiFID II, e-money regulated under the E-Money Directive, or deposits regulated under the Capital Requirements Directive. If your crypto-asset qualifies as a security under MiFID II (i.e., it is a transferable security), it is subject to MiFID II rather than MiCA. The boundary between security tokens and utility/payment tokens remains a key regulatory determination.',
  },
]

export default function MiCAGuidePage() {
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'MiCA Regulation Guide: What Crypto Startups Must Do (2025)',
    description: 'Complete guide to EU MiCA regulation — CASP authorization requirements, token whitepaper obligations, ART/EMT rules, and how to prepare for compliance.',
    url: 'https://bizlegal-ai.com/guides/mica-regulation-crypto-compliance',
    publisher: { '@type': 'Organization', name: 'BizLegal AI', url: 'https://bizlegal-ai.com' },
    author: { '@type': 'Organization', name: 'BizLegal AI' },
    inLanguage: 'en-US',
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
      { '@type': 'ListItem', position: 3, name: 'MiCA Regulation Guide', item: 'https://bizlegal-ai.com/guides/mica-regulation-crypto-compliance' },
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
          MiCA Regulation Guide
        </nav>

        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5 }}>
          Regulatory Guide
        </span>

        <h1 style={{ fontSize: 'clamp(1.7rem, 4vw, 2.5rem)', fontWeight: 700, lineHeight: 1.2, margin: '0.75rem 0 1.25rem' }}>
          MiCA Regulation: What Crypto Startups Must Do in 2025
        </h1>

        <p style={{ fontSize: '1.05rem', lineHeight: 1.75, opacity: 0.85, marginBottom: '2.5rem' }}>
          The EU's Markets in Crypto-Assets Regulation (MiCA) is now fully in force. If you operate a crypto exchange, custody service, or other crypto-asset service provider — or if you issue tokens targeting EU investors — you need authorization or registration in the EU. This guide explains who MiCA applies to, what it requires, and what you need to do.
        </p>

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border, #e5e7eb)', marginBottom: '2.5rem' }} />

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>What MiCA Covers</h2>
          <p style={{ lineHeight: 1.75, marginBottom: '1rem' }}>
            MiCA creates a comprehensive regulatory framework for crypto-assets in the EU. It covers three main categories:
          </p>
          <ul style={{ paddingLeft: '1.5rem', lineHeight: 1.9, marginBottom: '1rem' }}>
            <li><strong>Asset-Referenced Tokens (ARTs):</strong> tokens that maintain a stable value by referencing multiple currencies, commodities, or crypto-assets. The most common example is a multi-collateral stablecoin. Issuers need authorization; significant ARTs face additional capital and liquidity requirements.</li>
            <li><strong>E-Money Tokens (EMTs):</strong> tokens referencing a single official currency. Essentially crypto-native e-money. Issuers must be authorized as either a credit institution or an e-money institution under existing EU law.</li>
            <li><strong>Other Crypto-Assets:</strong> utility tokens, payment tokens, and other crypto-assets not qualifying as ARTs or EMTs. Offering these in the EU requires a public whitepaper (with some volume exemptions) but does not require issuer authorization.</li>
          </ul>
          <p style={{ lineHeight: 1.75 }}>
            In addition to token issuers, MiCA regulates <strong>Crypto-Asset Service Providers (CASPs)</strong> — any business providing crypto-asset services, from custody to exchange to portfolio management.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>CASP Authorization: Who Needs It and How It Works</h2>
          <p style={{ lineHeight: 1.75, marginBottom: '1rem' }}>
            MiCA defines 10 categories of crypto-asset services requiring authorization:
          </p>
          <ul style={{ paddingLeft: '1.5rem', lineHeight: 1.9, marginBottom: '1rem' }}>
            <li>Custody and administration of crypto-assets on behalf of clients</li>
            <li>Operation of a trading platform for crypto-assets</li>
            <li>Exchange of crypto-assets for funds or other crypto-assets</li>
            <li>Execution of orders for crypto-assets on behalf of clients</li>
            <li>Placing of crypto-assets</li>
            <li>Reception and transmission of orders for crypto-assets</li>
            <li>Providing advice on crypto-assets</li>
            <li>Providing portfolio management on crypto-assets</li>
            <li>Providing transfer services for crypto-assets</li>
          </ul>
          <p style={{ lineHeight: 1.75, marginBottom: '1rem' }}>
            To obtain CASP authorization, you apply to the national competent authority (NCA) in an EU member state — typically the financial regulator (BaFin in Germany, AMF in France, AFM in the Netherlands, and so on). Applicants must meet minimum capital requirements, fit-and-proper assessments for management, governance arrangements, and operational safeguards including client asset segregation.
          </p>
          <p style={{ lineHeight: 1.75 }}>
            Once authorized in one member state, you can passport your authorization across all EU member states — a significant advantage over pre-MiCA national licensing fragmentation.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>Transitional Provisions for Existing CASPs</h2>
          <p style={{ lineHeight: 1.75, marginBottom: '1rem' }}>
            Businesses that were already providing crypto-asset services under national law before MiCA's CASP rules became applicable (December 30, 2024) may benefit from a transitional period. Member states can allow these businesses to continue operating under national law for up to 18 months while they obtain full MiCA authorization.
          </p>
          <p style={{ lineHeight: 1.75 }}>
            Not all member states have implemented this transitional provision, and not all have implemented it for the same duration. If you relied on a national registration (e.g., a VASP registration) in a specific member state, you need to verify whether that state's transitional regime applies to you and when it expires.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>Whitepaper Requirements for Token Offerings</h2>
          <p style={{ lineHeight: 1.75, marginBottom: '1rem' }}>
            A public offering of crypto-assets (other than ARTs and EMTs) in the EU requires a compliant crypto-asset whitepaper. This is a departure from the pre-MiCA environment where token offerings in the EU were lightly regulated (or unregulated) unless they qualified as securities.
          </p>
          <p style={{ lineHeight: 1.75, marginBottom: '1rem' }}>
            The whitepaper must include:
          </p>
          <ul style={{ paddingLeft: '1.5rem', lineHeight: 1.9, marginBottom: '1rem' }}>
            <li>Information about the offeror/issuer (legal form, identity, contact)</li>
            <li>Description of the project the crypto-asset serves</li>
            <li>Description of the crypto-asset (type, features, rights and obligations)</li>
            <li>Offering terms (price, allocation, admission to trading)</li>
            <li>Technology and protocol description</li>
            <li>Risks specific to the issuer, project, and crypto-asset</li>
            <li>Principal adverse impacts on the environment and climate</li>
          </ul>
          <p style={{ lineHeight: 1.75 }}>
            Offerors bear civil liability for misleading or inaccurate whitepapers. Unlike EU securities prospectuses, crypto-asset whitepapers do not require regulatory pre-approval — they must be notified to the NCA before publication, but the NCA does not approve the content. Key exemptions: offerings below €1 million over 12 months, offerings to qualified investors only, and offerings of free tokens (airdrops with no consideration).
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>Non-EU Companies Serving EU Clients</h2>
          <p style={{ lineHeight: 1.75, marginBottom: '1rem' }}>
            MiCA has extraterritorial reach. A non-EU CASP that actively markets to EU clients or acquires EU clients through solicitation needs CASP authorization. "Reverse solicitation" — where the EU client initiates the relationship of their own exclusive initiative — is an exception, but regulators interpret it narrowly.
          </p>
          <p style={{ lineHeight: 1.75 }}>
            For practical purposes: if you are a US, UK, or Asia-based exchange that actively acquires EU customers (through advertising, social media campaigns, app store listings, or localized websites), you are likely providing services in the EU and need to address MiCA compliance — either through an EU subsidiary or by limiting EU client acquisition.
          </p>
        </section>

        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem' }}>AML Obligations Under MiCA</h2>
          <p style={{ lineHeight: 1.75 }}>
            MiCA itself is not an AML regulation — it works alongside the EU's AML framework. CASPs authorized under MiCA are subject to the EU's Anti-Money Laundering Directive (AMLD) and the Transfer of Funds Regulation as applied to crypto (the "Travel Rule"). In practice, CASPs must implement: customer due diligence (KYC) procedures, transaction monitoring, SAR filing, and the Travel Rule for crypto transfers above €1,000. The incoming AML Regulation (AMLA) will further harmonize these requirements.
          </p>
        </section>

        <section
          style={{
            background: 'var(--surface, #f9fafb)',
            border: '1px solid var(--color-border, #e5e7eb)',
            borderRadius: '12px',
            padding: '1.75rem',
            marginBottom: '3rem',
          }}
        >
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.75rem' }}>Assess your MiCA compliance exposure</h2>
          <p style={{ lineHeight: 1.7, marginBottom: '1.25rem', opacity: 0.85 }}>
            BRAI generates a counterparty risk and regulatory exposure report for crypto businesses — covering MiCA, AML/KYC, VARA, and SEC framework mapping. Understand your obligations before you apply for authorization or expand into EU markets.
          </p>
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
            Explore BRAI Risk Reports
          </a>
        </section>

        <div style={{ margin: '2.5rem 0', padding: '1.5rem', background: 'linear-gradient(135deg, #1a56db08, #1a56db14)', border: '1px solid #1a56db30', borderRadius: '10px' }}>
          <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6, marginBottom: '0.5rem' }}>Contract Risk — $97</p>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.75rem' }}>Review Your MiCA-Related Contracts in 60 Seconds</h3>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.7, opacity: 0.85, marginBottom: '1.25rem' }}>
            CASP service agreements, token issuance contracts, AML/KYC vendor agreements, and custody arrangements all need MiCA-compliant language. BizLegal AI scans your contracts for missing MiCA-required provisions — liability caps, governance disclosures, data handling clauses — and flags every gap with a risk rating.
          </p>
          <a href="https://docai.bizlegal-ai.com" style={{ display: 'inline-block', padding: '0.6rem 1.25rem', background: '#1a56db', color: '#fff', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>
            Scan Your MiCA Contracts →
          </a>
        </div>

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
            Related: <a href="/regulations/mica" style={{ color: 'var(--primary, #1a56db)' }}>MiCA Framework Hub</a> — enforcement analysis, licensing tracker, and compliance briefs
          </p>
        </div>

        <footer style={{ borderTop: '1px solid var(--color-border, #e5e7eb)', paddingTop: '1.5rem', fontSize: '0.8rem', opacity: 0.5 }}>
          <p>This guide is for informational purposes only and does not constitute legal advice. MiCA is enforced by national competent authorities across EU member states; interpretations and transitional arrangements vary. Consult a licensed attorney or regulated compliance advisor for advice specific to your situation.</p>
        </footer>
      </main>
    </>
  )
}
