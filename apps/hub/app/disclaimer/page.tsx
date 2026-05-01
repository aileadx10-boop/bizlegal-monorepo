import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Disclaimer | BizLegal AI',
  description: 'Important legal and operational boundaries for BizLegal AI content and products.',
  alternates: { canonical: 'https://bizlegal-ai.com/disclaimer' },
}

const SECTIONS = [
  {
    title: 'No Legal Advice',
    body: 'BizLegal AI provides templates, automation, workflow support, and informational intelligence. Nothing on the site should be treated as legal advice for your specific matter.',
    sub: 'Legal outcomes depend on jurisdiction, deal facts, counterparties, regulators, and qualified professional review.',
  },
  {
    title: 'No Attorney-Client Relationship',
    body: 'Using the site, reading a guide, downloading a template, or submitting an inquiry does not create an attorney-client relationship.',
    sub: 'You should consult qualified legal counsel before relying on any template, workflow output, or strategic interpretation in a live matter.',
  },
  {
    title: 'AI-Generated Outputs',
    body: 'All outputs from BizLegal AI products are generated using AI and verified through our four-layer verification system. Confidence scores are shown on every output. Outputs below 70% confidence require expert review before release.',
    sub: 'Risk scores, Compliance Health Score snapshots, and jurisdiction analyses are intelligence instruments — not binding regulatory determinations.',
  },
  {
    title: 'Use at Your Own Risk',
    body: 'BizLegal AI makes no guarantee that any page, template, or workflow is complete for every jurisdiction or factual scenario.',
    sub: 'Users are responsible for independent validation, commercial diligence, and legal review before execution or regulatory reliance.',
  },
  {
    title: 'Accuracy & Currency',
    body: 'Regulatory information is updated daily but may not reflect real-time changes in every jurisdiction. BizLegal AI is not responsible for decisions made based on outdated regulatory data.',
    sub: null,
  },
]

const TERMS_CONDITIONS = [
  { title: 'Platform Scope', body: 'BizLegal AI provides software, intelligence content, compliance tools, workflow automation, and legal document generation for informational and operational use. Products include TRACR, BRAI, LexAudit, DocAI, Forge, and LeadForge.' },
  { title: 'Acceptable Use', body: 'You may not use the platform for unlawful activity, to evade regulatory obligations, to harass individuals, or to reproduce AI outputs as authoritative legal determinations. Do not submit unlawful, infringing, or confidential third-party information without authorization.' },
  { title: 'Intellectual Property', body: 'All platform content, AI models, risk scoring methodologies, product interfaces, and brand elements are the exclusive property of BizLegal AI. No license to reproduce, republish, or redistribute is granted except as expressly provided in writing.' },
  { title: 'Liability Limitations', body: 'To the maximum extent permitted by applicable law, BizLegal AI disclaims liability for indirect, consequential, special, incidental, or punitive damages arising from use of the platform. Aggregate liability shall not exceed the amount paid in the 12 months preceding the claim.' },
  { title: 'Governing Law', body: 'These terms are governed by the laws of the jurisdiction in which BizLegal AI is incorporated. Disputes shall be resolved by binding arbitration or the competent courts of that jurisdiction.' },
  { title: 'Updates', body: 'BizLegal AI may update these terms at any time. Continued use after notice of changes constitutes acceptance. Material changes will be communicated with at least 14 days advance notice.' },
]

export default function DisclaimerPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        {/* Header */}
        <section style={{ maxWidth: 900, margin: '0 auto', padding: '120px 32px 64px' }}>
          <div className="quantum-label" style={{ marginBottom: 16, color: 'var(--gold)' }}>Legal</div>
          <h1 className="quantum-h1" style={{ marginBottom: 20, color: 'var(--white)' }}>Disclaimer</h1>
          <p style={{ fontSize: 16, lineHeight: 1.8, maxWidth: 600, color: 'var(--on-surface-var)' }}>
            Strong commercial positioning. Clear legal boundaries.
            This disclaimer clarifies what BizLegal AI does, and just as importantly, what it does not do.
          </p>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)',
            letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 16,
          }}>
            Last updated: April 2026
          </div>
        </section>

        {/* Disclaimer sections */}
        <section style={{ maxWidth: 900, margin: '0 auto', padding: '0 32px 80px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {SECTIONS.map(s => (
              <div key={s.title} className="glass-card" style={{ padding: 28 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--white)', marginBottom: 12, fontWeight: 400 }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--on-surface-var)', lineHeight: 1.75, marginBottom: s.sub ? 12 : 0 }}>{s.body}</p>
                {s.sub && (
                  <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7, borderLeft: '2px solid var(--outline)', paddingLeft: 16 }}>{s.sub}</p>
                )}
              </div>
            ))}
          </div>
        </section>

        <div style={{ maxWidth: 900, margin: '0 auto', borderTop: '0.5px solid var(--outline-var)' }} />

        {/* Downstairs Terms & Conditions */}
        <section style={{ background: 'var(--bg-low)', padding: '64px 32px' }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <div className="quantum-label" style={{ marginBottom: 16, color: 'var(--primary)' }}>Terms & Conditions</div>
            <h2 className="quantum-h2" style={{ marginBottom: 32, color: 'var(--white)' }}>Terms & Conditions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {TERMS_CONDITIONS.map(t => (
                <div key={t.title} className="glass-card" style={{ padding: 20 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--white)', marginBottom: 8, fontWeight: 400 }}>{t.title}</div>
                  <p style={{ fontSize: 13, color: 'var(--on-surface-var)', lineHeight: 1.65 }}>{t.body}</p>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 24 }}>
              <Link href="/terms" style={{ fontSize: 13, color: 'var(--primary)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', textDecoration: 'none' }}>Full Terms of Use →</Link>
            </div>
          </div>
        </section>

        {/* Legal links */}
        <section style={{ padding: '40px 32px', borderTop: '0.5px solid var(--outline-var)' }}>
          <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 600, marginRight: 8 }}>Legal</span>
            {[
              { label: 'Privacy Policy', href: '/privacy' },
              { label: 'Terms of Use', href: '/terms' },
              { label: 'Trust Center', href: '/trust' },
              { label: 'FAQ', href: '/faq' },
            ].map(l => (
              <Link key={l.href} href={l.href} className="link-hover-muted" style={{
                fontSize: 12, fontWeight: 600, textDecoration: 'none',
                fontFamily: 'var(--font-body)',
              }}
              >{l.label}</Link>
            ))}
          </div>
        </section>
      </div>
  )
}