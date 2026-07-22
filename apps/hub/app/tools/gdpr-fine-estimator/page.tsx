'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function GdprFineEstimator() {
  const [revenue, setRevenue] = useState(10_000_000)
  const [severity, setSeverity] = useState<'low' | 'high'>('high')
  const [records, setRecords] = useState(50_000)

  const low4 = Math.min(revenue * 0.02, 10_000_000)
  const low5 = Math.min(revenue * 0.04, 20_000_000)
  const fmt = (n: number) => `€${n >= 1_000_000 ? (n / 1_000_000).toFixed(1) + 'M' : n.toLocaleString()}`

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 32px' }}>
      <span className="section-label">GDPR · Calculator</span>
      <h1 style={{ marginBottom: 8, fontSize: 'clamp(28px,5vw,48px)' }}>GDPR Fine Estimator</h1>
      <p style={{ color: 'var(--on-surface-var)', marginBottom: 40 }}>Real-time Article 83 penalty calculation based on revenue, severity track, and records affected.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
        <div>
          <div style={{ marginBottom: 28 }}>
            <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, color: 'var(--outline)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
              <span>Annual Revenue</span>
              <span style={{ color: 'var(--primary)' }}>{fmt(revenue)}</span>
            </label>
            <input type="range" min={1_000_000} max={500_000_000} step={1_000_000} value={revenue} onChange={e => setRevenue(+e.target.value)} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--outline)', marginTop: 4 }}><span>€1M</span><span>€500M</span></div>
          </div>

          <div style={{ marginBottom: 28 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--outline)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Breach Severity</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {([{ val: 'low', label: 'Art. 83(4) — Lower Tier' }, { val: 'high', label: 'Art. 83(5) — Upper Tier' }] as const).map(opt => (
                <button key={opt.val} onClick={() => setSeverity(opt.val)}
                  style={{ flex: 1, background: severity === opt.val ? '#2563eb' : 'var(--bg-mid)', color: severity === opt.val ? '#eeefff' : 'var(--on-surface-var)', border: `0.5px solid ${severity === opt.val ? '#2563eb' : 'var(--outline-var)'}`, padding: '8px', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Manrope, sans-serif' }}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, color: 'var(--outline)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
              <span>Records Affected</span>
              <span style={{ color: 'var(--primary)' }}>{records.toLocaleString()}</span>
            </label>
            <input type="range" min={100} max={10_000_000} step={1000} value={records} onChange={e => setRecords(+e.target.value)} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--outline)', marginTop: 4 }}><span>100</span><span>10M</span></div>
          </div>
        </div>

        <div>
          <div className="card" style={{ marginBottom: 16, background: 'var(--bg-mid)' }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--outline)', marginBottom: 6 }}>Art. 83(4) — Lower Tier</div>
            <div style={{ fontFamily: 'Newsreader, serif', fontSize: 40, fontWeight: 700, color: '#e9c349', marginBottom: 4 }}>{fmt(low4)}</div>
            <div style={{ fontSize: 11, color: 'var(--outline)' }}>max(2% global turnover, €10M)</div>
          </div>
          <div className="card" style={{ background: 'rgba(248,113,113,0.08)', borderColor: 'rgba(248,113,113,0.3)' }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#f87171', marginBottom: 6 }}>Art. 83(5) — Upper Tier</div>
            <div style={{ fontFamily: 'Newsreader, serif', fontSize: 40, fontWeight: 700, color: '#f87171', marginBottom: 4 }}>{fmt(low5)}</div>
            <div style={{ fontSize: 11, color: 'var(--outline)' }}>max(4% global turnover, €20M)</div>
          </div>
          <div style={{ marginTop: 16, padding: '12px', background: 'var(--bg-mid)', border: '0.5px solid var(--outline-var)', fontSize: 12, color: 'var(--on-surface-var)', lineHeight: 1.6 }}>
            Based on {fmt(revenue)} revenue with {records.toLocaleString()} records affected.
          </div>
        </div>
      </div>

      <div style={{ marginTop: 40 }}>
        <span className="section-label">Real GDPR Fines at Similar Scale</span>
        <table className="data-table" style={{ marginTop: 8 }}>
          <thead><tr><th>Entity</th><th>Fine</th><th>Year</th><th>Violation</th></tr></thead>
          <tbody>
            <tr><td>Meta Platforms Ireland</td><td style={{ color: '#f87171', fontWeight: 700 }}>€1.2B</td><td>2023</td><td>Unlawful EU-US data transfers</td></tr>
            <tr><td>Amazon (Luxembourg)</td><td style={{ color: '#f87171', fontWeight: 700 }}>€746M</td><td>2021</td><td>Unlawful behavioural advertising</td></tr>
            <tr><td>WhatsApp (Ireland)</td><td style={{ color: '#e9c349', fontWeight: 700 }}>€225M</td><td>2021</td><td>Transparency failures</td></tr>
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 32, display: 'flex', gap: 20, alignItems: 'center' }}>
        <Link href="/regulations/gdpr" style={{ fontSize: 12, color: 'var(--primary)' }}>Read the GDPR Compliance Hub →</Link>
        <button onClick={() => window.print()} style={{ background: 'none', border: 'none', fontSize: 12, color: 'var(--outline)', cursor: 'pointer', fontFamily: 'Manrope, sans-serif' }}>Print PDF</button>
      </div>

      <div style={{ marginTop: 48, padding: '28px 32px', background: 'var(--bg-mid)', border: '1px solid var(--outline-var)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--outline)', marginBottom: 6 }}>Keep your policy compliant automatically</div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Policy Auto-Refresh — $29/mo</div>
          <div style={{ fontSize: 12, color: 'var(--on-surface-var)', lineHeight: 1.6 }}>Daily 7-framework redline of your privacy policy. Email alert when a new gap appears.</div>
        </div>
        <a href="/agents/policy-refresh" style={{ display: 'inline-block', background: 'var(--primary)', color: '#fff', padding: '10px 24px', borderRadius: '8px', fontWeight: 700, fontSize: '13px', textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>Start Free Audit →</a>
      </div>
      <div style={{ marginTop: 16, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        <Link href="/guides/gdpr-compliance-checklist-saas" style={{ fontSize: 12, color: 'var(--primary)' }}>GDPR Compliance Checklist →</Link>
        <Link href="/guides/privacy-policy-compliance-guide" style={{ fontSize: 12, color: 'var(--primary)' }}>Privacy Policy Compliance Guide →</Link>
        <Link href="/guides" style={{ fontSize: 12, color: 'var(--primary)' }}>All Guides →</Link>
      </div>
    </div>
  )
}
