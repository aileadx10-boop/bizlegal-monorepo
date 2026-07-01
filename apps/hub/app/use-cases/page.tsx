import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Use Cases — BizLegal AI Compliance Software',
  description:
    'How compliance and legal teams use BizLegal AI: SOC 2 questionnaire automation, DPA review, MiCA compliance monitoring, BOI filing, and cross-border regulatory intelligence.',
  alternates: { canonical: 'https://bizlegal-ai.com/use-cases' },
}

const USE_CASES = [
  {
    href: '/use-cases/soc2-questionnaire',
    badge: 'DocAI SQA',
    title: 'SOC 2 Questionnaire Automation',
    desc: 'Answer 300-question security questionnaires in 2 hours instead of 3 days. Map your existing policies to enterprise buyer questions automatically.',
    stat: '2 hours',
    statLabel: 'vs 3-4 days manually',
    cta: 'From $69/mo',
    color: 'var(--sky)',
  },
  {
    href: '/use-cases/dpa-review',
    badge: 'DocAI DPA',
    title: 'DPA Review Automation',
    desc: 'Review GDPR Article 28 Data Processing Agreements in 15 minutes. AI checks all 12 mandatory clauses, SCC validity, and sub-processor restrictions.',
    stat: '15 min',
    statLabel: 'vs 3 days via lawyer',
    cta: 'From $69/mo',
    color: '#a78bfa',
  },
  {
    href: '/use-cases/mica-compliance',
    badge: 'Hub Pro',
    title: 'MiCA Compliance Monitoring',
    desc: 'Real-time monitoring of EU crypto regulation across 27 NCAs. CASP authorization tracking, Article 45 obligations, ESMA guidance alerts.',
    stat: '27',
    statLabel: 'EU NCAs monitored daily',
    cta: 'From $149/mo',
    color: '#34d399',
  },
  {
    href: '/use-cases/boi-filing',
    badge: 'Forge + BOI Tracker',
    title: 'BOI Filing Compliance',
    desc: 'FinCEN CTA beneficial ownership reporting for US LLCs and crypto companies. Pre-filing checklist, exemption analysis, and ongoing update monitoring.',
    stat: '$500/day',
    statLabel: 'penalty for willful non-filing',
    cta: '$149 kit',
    color: '#fbbf24',
  },
]

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bizlegal-ai.com' },
    { '@type': 'ListItem', position: 2, name: 'Use Cases', item: 'https://bizlegal-ai.com/use-cases' },
  ],
}

export default function UseCasesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', paddingTop: '36px' }}>
        {/* Nav */}
        <div style={{ background: 'rgba(7,9,26,0.95)', borderBottom: '1px solid rgba(125,211,252,0.08)' }}>
          <div className="container" style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link href="/" className="nav-logo" style={{ marginRight: 'auto' }}>BizLegal<em>AI</em></Link>
            <Link href="/pricing" className="btn-ghost" style={{ fontSize: '12px' }}>Pricing</Link>
            <Link href="/pricing" className="btn-primary" style={{ fontSize: '12px' }}>Get Started →</Link>
          </div>
        </div>

        {/* Hero */}
        <div style={{ padding: '80px 24px 60px', maxWidth: '960px', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'Gloock, serif', fontSize: 'clamp(36px, 5vw, 64px)', color: 'var(--white)', lineHeight: 1.1, marginBottom: '24px', letterSpacing: '-0.02em' }}>
            Compliance work that used to take days.<br />
            <em style={{ fontStyle: 'italic', color: 'var(--sky)' }}>Now done in minutes.</em>
          </h1>
          <p style={{ fontSize: '17px', color: 'var(--muted)', lineHeight: 1.8, maxWidth: '640px', margin: '0 auto 24px' }}>
            BizLegal AI automates the specific compliance work that slows down fintech, crypto, and SaaS teams — SOC 2 reviews, DPA negotiations, regulatory monitoring, and beneficial ownership reporting.
          </p>
        </div>

        {/* Use case cards */}
        <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 24px 80px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {USE_CASES.map((uc) => (
            <Link
              key={uc.href}
              href={uc.href}
              style={{ textDecoration: 'none', display: 'block', padding: '32px', border: '1px solid rgba(125,211,252,0.12)', borderRadius: '16px', background: 'rgba(125,211,252,0.02)', transition: 'border-color 0.2s' }}
            >
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', borderRadius: '100px', border: `1px solid ${uc.color}30`, background: `${uc.color}08`, fontSize: '11px', fontFamily: 'Geist Mono, monospace', color: uc.color, marginBottom: '20px' }}>
                {uc.badge}
              </div>
              <h2 style={{ fontFamily: 'Gloock, serif', fontSize: '22px', color: 'var(--white)', marginBottom: '12px', fontWeight: 600 }}>{uc.title}</h2>
              <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '24px' }}>{uc.desc}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: `1px solid rgba(125,211,252,0.08)`, paddingTop: '20px' }}>
                <div>
                  <div style={{ fontFamily: 'Gloock, serif', fontSize: '28px', color: uc.color }}>{uc.stat}</div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{uc.statLabel}</div>
                </div>
                <div style={{ fontSize: '13px', color: uc.color, fontWeight: 600 }}>{uc.cta} →</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom CTA */}
        <div style={{ background: 'rgba(125,211,252,0.04)', borderTop: '1px solid rgba(125,211,252,0.1)', padding: '60px 24px', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Gloock, serif', fontSize: '32px', color: 'var(--white)', marginBottom: '16px' }}>
            Have a different compliance challenge?
          </h2>
          <p style={{ fontSize: '16px', color: 'var(--muted)', marginBottom: '32px' }}>
            BizLegal AI covers 50+ regulatory frameworks. See all products or talk to us.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/pricing" className="lx-btn-p">All Products →</Link>
            <Link href="/contact" className="lx-btn-g">Contact Us</Link>
          </div>
        </div>
      </div>
    </>
  )
}
