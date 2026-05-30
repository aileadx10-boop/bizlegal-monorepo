const TOOLS = [
  { label: 'Contract Scan', href: '/dashboard/contract/scan', desc: 'Upload a contract for AI risk analysis.', icon: '🔍' },
  { label: 'SQA Auto-Fill', href: '/dashboard/contract/sqa', desc: 'Draft security questionnaire answers with citations.', icon: '📋' },
  { label: 'DPA Negotiator', href: '/dashboard/contract/dpa', desc: 'Compare your DPA against regulatory baselines.', icon: '🤝' },
]

export default function ContractVertical() {
  return (
    <div>
      <h1 style={{
        fontFamily: 'var(--bl-font-display, Fraunces, serif)',
        fontSize: '1.5rem',
        fontWeight: 700,
        marginBottom: '0.5rem',
      }}>
        Contract Compliance
      </h1>
      <p style={{ color: 'var(--bl-text-muted, #888)', marginBottom: '2rem', fontSize: '0.95rem' }}>
        Scan contracts for risk, auto-fill security questionnaires, and negotiate DPAs.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        {TOOLS.map(t => (
          <a
            key={t.href}
            href={t.href}
            style={{
              display: 'block',
              padding: '1.5rem',
              borderRadius: 10,
              border: '1px solid var(--bl-border, #e2e2e2)',
              background: 'var(--bl-surface, #fff)',
              textDecoration: 'none',
              color: 'var(--bl-text, #1a1a1a)',
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{t.icon}</div>
            <div style={{ fontWeight: 600, marginBottom: '0.4rem' }}>{t.label}</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--bl-text-muted, #666)' }}>{t.desc}</div>
          </a>
        ))}
      </div>
    </div>
  )
}
