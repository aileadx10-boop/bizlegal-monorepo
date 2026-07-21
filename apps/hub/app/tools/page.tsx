import type { Metadata } from 'next'
import Link from 'next/link'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'Free Compliance Tools — AI-Powered Legal & Regulatory Tools | BizLegal AI',
  description:
    '18 free compliance tools: GDPR fine estimator, BOI filing check, contract risk scanner, sanctions screener, crypto wallet analysis, MiCA classifier, and more. No account required.',
  alternates: { canonical: 'https://bizlegal-ai.com/tools' },
  openGraph: {
    title: 'Free Compliance Tools | BizLegal AI',
    description:
      '18 free AI-powered tools covering GDPR, BOI/CTA, MiCA, sanctions screening, contract risk, and more. No signup until you see results.',
    url: 'https://bizlegal-ai.com/tools',
  },
}

const HUB_TOOLS = [
  {
    slug: 'gdpr-fine-estimator',
    title: 'GDPR Fine Estimator',
    desc: 'Estimate potential GDPR fines based on violation type, company revenue, and breach severity.',
    tag: 'GDPR',
  },
  {
    slug: 'mica-asset-classifier',
    title: 'MiCA Asset Classifier',
    desc: 'Classify your crypto asset under EU MiCA — e-money token, asset-referenced token, or other crypto-asset.',
    tag: 'MiCA',
  },
  {
    slug: 'token-classifier',
    title: 'Token Classifier (Howey Test)',
    desc: 'Run a Howey Test analysis on your token to estimate US securities classification risk.',
    tag: 'SEC',
  },
  {
    slug: 'vara-licence-finder',
    title: 'VARA Licence Finder',
    desc: 'Find the right Virtual Asset Service Provider licence category under UAE VARA regulation.',
    tag: 'VARA',
  },
  {
    slug: 'contract-fixer',
    title: 'Freelancer Contract Fixer',
    desc: 'Paste a contractor or freelance agreement clause — get a risk flag and a plain-English fix.',
    tag: 'Contract',
  },
  {
    slug: 'saas-risk-scanner',
    title: 'SaaS Terms Risk Scanner',
    desc: "Paste a vendor's ToS or DPA clause — AI flags the top risk and suggests negotiation language.",
    tag: 'Contract',
  },
  {
    slug: 'gdpr-breach-timer',
    title: 'GDPR Breach Notification Timer',
    desc: 'Input your breach discovery date to track the 72-hour supervisory authority notification deadline.',
    tag: 'GDPR',
  },
  {
    slug: 'debt-collection',
    title: 'Debt Collection Letter Generator',
    desc: 'Generate a compliant demand letter with correct statutory language for your jurisdiction.',
    tag: 'Collections',
  },
  {
    slug: 'website-compliance',
    title: 'AI Website Compliance Checker',
    desc: 'Enter your URL — AI audits cookie consent, privacy policy, accessibility basics, and GDPR signals.',
    tag: 'Privacy',
  },
]

const SUBDOMAIN_TOOLS = [
  {
    href: 'https://lexaudit.bizlegal-ai.com/compliance-health-score',
    title: 'Compliance Health Score',
    desc: '40-question self-assessment across 8 domains (GDPR, HIPAA, SOC 2, FinCEN, ISO 27001 and more). Get a 0–100 score and your top 3 priority gaps.',
    tag: 'LexAudit',
    badge: '★ Most comprehensive',
  },
  {
    href: 'https://lexaudit.bizlegal-ai.com/decision-tree',
    title: 'Compliance Monitor Decision Tree',
    desc: '60-second screen: is continuous compliance monitoring the right call for your regulator footprint? Returns a preliminary verdict before you sign anything.',
    tag: 'LexAudit',
  },
  {
    href: 'https://docai.bizlegal-ai.com/decision-tree',
    title: 'Privacy Scan Decision Tree',
    desc: '60-second privacy-exposure screen across GDPR, CCPA, and US state privacy laws. Email-gated full breakdown.',
    tag: 'DocAI',
  },
  {
    href: 'https://docai.bizlegal-ai.com/sqa',
    title: 'Security Questionnaire Auto-Fill',
    desc: 'Drop a SOC 2, CAIQ, SIG-Lite, or NIST question — get a citation-grounded draft answer in seconds. First draft free.',
    tag: 'DocAI',
  },
  {
    href: 'https://forge.bizlegal-ai.com/decision-tree',
    title: 'BOI Filing Decision Tree',
    desc: "Does your US entity need to file a Beneficial Ownership Information report under FinCEN's Corporate Transparency Act? Find out in 60 seconds.",
    tag: 'Forge',
  },
  {
    href: 'https://brai.bizlegal-ai.com/decision-tree',
    title: 'Sanctions Screening Decision Tree',
    desc: '60-second sanctions-exposure screen across OFAC, EU, UK, and on-chain risk vectors. Returns an action priority before you pay for a full report.',
    tag: 'BRAI',
  },
  {
    href: 'https://tracr.bizlegal-ai.com/decision-tree',
    title: 'Crypto Reporting Decision Tree',
    desc: 'Should you file an FBAR, IRS Form 8949, or FinCEN AML report for your crypto activity? 60-second screen.',
    tag: 'TRACR',
  },
  {
    href: 'https://tracr.bizlegal-ai.com/scan',
    title: 'Business Compliance Scan',
    desc: 'Multi-step compliance exposure scan for crypto businesses: jurisdiction × custody × revenue × AML obligations.',
    tag: 'TRACR',
  },
  {
    href: 'https://tracr.bizlegal-ai.com/analyze',
    title: 'Wallet Risk Snapshot',
    desc: 'Enter a wallet address (Ethereum, BNB, Polygon, Arbitrum, Base, or Bitcoin) — get a free blockchain forensic risk snapshot.',
    tag: 'TRACR',
  },
]

const TAG_COLORS: Record<string, string> = {
  GDPR: '#1a6b4a',
  MiCA: '#1a3a6b',
  SEC: '#6b1a1a',
  VARA: '#6b4a1a',
  Contract: '#3a1a6b',
  Privacy: '#1a4a6b',
  Collections: '#4a3a1a',
  LexAudit: '#2a1a5a',
  DocAI: '#1a4a2a',
  Forge: '#4a2a1a',
  BRAI: '#1a3a4a',
  TRACR: '#3a1a4a',
}

export default function ToolsPage(): JSX.Element {
  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'BizLegal AI Free Compliance Tools',
    url: 'https://bizlegal-ai.com/tools',
    numberOfItems: HUB_TOOLS.length + SUBDOMAIN_TOOLS.length,
    itemListElement: [
      ...HUB_TOOLS.map((t, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: t.title,
        url: `https://bizlegal-ai.com/tools/${t.slug}`,
      })),
      ...SUBDOMAIN_TOOLS.map((t, i) => ({
        '@type': 'ListItem',
        position: HUB_TOOLS.length + i + 1,
        name: t.title,
        url: t.href,
      })),
    ],
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bizlegal-ai.com' },
      { '@type': 'ListItem', position: 2, name: 'Free Compliance Tools', item: 'https://bizlegal-ai.com/tools' },
    ],
  }

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Are these compliance tools really free?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. All tools on this page are free to use. Some tools gate the full breakdown behind an email address — the screen result (verdict or score) is always shown first, with no card required.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do these tools provide legal advice?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. These are AI-powered decision-support tools. They are not a substitute for legal counsel. Outputs should be treated as preliminary signals — confirm material compliance decisions with a qualified attorney.',
        },
      },
      {
        '@type': 'Question',
        name: 'Which tool should I start with?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'For a broad compliance posture overview, start with the Compliance Health Score (40 questions, 8 domains, 0–100 score). For a specific regulatory question (BOI, GDPR breach, crypto reporting), pick the relevant decision tree.',
        },
      },
      {
        '@type': 'Question',
        name: 'What regulations do these tools cover?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Coverage spans GDPR, CCPA, HIPAA, SOC 2, FinCEN BOI/CTA, MiCA, VARA, OFAC sanctions, IRS crypto reporting (FBAR/8949), SEC Howey Test, and general B2B contract risk.',
        },
      },
    ],
  }

  return (
    <main style={{ minHeight: '100vh', background: '#050509' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '64px 24px' }}>
        {/* Header */}
        <header style={{ textAlign: 'center', marginBottom: 56 }}>
          <span style={{ display: 'inline-block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.16em', color: '#c9a84c', fontWeight: 700, marginBottom: 12 }}>
            18 free tools · no account required
          </span>
          <h1 style={{ fontSize: 'clamp(2rem, 1rem + 3.5vw, 3.2rem)', fontWeight: 700, color: '#f7f3e8', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 16 }}>
            Free Compliance Tools
          </h1>
          <p style={{ fontSize: 17, color: '#94a3b8', lineHeight: 1.7, maxWidth: 600, margin: '0 auto' }}>
            AI-powered tools for GDPR, BOI/CTA, MiCA, sanctions screening, contract risk, crypto reporting, and more.
            Run the screen first — no card, no account.
          </p>
        </header>

        {/* Subdomain tools — featured */}
        <section style={{ marginBottom: 56 }}>
          <h2 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#64748b', fontWeight: 600, marginBottom: 20 }}>
            Assessment tools
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: 16 }}>
            {SUBDOMAIN_TOOLS.map((tool) => (
              <a
                key={tool.href}
                href={tool.href}
                style={{
                  display: 'block',
                  background: '#0b0b16',
                  border: '1px solid #1a1a2e',
                  borderRadius: 12,
                  padding: '20px 22px',
                  textDecoration: 'none',
                  transition: 'border-color 0.2s',
                  position: 'relative',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#c9a84c' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#1a1a2e' }}
              >
                {tool.badge && (
                  <span style={{ position: 'absolute', top: 14, right: 14, fontSize: 10, background: '#c9a84c22', color: '#c9a84c', border: '1px solid #c9a84c44', borderRadius: 999, padding: '2px 8px', fontWeight: 700 }}>
                    {tool.badge}
                  </span>
                )}
                <span style={{
                  display: 'inline-block',
                  fontSize: 10,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  fontWeight: 700,
                  color: '#c9a84c',
                  background: '#1a150a',
                  border: '1px solid #2a1f08',
                  borderRadius: 999,
                  padding: '2px 8px',
                  marginBottom: 10,
                }}>
                  {tool.tag}
                </span>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: '#e2e8f0', marginBottom: 6, lineHeight: 1.3 }}>
                  {tool.title}
                </h3>
                <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>{tool.desc}</p>
              </a>
            ))}
          </div>
        </section>

        {/* Hub tools grid */}
        <section>
          <h2 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#64748b', fontWeight: 600, marginBottom: 20 }}>
            Quick calculators &amp; generators
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
            {HUB_TOOLS.map((tool) => {
              const tagColor = TAG_COLORS[tool.tag] ?? '#1a2a1a'
              return (
                <Link
                  key={tool.slug}
                  href={`/tools/${tool.slug}`}
                  style={{
                    display: 'block',
                    background: '#0b0b16',
                    border: '1px solid #1a1a2e',
                    borderRadius: 10,
                    padding: '18px 20px',
                    textDecoration: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#3a3a5a' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#1a1a2e' }}
                >
                  <span style={{
                    display: 'inline-block',
                    fontSize: 10,
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    fontWeight: 700,
                    color: '#94a3b8',
                    background: `${tagColor}66`,
                    border: `1px solid ${tagColor}aa`,
                    borderRadius: 999,
                    padding: '2px 8px',
                    marginBottom: 10,
                  }}>
                    {tool.tag}
                  </span>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: '#cbd5e1', marginBottom: 5, lineHeight: 1.3 }}>
                    {tool.title}
                  </h3>
                  <p style={{ fontSize: 12, color: '#475569', lineHeight: 1.6 }}>{tool.desc}</p>
                </Link>
              )
            })}
          </div>
        </section>

        {/* FAQ section for SEO */}
        <section style={{ marginTop: 64, borderTop: '1px solid #1a1a2e', paddingTop: 48 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#e2e8f0', marginBottom: 28 }}>Common questions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {[
              {
                q: 'Are these compliance tools really free?',
                a: 'Yes. All tools on this page are free to use. Some gate the full breakdown behind an email address — the screen result is always shown first, no card required.',
              },
              {
                q: 'Do these tools provide legal advice?',
                a: 'No. These are AI-powered decision-support tools. Outputs are preliminary signals — confirm material compliance decisions with qualified legal counsel.',
              },
              {
                q: 'Which tool should I start with?',
                a: 'For a broad compliance posture overview, start with the Compliance Health Score (40 questions, 8 domains, 0–100 score). For a specific regulatory question (BOI, GDPR breach, crypto reporting), pick the relevant decision tree.',
              },
              {
                q: 'What regulations do these tools cover?',
                a: 'Coverage spans GDPR, CCPA, HIPAA, SOC 2, FinCEN BOI/CTA, MiCA, VARA, OFAC sanctions, IRS crypto reporting (FBAR/8949), SEC Howey Test, and B2B contract risk.',
              },
            ].map(({ q, a }) => (
              <div key={q} style={{ background: '#0b0b16', border: '1px solid #1a1a2e', borderRadius: 10, padding: '20px 22px' }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: '#e2e8f0', marginBottom: 8 }}>{q}</h3>
                <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6 }}>{a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Cross-sell */}
        <div style={{ marginTop: 56, textAlign: 'center', background: 'linear-gradient(135deg, #0f0a1f 0%, #0a1520 100%)', border: '1px solid #1a2a3a', borderRadius: 16, padding: '40px 32px' }}>
          <p style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#64748b', marginBottom: 12 }}>
            Need more than a tool?
          </p>
          <h2 style={{ fontSize: 'clamp(1.4rem, 0.8rem + 2vw, 2rem)', fontWeight: 700, color: '#f7f3e8', marginBottom: 12 }}>
            Managed Compliance Ops — $2,500/mo
          </h2>
          <p style={{ fontSize: 15, color: '#94a3b8', marginBottom: 24, maxWidth: 480, margin: '0 auto 24px' }}>
            24/7 regulatory monitoring, legal review, and response drafts — delivered as a subscription service to fintech and crypto companies.
          </p>
          <a
            href="/services/compliance-ops"
            style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #c9a84c 0%, #e6c86e 100%)',
              color: '#050509',
              fontWeight: 700,
              fontSize: 14,
              padding: '12px 28px',
              borderRadius: 8,
              textDecoration: 'none',
            }}
          >
            See the retainer offer →
          </a>
        </div>
      </div>
    </main>
  )
}
