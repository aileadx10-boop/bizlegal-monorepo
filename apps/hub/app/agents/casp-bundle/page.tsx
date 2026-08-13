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

const INCLUDED_TOOLS = [
  {
    href: '/tools/wallet-screener',
    title: 'Sanctions & Wallet Screening',
    desc: 'Check Ethereum addresses against the OFAC, UN, and EU sanctions lists — instant three-way result with citations.',
  },
  {
    href: '/mica-deadlines',
    title: 'MiCA Deadline Tracker',
    desc: 'Every statutory MiCA milestone for CASPs — authorisation, Travel Rule, grandfathering waves — with citations. Curated daily.',
  },
  {
    href: '/tools/stablecoin-classifier',
    title: 'Stablecoin Classifier',
    desc: 'Route a token to permitted / non-permitted status under the US GENIUS Act and to EMT / ART / other crypto-asset under EU MiCA.',
  },
  {
    href: '/reserve-report',
    title: 'Stablecoin Reserve Report',
    desc: 'Generate a reserve report for your stablecoin — attestation-ready structure with the evidence a regulator expects.',
  },
  {
    href: '/tools/obligation-extractor',
    title: 'Compliance Obligation Extractor',
    desc: 'Paste a regulation or contract — get a structured checklist of every obligation, each tied to the exact provision.',
  },
  {
    href: '/tools/ofac-watcher',
    title: 'OFAC Sanctions List Watcher',
    desc: 'Daily diff of the OFAC SDN, UN, and EU lists against your watched addresses and entities, with email alerts on new matches.',
  },
]

export default function CaspBundle() {
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState<'idle' | 'checkout'>('idle')
  const [error, setError] = useState('')

  async function checkout(gateway: 'crypto' | 'card') {
    if (!email.trim()) {
      setError('Enter a work email to start checkout.')
      return
    }
    setBusy('checkout')
    setError('')
    try {
      const res = await fetch('/api/pay/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: 'casp_bundle_monthly',
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

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 32px' }}>
      <span className="section-label">MiCA CASP · Compliance toolkit · $499/mo</span>
      <h1 style={{ marginBottom: 8, fontSize: 'clamp(28px,5vw,48px)' }}>CASP Compliance Bundle</h1>
      <p style={{ color: 'var(--on-surface-var)', marginBottom: 8, lineHeight: 1.7, maxWidth: 720 }}>
        The MiCA CASP compliance toolkit, packaged: <strong>sanctions &amp; wallet screening, MiCA deadline
        tracking, stablecoin classification, reserve reports, obligation extraction, and OFAC list watch</strong> —
        one subscription instead of six point tools.
      </p>
      <p style={{ fontSize: 12, color: 'var(--outline)', lineHeight: 1.6, marginBottom: 32, maxWidth: 720 }}>
        The bundle is a <strong>compliance toolkit + intelligence — not a legal opinion and not regulatory
        approval</strong>. Each included tool carries its own disclaimer; verify material compliance decisions with
        qualified counsel.
      </p>

      {error && (
        <div style={{ marginBottom: 20, padding: '14px 18px', borderRadius: '10px', background: '#fdecea', border: '1px solid #f5c6c0', color: '#c0392b', fontSize: 13, lineHeight: 1.6 }}>
          {error}
        </div>
      )}

      {/* Included tools */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--on-surface-var)', fontWeight: 600, marginBottom: 16 }}>
          What&apos;s included
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
          {INCLUDED_TOOLS.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              style={{ display: 'block', padding: '16px 18px', borderRadius: 10, background: 'var(--bg-mid)', border: '1px solid var(--outline-var)', textDecoration: 'none' }}
            >
              <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--on-surface)', marginBottom: 6, lineHeight: 1.3 }}>
                {tool.title}
              </h3>
              <p style={{ fontSize: 12, color: 'var(--on-surface-var)', lineHeight: 1.6, margin: 0 }}>{tool.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Checkout */}
      <div className="card" style={{ padding: '28px', background: 'var(--bg-mid)' }}>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--on-surface-var)' }}>
            Work email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            style={INPUT_STYLE}
          />
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={() => checkout('card')}
            disabled={busy === 'checkout'}
            style={{ padding: '12px 22px', borderRadius: 10, border: 'none', background: 'var(--primary)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}
          >
            {busy === 'checkout' ? 'Opening checkout…' : 'Subscribe — $499/mo'}
          </button>
          <button
            onClick={() => checkout('crypto')}
            disabled={busy === 'checkout'}
            style={{ padding: '12px 22px', borderRadius: 10, border: '1px solid var(--outline-var)', background: 'transparent', color: 'var(--on-surface)', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}
          >
            Pay with crypto
          </button>
        </div>
        <p style={{ fontSize: 11, color: 'var(--outline)', marginTop: 14, lineHeight: 1.6 }}>
          Cancel anytime. After checkout you&apos;ll receive a confirmation email with your bundle access.
          <Link href="/mica-readiness" style={{ color: 'var(--primary)' }}> Not sure you need it? Run the 60-second MiCA readiness check →</Link>
        </p>
      </div>
    </div>
  )
}
