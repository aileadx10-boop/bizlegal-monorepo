'use client'
import { useState, type CSSProperties } from 'react'
import Link from 'next/link'

const INPUT_STYLE: CSSProperties = {
  padding: '10px 14px',
  borderRadius: '8px',
  border: '1px solid var(--outline-var)',
  background: 'var(--bg)',
  color: 'var(--on-surface)',
  fontSize: 13,
  fontFamily: 'Manrope, sans-serif',
  width: '100%',
}

const FIRM_SIZES = [
  { value: 'solo', label: 'Solo practitioner', desc: 'Just you' },
  { value: 'small', label: 'Small firm', desc: '2–10 attorneys' },
  { value: 'mid', label: 'Mid-size firm', desc: '11–50 attorneys' },
  { value: 'large', label: 'Large firm', desc: '50+ attorneys' },
] as const

const PRACTICE_AREAS = [
  'Corporate / M&A',
  'Litigation',
  'Real estate',
  'Intellectual property',
  'Employment',
  'Immigration',
  'Crypto / fintech',
  'Tax',
  'Family law',
  'Regulatory / compliance',
]

const AI_TOOLS = [
  'Claude / Anthropic',
  'ChatGPT / OpenAI',
  'Copilot (Microsoft)',
  'Gemini (Google)',
  'Lexis+ AI',
  'Westlaw Precision',
  'Harvey',
  'Internal document Q&A',
  'Drafting assistants',
  'Other / not sure',
]

interface PolicySection {
  heading: string
  body: string
  citations: string[]
}

interface GenResult {
  policy_title: string
  sections: PolicySection[]
  attorney_review_note: string
  draft_id: string
  download_token: string
  checkout: { product_id: string; amount_cents: number }
}

export default function AiPolicyGenerator() {
  const [step, setStep] = useState(0)
  const [firmSize, setFirmSize] = useState<string>('')
  const [practiceAreas, setPracticeAreas] = useState<string[]>([])
  const [aiTools, setAiTools] = useState<string[]>([])
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState<'idle' | 'generate' | 'checkout'>('idle')
  const [error, setError] = useState('')
  const [result, setResult] = useState<GenResult | null>(null)

  function toggle(list: string[], value: string, set: (v: string[]) => void) {
    set(list.includes(value) ? list.filter((x) => x !== value) : [...list, value])
  }

  async function generate() {
    if (!firmSize) {
      setError('Select a firm size.')
      return
    }
    if (practiceAreas.length === 0) {
      setError('Select at least one practice area.')
      return
    }
    if (aiTools.length === 0) {
      setError('Select at least one AI tool.')
      return
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      setError('Enter a valid work email — we send the policy there after payment.')
      return
    }
    setBusy('generate')
    setError('')
    try {
      const res = await fetch('/api/tools/ai-policy-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          firm_size: firmSize,
          practice_areas: practiceAreas,
          ai_tools: aiTools,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'The generator is temporarily unavailable — please retry in a moment.')
        setBusy('idle')
        return
      }
      setResult(data as GenResult)
      setStep(3)
    } catch {
      setError('Network issue — please retry.')
      setBusy('idle')
    }
  }

  async function checkout(gateway: 'crypto' | 'card') {
    setBusy('checkout')
    setError('')
    try {
      const res = await fetch('/api/pay/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: 'ai_policy_generator',
          user_email: email.trim(),
          gateway,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.checkout_url) {
        setError(data.error ?? 'Checkout is temporarily unavailable — please retry in a moment.')
        setBusy('idle')
        return
      }
      window.location.href = data.checkout_url
    } catch {
      setError('Network issue — please retry.')
      setBusy('idle')
    }
  }

  function download() {
    if (!result) return
    window.location.href = `/api/tools/ai-policy-generator/download?token=${result.download_token}`
  }

  const stepLabels = ['Firm profile', 'AI tools', 'Email', 'Your policy']

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '48px 32px' }}>
      <span className="section-label">Law-firm AI governance · $99 one-time</span>
      <h1 style={{ marginBottom: 8, fontSize: 'clamp(28px,5vw,48px)' }}>AI Policy Generator</h1>
      <p style={{ color: 'var(--on-surface-var)', marginBottom: 8, lineHeight: 1.7, maxWidth: 720 }}>
        Answer three short questions about your firm — we draft a firm-wide <strong>AI usage policy</strong> with
        citations to <strong>ABA Formal Opinion 512 (2024)</strong> and the Model Rules, ready for your attorney to
        review and adopt.
      </p>
      <p style={{ fontSize: 12, color: 'var(--outline)', lineHeight: 1.6, marginBottom: 32, maxWidth: 720 }}>
        The output is a <strong>template — not legal advice and not bar-approved</strong>. An attorney must review and
        adopt it before your firm uses it. Citations are constrained to the ABA allowlist; sections that don&apos;t
        cite an allowlisted source are dropped automatically.
      </p>

      {/* Stepper */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
        {stepLabels.map((label, i) => (
          <div
            key={label}
            style={{
              padding: '6px 12px',
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 700,
              background: i === step ? 'var(--primary)' : 'var(--bg-mid)',
              color: i === step ? '#fff' : 'var(--on-surface-var)',
              border: i === step ? 'none' : '1px solid var(--outline-var)',
            }}
          >
            {i + 1}. {label}
          </div>
        ))}
      </div>

      {error && (
        <div style={{ marginBottom: 20, padding: '14px 18px', borderRadius: '10px', background: '#fdecea', border: '1px solid #f5c6c0', color: '#c0392b', fontSize: 13, lineHeight: 1.6 }}>
          {error}
        </div>
      )}

      <div className="card" style={{ padding: '28px', background: 'var(--bg-mid)', marginBottom: 28 }}>
        {step === 0 && (
          <>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Firm profile</h2>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 8, color: 'var(--on-surface-var)' }}>
                Firm size
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 8 }}>
                {FIRM_SIZES.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setFirmSize(s.value)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 10,
                      textAlign: 'left',
                      cursor: 'pointer',
                      background: firmSize === s.value ? 'var(--primary)' : 'var(--bg)',
                      color: firmSize === s.value ? '#fff' : 'var(--on-surface)',
                      border: firmSize === s.value ? 'none' : '1px solid var(--outline-var)',
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{s.label}</div>
                    <div style={{ fontSize: 11, opacity: 0.8 }}>{s.desc}</div>
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 8, color: 'var(--on-surface-var)' }}>
                Practice areas
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {PRACTICE_AREAS.map((area) => (
                  <button
                    key={area}
                    onClick={() => toggle(practiceAreas, area, setPracticeAreas)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 999,
                      cursor: 'pointer',
                      fontSize: 12,
                      background: practiceAreas.includes(area) ? 'var(--primary)' : 'var(--bg)',
                      color: practiceAreas.includes(area) ? '#fff' : 'var(--on-surface)',
                      border: practiceAreas.includes(area) ? 'none' : '1px solid var(--outline-var)',
                    }}
                  >
                    {area}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={() => { setError(''); setStep(1) }}
              style={{ padding: '12px 22px', borderRadius: 10, border: 'none', background: 'var(--primary)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}
            >
              Continue →
            </button>
          </>
        )}

        {step === 1 && (
          <>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>AI tools in use</h2>
            <p style={{ fontSize: 12, color: 'var(--on-surface-var)', lineHeight: 1.6, marginBottom: 16 }}>
              Select the AI tools your firm uses (or plans to use). The policy covers permitted and prohibited uses for
              each.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
              {AI_TOOLS.map((tool) => (
                <button
                  key={tool}
                  onClick={() => toggle(aiTools, tool, setAiTools)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 999,
                    cursor: 'pointer',
                    fontSize: 12,
                    background: aiTools.includes(tool) ? 'var(--primary)' : 'var(--bg)',
                    color: aiTools.includes(tool) ? '#fff' : 'var(--on-surface)',
                    border: aiTools.includes(tool) ? 'none' : '1px solid var(--outline-var)',
                  }}
                >
                  {tool}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => { setError(''); setStep(0) }}
                style={{ padding: '12px 22px', borderRadius: 10, border: '1px solid var(--outline-var)', background: 'transparent', color: 'var(--on-surface)', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}
              >
                ← Back
              </button>
              <button
                onClick={() => { setError(''); setStep(2) }}
                style={{ padding: '12px 22px', borderRadius: 10, border: 'none', background: 'var(--primary)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}
              >
                Continue →
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Where should we send it?</h2>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--on-surface-var)' }}>
                Work email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@lawfirm.com"
                style={INPUT_STYLE}
              />
            </div>
            <p style={{ fontSize: 11, color: 'var(--outline)', lineHeight: 1.6, marginBottom: 20 }}>
              We draft your policy now (free preview), then email the full policy after the $99 one-time payment.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => { setError(''); setStep(1) }}
                style={{ padding: '12px 22px', borderRadius: 10, border: '1px solid var(--outline-var)', background: 'transparent', color: 'var(--on-surface)', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}
              >
                ← Back
              </button>
              <button
                onClick={generate}
                disabled={busy === 'generate'}
                style={{ padding: '12px 22px', borderRadius: 10, border: 'none', background: 'var(--primary)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}
              >
                {busy === 'generate' ? 'Drafting your policy…' : 'Draft my policy — free preview'}
              </button>
            </div>
          </>
        )}

        {step === 3 && result && (
          <>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{result.policy_title}</h2>
            <p style={{ fontSize: 12, color: 'var(--on-surface-var)', lineHeight: 1.6, marginBottom: 20 }}>
              {result.sections.length} sections drafted · citations to ABA Formal Opinion 512 (2024) + Model Rules.
              This is a <strong>preview</strong> — unlock the full policy for $99.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              {result.sections.slice(0, 3).map((s, i) => (
                <div key={i} style={{ padding: '14px 16px', borderRadius: 10, background: 'var(--bg)', border: '1px solid var(--outline-var)' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{s.heading}</div>
                  <div style={{ fontSize: 12, color: 'var(--on-surface-var)', lineHeight: 1.6 }}>{s.body}</div>
                  <div style={{ marginTop: 6, fontSize: 11, color: 'var(--outline)' }}>
                    <strong>Citations:</strong> {s.citations.join('; ')}
                  </div>
                </div>
              ))}
              {result.sections.length > 3 && (
                <div style={{ fontSize: 12, color: 'var(--outline)', textAlign: 'center', padding: '8px' }}>
                  + {result.sections.length - 3} more sections in the full policy
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
              <button
                onClick={() => checkout('card')}
                disabled={busy === 'checkout'}
                style={{ padding: '12px 22px', borderRadius: 10, border: 'none', background: 'var(--primary)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}
              >
                {busy === 'checkout' ? 'Opening checkout…' : 'Unlock full policy — $99'}
              </button>
              <button
                onClick={() => checkout('crypto')}
                disabled={busy === 'checkout'}
                style={{ padding: '12px 22px', borderRadius: 10, border: '1px solid var(--outline-var)', background: 'transparent', color: 'var(--on-surface)', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}
              >
                Pay with crypto
              </button>
            </div>
            <p style={{ fontSize: 11, color: 'var(--outline)', lineHeight: 1.6 }}>
              After payment we email the full policy to {email} and unlock the download link. Template — attorney must
              review before adoption.
            </p>
          </>
        )}
      </div>

      {/* FirmCited Starter upsell */}
      <div className="card" style={{ padding: '24px 28px', background: 'var(--bg-mid)', border: '1px solid var(--outline-var)' }}>
        <span className="section-label">Ongoing AI governance</span>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: '6px 0 8px' }}>Keep the policy honest — FirmCited Starter</h2>
        <p style={{ fontSize: 13, color: 'var(--on-surface-var)', lineHeight: 1.7, marginBottom: 12 }}>
          A policy is only as good as the citations behind it. <strong>FirmCited</strong> monitors your firm&apos;s
          AI-assisted work for hallucinated or stale citations — every brief, memo, and filing checked against the
          source, with a citation health score. <strong>$299/mo</strong>.
        </p>
        <Link
          href="https://cited.bizlegal-ai.com"
          style={{ display: 'inline-block', padding: '10px 18px', borderRadius: 10, background: 'var(--primary)', color: '#fff', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}
        >
          Explore FirmCited →
        </Link>
        <p style={{ fontSize: 11, color: 'var(--outline)', marginTop: 12, lineHeight: 1.6 }}>
          <Link href="/tools" style={{ color: 'var(--primary)' }}>← Back to tools</Link>
        </p>
      </div>
    </div>
  )
}
