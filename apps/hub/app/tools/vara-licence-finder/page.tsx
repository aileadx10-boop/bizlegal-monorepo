'use client'
import { useState } from 'react'
import Link from 'next/link'

const CATEGORIES = [
  {
    id: 'cat1', name: 'Category 1 — Exchange Services',
    activities: ['Spot crypto trading', 'Order book operations', 'Market making'],
    capital: 'AED 1,000,000', appFee: 'AED 100,000', annualFee: 'AED 200,000', bond: 'AED 500,000',
    for: ['Centralised exchanges', 'DEX operators with UAE nexus', 'OTC trading desks'],
  },
  {
    id: 'cat2', name: 'Category 2 — Broker-Dealer Services',
    activities: ['Order execution', 'Agency trading', 'Principal trading'],
    capital: 'AED 750,000', appFee: 'AED 75,000', annualFee: 'AED 150,000', bond: 'AED 300,000',
    for: ['Crypto brokerages', 'Institutional trading desks', 'OTC intermediaries'],
  },
  {
    id: 'cat3', name: 'Category 3 — Asset Management',
    activities: ['Fund management', 'Portfolio management', 'Investment advice'],
    capital: 'AED 500,000', appFee: 'AED 50,000', annualFee: 'AED 100,000', bond: 'AED 200,000',
    for: ['Crypto funds', 'Digital asset managers', 'Hedge funds with crypto exposure'],
  },
  {
    id: 'cat4', name: 'Category 4 — Advisory Services',
    activities: ['Investment advisory', 'Custody advisory', 'Compliance consulting'],
    capital: 'AED 250,000', appFee: 'AED 25,000', annualFee: 'AED 50,000', bond: 'AED 100,000',
    for: ['Crypto advisers', 'Compliance consultants', 'Financial planners'],
  },
]

export default function VaraLicenceFinder() {
  const [selected, setSelected] = useState<string | null>(null)
  const cat = CATEGORIES.find(c => c.id === selected)

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 32px' }}>
      <span className="section-label">VARA · Tool</span>
      <h1 style={{ marginBottom: 8, fontSize: 'clamp(28px,5vw,48px)' }}>VARA Licence Finder</h1>
      <p style={{ color: 'var(--on-surface-var)', marginBottom: 40 }}>
        Select your primary business activity to identify the required VARA licence category and applicable 2026 fees.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 32 }}>
        {CATEGORIES.map(c => (
          <button key={c.id} onClick={() => setSelected(c.id)} style={{
            background: selected === c.id ? '#2563eb' : 'var(--bg-mid)',
            color: selected === c.id ? '#eeefff' : 'var(--on-surface-var)',
            border: `0.5px solid ${selected === c.id ? '#2563eb' : 'var(--outline-var)'}`,
            padding: '14px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
            fontFamily: 'Manrope, sans-serif', textAlign: 'left', lineHeight: 1.4,
          }}>
            {c.name}
          </button>
        ))}
      </div>

      {cat && (
        <div>
          <table className="data-table" style={{ marginBottom: 24 }}>
            <thead><tr><th>Fee Component</th><th>Amount</th></tr></thead>
            <tbody>
              <tr><td>Application Fee</td><td style={{ fontWeight: 700, color: 'var(--on-surface)' }}>{cat.appFee}</td></tr>
              <tr><td>Annual Licence Fee</td><td style={{ fontWeight: 700, color: 'var(--on-surface)' }}>{cat.annualFee}</td></tr>
              <tr><td>Compliance Bond</td><td style={{ fontWeight: 700, color: 'var(--on-surface)' }}>{cat.bond}</td></tr>
              <tr><td>Minimum Paid-Up Capital</td><td style={{ fontWeight: 700, color: 'var(--on-surface)' }}>{cat.capital}</td></tr>
              <tr>
                <td style={{ fontWeight: 700, color: 'var(--secondary)' }}>Est. Year 1 (fees only)</td>
                <td style={{ fontWeight: 700, color: 'var(--secondary)' }}>
                  AED {(
                    parseInt(cat.appFee.replace(/\D/g, '')) +
                    parseInt(cat.annualFee.replace(/\D/g, '')) +
                    parseInt(cat.bond.replace(/\D/g, ''))
                  ).toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="bq-callout" style={{ fontSize: 13 }}>
            <strong>Activities covered:</strong> {cat.activities.join(' · ')}<br />
            <strong>Suitable for:</strong> {cat.for.join(', ')}.
            <cite>VARA Rulebook 2023 — fees subject to annual review</cite>
          </div>

          <div style={{ marginTop: 20, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <Link href="/regulations/vara" style={{ fontSize: 12, color: 'var(--primary)' }}>Read the VARA Compliance Hub →</Link>
            <Link href="/guides/vara-licensing-guide" style={{ fontSize: 12, color: 'var(--primary)' }}>VARA Licensing Guide →</Link>
          </div>

          <div style={{ marginTop: 24, padding: '24px', background: 'var(--bg-mid)', border: '1px solid var(--outline-var)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--outline)', marginBottom: 6 }}>VARA-specific regulatory risk scoring</div>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>BRAI Regulatory Risk Reports — from $149</div>
              <div style={{ fontSize: 12, color: 'var(--on-surface-var)', lineHeight: 1.6 }}>VARA, MiCA, and SEC compliance scoring with attorney narrative. Used for exchange onboarding and investor DD.</div>
            </div>
            <a href="https://brai.bizlegal-ai.com" style={{ display: 'inline-block', background: 'var(--primary)', color: '#fff', padding: '10px 22px', borderRadius: '8px', fontWeight: 700, fontSize: '13px', textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>Get a Risk Report →</a>
          </div>
        </div>
      )}
    </div>
  )
}
