import Link from 'next/link'

const TOOLS = [
  { slug: 'gdpr-fine-estimator', tag: 'CALCULATOR', title: 'GDPR Fine Estimator', desc: 'Calculate maximum exposure under Article 83(4) and 83(5) tracks based on revenue and records affected.' },
  { slug: 'sanction-screener', tag: 'TOOL', title: 'Sanction Screener', desc: 'Simulate OFAC, EU, and UN sanction list screening for entities and individuals.' },
  { slug: 'mica-asset-classifier', tag: 'TOOL', title: 'MiCA Asset Classifier', desc: 'Decision tree to classify tokens as ARTs, EMTs, or other crypto-assets under MiCA Article 3.' },
  { slug: 'token-classifier', tag: 'TOOL', title: 'Token Classifier (Howey)', desc: 'Apply the four-prong Howey Test interactively to determine securities probability.' },
  { slug: 'gdpr-breach-timer', tag: 'TOOL', title: 'GDPR Breach Timer', desc: 'Live 72-hour countdown from discovery date with authority notification list for all 27 EU DPAs.' },
  { slug: 'vara-licence-finder', tag: 'TOOL', title: 'VARA Licence Finder', desc: 'Multi-step selector to identify your required VARA licence category and applicable fees.' },
]

const ICONS: Record<string, string> = {
  'gdpr-fine-estimator': 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z',
  'sanction-screener': 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  'mica-asset-classifier': 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343',
  'token-classifier': 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  'gdpr-breach-timer': 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  'vara-licence-finder': 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
}

export default function ToolsTeaser() {
  return (
    <section style={{ padding: '64px 32px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <span className="section-label">Compliance Toolkit</span>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <h2>20 Compliance Tools</h2>
          <Link href="/tools" className="btn-ghost" style={{ fontSize: 12 }}>View All 20 Tools →</Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 1 }}>
          {TOOLS.map(tool => (
            <Link key={tool.slug} href={`/tools/${tool.slug}`} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ height: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 36, height: 36, background: 'var(--bg-mid)', border: '0.5px solid var(--outline-var)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5">
                      <path d={ICONS[tool.slug]} strokeLinecap="square" />
                    </svg>
                  </div>
                  <div>
                    <span className="tag" style={{ display: 'block', marginBottom: 4 }}>{tool.tag}</span>
                    <div style={{ fontSize: 15, fontFamily: 'Newsreader, serif', fontWeight: 700, color: 'var(--on-surface)' }}>{tool.title}</div>
                  </div>
                </div>
                <p style={{ fontSize: 13, color: 'var(--on-surface-var)', lineHeight: 1.6 }}>{tool.desc}</p>
                <div style={{ marginTop: 12, fontSize: 12, color: 'var(--primary)', fontWeight: 700 }}>Open Tool →</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
