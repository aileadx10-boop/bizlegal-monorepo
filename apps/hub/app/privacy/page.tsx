import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How BizLegal AI handles website, product, and operational data. GDPR and CCPA compliant.',
}

const SECTIONS = [
  {
    title: '1. What We Collect',
    body: 'BizLegal AI collects information necessary to operate our platform, deliver products, and improve the user experience. We apply data minimisation principles — we only collect what is required for the stated purpose.',
    bullets: [
      'Account information: name, email, company, and payment details submitted at registration or checkout.',
      'Usage data: pages visited, features accessed, API calls, and product workflow interactions.',
      'User-submitted content: wallet addresses, document inputs, and compliance queries submitted to our products.',
      'Device and technical data: browser type, IP address, timezone, and referring URL for security and performance.',
      'Communications: support requests, feedback, and correspondence with our team.',
    ],
  },
  {
    title: '2. How We Use Your Information',
    body: 'We process personal data for the following lawful purposes:',
    bullets: [
      'Delivering the products and services you have subscribed to or purchased.',
      'Processing payments and managing billing relationships.',
      'Improving product accuracy, AI model performance, and platform features.',
      'Sending transactional communications (invoices, alerts, order confirmations).',
      'Sending marketing communications with your consent (unsubscribe at any time).',
      'Detecting, preventing, and investigating fraud, abuse, or security incidents.',
      'Meeting legal obligations including AML, KYC, and data retention requirements.',
    ],
    sub: 'We do not use your data to train publicly available AI models without explicit consent.',
  },
  {
    title: '3. Data Sharing',
    body: 'BizLegal AI does not sell personal data. We share data only with:',
    bullets: [
      'Infrastructure providers (cloud hosting, CDN, database) under data processing agreements.',
      'Payment processors (NOWPayments, PayPal) to complete transactions securely.',
      'Analytics and monitoring tools (with pseudonymisation applied where possible).',
      'Law enforcement or regulatory authorities when legally required to disclose.',
    ],
    sub: 'All third-party providers are contractually bound to process data only for the stated purposes and to maintain adequate security standards.',
  },
  {
    title: '4. International Transfers',
    body: 'BizLegal AI operates globally. Data may be transferred to and processed in countries outside your home jurisdiction. Where we transfer data outside the EEA or UK, we rely on Standard Contractual Clauses (SCCs) or equivalent adequacy mechanisms.',
    sub: null,
  },
  {
    title: '5. Your Rights (GDPR / CCPA)',
    body: 'Depending on your jurisdiction, you may have the following rights:',
    bullets: [
      'Right to access — request a copy of the personal data we hold about you.',
      'Right to rectification — correct inaccurate or incomplete data.',
      'Right to erasure — request deletion of your data ("right to be forgotten").',
      'Right to portability — receive your data in a structured, machine-readable format.',
      'Right to restrict processing — object to or limit certain uses of your data.',
      'Right to opt out of sale — California residents may opt out under CCPA.',
    ],
    sub: 'To exercise any right, email privacy@bizlegal-ai.com. We respond within 30 days.',
  },
  {
    title: '6. Data Retention',
    body: 'We retain personal data for as long as reasonably necessary to operate the platform, fulfil contractual obligations, comply with legal requirements, and resolve disputes. Account data is deleted within 90 days of account closure, subject to legal retention obligations.',
    sub: null,
  },
  {
    title: '7. Cookies & Tracking',
    body: 'We use essential cookies for authentication and security. We use analytics cookies to understand platform usage. You can manage cookie preferences via your browser settings or our cookie consent banner. We do not use cross-site advertising trackers.',
    sub: null,
  },
  {
    title: '8. Security',
    body: 'BizLegal AI implements industry-standard security measures including AES-256 encryption at rest and TLS in transit, role-based access controls, audit logging, and SOC 2-aligned security practices. No method of electronic transmission is 100% secure — we maintain incident response procedures for data breaches.',
    sub: null,
  },
  {
    title: '9. Contact & DPO',
    body: 'For privacy enquiries, data subject requests, or to reach our Data Protection Officer:',
    bullets: [
      'Email: privacy@bizlegal-ai.com',
      'For EU/UK requests, we respond within 30 calendar days.',
      'You have the right to lodge a complaint with your national supervisory authority.',
    ],
  },
]

export default function PrivacyPage() {
  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '80px 32px 120px', paddingTop: 120 }}>
      {/* Header */}
      <div style={{ marginBottom: 56 }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.18em',
          textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 20,
        }}>
          Legal — Privacy Policy
        </div>
        <h1 className="quantum-h2" style={{ marginBottom: 16, color: 'var(--white)' }}>
          Privacy Policy
        </h1>
        <p style={{ fontSize: 15, color: 'var(--on-surface-var)', lineHeight: 1.7, marginBottom: 16 }}>
          This policy explains how BizLegal AI collects, uses, shares, and protects personal data across all products and services. We are committed to transparency and GDPR / CCPA compliance.
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
            <p style={{ fontSize: 14, color: 'var(--on-surface-var)', lineHeight: 1.75, marginBottom: s.bullets ? 14 : 0 }}>
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
        Privacy enquiries:{' '}
        <a href="mailto:privacy@bizlegal-ai.com" style={{ color: 'var(--primary)' }}>privacy@bizlegal-ai.com</a>
      </p>

      {/* Nav */}
      <div style={{ display: 'flex', gap: 20, marginTop: 24 }}>
        <Link href="/terms" style={{ fontSize: 13, color: 'var(--muted)', textDecoration: 'none', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>← Terms of Use</Link>
        <Link href="/refund" style={{ fontSize: 13, color: 'var(--muted)', textDecoration: 'none', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>Refund Policy →</Link>
      </div>
    </main>
  )
}
