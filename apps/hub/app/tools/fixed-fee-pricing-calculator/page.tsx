'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function FixedFeePricingCalculator() {
  const [hours, setHours] = useState(6)
  const [rate, setRate] = useState(350)
  const [burden, setBurden] = useState(1.3)

  const base = hours * rate
  const low = Math.round(base * burden * 0.9)
  const high = Math.round(base * burden * 1.1)
  const mid = Math.round(base * burden)
  const monthly = Math.round(mid / 3)
  const fmt = (n: number) => `$${n >= 1000 ? (n / 1000).toFixed(1) + 'K' : n.toLocaleString()}`

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 32px' }}>
      <span className="section-label">Law Firm Business · Calculator</span>
      <h1 style={{ marginBottom: 8, fontSize: 'clamp(28px,5vw,48px)' }}>Fixed-Fee Pricing Calculator</h1>
      <p style={{ color: 'var(--on-surface-var)', marginBottom: 40 }}>Convert your hourly estimate into a profitable flat fee using the burden-factor formula. Illustrative only — not financial or legal advice.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
        <div>
          <div style={{ marginBottom: 28 }}>
            <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, color: 'var(--outline)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
              <span>Estimated Hours</span>
              <span style={{ color: 'var(--primary)' }}>{hours}h</span>
            </label>
            <input type="range" min={1} max={50} step={1} value={hours} onChange={e => setHours(+e.target.value)} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--outline)', marginTop: 4 }}><span>1h</span><span>50h</span></div>
          </div>

          <div style={{ marginBottom: 28 }}>
            <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, color: 'var(--outline)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
              <span>Effective Hourly Rate</span>
              <span style={{ color: 'var(--primary)' }}>${rate}/hr</span>
            </label>
            <input type="range" min={150} max={1000} step={25} value={rate} onChange={e => setRate(+e.target.value)} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--outline)', marginTop: 4 }}><span>$150</span><span>$1,000</span></div>
          </div>

          <div>
            <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, color: 'var(--outline)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
              <span>Burden Factor</span>
              <span style={{ color: 'var(--primary)' }}>{burden.toFixed(1)}x</span>
            </label>
            <input type="range" min={1.0} max={1.6} step={0.1} value={burden} onChange={e => setBurden(+e.target.value)} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--outline)', marginTop: 4 }}><span>1.0x</span><span>1.6x</span></div>
          </div>
        </div>

        <div>
          <div className="card" style={{ marginBottom: 16, background: 'var(--bg-mid)' }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--outline)', marginBottom: 6 }}>Recommended Fixed Fee</div>
            <div style={{ fontFamily: 'Newsreader, serif', fontSize: 40, fontWeight: 700, color: '#e9c349', marginBottom: 4 }}>{fmt(mid)}</div>
            <div style={{ fontSize: 11, color: 'var(--outline)' }}>Range: {fmt(low)} – {fmt(high)}</div>
          </div>
          <div className="card" style={{ background: 'rgba(248,113,113,0.08)', borderColor: 'rgba(248,113,113,0.3)' }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#f87171', marginBottom: 6 }}>Monthly Retainer Equivalent</div>
            <div style={{ fontFamily: 'Newsreader, serif', fontSize: 40, fontWeight: 700, color: '#f87171', marginBottom: 4 }}>{fmt(monthly)}/mo</div>
            <div style={{ fontSize: 11, color: 'var(--outline)' }}>≈ fixed fee ÷ 3, for recurring scope</div>
          </div>
          <div style={{ marginTop: 16, padding: '12px', background: 'var(--bg-mid)', border: '0.5px solid var(--outline-var)', fontSize: 12, color: 'var(--on-surface-var)', lineHeight: 1.6 }}>
            {hours}h × ${rate}/hr × {burden.toFixed(1)}x = <strong>{fmt(mid)}</strong>. Round up to a clean number for your quote.
          </div>
        </div>
      </div>

      <div style={{ marginTop: 40 }}>
        <span className="section-label">Burden Factor Guidance</span>
        <table className="data-table" style={{ marginTop: 8 }}>
          <thead><tr><th>Matter Type</th><th>Burden Factor</th><th>Why</th></tr></thead>
          <tbody>
            <tr><td>Routine, well-scoped (simple contract, standard filing)</td><td style={{ color: '#e9c349', fontWeight: 700 }}>1.2–1.3x</td><td>Low communication overhead, predictable scope</td></tr>
            <tr><td>Moderate (incorporation, trademark filing)</td><td style={{ color: '#e9c349', fontWeight: 700 }}>1.3–1.4x</td><td>Some research and revision rounds expected</td></tr>
            <tr><td>Open-ended (litigation-adjacent, regulatory risk)</td><td style={{ color: '#f87171', fontWeight: 700 }}>1.4–1.5x</td><td>Unpredictable scope, high client communication</td></tr>
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 32, display: 'flex', gap: 20, alignItems: 'center' }}>
        <Link href="/guides/fixed-fee-pricing-playbook" style={{ fontSize: 12, color: 'var(--primary)' }}>Read the Fixed-Fee Pricing Playbook →</Link>
        <button onClick={() => window.print()} style={{ background: 'none', border: 'none', fontSize: 12, color: 'var(--outline)', cursor: 'pointer', fontFamily: 'Manrope, sans-serif' }}>Print PDF</button>
      </div>

      <div style={{ marginTop: 48, padding: '28px 32px', background: 'var(--bg-mid)', border: '1px solid var(--outline-var)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--outline)', marginBottom: 6 }}>Turn your pricing into a client magnet</div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>FirmCited Starter — $6.5K install</div>
          <div style={{ fontSize: 12, color: 'var(--on-surface-var)', lineHeight: 1.6 }}>AEO agency for law firms: get cited by ChatGPT, Claude, and Perplexity when buyers ask who to hire. Your fixed-fee pricing becomes a searchable differentiator.</div>
        </div>
        <a href="https://cited.bizlegal-ai.com" style={{ display: 'inline-block', background: 'var(--primary)', color: '#fff', padding: '10px 24px', borderRadius: '8px', fontWeight: 700, fontSize: '13px', textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>See FirmCited →</a>
      </div>
      <div style={{ marginTop: 16, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        <Link href="/guides/fixed-fee-pricing-playbook" style={{ fontSize: 12, color: 'var(--primary)' }}>Fixed-Fee Pricing Playbook →</Link>
        <Link href="/guides" style={{ fontSize: 12, color: 'var(--primary)' }}>All Guides →</Link>
      </div>
    </div>
  )
}
