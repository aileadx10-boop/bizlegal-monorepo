import type { Metadata } from 'next'
import Link from 'next/link'
import { AgentCheckoutButton } from '@/app/components/ui-v2/AgentCheckoutButton'

export const metadata: Metadata = {
  title: 'AI Compliance Agents | BizLegal AI',
  description:
    'Fifteen specialized AI compliance agents — research, contracts, risk, diligence, monitoring, marketplace, AI governance, India DPDPA. $19 one-time or $49/mo. Pay with crypto or card.',
  alternates: { canonical: 'https://bizlegal-ai.com/agents' },
}

interface Agent {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly priceCents: number
  readonly priceLabel: string
  readonly interval: 'one-time' | 'monthly'
  readonly addon: 'BRAI' | 'TRACR' | 'DocAI' | 'LexAudit' | 'Forge' | 'Hub'
  readonly accent: string
  readonly features: ReadonlyArray<string>
  /** Optional deep-link to the standalone surface (free-first or web-app). */
  readonly deepLink?: string
  /** Optional badge above the name (e.g. "New", "Most popular"). */
  readonly badge?: string
  /** Optional vertical tag (Phase RR — three new $49/$19 agents filling the gap). */
  readonly vertical?: 'fintech' | 'ai-governance' | 'apac-privacy'
}

const AGENTS: ReadonlyArray<Agent> = [
  {
    id: 'compliance_researcher',
    name: 'Compliance Researcher',
    description:
      'Deep regulatory research across 50+ jurisdictions. Finds relevant frameworks, enforcement actions, and compliance gaps before they become structural liability.',
    priceCents: 4900,
    priceLabel: '$49/mo',
    interval: 'monthly',
    addon: 'BRAI',
    accent: '#5b21b6',
    features: ['50+ jurisdiction coverage', 'Framework gap identification', 'Enforcement action tracking', 'Weekly research digest'],
  },
  {
    id: 'cross_jurisdiction_analyst',
    name: 'Cross-Jurisdiction Analyst',
    description:
      'Compare regulatory requirements across jurisdictions. Identify optimal paths, flag conflicts, and surface arbitrage opportunities with structured analysis.',
    priceCents: 4900,
    priceLabel: '$49/mo',
    interval: 'monthly',
    addon: 'BRAI',
    accent: '#7c3aed',
    features: ['Side-by-side jurisdiction comparison', 'Regulatory conflict detection', 'Optimal path recommendations', 'Expansion risk scoring'],
  },
  {
    id: 'contracts_expert',
    name: 'Contracts Expert',
    description:
      'AI-powered contract review and generation. SAFTs, NDAs, terms of service, privacy policies — drafted with jurisdiction awareness and clause risk scoring.',
    priceCents: 1900,
    priceLabel: '$19 one-time',
    interval: 'one-time',
    addon: 'DocAI',
    accent: '#ec4899',
    features: ['Jurisdiction-aware drafting', 'Clause risk scoring', 'Template library access', 'Multi-format export'],
  },
  {
    id: 'risk_assessor',
    name: 'Risk Assessor',
    description:
      'Quantify regulatory risk by jurisdiction and framework. Score exposure probability, estimate financial impact, and produce risk heat maps.',
    priceCents: 4900,
    priceLabel: '$49/mo',
    interval: 'monthly',
    addon: 'BRAI',
    accent: '#f59e0b',
    features: ['Risk heat mapping', 'Exposure probability scoring', 'Financial impact estimation', 'Mitigation priority ranking'],
  },
  {
    id: 'due_diligence_scanner',
    name: 'Due Diligence Scanner',
    description:
      'Scan counterparties, wallets, and entities for AML, KYC, and sanctions risk. Produce diligence reports suitable for investor and regulator review.',
    priceCents: 1900,
    priceLabel: '$19 one-time',
    interval: 'one-time',
    addon: 'TRACR',
    accent: '#dc2626',
    features: ['Counterparty risk screening', 'Wallet provenance analysis', 'Sanctions list matching', 'Diligence report export'],
  },
  {
    id: 'regulatory_monitor',
    name: 'Regulatory Monitor',
    description:
      'Real-time monitoring of regulatory changes across your tracked jurisdictions. Alerts for relevant updates, deadline tracking, and compliance impact summaries.',
    priceCents: 4900,
    priceLabel: '$49/mo',
    interval: 'monthly',
    addon: 'BRAI',
    accent: '#16a34a',
    features: ['Real-time change alerts', 'Deadline tracking', 'Impact summary per change', 'Custom jurisdiction watchlist'],
  },

  // ─── Phase L wave (2026-04-29) ─────────────────────────────────────
  {
    id: 'compliance_monitor_pro',
    name: 'Compliance Monitor Pro',
    description:
      'Daily SHA-256 monitoring of canonical source URLs for SOC 2, ISO 27001, GDPR, HIPAA, DPDP, and NIST 800-53. We hash, you decide. Decision-support, not a compliance attestation.',
    priceCents: 4900,
    priceLabel: '$49/mo',
    interval: 'monthly',
    addon: 'LexAudit',
    accent: '#d4a843',
    features: [
      '6 frameworks tracked daily',
      'Email alert on source-content change',
      'Live framework-index dashboard',
      'Cross-link to LexAudit Health Score',
    ],
    deepLink: '/compliance-monitor',
    badge: 'New',
  },
  {
    id: 'dpa_negotiator',
    name: 'DPA Negotiator',
    description:
      'Paste the customer redline + your standard DPA. Get a 3-column comparison classifying every material delta (procedural/liability/sub-processor/residency) with citations to GDPR Art 28, EU SCCs, CCPA, or HIPAA.',
    priceCents: 1900,
    priceLabel: '$19 one-time',
    interval: 'one-time',
    addon: 'DocAI',
    accent: '#5b21b6',
    features: [
      'GDPR / CCPA / HIPAA support',
      '21-clause public-source KB',
      '3-column delta comparison',
      'Inline regulatory citations',
    ],
    deepLink: 'https://docai.bizlegal-ai.com/dpa',
    badge: 'New',
  },
  {
    id: 'psp_mor_risk_manager',
    name: 'PSP & MoR Risk Manager',
    description:
      'Pre-flight audit before applying to Stripe / PayPal / Square / Mercury / Wise / Revolut — or recovery support after a freeze. Pattern recognition against public AUP texts. Outcome of any application not guaranteed.',
    priceCents: 4900,
    priceLabel: '$49/mo',
    interval: 'monthly',
    addon: 'Hub',
    accent: '#dc2626',
    features: [
      'Prevention + recovery modes',
      '6 processors covered',
      'Appeal-letter draft (recovery)',
      'CFPB / FCA / EBA escalation paths',
    ],
    deepLink: '/psp-risk',
    badge: 'New',
  },
  {
    id: 'cta_boi_tracker',
    name: 'CTA-2024 BOI Tracker',
    description:
      'Daily monitoring of FinCEN BOI guidance + 30-day refile deadline alerts for your US LLC, Corp, or LP. Penalty for missed filings is up to $500/day capped at $10K — we email before that bites.',
    priceCents: 4900,
    priceLabel: '$49/mo',
    interval: 'monthly',
    addon: 'Forge',
    accent: '#16a34a',
    features: [
      '1 entity (Solo) · up to 50 (Firm)',
      'Daily federalregister.gov pull',
      '30/7/3/1-day deadline alerts',
      'Resend email notifications',
    ],
    deepLink: '/agents/boi-tracker',
    badge: 'New',
  },
  {
    id: 'ai_act_classifier',
    name: 'EU AI Act Risk Classifier',
    description:
      'Classify your AI system into Article 6 risk tiers + Annex III references before the 2026-08-02 deadline. Free preview classification, $19 one-time full report with citation map and documentation checklist.',
    priceCents: 1900,
    priceLabel: '$19 one-time',
    interval: 'one-time',
    addon: 'Hub',
    accent: '#5b21b6',
    features: [
      'Free preview classification (no card)',
      'Article 6 + Annex III citation map',
      'Documentation checklist (15+ items)',
      'Full PDF report delivered to inbox',
    ],
    deepLink: '/agents/ai-act',
    badge: 'EU deadline',
  },
  {
    id: 'policy_auto_refresh',
    name: 'Privacy Policy Auto-Refresh',
    description:
      'Daily 7-framework redline of your privacy policy (GDPR / CCPA / CPRA / Quebec Law 25 / Colorado / Connecticut / Texas DPSA). Material-change alerts only — no cosmetic-edit noise. Free first audit.',
    priceCents: 4900,
    priceLabel: '$49/mo',
    interval: 'monthly',
    addon: 'LexAudit',
    accent: '#7c3aed',
    features: [
      'Free first audit (no card)',
      'Daily Sonnet semantic-diff',
      'Material-change email alerts',
      'Suggested replacement language',
      'Audit history dashboard',
    ],
    deepLink: '/agents/policy-refresh',
    badge: 'New',
  },

  // ─── Phase RR wave (2026-05-22) — three new verticals filling the
  //     fintech / AI-governance / APAC-privacy gaps in the BizLegal fleet.
  {
    id: 'marketplace_shield',
    name: 'Marketplace Compliance Shield',
    description:
      'Monitoring layer for Stripe Connect platforms, gig marketplaces, and creator-economy tools. Track 1099-K threshold crossings (the $600 cliff), state NEXUS exposure, and KYB drift on connected accounts. Decision-support, not tax advice.',
    priceCents: 4900,
    priceLabel: '$49/mo',
    interval: 'monthly',
    addon: 'Hub',
    accent: '#0ea5e9',
    features: [
      '1099-K threshold monitor per connected account',
      'State NEXUS exposure scorecard',
      'KYB drift alerts (sanctions / PEP refresh)',
      'Stripe Connect webhook ingest (configurable)',
    ],
    deepLink: '/agents/marketplace-shield',
    badge: 'New · Fintech',
    vertical: 'fintech',
  },
  {
    id: 'ai_governance_product',
    name: 'AI Governance for Product Teams',
    description:
      'For product orgs (not lawyers) deploying LLM features. Per-feature Article 6 classification against the EU AI Act, California SB-942, and Colorado AI Act. Monthly delta reports map your repo changes to compliance posture changes.',
    priceCents: 4900,
    priceLabel: '$49/mo',
    interval: 'monthly',
    addon: 'Hub',
    accent: '#22c55e',
    features: [
      'Per-feature Article 6 risk classification',
      'EU AI Act + CA SB-942 + CO AI Act coverage',
      'Monthly delta report (repo changes → posture changes)',
      'Documentation checklist per high-risk feature',
    ],
    deepLink: '/agents/ai-governance',
    badge: 'New · 2026 deadlines',
    vertical: 'ai-governance',
  },
  {
    id: 'india_dpdpa',
    name: 'India DPDPA Readiness Kit',
    description:
      'One-time gap audit for B2B SaaS handling Indian users. Maps your current posture to DPDPA notice + consent + DPO requirements. First-mover positioning before late-2026 fines kick in for Significant Data Fiduciaries.',
    priceCents: 1900,
    priceLabel: '$19 one-time',
    interval: 'one-time',
    addon: 'LexAudit',
    accent: '#f97316',
    features: [
      'Notice + consent gap audit',
      'DPO appointment recommendation',
      'Data principal rights checklist (access / correct / erase / nominate)',
      'Significant Data Fiduciary tripwire analysis',
    ],
    deepLink: '/agents/india-dpdpa',
    badge: 'New · APAC wedge',
    vertical: 'apac-privacy',
  },
]

export default function AgentsPage() {
  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "BizLegal AI Compliance Agents",
    "description":
      "12 AI compliance agents covering 50+ jurisdictions. From BOI tracking to AI Act classification to cross-jurisdiction analysis.",
    "url": "https://bizlegal-ai.com/agents",
    "numberOfItems": AGENTS.length,
    "itemListElement": AGENTS.map((a, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "item": {
        "@type": "SoftwareApplication",
        "name": a.name,
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Web",
        "description": a.description,
        "url": `https://bizlegal-ai.com/agents/${a.id.replace(/_/g, '-')}`,
        "brand": { "@type": "Brand", name: "BizLegal AI" },
        "provider": {
          "@type": "Organization",
          "name": "BizLegal AI",
          "url": "https://bizlegal-ai.com",
        },
        "offers": {
          "@type": "Offer",
          "price": (a.priceCents / 100).toFixed(2),
          "priceCurrency": "USD",
          "category": a.interval,
          "url": `https://bizlegal-ai.com/agents/${a.id.replace(/_/g, '-')}`,
        },
      },
    })),
  }

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://bizlegal-ai.com" },
      { "@type": "ListItem", "position": 2, "name": "Agents", "item": "https://bizlegal-ai.com/agents" },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <section
        className="bl-hero-bg"
        style={{ paddingTop: 'clamp(4rem, 2rem + 4vw, 6rem)', paddingBottom: 'clamp(2rem, 1.5rem + 2vw, 3rem)' }}
      >
        <div className="bl-container" style={{ maxWidth: 880 }}>
          <span className="bl-tag" style={{ marginBottom: '1rem' }}>
            Limited Beta
          </span>
          <h1
            style={{
              fontFamily: 'var(--bl-font-display)',
              fontSize: 'var(--bl-text-h1)',
              fontWeight: 800,
              letterSpacing: '-0.025em',
              lineHeight: 1.05,
              color: 'var(--bl-text)',
              margin: '1.5rem 0 1rem',
            }}
          >
            AI Compliance <span className="bl-grad-text">Agents.</span>
          </h1>
          <p
            style={{
              fontSize: 'clamp(1.05rem, 0.95rem + 0.4vw, 1.2rem)',
              color: 'var(--bl-text-muted)',
              lineHeight: 1.6,
              margin: 0,
              maxWidth: 720,
            }}
          >
            Fifteen specialised agents — research, comparison, contracts,
            risk, diligence, monitoring, plus three new wedges: marketplace
            compliance, AI governance, and India DPDPA. Pay individually
            with crypto or card. $19 one-time or $49/mo.
          </p>
          {/* D12: visible-from-the-hero free triage CTA. Drives unsure
              visitors to /triage which routes to one of 6 decision trees. */}
          <div
            style={{
              marginTop: '1.5rem',
              padding: '0.85rem 1.1rem',
              background: 'color-mix(in oklab, var(--bl-accent) 8%, transparent)',
              border: '1px solid color-mix(in oklab, var(--bl-accent) 25%, var(--bl-border))',
              borderRadius: 'var(--bl-radius-md)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.75rem',
              flexWrap: 'wrap',
            }}
          >
            <span style={{ fontSize: 12, color: 'var(--bl-text-muted)', letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 600 }}>
              Not sure which one fits?
            </span>
            <Link
              href="/triage"
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: 'var(--bl-accent)',
                textDecoration: 'none',
              }}
            >
              Run free 60-second triage →
            </Link>
          </div>
        </div>
      </section>

      {/* Group counts */}
      <section
        style={{
          background: 'var(--bl-bg-low)',
          borderTop: '1px solid var(--bl-divider)',
          borderBottom: '1px solid var(--bl-divider)',
          padding: 'clamp(1.5rem, 1rem + 1vw, 2.5rem) 0',
        }}
      >
        <div
          className="bl-container"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 'clamp(1.5rem, 1rem + 2vw, 3rem)',
          }}
        >
          {[
            { label: 'Agents Total', count: 15, color: '#5b21b6' },
            { label: 'One-time ($19)', count: 5, color: 'var(--bl-accent)' },
            { label: 'Monthly ($49)', count: 10, color: '#16a34a' },
            { label: 'New Wedges (Phase RR)', count: 3, color: '#f97316' },
          ].map((g) => (
            <div key={g.label}>
              <div
                style={{
                  fontFamily: 'var(--bl-font-mono)',
                  fontSize: 'clamp(1.75rem, 1rem + 2vw, 2.5rem)',
                  fontWeight: 700,
                  color: g.color,
                  lineHeight: 1,
                  letterSpacing: '-0.02em',
                }}
              >
                {g.count}
              </div>
              <div className="bl-label" style={{ marginTop: 8, fontSize: 10, color: 'var(--bl-text-muted)' }}>
                {g.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Agent cards */}
      <section className="bl-section">
        <div className="bl-container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: 'clamp(1rem, 0.75rem + 1vw, 1.5rem)',
            }}
          >
            {AGENTS.map((agent) => (
              <div
                key={agent.id}
                className="bl-card"
                style={{ display: 'flex', flexDirection: 'column', gap: 12, position: 'relative' }}
              >
                {agent.badge && (
                  <span
                    style={{
                      position: 'absolute',
                      top: -10,
                      right: 16,
                      background: agent.accent,
                      color: '#fff',
                      fontFamily: 'var(--bl-font-mono)',
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      padding: '4px 10px',
                      borderRadius: 'var(--bl-radius-pill)',
                    }}
                  >
                    {agent.badge}
                  </span>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <div>
                    <h3
                      style={{
                        fontFamily: 'var(--bl-font-display)',
                        fontSize: '1.25rem',
                        fontWeight: 800,
                        color: 'var(--bl-text)',
                        margin: 0,
                        marginBottom: 4,
                        letterSpacing: '-0.02em',
                      }}
                    >
                      {agent.name}
                    </h3>
                    <span
                      style={{
                        fontFamily: 'var(--bl-font-mono)',
                        fontSize: 9,
                        fontWeight: 700,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: agent.accent,
                        background: `${agent.accent}15`,
                        padding: '2px 8px',
                        borderRadius: 4,
                        border: `1px solid ${agent.accent}30`,
                      }}
                    >
                      {agent.addon === 'Hub' ? 'Hub-native' : `Add-on to ${agent.addon}`}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div
                      style={{
                        fontFamily: 'var(--bl-font-display)',
                        fontSize: 22,
                        fontWeight: 700,
                        color: 'var(--bl-text)',
                        letterSpacing: '-0.02em',
                      }}
                    >
                      {agent.priceLabel}
                    </div>
                    <div
                      style={{
                        fontFamily: 'var(--bl-font-mono)',
                        fontSize: 8,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: 'var(--bl-success)',
                        marginTop: 4,
                      }}
                    >
                      Beta
                    </div>
                  </div>
                </div>

                <p
                  style={{
                    fontSize: 'var(--bl-text-small)',
                    color: 'var(--bl-text-muted)',
                    lineHeight: 1.6,
                    margin: 0,
                    flex: 1,
                  }}
                >
                  {agent.description}
                </p>

                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 6 }}>
                  {agent.features.map((f) => (
                    <li
                      key={f}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 8,
                        fontSize: 'var(--bl-text-small)',
                        color: 'var(--bl-text)',
                        lineHeight: 1.5,
                      }}
                    >
                      <span aria-hidden="true" style={{ color: agent.accent, fontWeight: 700, flexShrink: 0 }}>
                        ✓
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>

                <AgentCheckoutButton
                  product={`agent_${agent.id}`}
                  tier={agent.name}
                  amountCents={agent.priceCents}
                  interval={agent.interval}
                  priceLabel={agent.priceLabel}
                  accent={agent.accent}
                />

                {agent.deepLink && (
                  <Link
                    href={agent.deepLink}
                    style={{
                      fontFamily: 'var(--bl-font-mono)',
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: agent.accent,
                      textDecoration: 'none',
                      textAlign: 'center',
                      paddingTop: 4,
                    }}
                  >
                    Try free first ↗
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bl-section" style={{ background: 'var(--bl-accent-soft)' }}>
        <div className="bl-container-narrow" style={{ textAlign: 'center' }}>
          <span className="bl-label" style={{ color: 'var(--bl-accent)' }}>— Not sure which agent</span>
          <h2
            style={{
              fontFamily: 'var(--bl-font-display)',
              fontSize: 'var(--bl-text-h2)',
              fontWeight: 800,
              letterSpacing: '-0.025em',
              color: 'var(--bl-text)',
              margin: '0.5rem 0 1rem',
            }}
          >
            Start with a <span className="bl-grad-text">Free Risk Scan.</span>
          </h2>
          <p
            style={{
              fontSize: 'var(--bl-text-body)',
              color: 'var(--bl-text-muted)',
              lineHeight: 1.6,
              margin: 0,
              marginBottom: '2rem',
            }}
          >
            Run a free risk analysis first. The result tells you which agent
            would close the biggest gap.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/risk-engine" className="bl-btn-primary">
              Free Risk Scan
              <span aria-hidden="true">→</span>
            </Link>
            <Link href="/contact" className="bl-btn-ghost">
              Talk to our team
            </Link>
          </div>
        </div>
      </section>

      {/* ItemList JSON-LD — makes the agent fleet discoverable by AI search engines
          (Perplexity, ChatGPT Bing Browse, Google SGE) as a structured product catalog. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: 'BizLegal AI Compliance Agents',
            description: 'Fleet of 15 specialized AI compliance agents covering regulatory research, contracts, risk assessment, diligence, monitoring, marketplace compliance, AI governance, and India DPDPA.',
            url: 'https://bizlegal-ai.com/agents',
            numberOfItems: AGENTS.length,
            itemListElement: AGENTS.map((agent, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              item: {
                '@type': 'SoftwareApplication',
                '@id': `https://bizlegal-ai.com/agents#${agent.id}`,
                name: agent.name,
                description: agent.description,
                applicationCategory: 'BusinessApplication',
                applicationSubCategory: 'LegalTech',
                offers: {
                  '@type': 'Offer',
                  price: (agent.priceCents / 100).toFixed(2),
                  priceCurrency: 'USD',
                  priceSpecification: {
                    '@type': agent.interval === 'monthly' ? 'UnitPriceSpecification' : 'PriceSpecification',
                    price: (agent.priceCents / 100).toFixed(2),
                    priceCurrency: 'USD',
                    ...(agent.interval === 'monthly' ? { unitCode: 'MON', referenceQuantity: { '@type': 'QuantitativeValue', value: 1, unitCode: 'MON' } } : {}),
                  },
                },
                featureList: agent.features,
                url: agent.deepLink
                  ? agent.deepLink.startsWith('http')
                    ? agent.deepLink
                    : `https://bizlegal-ai.com${agent.deepLink}`
                  : 'https://bizlegal-ai.com/agents',
              },
            })),
          }),
        }}
      />
    </>
  )
}
