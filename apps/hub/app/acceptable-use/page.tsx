import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Acceptable Use Policy',
  description: 'BizLegal AI Acceptable Use Policy governing how products and intelligence services may be used.',
}

export default function AcceptableUsePage() {
  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '80px 32px 120px' }}>
      {/* Header */}
      <div style={{ marginBottom: 56 }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.18em',
          textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 20,
        }}>
          Legal — Acceptable Use Policy
        </div>
        <h1 className="quantum-h2" style={{ marginBottom: 16, color: 'var(--white)' }}>
          Acceptable Use Policy
        </h1>
        <p style={{ fontSize: 15, color: 'var(--on-surface-var)', lineHeight: 1.7, marginBottom: 16 }}>
          This Acceptable Use Policy ("AUP") governs how BizLegal AI products, intelligence services, APIs, and platform infrastructure may be accessed and used. By using any BizLegal AI product, you agree to this AUP.
        </p>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)',
          letterSpacing: '0.1em', textTransform: 'uppercase',
        }}>
          Last updated: April 2026
        </div>
      </div>

      <div className="quantum-divider" style={{ marginBottom: 48 }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>

        {/* 1 */}
        <section>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--white)', marginBottom: 16, fontWeight: 400 }}>
            1. Permitted Use
          </h2>
          <p style={{ fontSize: 14, color: 'var(--on-surface-var)', lineHeight: 1.75, marginBottom: 12 }}>
            BizLegal AI products are designed for legitimate business, compliance, legal research, and intelligence purposes. Permitted uses include:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              'Conducting AML/KYC due diligence on blockchain transactions and wallets',
              'Generating regulatory compliance gap reports for internal use',
              'Producing legal documents and contracts for review by qualified counsel',
              'Monitoring regulatory enforcement actions for business risk management',
              'Accessing jurisdiction intelligence to inform lawful business decisions',
              'Integrating APIs for licensed financial services and compliance workflows',
            ].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span style={{ color: 'var(--accent)', fontSize: 12, marginTop: 2, flexShrink: 0 }}>✓</span>
                <span style={{ fontSize: 14, color: 'var(--on-surface-var)', lineHeight: 1.65 }}>{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 2 */}
        <section>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--white)', marginBottom: 16, fontWeight: 400 }}>
            2. Prohibited Activities
          </h2>
          <p style={{ fontSize: 14, color: 'var(--on-surface-var)', lineHeight: 1.75, marginBottom: 16 }}>
            The following activities are strictly prohibited:
          </p>

          {[
            {
              heading: 'Illegal activity',
              items: [
                'Using services to facilitate money laundering, fraud, or terrorist financing',
                'Accessing platform outputs to evade sanctions, OFAC lists, or AML obligations',
                'Generating documents intended to misrepresent regulatory compliance',
              ],
            },
            {
              heading: 'Abuse of platform',
              items: [
                'Scraping, crawling, or bulk-extracting data beyond API rate limits',
                'Reverse engineering AI models, algorithms, or proprietary risk scoring methods',
                'Sharing access credentials or reselling platform access without authorization',
                'Submitting false information to influence risk scores or report outcomes',
              ],
            },
            {
              heading: 'Harmful use',
              items: [
                'Using blockchain forensics outputs to harass, stalk, or harm private individuals',
                'Publishing BizLegal AI intelligence outputs as the primary basis of public accusations',
                'Using lead data from LeadForge to contact individuals who have opted out',
              ],
            },
          ].map(group => (
            <div key={group.heading} style={{ marginBottom: 24 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--danger)', marginBottom: 10 }}>
                {group.heading}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {group.items.map(item => (
                  <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <span style={{ color: 'var(--danger)', fontSize: 12, marginTop: 2, flexShrink: 0 }}>✕</span>
                    <span style={{ fontSize: 14, color: 'var(--on-surface-var)', lineHeight: 1.65 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* 3 */}
        <section>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--white)', marginBottom: 16, fontWeight: 400 }}>
            3. AI Output Limitations
          </h2>
          <p style={{ fontSize: 14, color: 'var(--on-surface-var)', lineHeight: 1.75, marginBottom: 12 }}>
            BizLegal AI products generate outputs using artificial intelligence, machine learning, and curated data sources. You acknowledge that:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              'AI-generated content is informational and does not constitute legal advice',
              'Risk scores and Compliance Health Score snapshots are intelligence tools, not regulatory determinations',
              'Outputs must be reviewed by qualified legal or compliance professionals before reliance',
              'BizLegal AI is not liable for decisions made solely on the basis of AI-generated content',
            ].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span style={{ color: 'var(--warning)', fontSize: 12, marginTop: 2, flexShrink: 0 }}>!</span>
                <span style={{ fontSize: 14, color: 'var(--on-surface-var)', lineHeight: 1.65 }}>{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 4 */}
        <section>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--white)', marginBottom: 16, fontWeight: 400 }}>
            4. API and Integration Use
          </h2>
          <p style={{ fontSize: 14, color: 'var(--on-surface-var)', lineHeight: 1.75 }}>
            Access to BizLegal AI via API is subject to rate limits, authentication requirements, and product-specific terms. API keys are non-transferable. You are responsible for all activity under your API key. Excessive or abusive API usage may result in rate limiting, key suspension, or account termination.
          </p>
        </section>

        {/* 5 */}
        <section>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--white)', marginBottom: 16, fontWeight: 400 }}>
            5. Enforcement
          </h2>
          <p style={{ fontSize: 14, color: 'var(--on-surface-var)', lineHeight: 1.75, marginBottom: 12 }}>
            Violation of this AUP may result in:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              'Immediate suspension or termination of access without refund',
              'Reporting to relevant authorities where illegal activity is suspected',
              'Legal action to recover damages or enforce platform terms',
            ].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span style={{ color: 'var(--danger)', fontSize: 12, marginTop: 2, flexShrink: 0 }}>→</span>
                <span style={{ fontSize: 14, color: 'var(--on-surface-var)', lineHeight: 1.65 }}>{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 6 */}
        <section>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--white)', marginBottom: 16, fontWeight: 400 }}>
            6. Reporting Violations
          </h2>
          <p style={{ fontSize: 14, color: 'var(--on-surface-var)', lineHeight: 1.75 }}>
            If you become aware of a violation of this AUP, report it to{' '}
            <a href="mailto:security@bizlegal-ai.com" style={{ color: 'var(--primary)' }}>security@bizlegal-ai.com</a>.
            We investigate all reports and take appropriate action.
          </p>
        </section>

      </div>

      {/* Nav back */}
      <div className="quantum-divider" style={{ margin: '56px 0 32px' }} />
      <div style={{ display: 'flex', gap: 20 }}>
        <Link href="/refund" style={{ fontSize: 13, color: 'var(--muted)', textDecoration: 'none', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>← Refund Policy</Link>
        <Link href="/terms" style={{ fontSize: 13, color: 'var(--muted)', textDecoration: 'none', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>Terms of Use →</Link>
      </div>
    </main>
  )
}
