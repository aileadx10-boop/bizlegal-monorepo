import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Trust Center | BizLegal AI',
  description: 'How BizLegal AI prevents hallucinations, protects your data, and ensures legal accuracy. Four-layer verification. Expert review. Full audit trail.',
  alternates: { canonical: 'https://bizlegal-ai.com/trust' },
}

const LAYERS = [
  {
    num: '01',
    title: 'Input Validation',
    desc: 'Every request passes syntax checks, prompt injection filters, length limits, and type validation before it reaches the AI. Malicious inputs are blocked before processing begins.',
    items: ['Syntax check (valid JSON/form)', 'Prompt injection filter', 'Length limits enforced', 'Type validation (email, URL, wallet address)', 'Known-harmful pattern blocklist'],
  },
  {
    num: '02',
    title: 'Output Verification',
    desc: 'Every AI response is scored for confidence and cross-referenced against regulatory databases before it reaches you. Suspicious language triggers automatic review.',
    items: ['Confidence scoring per claim', 'Regulatory database cross-reference', 'Hallucination phrase detection', 'Citation requirement on every factual claim', 'Semantic domain validation'],
  },
  {
    num: '03',
    title: 'Practitioner Review (High-Stakes Tier)',
    desc: 'High-stakes outputs — investigation reports and Compliance Health Score snapshots — are reviewed by a qualified practitioner before delivery. Turnaround: 24 to 48 hours.',
    items: ['Available on the high-stakes and compliance tiers', 'Reviewed by an LLB + LLM qualified practitioner', '20 years international commercial law experience', 'Practitioner-Reviewed badge on approved output', '24–48 hour turnaround'],
  },
  {
    num: '04',
    title: 'Audit Trail',
    desc: 'Every output has a full trace from input to delivery. You can view and export the complete audit log at any time. Suitable for use in legal proceedings.',
    items: ['Full trace: Input > Model > Output > Review > User', 'Logged metadata: timestamp, model version, input hash', 'Confidence score and review status', 'Encrypted storage', 'Export as PDF for legal proceedings'],
  },
]

const SECURITY = [
  { title: 'Data Encryption', desc: 'All data encrypted at rest (AES-256) and in transit (TLS 1.3). No unencrypted storage of personal data.' },
  { title: 'No Training on Your Data', desc: 'Your submissions are never used to train AI models. Your data stays in your account.' },
  { title: 'GDPR Compliant', desc: 'Full Data Processing Agreement available. Right to erasure honored within 30 days.' },
  { title: 'SOC 2 Infrastructure', desc: 'Hosted on SOC 2 Type II aligned infrastructure via Vercel and Supabase.' },
  { title: 'Row-Level Security', desc: 'Database enforces row-level security policies. You can only access your own data.' },
  { title: 'Zero-Retention Mode', desc: 'Zero-retention mode available by default. No data persisted beyond your session unless you opt in.' },
  { title: 'Penetration Testing', desc: 'Annual third-party security audit. Results available to customers on request.' },
  { title: 'Audit Logging', desc: 'Full audit trail from input to delivery. Every action is logged, timestamped, and encrypted.' },
]

export default function TrustPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        {/* Hero */}
        <section className="quantum-section" style={{ paddingTop: 120 }}>
          <div className="quantum-container" style={{ maxWidth: 900 }}>
            <div className="quantum-label" style={{ marginBottom: 16, color: 'var(--gold)' }}>Trust Center</div>
            <h1 className="quantum-h1" style={{ marginBottom: 20, color: 'var(--white)' }}>
              Verified at Every Layer.
            </h1>
            <p style={{ fontSize: 16, lineHeight: 1.8, maxWidth: 600, color: 'var(--on-surface-var)' }}>
              AI outputs are only as good as the systems built around them.
              BizLegal AI uses four independent verification layers, expert review, and full audit trails to ensure accuracy.
            </p>
          </div>
        </section>

        {/* AI Disclosure */}
        <section style={{ maxWidth: 900, margin: '0 auto', padding: '0 32px 48px' }}>
          <div className="glass-card" style={{ padding: 24, display: 'flex', gap: 16, alignItems: 'flex-start', borderLeft: '3px solid var(--primary)' }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>🛡</span>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--white)', marginBottom: 4, fontFamily: 'var(--font-display)' }}>AI Disclosure</div>
              <p style={{ fontSize: 14, color: 'var(--on-surface-var)', lineHeight: 1.7 }}>
                All outputs from BizLegal AI are generated using AI and verified through our four-layer system.
                Confidence scores are shown on every output. For decisions with legal consequences, we recommend expert review.
                All litigation-tier outputs include mandatory attorney review.
              </p>
            </div>
          </div>
        </section>

        {/* Four layers */}
        <section style={{ maxWidth: 900, margin: '0 auto', padding: '0 32px 80px' }}>
          <div className="quantum-label" style={{ marginBottom: 32, color: 'var(--primary)' }}>Verification System</div>
          <h2 className="quantum-h2" style={{ marginBottom: 40, color: 'var(--white)' }}>Four-Layer Verification</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {LAYERS.map(layer => (
              <div key={layer.num} className="glass-card" style={{ padding: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
                  <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
                    color: 'var(--primary)', background: 'var(--primary-glow)',
                    padding: '4px 12px', borderRadius: 6,
                    border: '1px solid var(--primary)',
                  }}>{layer.num}</div>
                  <h3 className="quantum-h3" style={{ marginBottom: 0 }}>{layer.title}</h3>
                </div>
                <p style={{ fontSize: 14, color: 'var(--on-surface-var)', lineHeight: 1.7, marginBottom: 16 }}>{layer.desc}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {layer.items.map(item => (
                    <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: 'var(--accent)', fontSize: 11 }}>✓</span>
                      <span style={{ fontSize: 13, color: 'var(--on-surface-var)' }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <div style={{ maxWidth: 900, margin: '0 auto', borderTop: '0.5px solid var(--outline-var)' }} />

        {/* Confidence scoring legend */}
        <section style={{ background: 'var(--bg-low)', borderTop: '0.5px solid var(--outline-var)', padding: '64px 32px' }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <div className="quantum-label" style={{ marginBottom: 16, color: 'var(--gold)' }}>Scoring</div>
            <h2 className="quantum-h2" style={{ marginBottom: 32, color: 'var(--white)' }}>Confidence Score Guide</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
              {[
                { range: '90–100%', label: 'Verified', color: 'var(--accent)', desc: 'Every claim sourced. Safe to rely on.' },
                { range: '70–89%', label: 'Review Recommended', color: 'var(--warning)', desc: 'Some claims need verification before use in legal contexts.' },
                { range: 'Below 70%', label: 'Expert Review Required', color: 'var(--danger)', desc: 'Output not released until reviewed by an attorney.' },
              ].map(c => (
                <div key={c.range} className="glass-card" style={{ padding: 24 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: c.color, marginBottom: 4 }}>{c.range}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: c.color, marginBottom: 8, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{c.label}</div>
                  <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--on-surface-var)' }}>{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Security Posture */}
        <section className="quantum-section">
          <div className="quantum-container" style={{ maxWidth: 900 }}>
            <div className="quantum-label" style={{ marginBottom: 16, color: 'var(--gold)' }}>Security Posture</div>
            <h2 className="quantum-h2" style={{ marginBottom: 32, color: 'var(--white)' }}>Data Security & Infrastructure</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
              {SECURITY.map(s => (
                <div key={s.title} className="glass-card" style={{ padding: 20 }}>
                  <div style={{ fontWeight: 700, color: 'var(--white)', marginBottom: 6, fontSize: 14, fontFamily: 'var(--font-body)' }}>{s.title}</div>
                  <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--on-surface-var)' }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Legal links */}
        <section style={{ background: 'var(--bg-low)', borderTop: '0.5px solid var(--outline-var)', padding: '40px 32px' }}>
          <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 600, marginRight: 8 }}>Legal</span>
            {[
              { label: 'Privacy Policy', href: '/privacy' },
              { label: 'Terms of Service', href: '/terms' },
              { label: 'Disclaimer', href: '/disclaimer' },
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