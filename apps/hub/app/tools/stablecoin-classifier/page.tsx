'use client'
import { useState } from 'react'
import Link from 'next/link'
import {
  QUESTIONS,
  classifyStablecoin,
  type StablecoinAnswers,
} from '@/lib/stablecoin-classifier'

export default function StablecoinClassifier() {
  const [answers, setAnswers] = useState<StablecoinAnswers>({})
  const [step, setStep] = useState(0)
  const [email, setEmail] = useState('')
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [emailMessage, setEmailMessage] = useState('')

  const currentQ = QUESTIONS[step]
  const allAnswered = step >= QUESTIONS.length
  const result = allAnswered ? classifyStablecoin(answers) : null

  const answer = (val: boolean) => {
    const newAnswers = { ...answers, [currentQ.id]: val }
    setAnswers(newAnswers)
    setStep((s) => s + 1)
  }

  const reset = () => {
    setAnswers({})
    setStep(0)
    setEmail('')
    setEmailStatus('idle')
    setEmailMessage('')
  }

  async function submitEmail() {
    if (!email.trim()) {
      // No email is fine — the result stays on screen either way.
      setEmailStatus('done')
      return
    }
    setEmailStatus('sending')
    try {
      const res = await fetch('/api/tools/stablecoin-classifier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), result_type: result?.type }),
      })
      const data = await res.json()
      if (res.ok) {
        setEmailStatus('done')
        setEmailMessage('Saved. We\'ll send the reserve-report comparison — nothing else.')
      } else {
        setEmailStatus('error')
        setEmailMessage(data.error ?? 'Could not save — but your classification is unaffected.')
      }
    } catch {
      setEmailStatus('error')
      setEmailMessage('Network issue — your classification is unaffected.')
    }
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '48px 32px' }}>
      <span className="section-label">Stablecoins · GENIUS Act + MiCA</span>
      <h1 style={{ marginBottom: 8, fontSize: 'clamp(28px,5vw,48px)' }}>Stablecoin Classifier</h1>
      <p style={{ color: 'var(--on-surface-var)', marginBottom: 40 }}>
        7-question decision tree. Routes a token to permitted / non-permitted status under the US
        GENIUS Act (effective 2027) and to EMT / ART / other crypto-asset under EU MiCA — each
        classification cited to the governing provision.
      </p>

      <div className="progress-track" style={{ marginBottom: 32 }}>
        <div className="progress-fill" style={{ width: `${(Math.min(step, QUESTIONS.length) / QUESTIONS.length) * 100}%` }} />
      </div>

      {!allAnswered ? (
        <div>
          <div style={{ fontSize: 11, color: 'var(--outline)', marginBottom: 12 }}>
            Question {step + 1} of {QUESTIONS.length}
          </div>
          <div style={{ fontFamily: 'Newsreader, serif', fontSize: 20, color: 'var(--on-surface)', marginBottom: 32, lineHeight: 1.45 }}>
            {currentQ.text}
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => answer(true)} className="btn-primary" style={{ flex: 1, justifyContent: 'center', fontSize: 14, padding: '12px' }}>Yes</button>
            <button onClick={() => answer(false)} className="btn-ghost" style={{ flex: 1, justifyContent: 'center', fontSize: 14, padding: '12px' }}>No</button>
          </div>
          {step > 0 && (
            <button onClick={() => setStep((s) => s - 1)} style={{ marginTop: 16, background: 'none', border: 'none', fontSize: 12, color: 'var(--outline)', cursor: 'pointer', fontFamily: 'Manrope, sans-serif' }}>
              ← Back
            </button>
          )}
        </div>
      ) : result ? (
        <div>
          <div className="card" style={{ padding: '28px', background: 'var(--bg-mid)', borderLeft: `3px solid ${result.color}`, marginBottom: 24 }}>
            <span className="tag" style={{ color: result.color, display: 'block', marginBottom: 8 }}>
              {result.regime} · Classification
            </span>
            <div style={{ fontFamily: 'Newsreader, serif', fontSize: 28, fontWeight: 700, color: result.color, marginBottom: 16, lineHeight: 1.2 }}>
              {result.type}
            </div>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7 }}>{result.desc}</p>
            <div style={{ marginTop: 16, fontSize: 12, color: 'var(--primary)', lineHeight: 1.6 }}>
              <strong>Citation:</strong> {result.citation}
            </div>
          </div>

          {/* Lead capture — optional, never gates the result */}
          <div style={{ padding: '24px', background: 'var(--bg-mid)', border: '1px solid var(--outline-var)', borderRadius: '12px', marginBottom: 28 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--outline)', marginBottom: 6 }}>
              Reserve &amp; attestation report (free comparison)
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>
              Want the reserve-report breakdown for this class?
            </div>
            <div style={{ fontSize: 12, color: 'var(--on-surface-var)', lineHeight: 1.6, marginBottom: 12 }}>
              We'll send a templated reserve-report comparison for {result.type} — no other emails.
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Work email (optional)"
                style={{
                  flex: '1 1 200px',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--outline-var)',
                  background: 'var(--bg)',
                  color: 'var(--on-surface)',
                  fontSize: 13,
                  fontFamily: 'Manrope, sans-serif',
                }}
              />
              <button onClick={submitEmail} disabled={emailStatus === 'sending'} className="btn-primary" style={{ fontSize: 13, padding: '10px 22px' }}>
                {emailStatus === 'sending' ? 'Saving…' : 'Send the comparison'}
              </button>
            </div>
            {emailStatus === 'done' && emailMessage && (
              <div style={{ marginTop: 10, fontSize: 12, color: '#10B981' }}>✓ {emailMessage}</div>
            )}
            {emailStatus === 'error' && emailMessage && (
              <div style={{ marginTop: 10, fontSize: 12, color: '#f87171' }}>{emailMessage}</div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 28 }}>
            <button onClick={reset} className="btn-ghost">Start Over</button>
            <Link href="/regulations/mica" className="btn-primary" style={{ fontSize: 13 }}>Read MiCA Hub →</Link>
          </div>

          <div style={{ padding: '24px', background: 'var(--bg-mid)', border: '1px solid var(--outline-var)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--outline)', marginBottom: 6 }}>Stablecoin reserve + regulatory monitoring</div>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>TRACR Forensic Wallet &amp; Reserve Reports</div>
              <div style={{ fontSize: 12, color: 'var(--on-surface-var)', lineHeight: 1.6 }}>Reserve attestation, wallet-tracing, and sanctions exposure for stablecoin issuers and counterparties.</div>
            </div>
            <a href="https://tracr.bizlegal-ai.com" style={{ display: 'inline-block', background: 'var(--primary)', color: '#fff', padding: '10px 22px', borderRadius: '8px', fontWeight: 700, fontSize: '13px', textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>Explore TRACR →</a>
          </div>

          <div style={{ marginTop: 12, fontSize: 11, color: 'var(--outline)', lineHeight: 1.6 }}>
            Classification for discussion only — not legal advice. Regimes are evolving (GENIUS Act
            effective 2027; MiCA transitional regimes vary by NCA). Verify material decisions with
            qualified counsel.
          </div>
        </div>
      ) : null}
    </div>
  )
}
