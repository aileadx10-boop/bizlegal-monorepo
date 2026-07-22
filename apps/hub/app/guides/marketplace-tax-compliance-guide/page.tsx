import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Marketplace Tax & 1099-K Compliance Guide for Platforms (2025) | BizLegal AI',
  description:
    '1099-K threshold changes ($600 in 2025), platform reporting obligations, state nexus rules, and what marketplace operators owe the IRS and their sellers. Avoid the $250 per-form penalty.',
  alternates: { canonical: 'https://bizlegal-ai.com/guides/marketplace-tax-compliance-guide' },
  openGraph: {
    title: 'Marketplace Tax & 1099-K Compliance Guide for Platforms (2025)',
    description:
      '1099-K threshold drops to $600 in 2025. Platform-specific reporting obligations, state nexus rules, penalty tiers, and what marketplace operators owe the IRS and their sellers.',
    url: 'https://bizlegal-ai.com/guides/marketplace-tax-compliance-guide',
    type: 'article',
  },
}

const THRESHOLD_HISTORY = [
  {
    year: 2021,
    threshold: '$20,000 + 200 transactions',
    label: 'Original rule (pre-ARPA)',
    note: 'The American Rescue Plan Act of 2021 included a provision lowering the threshold to $600, but the IRS had not yet implemented it. Platforms issued 1099-Ks only above $20,000 with at least 200 transactions.',
    status: 'historical',
  },
  {
    year: 2022,
    threshold: '$20,000 + 200 transactions (delayed)',
    label: 'IRS Notice 2022-41: $600 reduction delayed to 2023',
    note: 'The IRS announced transition relief for calendar year 2022. The $600 threshold would not apply to 2022 payments — the prior $20,000/200 transaction rule remained in effect for another year.',
    status: 'delayed',
  },
  {
    year: 2023,
    threshold: '$20,000 + 200 transactions (delayed again)',
    label: 'IRS Notice 2023-10: Further delay — threshold stays at prior rule for 2023',
    note: 'The IRS extended transition relief for a second year, citing need for additional time for stakeholder preparation. The $600 rule was postponed again. 2023 remained governed by the $20,000/200 transaction threshold.',
    status: 'delayed',
  },
  {
    year: 2024,
    threshold: '$5,000 (phased transition)',
    label: 'IRS Notice 2023-74: Phased approach — $5,000 for 2024 as transition year',
    note: '2024 was designated a formal transition year. Platforms were required to issue 1099-Ks once a seller received $5,000 or more in gross payments — regardless of transaction count. This was a middle step before the final $600 rule.',
    status: 'phased',
  },
  {
    year: 2025,
    threshold: '$600',
    label: 'Final rule effective — no de minimis exception',
    note: 'The $600 threshold is fully effective for 2025 tax year payments, reported to the IRS in 2026. There is no minimum transaction count. Any seller receiving $600 or more in gross payments through a payment settlement entity (PSE) will receive a 1099-K.',
    status: 'current',
  },
]

const PLATFORM_OBLIGATIONS = [
  {
    platform: 'Amazon Marketplace',
    form: '1099-K',
    threshold: '$600 (2025+)',
    salesTax: 'Collects & remits in 45 states + DC (marketplace facilitator)',
    notes:
      'Amazon issues 1099-Ks directly to third-party sellers. As a marketplace facilitator, Amazon also collects and remits sales tax on behalf of sellers in 45 states + DC — individual sellers are relieved of sales tax collection obligations in those states. Sellers should still track their own physical nexus.',
  },
  {
    platform: 'Etsy',
    form: '1099-K',
    threshold: '$600 (2025+)',
    salesTax: 'Marketplace facilitator in most US states',
    notes:
      'Etsy issues 1099-Ks at the $600 threshold from 2025. Also issues state-specific forms (including Massachusetts, Vermont, and Virginia) where additional state reporting is required. Etsy collects and remits sales tax as a marketplace facilitator in states with MFL laws.',
  },
  {
    platform: 'eBay',
    form: '1099-K',
    threshold: '$600 (2025+)',
    salesTax: 'Partial — state-by-state; does not collect in all states',
    notes:
      'eBay issues 1099-Ks at $600. However, eBay does NOT collect and remit sales tax in every state — sellers must verify their obligations state by state. In states where eBay does act as a marketplace facilitator, sellers are relieved; in others, the seller retains the collection obligation.',
  },
  {
    platform: 'PayPal / Venmo',
    form: '1099-K',
    threshold: '$600 for goods & services payments (2025+)',
    salesTax: 'N/A — payment processor, not a marketplace',
    notes:
      'Business and goods-and-services payments only. Personal transfers (friends and family) are excluded from 1099-K reporting. PayPal issues a single 1099-K covering all eligible Venmo and PayPal commercial transactions. This was the center of the 2022 public controversy when the $600 rule was first announced and many sellers feared personal transfers would be reported.',
  },
  {
    platform: 'Stripe',
    form: '1099-K and/or 1099-MISC',
    threshold: '$600 (2025+)',
    salesTax: 'Via Stripe Tax add-on (optional, not automatic)',
    notes:
      'Who issues the 1099-K depends on your Stripe Connect account type. Standard or Express accounts: Stripe is the merchant of record and issues the 1099-K directly to connected accounts. Custom accounts: your platform is the payment settlement entity (PSE) and must issue the 1099-K yourself. Verify your configuration in Stripe Dashboard → Tax forms → Account setup before year-end.',
  },
  {
    platform: 'Shopify Payments',
    form: '1099-K',
    threshold: '$600 (2025+)',
    salesTax: 'Marketplace facilitator via Shopify Markets (where enabled)',
    notes:
      'Shopify Payments issues 1099-Ks only for merchants who use Shopify Payments as their payment processor. If a merchant uses a third-party processor (Stripe, PayPal, etc.), that processor issues the 1099-K — not Shopify. Shopify does not issue 1099-Ks for merchants using external payment gateways.',
  },
]

const NEXUS_TYPES = [
  {
    type: 'Physical nexus',
    trigger: 'Office, warehouse, employee, inventory, or agent physically located in a state',
    precedent: 'Traditional rule — predates South Dakota v. Wayfair (2018)',
    note: 'Always triggered regardless of sales volume or transaction count. Even a single remote employee working from a state can create nexus for that state. Storing inventory in a fulfillment center (e.g., Amazon FBA) in a state also creates physical nexus. This rule never went away after Wayfair.',
  },
  {
    type: 'Economic nexus',
    trigger: 'Usually 200 transactions OR $100,000 in annual sales to buyers in the state (thresholds vary by state)',
    precedent: 'South Dakota v. Wayfair, 138 S.Ct. 2080 (2018)',
    note: '45 states + DC have enacted economic nexus laws following Wayfair. Triggered by sales volume alone — no physical presence required. Most states use $100,000 in annual sales or 200 transactions as the threshold, but some states differ (e.g., California uses $500,000). Sellers must track this across all states where they make sales.',
  },
  {
    type: 'Marketplace facilitator nexus',
    trigger: 'Platform facilitates sales on behalf of third-party sellers in 45 states + DC',
    precedent: 'State marketplace facilitator statutes enacted 2018–2021',
    note: 'In states with marketplace facilitator laws, the platform (not the individual seller) must collect and remit sales tax on all facilitated sales. Third-party sellers are relieved of the collection obligation in those states. The 5 states without MFL laws also have no state sales tax: Alaska, Delaware, Montana, New Hampshire, and Oregon.',
  },
  {
    type: 'Click-through nexus',
    trigger: 'Referral or affiliate arrangements with in-state partners who send traffic to the marketplace',
    precedent: "New York's \"Amazon Law\" (2008) — 6 states still maintain this as a separate nexus trigger",
    note: 'Largely superseded by economic nexus laws following Wayfair, but still independently triggers nexus in some states for referral programs and affiliate marketing arrangements. If your marketplace operates an affiliate or referral program, review whether any participating affiliates are located in click-through nexus states.',
  },
]

const STATES_WITH_MFL = [
  { state: 'California', effective: 'Oct 1, 2019', threshold: '$500K gross sales', responsible: 'Platform (facilitator)' },
  { state: 'Texas', effective: 'Oct 1, 2019', threshold: '$500K gross sales', responsible: 'Platform (facilitator)' },
  { state: 'New York', effective: 'Jun 1, 2019', threshold: '$500K gross sales', responsible: 'Platform (facilitator)' },
  { state: 'Florida', effective: 'Jul 1, 2021', threshold: '$100K / 200 transactions', responsible: 'Platform (facilitator)' },
  { state: 'Illinois', effective: 'Jan 1, 2020', threshold: '$100K / 200 transactions', responsible: 'Platform (facilitator)' },
  { state: 'Pennsylvania', effective: 'Jul 1, 2019', threshold: '$100K / 200 transactions', responsible: 'Platform (facilitator)' },
  { state: 'Ohio', effective: 'Aug 1, 2019', threshold: '$100K / 200 transactions', responsible: 'Platform (facilitator)' },
  { state: 'Georgia', effective: 'Jan 1, 2020', threshold: '$100K / 200 transactions', responsible: 'Platform (facilitator)' },
  { state: 'Michigan', effective: 'Jan 1, 2020', threshold: '$100K / 200 transactions', responsible: 'Platform (facilitator)' },
  { state: 'New Jersey', effective: 'Nov 1, 2018', threshold: '$100K / 200 transactions', responsible: 'Platform (facilitator)' },
]

const PENALTIES = [
  {
    scenario: 'Filed correctly and on time',
    perForm: '$0',
    annualMax: '$0',
    severity: 'none',
  },
  {
    scenario: 'Filed late — within 30 days of the due date',
    perForm: '$60',
    annualMax: '$500,000 (small business: $200,000)',
    severity: 'low',
  },
  {
    scenario: 'Filed late — 31 days after due date through August 1',
    perForm: '$120',
    annualMax: '$1,500,000',
    severity: 'medium',
  },
  {
    scenario: 'Filed after August 1 or not filed at all',
    perForm: '$310',
    annualMax: '$3,750,000',
    severity: 'high',
  },
  {
    scenario: 'Intentional disregard — deliberate failure to file or furnish',
    perForm: '$630',
    annualMax: 'No cap — unlimited liability',
    severity: 'critical',
  },
]

const FAQS = [
  {
    q: 'Do I need to issue 1099-Ks to all my sellers in 2025?',
    a: 'Yes, if you are a payment settlement entity (PSE) or third-party settlement organization (TPSO) and a seller receives $600 or more in gross payments through your platform during the 2025 tax year. The $20,000/200 transaction threshold no longer applies for 2025 payments. Note that this is based on gross payments — not net — which means platform fees paid to you do not reduce the amount reported on the seller\'s 1099-K.',
  },
  {
    q: 'My marketplace uses Stripe Connect. Who sends the 1099-K — me or Stripe?',
    a: 'It depends on your Connect account configuration. If you use Standard or Express accounts where Stripe is the merchant of record, Stripe issues the 1099-K directly to your connected accounts — you do not issue it. If you use Custom accounts where your platform is the PSE, you are responsible for issuing the 1099-K to each seller. Verify your configuration in Stripe Dashboard under Tax forms → Account setup. Getting this wrong can result in duplicate filings (if both Stripe and you file) or missed filings (if each party assumes the other is filing) — both create IRS correspondence.',
  },
  {
    q: 'What is the difference between a marketplace facilitator and a marketplace seller for sales tax?',
    a: 'A marketplace facilitator is the platform itself — the entity (Amazon, Etsy, your SaaS app) that facilitates the transaction between buyers and third-party sellers. In 45 states + DC, the marketplace facilitator must collect and remit sales tax on all facilitated sales, including those made by third-party sellers. The individual seller is then relieved of the sales tax collection obligation in those states, meaning they generally do not need to register for sales tax in MFL states where the platform already collects. However, sellers must still track their own economic nexus thresholds in the 5 non-MFL states and for any direct (non-marketplace) sales.',
  },
  {
    q: 'We operate a B2B marketplace. Do marketplace facilitator laws apply to us?',
    a: 'Most state MFL statutes apply to all marketplace sales — B2B and B2C — without distinguishing the buyer type. However, many states provide exemptions for sales to registered businesses that furnish a valid exemption certificate (e.g., a resale certificate or direct-pay permit). You are still required to collect exemption certificates from each B2B buyer, validate them, and document the exemption. Failure to maintain valid certificates leaves your platform liable for the uncollected tax. Marketplace Shield automates exemption certificate collection and tracks when certificates are about to expire.',
  },
  {
    q: 'How does Marketplace Shield track the 1099-K threshold in real-time?',
    a: 'Marketplace Shield connects to your Stripe, Shopify, or PayPal data and monitors cumulative gross payment volume per seller throughout the calendar year. When a seller approaches the $600 threshold, Marketplace Shield flags the account and initiates an automated W-9 collection flow — before year-end. This prevents the January scramble when you suddenly need taxpayer identification numbers (TINs) for 1099-K filing and sellers are unresponsive. Marketplace Shield also tracks the prior-year $5,000 phased threshold automatically for any outstanding 2024 obligations.',
  },
]

const CHECKOUT_URL =
  'https://bizlegal-ai.com/checkout?product=agent_marketplace_shield&tier=Marketplace+Compliance+Shield&interval=monthly&amount=4900&name=Marketplace+Compliance+Shield'

export default function MarketplaceTaxComplianceGuidePage() {
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Marketplace Tax & 1099-K Compliance Guide for Platforms (2025)',
    description:
      '1099-K threshold changes, platform-specific reporting obligations, state nexus rules, and what marketplace operators owe the IRS and their sellers.',
    url: 'https://bizlegal-ai.com/guides/marketplace-tax-compliance-guide',
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
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Marketplace Tax Compliance Guide',
        item: 'https://bizlegal-ai.com/guides/marketplace-tax-compliance-guide',
      },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <main style={{ maxWidth: '760px', margin: '0 auto', padding: '3rem 1.5rem' }}>

        {/* Breadcrumb */}
        <nav style={{ fontSize: '0.8rem', opacity: 0.55, marginBottom: '2rem' }}>
          <a href="/" style={{ color: 'inherit' }}>Home</a>
          {' → '}
          <a href="/guides" style={{ color: 'inherit' }}>Guides</a>
          {' → '}
          Marketplace Tax Compliance
        </nav>

        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5 }}>
          Tax & Marketplace Compliance
        </span>

        {/* Hero */}
        <h1 style={{ fontSize: 'clamp(1.7rem, 4vw, 2.5rem)', fontWeight: 700, lineHeight: 1.2, margin: '0.75rem 0 1.25rem' }}>
          1099-K Threshold Drops to $600 in 2025 — Is Your Marketplace Ready?
        </h1>

        <p style={{ fontSize: '1.05rem', lineHeight: 1.75, opacity: 0.85, marginBottom: '1rem' }}>
          The IRS lowered the Form 1099-K reporting threshold from $20,000 (with 200 transactions) to $600 — effective for 2025 tax year payments. After three years of delays and a $5,000 transition threshold in 2024, the rule is now final. No minimum transaction count. No de minimis exception.
        </p>
        <p style={{ fontSize: '1.05rem', lineHeight: 1.75, opacity: 0.85, marginBottom: '2.5rem' }}>
          For marketplace operators, this means substantially more 1099-Ks than before — and IRC §6721/§6722 penalties starting at $60 per form (up to $630 per form with no annual cap for intentional disregard) for failures. This guide covers the full threshold history, platform-specific obligations, state sales tax nexus rules, and the penalty structure you need to understand before year-end.
        </p>

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border, #e5e7eb)', marginBottom: '2.5rem' }} />

        {/* Section 1: Threshold History Timeline */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            1099-K Threshold History: 2021 → 2025
          </h2>
          <p style={{ lineHeight: 1.75, marginBottom: '1.5rem', opacity: 0.8 }}>
            The American Rescue Plan Act of 2021 reduced the threshold to $600, but the IRS delayed implementation three consecutive times before the rule took effect.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {THRESHOLD_HISTORY.map((entry, i) => (
              <div key={entry.year} style={{ display: 'flex', gap: '1rem' }}>
                {/* Timeline spine */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '36px' }}>
                  <div
                    style={{
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      flexShrink: 0,
                      marginTop: '5px',
                      background:
                        entry.status === 'current'
                          ? '#dc2626'
                          : entry.status === 'phased'
                          ? '#d97706'
                          : '#9ca3af',
                    }}
                  />
                  {i < THRESHOLD_HISTORY.length - 1 && (
                    <div
                      style={{
                        width: '2px',
                        flexGrow: 1,
                        background: 'var(--color-border, #e5e7eb)',
                        minHeight: '28px',
                      }}
                    />
                  )}
                </div>
                {/* Entry content */}
                <div
                  style={{
                    paddingBottom: i < THRESHOLD_HISTORY.length - 1 ? '1.25rem' : undefined,
                    paddingTop: '0',
                    flex: 1,
                    borderLeft: entry.status === 'current' ? '3px solid #dc2626' : '3px solid transparent',
                    paddingLeft: '0.75rem',
                    marginLeft: '-0.1rem',
                    background: entry.status === 'current' ? 'rgba(220,38,38,0.04)' : undefined,
                    borderRadius: entry.status === 'current' ? '0 6px 6px 0' : undefined,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.65rem', flexWrap: 'wrap', marginBottom: '2px' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', opacity: 0.6 }}>{entry.year}</span>
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: '1rem',
                        color:
                          entry.status === 'current'
                            ? '#dc2626'
                            : entry.status === 'phased'
                            ? '#d97706'
                            : 'inherit',
                      }}
                    >
                      {entry.threshold}
                    </span>
                    {entry.status === 'current' && (
                      <span
                        style={{
                          fontSize: '0.65rem',
                          background: '#dc2626',
                          color: '#fff',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontWeight: 700,
                          letterSpacing: '0.06em',
                        }}
                      >
                        IN EFFECT NOW
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.775rem', fontWeight: 600, opacity: 0.55, marginBottom: '3px' }}>{entry.label}</div>
                  <div style={{ fontSize: '0.875rem', lineHeight: 1.65, opacity: 0.75 }}>{entry.note}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 2: Platform-Specific Obligations */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Platform-Specific 1099-K Obligations
          </h2>
          <p style={{ lineHeight: 1.75, marginBottom: '1.5rem', opacity: 0.8 }}>
            Each major platform handles 1099-K issuance differently. If your marketplace is built on top of one of these processors — or competes in the same space — this is what your sellers and operators need to know.
          </p>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {PLATFORM_OBLIGATIONS.map((p) => (
              <div
                key={p.platform}
                style={{
                  border: '1px solid var(--color-border, #e5e7eb)',
                  borderRadius: '10px',
                  padding: '1.1rem 1.25rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                    marginBottom: '0.5rem',
                  }}
                >
                  <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{p.platform}</span>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      background: 'var(--surface, #f3f4f6)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {p.form}
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    gap: '1.5rem',
                    flexWrap: 'wrap',
                    fontSize: '0.8rem',
                    marginBottom: '0.6rem',
                    opacity: 0.7,
                  }}
                >
                  <span>
                    Threshold: <strong style={{ opacity: 1 }}>{p.threshold}</strong>
                  </span>
                  <span>
                    Sales tax: <strong style={{ opacity: 1 }}>{p.salesTax}</strong>
                  </span>
                </div>
                <p style={{ fontSize: '0.875rem', lineHeight: 1.65, opacity: 0.8, margin: 0 }}>{p.notes}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: Nexus Types */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Sales Tax Nexus: 4 Types That Affect Marketplace Operators
          </h2>
          <p style={{ lineHeight: 1.75, marginBottom: '1.5rem', opacity: 0.8 }}>
            "Nexus" is the connection between a seller or platform and a state that creates an obligation to collect and remit sales tax. Multiple nexus types can apply simultaneously, and the obligations differ for platforms versus individual sellers.
          </p>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {NEXUS_TYPES.map((n) => (
              <div
                key={n.type}
                style={{
                  border: '1px solid var(--color-border, #e5e7eb)',
                  borderRadius: '10px',
                  padding: '1.1rem 1.25rem',
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: '0.35rem' }}>{n.type}</div>
                <div
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--primary, #1a56db)',
                    marginBottom: '0.3rem',
                    fontWeight: 600,
                  }}
                >
                  Trigger: {n.trigger}
                </div>
                <div style={{ fontSize: '0.75rem', opacity: 0.5, marginBottom: '0.45rem' }}>
                  Precedent: {n.precedent}
                </div>
                <p style={{ fontSize: '0.875rem', lineHeight: 1.65, opacity: 0.8, margin: 0 }}>{n.note}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 4: States with MFL */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Top 10 E-Commerce States — Marketplace Facilitator Laws
          </h2>
          <p style={{ lineHeight: 1.75, marginBottom: '1.25rem', opacity: 0.8 }}>
            45 states + DC have enacted marketplace facilitator laws. The 5 states without them — Alaska, Delaware, Montana, New Hampshire, and Oregon — also have no state sales tax. The table below covers the top 10 states by e-commerce transaction volume.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-border, #e5e7eb)' }}>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>State</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>MFL Effective</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Nexus Threshold</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Who Collects?</th>
                </tr>
              </thead>
              <tbody>
                {STATES_WITH_MFL.map((s, i) => (
                  <tr
                    key={s.state}
                    style={{
                      borderBottom: '1px solid var(--color-border, #e5e7eb)',
                      background: i % 2 !== 0 ? 'var(--surface, #f9fafb)' : undefined,
                    }}
                  >
                    <td style={{ padding: '10px 12px', fontWeight: 600 }}>{s.state}</td>
                    <td style={{ padding: '10px 12px', opacity: 0.75 }}>{s.effective}</td>
                    <td style={{ padding: '10px 12px', opacity: 0.75 }}>{s.threshold}</td>
                    <td style={{ padding: '10px 12px', opacity: 0.75 }}>{s.responsible}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '0.8rem', opacity: 0.5, marginTop: '0.75rem', lineHeight: 1.6 }}>
            Source: State department of revenue statutes. Effective dates and thresholds are subject to legislative change. Verify current rules with a state tax advisor before relying on these figures for compliance purposes.
          </p>
        </section>

        {/* Section 5: Penalties */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            The Cost of Getting It Wrong: IRC §6721/§6722 Penalty Tiers
          </h2>
          <p style={{ lineHeight: 1.75, marginBottom: '1.25rem', opacity: 0.8 }}>
            IRC §6721 covers failures to file correct information returns with the IRS. IRC §6722 covers failures to furnish correct payee statements to sellers. Both can apply separately for the same failure — doubling the exposure. Penalties escalate based on how late the filing is.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-border, #e5e7eb)' }}>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600 }}>Scenario</th>
                  <th style={{ textAlign: 'right', padding: '10px 12px', fontWeight: 600, whiteSpace: 'nowrap' }}>Per Form</th>
                  <th style={{ textAlign: 'right', padding: '10px 12px', fontWeight: 600, whiteSpace: 'nowrap' }}>Annual Maximum</th>
                </tr>
              </thead>
              <tbody>
                {PENALTIES.map((pen) => {
                  const isHighSeverity = pen.severity === 'high' || pen.severity === 'critical'
                  return (
                    <tr
                      key={pen.scenario}
                      style={{
                        borderBottom: '1px solid var(--color-border, #e5e7eb)',
                        background: isHighSeverity ? 'rgba(220,38,38,0.05)' : undefined,
                        color: isHighSeverity ? '#b91c1c' : undefined,
                      }}
                    >
                      <td style={{ padding: '10px 12px', fontWeight: pen.severity === 'critical' ? 700 : 400 }}>
                        {pen.scenario}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>{pen.perForm}</td>
                      <td
                        style={{
                          padding: '10px 12px',
                          textAlign: 'right',
                          fontWeight: pen.severity === 'critical' ? 700 : 400,
                        }}
                      >
                        {pen.annualMax}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: '0.75rem', lineHeight: 1.6 }}>
            Penalty amounts are adjusted for inflation annually under IRC §6722(d). Figures shown reflect approximate current-year amounts. Small-business thresholds apply to entities with average annual gross receipts of $5 million or less over the 3 prior tax years. Penalties apply per incorrect or unfurnished form — a large seller base multiplies exposure rapidly.
          </p>
        </section>

        {/* Section 6: FAQ */}
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

        {/* CTA */}
        <section
          style={{
            background: 'var(--surface, #f9fafb)',
            border: '1px solid var(--color-border, #e5e7eb)',
            borderRadius: '12px',
            padding: '1.75rem',
            marginBottom: '2.5rem',
          }}
        >
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            Marketplace Shield automates all of this — $49/month
          </h2>
          <p style={{ lineHeight: 1.7, marginBottom: '1rem', opacity: 0.85 }}>
            Stop tracking 1099-K thresholds manually. Marketplace Shield monitors gross payment volume per seller in real time, triggers automated W-9 collection before year-end, tracks state nexus exposure across all connected accounts, and alerts you the moment a seller crosses a material threshold.
          </p>
          <ul
            style={{
              paddingLeft: '1.25rem',
              marginBottom: '1.25rem',
              lineHeight: 1.85,
              opacity: 0.8,
              fontSize: '0.9rem',
            }}
          >
            <li>1099-K threshold monitor per connected account — real-time alerts at $600</li>
            <li>State nexus exposure scorecard across 45 states + DC</li>
            <li>Automated W-9 collection flow when sellers approach reporting thresholds</li>
            <li>Stripe Connect webhook ingest (configurable; bring your own event stream)</li>
            <li>Weekly KYB drift alerts against OFAC + UN + EU sanctions lists</li>
          </ul>
          <a
            href={CHECKOUT_URL}
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
            Subscribe to Marketplace Shield — $49/mo →
          </a>
          <p style={{ marginTop: '0.75rem', fontSize: '0.75rem', opacity: 0.5, margin: '0.75rem 0 0' }}>
            Decision-support, not tax advice. Consult a CPA before filing.
          </p>
        </section>

        {/* Internal cross-links */}
        <div
          style={{
            marginBottom: '2rem',
            padding: '1.1rem',
            background: 'var(--surface, #f9fafb)',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.45rem',
          }}
        >
          <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700, opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Related
          </p>
          <p style={{ margin: 0, fontSize: '0.875rem' }}>
            <a href="/agents/marketplace-shield" style={{ color: 'var(--primary, #1a56db)' }}>
              Marketplace Shield agent →
            </a>{' '}
            <span style={{ opacity: 0.75 }}>real-time 1099-K monitoring and state nexus scorecard</span>
          </p>
          <p style={{ margin: 0, fontSize: '0.875rem' }}>
            <a href="/guides/compliance-health-score-saas" style={{ color: 'var(--primary, #1a56db)' }}>
              Compliance Health Score for SaaS →
            </a>{' '}
            <span style={{ opacity: 0.75 }}>60-signal monthly audit across SOC 2, GDPR, HIPAA, PCI DSS, and CCPA</span>
          </p>
          <p style={{ margin: 0, fontSize: '0.875rem' }}>
            <a href="/guides/aml-kyc-compliance-crypto" style={{ color: 'var(--primary, #1a56db)' }}>
              AML/KYC Compliance for Crypto →
            </a>{' '}
            <span style={{ opacity: 0.75 }}>onboarding obligations, OFAC screening, and transaction monitoring</span>
          </p>
          <p style={{ margin: 0, fontSize: '0.875rem' }}>
            <a href="/regulations" style={{ color: 'var(--primary, #1a56db)' }}>
              Regulations index →
            </a>{' '}
            <span style={{ opacity: 0.75 }}>IRS rules, state sales tax, and marketplace facilitator law tracker</span>
          </p>
          <p style={{ margin: 0, fontSize: '0.875rem' }}>
            <a href="/guides" style={{ color: 'var(--primary, #1a56db)' }}>
              All compliance guides →
            </a>
          </p>
        </div>

        {/* Footer disclaimer */}
        <footer
          style={{
            borderTop: '1px solid var(--color-border, #e5e7eb)',
            paddingTop: '1.5rem',
            fontSize: '0.8rem',
            opacity: 0.5,
          }}
        >
          <p>
            This guide is for informational purposes only and does not constitute legal, tax, or accounting advice. 1099-K
            reporting rules, state nexus thresholds, marketplace facilitator law obligations, and IRS penalty amounts are
            subject to change. Consult a licensed CPA and legal counsel for advice specific to your platform, business
            structure, and jurisdiction before making compliance decisions.
          </p>
        </footer>

      </main>
    </>
  )
}
