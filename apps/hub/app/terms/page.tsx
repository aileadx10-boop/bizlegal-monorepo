import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Use',
  description: 'Commercial and platform terms for using BizLegal AI websites, products, and intelligence services.',
}

const SECTIONS = [
  {
    title: '1. Platform Scope',
    body: 'BizLegal AI provides software, intelligence content, compliance tools, workflow automation, legal document generation, and related commercial materials for informational and operational use. Products include TRACR, BRAI, LexAudit, DocAI, Forge, and LeadForge.',
    sub: 'Access to any BizLegal AI product or site does not create an attorney-client relationship, fiduciary duty, or legal representation arrangement. All outputs are intelligence tools, not legal advice.',
  },
  {
    title: '2. Acceptable Use',
    body: 'By accessing BizLegal AI, you agree to our Acceptable Use Policy. You may not use the platform for unlawful activity, to evade regulatory obligations, to harass individuals, or to reproduce AI outputs as authoritative legal determinations.',
    bullets: [
      'Do not submit unlawful, infringing, or confidential third-party information without authorization.',
      'Do not attempt to reverse engineer, scrape, or disrupt platform infrastructure.',
      'Do not rely on AI-generated outputs as a substitute for qualified legal counsel.',
      'Do not share, resell, or redistribute access credentials or product outputs without written permission.',
    ],
  },
  {
    title: '3. AI Output Disclaimer',
    body: 'BizLegal AI products use artificial intelligence and machine learning to generate risk assessments, compliance summaries, legal documents, and intelligence reports. These outputs are informational only. They are not legal opinions and must be reviewed by qualified professionals before any regulatory, transactional, or legal reliance.',
    sub: 'Risk scores, Compliance Health Score snapshots, and jurisdiction analyses are intelligence instruments — not binding regulatory determinations.',
  },
  {
    title: '4. Commercial Terms',
    body: 'Pricing, subscriptions, and service tiers are subject to change with notice. Paid plans are governed by the plan terms active at the time of purchase. Enterprise agreements may contain separate terms that supersede this document.',
    bullets: [
      'Subscription fees are billed in advance on a monthly or annual cycle.',
      'Refunds are governed by the Refund Policy: subscriptions cancellable anytime with access to end of paid period; one-time deliveries non-refundable once produced unless damaged or defective.',
      'Chargebacks initiated without prior contact may result in account suspension.',
    ],
  },
  {
    title: '5. Intellectual Property',
    body: 'All platform content, AI models, risk scoring methodologies, product interfaces, and brand elements are the exclusive property of BizLegal AI. No license to reproduce, republish, or redistribute is granted except as expressly provided in writing.',
    sub: 'User-submitted content remains the property of the user, subject to a limited license for BizLegal AI to process and deliver the requested service.',
  },
  {
    title: '6. Liability Limitations',
    body: 'To the maximum extent permitted by applicable law, BizLegal AI disclaims liability for indirect, consequential, special, incidental, or punitive damages arising from use of the platform, product outputs, or intelligence content.',
    sub: 'Our aggregate liability for any claim shall not exceed the amount paid by you in the 12 months preceding the claim.',
  },
  {
    title: '7. Governing Law',
    body: 'These Terms are governed by the laws of the jurisdiction in which BizLegal AI is incorporated, without regard to conflict of law principles. Disputes shall be resolved by binding arbitration or the competent courts of that jurisdiction.',
    sub: null,
  },
  {
    title: '8. Updates',
    body: 'BizLegal AI may update these Terms at any time. Continued use of the platform after notice of changes constitutes acceptance of the revised Terms. Material changes will be communicated by email or in-platform notice with at least 14 days advance notice.',
    sub: null,
  },
]

export default function TermsPage() {
  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '80px 32px 120px', paddingTop: 120 }}>
      {/* Header */}
      <div style={{ marginBottom: 56 }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.18em',
          textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 20,
        }}>
          Legal — Terms of Use
        </div>
        <h1 className="quantum-h2" style={{ marginBottom: 16, color: 'var(--white)' }}>
          Terms of Use
        </h1>
        <p style={{ fontSize: 15, color: 'var(--on-surface-var)', lineHeight: 1.7, marginBottom: 16 }}>
          These Terms govern access to and use of all BizLegal AI products, websites, APIs, and intelligence services. Please read them carefully.
        </p>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)',
          letterSpacing: '0.1em', textTransform: 'uppercase',
        }}>
          Last updated: April 2026
        </div>
      </div>

      <div className="quantum-divider" style={{ marginBottom: 48 }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
        {SECTIONS.map(s => (
          <section key={s.title}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--white)', marginBottom: 14, fontWeight: 400 }}>
              {s.title}
            </h2>
            <p style={{ fontSize: 14, color: 'var(--on-surface-var)', lineHeight: 1.75, marginBottom: s.bullets ? 14 : (s.sub ? 12 : 0) }}>
              {s.body}
            </p>
            {s.bullets && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: s.sub ? 12 : 0 }}>
                {s.bullets.map(b => (
                  <div key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <span style={{ color: 'var(--primary)', fontSize: 12, marginTop: 2, flexShrink: 0 }}>–</span>
                    <span style={{ fontSize: 14, color: 'var(--on-surface-var)', lineHeight: 1.65 }}>{b}</span>
                  </div>
                ))}
              </div>
            )}
            {s.sub && (
              <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7, borderLeft: '2px solid var(--outline)', paddingLeft: 16, marginTop: s.bullets ? 12 : 0 }}>
                {s.sub}
              </p>
            )}
          </section>
        ))}
      </div>

      {/* Contact */}
      <div className="quantum-divider" style={{ margin: '48px 0 32px' }} />
      <p style={{ fontSize: 14, color: 'var(--on-surface-var)', lineHeight: 1.75 }}>
        Questions about these Terms?{' '}
        <a href="mailto:legal@bizlegal-ai.com" style={{ color: 'var(--primary)' }}>legal@bizlegal-ai.com</a>
      </p>

      {/* Nav */}
      <div style={{ display: 'flex', gap: 20, marginTop: 24 }}>
        <Link href="/privacy" style={{ fontSize: 13, color: 'var(--muted)', textDecoration: 'none', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>← Privacy Policy</Link>
        <Link href="/acceptable-use" style={{ fontSize: 13, color: 'var(--muted)', textDecoration: 'none', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>Acceptable Use →</Link>
      </div>
    </main>
  )
}
