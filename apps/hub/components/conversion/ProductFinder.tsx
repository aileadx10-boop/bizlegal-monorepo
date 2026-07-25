'use client'
import { useState } from 'react'
import type { CompanyType, Need, CryptoInvolved } from '@/lib/product-finder/routing'

/**
 * Customer product-finder. Three fixed questions → deterministic server
 * recommendation (one Haiku call for the "why") → recommendation card with a
 * primary CTA and an OPTIONAL email capture. No email wall in front of the
 * result. Visual pattern mirrors components/tools/RiskQuiz.tsx.
 */

const COMPANIES: { value: CompanyType; label: string }[] = [
  { value: 'saas', label: 'SaaS / Software' },
  { value: 'fintech', label: 'Fintech / Payments' },
  { value: 'crypto', label: 'Crypto / Web3' },
  { value: 'marketplace', label: 'Marketplace' },
  { value: 'other', label: 'Something else' },
]

const NEEDS: { value: Need; label: string }[] = [
  { value: 'contract_review', label: 'I have a contract / DPA / terms to check' },
  { value: 'compliance_proof', label: 'A customer or investor asked for compliance proof' },
  { value: 'filing_deadline', label: "I have a filing deadline (BOI / entity)" },
  { value: 'ongoing_monitoring', label: 'I want ongoing compliance monitoring' },
  { value: 'exploring', label: "I'm just exploring what I need" },
]

interface RecommendResponse {
  kind: 'product' | 'guide'
  title: string
  priceLabel: string | null
  why: string
  destinationUrl: string
  ctaLabel: string
}

function ProgressBar({ step }: { step: number }) {
  const pct = Math.round((step / 3) * 100)
  return (
    <div style={{ marginBottom: 36 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', color: 'var(--outline)', textTransform: 'uppercase' }}>Step {step} of 3</span>
        <span style={{ fontSize: 10, color: 'var(--outline)' }}>{pct}%</span>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

const optionStyle: React.CSSProperties = {
  background: 'var(--bg-mid)',
  color: 'var(--on-surface-var)',
  border: '0.5px solid var(--outline-var)',
  padding: '14px 16px',
  fontSize: 13,
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: 'Manrope, sans-serif',
  transition: 'all 0.15s',
  textAlign: 'left',
}

export default function ProductFinder() {
  const [step, setStep] = useState(1)
  const [company, setCompany] = useState<CompanyType | null>(null)
  const [need, setNeed] = useState<Need | null>(null)
  const [loading, setLoading] = useState(false)
  const [rec, setRec] = useState<RecommendResponse | null>(null)
  const [error, setError] = useState('')

  // Optional post-result email capture
  const [email, setEmail] = useState('')
  const [emailState, setEmailState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')

  async function submit(company: CompanyType, need: Need, crypto: CryptoInvolved) {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/find/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company, need, crypto }),
      })
      if (!res.ok) throw new Error('bad response')
      setRec((await res.json()) as RecommendResponse)
    } catch {
      setError('Something went wrong finding your match. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function captureEmail(e: React.FormEvent) {
    e.preventDefault()
    if (!email.includes('@')) return
    setEmailState('sending')
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'product-finder', vertical_interest: company ?? undefined }),
      })
      setEmailState(res.ok ? 'done' : 'error')
    } catch {
      setEmailState('error')
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--outline)', fontSize: 13 }}>
        Finding the right fit for you…
      </div>
    )
  }

  if (rec) {
    return (
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <span className="section-label">Your recommendation</span>
        <div
          style={{
            border: '1px solid #1a56db30',
            background: 'linear-gradient(135deg, #1a56db08, #1a56db14)',
            borderRadius: 12,
            padding: 24,
            marginTop: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{rec.title}</h3>
            {rec.priceLabel && (
              <span style={{ fontSize: 14, fontWeight: 700, color: '#1a56db', whiteSpace: 'nowrap' }}>{rec.priceLabel}</span>
            )}
          </div>
          <p style={{ margin: '0 0 20px', fontSize: 14, lineHeight: 1.7, opacity: 0.85 }}>{rec.why}</p>
          <a
            href={rec.destinationUrl}
            style={{
              display: 'inline-block',
              padding: '12px 22px',
              background: '#1a56db',
              color: '#fff',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            {rec.ctaLabel} →
          </a>
        </div>

        {/* Optional email capture — never gates the result above */}
        <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--outline-var)' }}>
          {emailState === 'done' ? (
            <p style={{ fontSize: 13, color: 'var(--outline)', margin: 0 }}>
              Check your inbox to confirm — we'll send this plus a short compliance checklist.
            </p>
          ) : (
            <form onSubmit={captureEmail}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--outline)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
                Optional — email me this + a checklist
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@company.com"
                  style={{ flex: 1, background: 'var(--bg-mid)', border: 'none', borderBottom: '1px solid var(--outline-var)', padding: '10px 0', color: 'var(--on-surface)', fontSize: 14, outline: 'none', fontFamily: 'Manrope, sans-serif' }}
                />
                <button type="submit" className="btn-primary" style={{ padding: '10px 16px', fontSize: 13 }} disabled={emailState === 'sending'}>
                  {emailState === 'sending' ? 'Sending…' : 'Send'}
                </button>
              </div>
              {emailState === 'error' && <p style={{ color: 'var(--danger)', fontSize: 12, marginTop: 8 }}>Could not sign you up — please try again.</p>}
              <p style={{ fontSize: 11, color: 'var(--outline)', marginTop: 10 }}>Double opt-in. One-click unsubscribe in every email.</p>
            </form>
          )}
        </div>

        <button
          type="button"
          onClick={() => { setRec(null); setStep(1); setCompany(null); setNeed(null); setEmail(''); setEmailState('idle') }}
          style={{ ...optionStyle, marginTop: 20, width: '100%', textAlign: 'center', background: 'transparent' }}
        >
          Start over
        </button>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto' }}>
      <ProgressBar step={step} />

      {step === 1 && (
        <div>
          <span className="section-label">Step 1</span>
          <h3 style={{ marginBottom: 24 }}>What kind of company are you?</h3>
          <div style={{ display: 'grid', gap: 8 }}>
            {COMPANIES.map((c) => (
              <button key={c.value} onClick={() => { setCompany(c.value); setStep(2) }} style={optionStyle}>
                {c.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <span className="section-label">Step 2</span>
          <h3 style={{ marginBottom: 24 }}>What brought you here today?</h3>
          <div style={{ display: 'grid', gap: 8 }}>
            {NEEDS.map((n) => (
              <button key={n.value} onClick={() => { setNeed(n.value); setStep(3) }} style={optionStyle}>
                {n.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <span className="section-label">Step 3</span>
          <h3 style={{ marginBottom: 24 }}>Do crypto, tokens, or wallets play a role?</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {([{ label: 'Yes', val: 'yes' as const }, { label: 'No', val: 'no' as const }]).map((opt) => (
              <button
                key={opt.val}
                onClick={() => { if (company && need) void submit(company, need, opt.val) }}
                style={{ ...optionStyle, textAlign: 'center' }}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {error && <p style={{ color: 'var(--danger)', fontSize: 12, marginTop: 16 }}>{error}</p>}
        </div>
      )}
    </div>
  )
}
