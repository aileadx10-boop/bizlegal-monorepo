'use client'
import { useState } from 'react'
import Link from 'next/link'

const PRONGS = [
  { id: 'investment', label: 'Investment of Money', desc: 'Did investors contribute money or value expecting returns?' },
  { id: 'common', label: 'Common Enterprise', desc: 'Are investor fortunes tied to the issuer or other investors?' },
  { id: 'profits', label: 'Expectation of Profits', desc: 'Did purchasers expect capital appreciation or returns?' },
  { id: 'efforts', label: 'Efforts of Others', desc: 'Are expected profits from efforts of a third party (the issuer)?' },
]

type Scores = { investment: number; common: number; profits: number; efforts: number }

export default function TokenClassifier() {
  const [scores, setScores] = useState<Scores>({ investment: 5, common: 5, profits: 5, efforts: 5 })

  const avg = Object.values(scores).reduce((a, b) => a + b, 0) / 4
  const probability = Math.round(avg * 10)
  const risk = probability >= 70 ? 'SECURITIES' : probability >= 40 ? 'UNCERTAIN' : 'LIKELY NOT SECURITIES'
  const riskColor = probability >= 70 ? '#f87171' : probability >= 40 ? '#e9c349' : '#10B981'

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 32px' }}>
      <span className="section-label">SEC · Tool</span>
      <h1 style={{ marginBottom: 8, fontSize: 'clamp(28px,5vw,48px)' }}>Token Classifier (Howey Test)</h1>
      <p style={{ color: 'var(--on-surface-var)', marginBottom: 40 }}>Apply the four-prong Howey Test interactively. Adjust each prong from 1 (absent) to 10 (strong). Result updates in real-time.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
        <div>
          {PRONGS.map(prong => (
            <div key={prong.id} style={{ marginBottom: 28 }}>
              <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, color: 'var(--outline)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
                <span>{prong.label}</span>
                <span style={{ color: 'var(--primary)' }}>{scores[prong.id as keyof Scores]}/10</span>
              </label>
              <div style={{ fontSize: 11, color: 'var(--outline)', marginBottom: 6 }}>{prong.desc}</div>
              <input type="range" min={1} max={10} value={scores[prong.id as keyof Scores]}
                onChange={e => setScores(prev => ({ ...prev, [prong.id]: +e.target.value }))} />
            </div>
          ))}
        </div>

        <div>
          <div className="card" style={{ textAlign: 'center', padding: '28px', marginBottom: 16,
            background: probability >= 70 ? 'rgba(248,113,113,0.08)' : probability >= 40 ? 'rgba(233,195,73,0.08)' : 'rgba(16,185,129,0.08)',
            borderColor: `${riskColor}40` }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: riskColor, marginBottom: 8 }}>Securities Probability</div>
            <div style={{ fontFamily: 'Newsreader, serif', fontSize: 72, fontWeight: 700, color: riskColor, lineHeight: 1 }}>{probability}%</div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: riskColor, marginTop: 8 }}>{risk}</div>
          </div>

          {PRONGS.map(prong => {
            const val = scores[prong.id as keyof Scores]
            return (
              <div key={prong.id} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--outline)', marginBottom: 4 }}>
                  <span>{prong.label}</span><span>{val * 10}%</span>
                </div>
                <div className="progress-track"><div className="progress-fill" style={{ width: `${val * 10}%` }} /></div>
              </div>
            )
          })}

          <div className="bq-callout" style={{ marginTop: 16, fontSize: 13 }}>
            {probability >= 70
              ? 'High securities probability. Obtain formal legal opinion before any token offering. Consider Reg D or Reg A+ exemptions.'
              : probability >= 40
              ? 'Uncertain classification. Fact-specific legal analysis required. The SEC has challenged tokens in this range.'
              : 'Lower securities probability. Document Howey analysis and utility-first design rationale. Monitor SEC guidance.'}
          </div>
        </div>
      </div>
      <div style={{ marginTop: 32, display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <Link href="/regulations/sec" style={{ fontSize: 12, color: 'var(--primary)' }}>Read the SEC Compliance Hub →</Link>
        <Link href="/guides/aml-kyc-compliance-crypto" style={{ fontSize: 12, color: 'var(--primary)' }}>AML/KYC for Crypto Guide →</Link>
      </div>

      <div style={{ marginTop: 28, padding: '24px', background: 'var(--bg-mid)', border: '1px solid var(--outline-var)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--outline)', marginBottom: 6 }}>Need a full regulatory risk assessment for your token or crypto business?</div>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>BRAI Counterparty Risk Reports — from $149</div>
          <div style={{ fontSize: 12, color: 'var(--on-surface-var)', lineHeight: 1.6 }}>SEC, MiCA, VARA, and GDPR scoring with attorney-drafted risk narrative. Used for investor DD and exchange onboarding.</div>
        </div>
        <a href="https://brai.bizlegal-ai.com" style={{ display: 'inline-block', background: 'var(--primary)', color: '#fff', padding: '10px 22px', borderRadius: '8px', fontWeight: 700, fontSize: '13px', textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>Get a Risk Report →</a>
      </div>
    </div>
  )
}
