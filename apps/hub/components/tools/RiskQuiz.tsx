'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ScoreGauge from './ScoreGauge'

type Industry = 'fintech' | 'saas' | 'healthcare' | 'ecommerce' | 'crypto' | 'legal'
type UserCount = 'under1k' | '1k-10k' | '10k-100k' | 'over100k'
type Region = 'US' | 'EU' | 'UAE' | 'Global'

const INDUSTRIES: { value: Industry; label: string }[] = [
  { value: 'crypto', label: 'Crypto / Web3' },
  { value: 'fintech', label: 'Fintech / Payments' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'saas', label: 'SaaS / Software' },
  { value: 'ecommerce', label: 'E-Commerce' },
  { value: 'legal', label: 'Legal / Professional' },
]

const USER_COUNTS: { value: UserCount; label: string }[] = [
  { value: 'under1k', label: 'Under 1,000' },
  { value: '1k-10k', label: '1,000 – 10,000' },
  { value: '10k-100k', label: '10,000 – 100,000' },
  { value: 'over100k', label: 'Over 100,000' },
]

const REGIONS: { value: Region; label: string }[] = [
  { value: 'Global', label: 'Global' },
  { value: 'US', label: 'United States' },
  { value: 'EU', label: 'European Union' },
  { value: 'UAE', label: 'UAE / MENA' },
]

function ProgressBar({ step }: { step: number }) {
  return (
    <div style={{ marginBottom: 36 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', color: 'var(--outline)', textTransform: 'uppercase' }}>Step {step} of 4</span>
        <span style={{ fontSize: 10, color: 'var(--outline)' }}>{step * 25}%</span>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${step * 25}%` }} />
      </div>
    </div>
  )
}

export default function RiskQuiz() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [industry, setIndustry] = useState<Industry | null>(null)
  const [userCount, setUserCount] = useState<UserCount | null>(null)
  const [regions, setRegions] = useState<Region[]>([])
  const [email, setEmail] = useState('')
  const [hasDPO, setHasDPO] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const toggleRegion = (r: Region) => {
    setRegions(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r])
  }

  const selStyle = (active: boolean): React.CSSProperties => ({
    background: active ? '#2563eb' : 'var(--bg-mid)',
    color: active ? '#eeefff' : 'var(--on-surface-var)',
    border: `0.5px solid ${active ? '#2563eb' : 'var(--outline-var)'}`,
    padding: '12px 16px',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'Manrope, sans-serif',
    transition: 'all 0.15s',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!industry || !userCount || regions.length === 0 || !email || hasDPO === null) {
      setError('Please complete all fields.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/risk-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ industry, userCountRange: userCount, regions, hasDPO, email }),
      })
      const data = await res.json()
      if (data.reportId) {
        router.push(`/report/${data.reportId}`)
      } else {
        setError('Failed to generate report. Please try again.')
        setLoading(false)
      }
    } catch {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 0' }}>
        <ScoreGauge score={75} severity="CRITICAL" animate />
        <p style={{ marginTop: 16, color: 'var(--outline)', fontSize: 13 }}>Generating your risk report...</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto' }}>
      <ProgressBar step={step} />

      {step === 1 && (
        <div>
          <span className="section-label">Step 1</span>
          <h3 style={{ marginBottom: 24 }}>What best describes your business?</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {INDUSTRIES.map(ind => (
              <button key={ind.value} onClick={() => { setIndustry(ind.value); setStep(2) }} style={selStyle(industry === ind.value)}>
                {ind.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <span className="section-label">Step 2</span>
          <h3 style={{ marginBottom: 24 }}>How many users or customers do you serve?</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {USER_COUNTS.map(uc => (
              <button key={uc.value} onClick={() => { setUserCount(uc.value); setStep(3) }} style={selStyle(userCount === uc.value)}>
                {uc.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <span className="section-label">Step 3</span>
          <h3 style={{ marginBottom: 24 }}>Which regions do you operate in?</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 24 }}>
            {REGIONS.map(r => (
              <button key={r.value} onClick={() => toggleRegion(r.value)} style={selStyle(regions.includes(r.value))}>
                {r.label}
              </button>
            ))}
          </div>
          <button onClick={() => regions.length > 0 && setStep(4)} className="btn-primary" style={{ width: '100%', justifyContent: 'center', opacity: regions.length === 0 ? 0.5 : 1 }}>
            Continue →
          </button>
        </div>
      )}

      {step === 4 && (
        <form onSubmit={handleSubmit}>
          <span className="section-label">Step 4</span>
          <h3 style={{ marginBottom: 24 }}>Where should we send your risk report?</h3>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--outline)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@company.com"
              style={{ width: '100%', background: 'var(--bg-mid)', border: 'none', borderBottom: '1px solid var(--outline-var)', padding: '10px 0', color: 'var(--on-surface)', fontSize: 14, outline: 'none', fontFamily: 'Manrope, sans-serif' }}
            />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--outline)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
              Do you have an appointed Data Protection Officer?
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[{ label: 'Yes', val: true }, { label: 'No', val: false }].map(opt => (
                <button key={String(opt.val)} type="button" onClick={() => setHasDPO(opt.val)} style={selStyle(hasDPO === opt.val)}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          {error && <p style={{ color: 'var(--danger)', fontSize: 12, marginBottom: 12 }}>{error}</p>}
          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: 14, padding: '14px' }}>
            Generate My Risk Report →
          </button>
          <p style={{ fontSize: 11, color: 'var(--outline)', marginTop: 12, textAlign: 'center' }}>
            Your email is used only to deliver your report.
          </p>
        </form>
      )}
    </div>
  )
}
