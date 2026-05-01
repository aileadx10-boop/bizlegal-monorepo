import type { Metadata } from 'next'
import Link from 'next/link'
import { AgentCheckoutButton } from '@/app/components/ui-v2/AgentCheckoutButton'

export const metadata: Metadata = {
  title: 'AI Compliance Agents | BizLegal AI',
  description:
    'Specialized AI compliance agents — Compliance Researcher, Cross-Jurisdiction Analyst, Contracts Expert, Risk Assessor, Due Diligence Scanner, Regulatory Monitor. Subscribe individually with crypto or card.',
  alternates: { canonical: 'https://bizlegal-ai.com/agents' },
}

interface Agent {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly priceCents: number
  readonly priceLabel: string
  readonly addon: 'BRAI' | 'TRACR' | 'DocAI' | 'LexAudit' | 'Forge' | 'Hub'
  readonly accent: string
  readonly features: ReadonlyArray<string>
  /** Optional deep-link to the standalone surface (free-first or web-app). */
  readonly deepLink?: string
  /** Optional badge above the name (e.g. "New", "Most popular"). */
  readonly badge?: string
}

const AGENTS: ReadonlyArray<Agent> = [
  {
    id: 'compliance_researcher',
    name: 'Compliance Researcher',
    description:
      'Deep regulatory research across 50+ jurisdictions. Finds relevant frameworks, enforcement actions, and compliance gaps before they become structural liability.',
    priceCents: 2900,
    priceLabel: '$29/mo',
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
    addon: 'BRAI',
    accent: '#7c3aed',
    features: ['Side-by-side jurisdiction comparison', 'Regulatory conflict detection', 'Optimal path recommendations', 'Expansion risk scoring'],
  },
  {
    id: 'contracts_expert',
    name: 'Contracts Expert',
    description:
      'AI-powered contract review and generation. SAFTs, NDAs, terms of service, privacy policies — drafted with jurisdiction awareness and clause risk scoring.',
    priceCents: 3900,
    priceLabel: '$39/mo',
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
    addon: 'BRAI',
    accent: '#f59e0b',
    features: ['Risk heat mapping', 'Exposure probability scoring', 'Financial impact estimation', 'Mitigation priority ranking'],
  },
  {
    id: 'due_diligence_scanner',
    name: 'Due Diligence Scanner',
    description:
      'Scan counterparties, wallets, and entities for AML, KYC, and sanctions risk. Produce diligence reports suitable for investor and regulator review.',
    priceCents: 3900,
    priceLabel: '$39/mo',
    addon: 'TRACR',
    accent: '#dc2626',
    features: ['Counterparty risk screening', 'Wallet provenance analysis', 'Sanctions list matching', 'Diligence report export'],
  },
  {
    id: 'regulatory_monitor',
    name: 'Regulatory Monitor',
    description:
      'Real-time monitoring of regulatory changes across your tracked jurisdictions. Alerts for relevant updates, deadline tracking, and compliance impact summaries.',
    priceCents: 2900,
    priceLabel: '$29/mo',
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
    priceCents: 9900,
    priceLabel: '$99/mo',
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
    priceCents: 6900,
    priceLabel: '$69/mo',
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
    priceCents: 9900,
    priceLabel: '$99/mo',
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
    priceCents: 2900,
    priceLabel: '$29/mo',
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
      'Classify your AI system into Article 6 risk tiers + Annex III references before the 2026-08-02 deadline. Free preview classification; $99 one-time full report; $49/mo monitoring with daily semantic-diff on EU sources.',
    priceCents: 9900,
    priceLabel: '$99 + $49/mo',
    addon: 'Hub',
    accent: '#5b21b6',
    features: [
      'Free preview classification (no card)',
      'Article 6 + Annex III citation map',
      'Documentation checklist (15+ items)',
      'Daily Sonnet semantic-diff monitoring',
      'Quarterly re-classification',
    ],
    deepLink: '/agents/ai-act',
    badge: 'EU deadline',
  },
  {
    id: 'policy_auto_refresh',
    name: 'Privacy Policy Auto-Refresh',
    description:
      'Daily 7-framework redline of your privacy policy (GDPR / CCPA / CPRA / Quebec Law 25 / Colorado / Connecticut / Texas DPSA). Material-change alerts only — no cosmetic-edit noise. Free first audit.',
    priceCents: 2900,
    priceLabel: '$29/mo',
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
]

export default function AgentsPage() {
  return (
    <>
      {/* Hero */}
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
            Six specialised agents — research, comparison, contracts, risk,
            diligence, monitoring. Subscribe individually with crypto or card,
            no parent product subscription required. $29–49/mo.
          </p>
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
            { label: 'BRAI Add-ons', count: 4, color: '#5b21b6' },
            { label: 'DocAI Add-ons', count: 1, color: '#ec4899' },
            { label: 'TRACR Add-ons', count: 1, color: '#dc2626' },
            { label: 'Pay-as-you-go', count: 6, color: 'var(--bl-accent)' },
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
                  interval="monthly"
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
    </>
  )
}
