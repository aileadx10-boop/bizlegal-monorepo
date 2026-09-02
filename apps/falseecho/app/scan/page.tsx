'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { TurnstileWidget } from '@bizlegal/turnstile-widget'

/* ─── Design tokens (fleet dark-professional look, matches TRACR) ───────── */
const C = {
  bg: '#07090e',
  surface: '#0d1118',
  card: '#111622',
  border: '#1a2035',
  text: '#e8ecf4',
  muted: '#5a6278',
  dim: '#2e3450',
  red: '#c0392b',
  redBg: 'rgba(192,57,43,0.09)',
  redBorder: 'rgba(192,57,43,0.30)',
  amber: '#d4a843',
  amberBg: 'rgba(212,168,67,0.08)',
  amberBorder: 'rgba(212,168,67,0.28)',
  green: '#27ae60',
  greenBg: 'rgba(39,174,96,0.08)',
  mono: '"DM Mono", "Fira Code", ui-monospace, monospace',
  serif: '"Playfair Display", Georgia, serif',
  sans: '"DM Sans", system-ui, -apple-system, sans-serif',
}

interface EngineStatus {
  id: string
  name: string
  configured: boolean
}

interface FreeResult {
  scanRef: string
  score: number
  flagsCount: number
  probedCount: number
  engines: EngineStatus[]
}

type Phase = 'form' | 'scanning' | 'results' | 'paid-pending'

function ScanInner() {
  const searchParams = useSearchParams()
  const prepaidOrder = searchParams.get('order') ?? ''

  const [entity, setEntity] = useState('')
  const [url, setUrl] = useState('')
  const [content, setContent] = useState('')
  const [email, setEmail] = useState('')
  const [token, setToken] = useState<string | null>(null)
  const [phase, setPhase] = useState<Phase>('form')
  const [error, setError] = useState('')
  const [result, setResult] = useState<FreeResult | null>(null)
  const [payBusy, setPayBusy] = useState<'card' | 'crypto' | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setPhase('scanning')
    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity: entity.trim(),
          url: url.trim() || undefined,
          content: content.trim() || undefined,
          email: email.trim(),
          ...(prepaidOrder ? { orderId: prepaidOrder } : {}),
          ...(token ? { turnstile_token: token } : {}),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Scan failed. Please try again.')
        setPhase('form')
        return
      }
      if (data.mode === 'paid') {
        setResult({ scanRef: data.scanRef, score: -1, flagsCount: -1, probedCount: 0, engines: data.engines ?? [] })
        setPhase('paid-pending')
      } else {
        setResult(data as FreeResult)
        setPhase('results')
      }
    } catch {
      setError('Network error. Please try again.')
      setPhase('form')
    }
  }

  async function payCard() {
    if (!result) return
    setPayBusy('card')
    setError('')
    try {
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, tier: 'audit', scanRef: result.scanRef }),
      })
      const data = await res.json()
      if (data.approvalUrl) window.location.href = data.approvalUrl
      else {
        setError(data.error || 'Could not start card checkout.')
        setPayBusy(null)
      }
    } catch {
      setError('Network error starting checkout.')
      setPayBusy(null)
    }
  }

  async function payCrypto() {
    if (!result) return
    setPayBusy('crypto')
    setError('')
    try {
      const res = await fetch('/api/payments/nowpayments/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, tier: 'audit', scanRef: result.scanRef }),
      })
      const data = await res.json()
      if (data.invoice_url) window.location.href = data.invoice_url
      else {
        setError(data.error || 'Could not start crypto checkout.')
        setPayBusy(null)
      }
    } catch {
      setError('Network error starting checkout.')
      setPayBusy(null)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '13px 16px',
    background: C.card,
    border: `1px solid ${C.border}`,
    borderRadius: 10,
    color: C.text,
    fontSize: 14,
    fontFamily: C.sans,
    outline: 'none',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontFamily: C.mono,
    fontSize: 11,
    color: C.muted,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    marginBottom: 6,
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: C.sans }}>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '64px 24px 96px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontFamily: C.mono, fontSize: 11, color: C.amber, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 12 }}>
            {prepaidOrder ? 'Paid scan — intake' : 'Free exposure check'}
          </div>
          <h1 style={{ fontFamily: C.serif, fontSize: 34, fontWeight: 700, margin: '0 0 12px', lineHeight: 1.15 }}>
            What is AI saying about you?
          </h1>
          <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.7, margin: 0 }}>
            We probe ChatGPT, Claude, Perplexity, and Google AI Overviews with
            a battery of questions about the name you give us — and capture
            every answer as hash-anchored evidence.
          </p>
        </div>

        {phase === 'form' && (
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 18, padding: '28px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16 }}>
            <div>
              <label htmlFor="entity" style={labelStyle}>Name / firm to scan *</label>
              <input id="entity" required minLength={2} maxLength={120} value={entity} onChange={(e) => setEntity(e.target.value)} placeholder="e.g. Jane Doe or Doe & Associates LLP" style={inputStyle} />
            </div>
            <div>
              <label htmlFor="url" style={labelStyle}>Website (optional)</label>
              <input id="url" type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" style={inputStyle} />
            </div>
            <div>
              <label htmlFor="content" style={labelStyle}>Paste a claim to check (optional)</label>
              <textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} rows={3} placeholder="Something an AI engine told you about this name…" style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
            <div>
              <label htmlFor="email" style={labelStyle}>Email for the report *</label>
              <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@firm.com" style={inputStyle} />
            </div>
            <TurnstileWidget onToken={setToken} />
            {error && <p style={{ color: C.red, fontSize: 13, fontFamily: C.mono, margin: 0 }}>{error}</p>}
            <button type="submit" style={{ padding: '14px', background: C.amber, color: C.bg, border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: C.sans }}>
              {prepaidOrder ? 'Start my paid scan →' : 'Run free check →'}
            </button>
            <p style={{ fontSize: 11, color: C.dim, fontFamily: C.mono, margin: 0, lineHeight: 1.6 }}>
              We publish signals, you decide. Engines change answers constantly — no detection completeness is guaranteed.
            </p>
          </form>
        )}

        {phase === 'scanning' && (
          <div style={{ textAlign: 'center', padding: '64px 0' }}>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <div style={{ width: 48, height: 48, borderRadius: '50%', border: `1.5px solid ${C.amber}`, borderTopColor: 'transparent', animation: 'spin 0.9s linear infinite', margin: '0 auto 20px' }} />
            <div style={{ fontFamily: C.mono, fontSize: 12, color: C.muted, letterSpacing: '0.12em' }}>
              Probing AI engines… (up to ~60s)
            </div>
          </div>
        )}

        {phase === 'paid-pending' && result && (
          <div style={{ padding: '36px 32px', background: C.greenBg, border: `1px solid rgba(39,174,96,0.25)`, borderRadius: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>✓</div>
            <h2 style={{ fontFamily: C.serif, fontSize: 24, margin: '0 0 10px' }}>Your full audit is running</h2>
            <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7, margin: '0 0 20px' }}>
              The 25-prompt battery is executing across all configured engines.
              We&apos;ll email you when the evidence pack is ready — usually a few minutes.
            </p>
            <a href={`/report/${result.scanRef}`} style={{ display: 'inline-block', padding: '13px 30px', background: C.amber, color: C.bg, borderRadius: 8, textDecoration: 'none', fontSize: 14, fontWeight: 700 }}>
              Watch the report build →
            </a>
            <div style={{ fontFamily: C.mono, fontSize: 11, color: C.dim, marginTop: 16 }}>Scan ref: {result.scanRef}</div>
          </div>
        )}

        {phase === 'results' && result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Score card */}
            <div style={{ padding: '28px', background: result.flagsCount > 0 ? C.redBg : C.greenBg, border: `1px solid ${result.flagsCount > 0 ? C.redBorder : 'rgba(39,174,96,0.25)'}`, borderRadius: 16, display: 'flex', gap: 24, alignItems: 'center' }}>
              <div style={{ textAlign: 'center', minWidth: 90 }}>
                <div style={{ fontFamily: C.mono, fontSize: 44, fontWeight: 500, color: result.flagsCount > 0 ? C.red : C.green, lineHeight: 1 }}>{result.score}</div>
                <div style={{ fontFamily: C.mono, fontSize: 9, color: C.muted, letterSpacing: '0.12em', marginTop: 4 }}>EXPOSURE / 100</div>
              </div>
              <div>
                <div style={{ fontFamily: C.serif, fontSize: 20, fontWeight: 700, color: result.flagsCount > 0 ? C.red : C.green }}>
                  {result.flagsCount > 0 ? `${result.flagsCount} suspected falsehood${result.flagsCount === 1 ? '' : 's'} flagged` : 'No flags in the quick probe'}
                </div>
                <div style={{ fontSize: 13, color: C.muted, marginTop: 6, lineHeight: 1.6 }}>
                  Quick probe: {result.probedCount} answers captured. The full audit runs 25 prompts per engine with Claude-graded narratives.
                </div>
              </div>
            </div>

            {/* Engine matrix */}
            <div style={{ padding: '20px 24px', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12 }}>
              <div style={{ fontFamily: C.mono, fontSize: 11, color: C.amber, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 12 }}>Engine coverage</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {result.engines.map((e) => (
                  <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: C.text }}>{e.name}</span>
                    <span style={{ fontFamily: C.mono, color: e.configured ? C.green : C.muted }}>
                      {e.configured ? 'probed' : 'unavailable'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Paywall */}
            <div style={{ padding: '32px', background: C.surface, border: `1px solid ${C.amberBorder}`, borderRadius: 16, textAlign: 'center' }}>
              <div style={{ fontFamily: C.mono, fontSize: 11, color: C.amber, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 10 }}>FalseEcho Audit — $29 one-time</div>
              <h2 style={{ fontFamily: C.serif, fontSize: 24, margin: '0 0 10px' }}>Unlock the full evidence pack</h2>
              <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7, margin: '0 0 22px' }}>
                25 prompts × 4 engines. Every answer hash-anchored (SHA-256 +
                UTC timestamp + sequence). Flagged answers graded for
                confidence with a factual narrative. Built to hand to counsel.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={payCard} disabled={payBusy !== null} style={{ padding: '13px 30px', background: C.amber, color: C.bg, border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: payBusy ? 'wait' : 'pointer', fontFamily: C.sans }}>
                  {payBusy === 'card' ? 'Starting checkout…' : 'Pay $29 by card →'}
                </button>
                <button onClick={payCrypto} disabled={payBusy !== null} style={{ padding: '13px 30px', background: C.redBg, border: `1px solid ${C.redBorder}`, borderRadius: 8, color: C.red, fontSize: 14, fontWeight: 700, cursor: payBusy ? 'wait' : 'pointer', fontFamily: C.sans }}>
                  {payBusy === 'crypto' ? 'Creating invoice…' : 'Pay with crypto →'}
                </button>
              </div>
              {error && <p style={{ color: C.red, fontSize: 12, fontFamily: C.mono, marginTop: 12 }}>{error}</p>}
              <p style={{ fontSize: 11, color: C.dim, fontFamily: C.mono, marginTop: 16 }}>
                Card via PayPal · Crypto via NOWPayments · Monitor tier ($149/mo) on the <a href="/pricing" style={{ color: C.amber }}>pricing page</a>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ScanPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#07090e' }} />}>
      <ScanInner />
    </Suspense>
  )
}
