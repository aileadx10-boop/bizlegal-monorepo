'use client'

const PRODUCTS = [
  {
    name: 'BRAI',
    title: 'Wallet Risk Intelligence',
    desc: 'Scan a wallet. Find risky patterns. Decide in seconds.',
    cta: 'Try Free',
    href: '/brai',
    accent: 'var(--primary)',
  },
  {
    name: 'TRACR',
    title: 'Blockchain Forensics',
    desc: 'Forensic reports. Litigation-grade evidence. $149–$2,000.',
    cta: 'Generate Report',
    href: '/tracr',
    accent: 'var(--secondary)',
  },
  {
    name: 'LexAudit',
    title: 'AI Compliance Certs',
    desc: '8 modules. Real-time regulations. $49–$499.',
    cta: 'Generate Cert',
    href: '/lexaudit',
    accent: 'var(--accent)',
  },
  {
    name: 'DocAI',
    title: 'AI Contract Generation',
    desc: 'Legal templates. Jurisdiction-aware. $29–$99.',
    cta: 'Generate Contract',
    href: '/docai',
    accent: 'var(--indigo)',
  },
  {
    name: 'Forge',
    title: 'Multi-Vertical Compliance',
    desc: '8 scanner modules. Real-time scoring. $199/month.',
    cta: 'Start Scan',
    href: '/forge',
    accent: 'var(--sky)',
  },
  {
    name: 'LeadForge',
    title: 'Legal Lead Marketplace',
    desc: 'B2B legal leads. Real-time scoring. $99–$499.',
    cta: 'Browse Leads',
    href: '/leadforge',
    accent: 'var(--purple)',
  },
]

export function Products() {
  return (
    <section id="products" style={{ background: 'var(--bg-low)', padding: '96px 32px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <span style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.2em',
            color: 'var(--cta)', textTransform: 'uppercase',
            display: 'block', marginBottom: 16,
          }}>
            6 Revenue-Generating Products
          </span>
          <h2 style={{
            fontFamily: 'Newsreader, Georgia, serif',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 700, color: 'var(--on-surface)',
          }}>
            Intelligence Tools Built for Scale
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 24,
        }}>
          {PRODUCTS.map((p) => (
            <div
              key={p.name}
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--outline-var)',
                borderRadius: 12,
                padding: 28,
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget
                el.style.borderColor = p.accent
                el.style.boxShadow = `0 0 24px ${p.accent}30`
              }}
              onMouseLeave={e => {
                const el = e.currentTarget
                el.style.borderColor = 'var(--outline-var)'
                el.style.boxShadow = 'none'
              }}
            >
              <div style={{
                fontSize: 22, fontWeight: 800,
                color: p.accent, marginBottom: 8,
                fontFamily: 'Newsreader, Georgia, serif',
              }}>
                {p.name}
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--on-surface)', marginBottom: 8 }}>
                {p.title}
              </h3>
              <p style={{ fontSize: 14, color: 'var(--on-surface-var)', lineHeight: 1.6, marginBottom: 20 }}>
                {p.desc}
              </p>
              <a
                href={p.href}
                className="btn-primary"
                style={{ display: 'block', textAlign: 'center', width: '100%' }}
              >
                {p.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
