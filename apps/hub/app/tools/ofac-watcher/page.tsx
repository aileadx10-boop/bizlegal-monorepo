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

export default function OfacWatcher() {
  const [email, setEmail] = useState('')
  const [addresses, setAddresses] = useState<string[]>([''])
  const [busy, setBusy] = useState<'idle' | 'checkout'>('idle')
  const [error, setError] = useState('')

  const updateAddress = (i: number, value: string) =>
    setAddresses((rows) => rows.map((r, idx) => (idx === i ? value : r)))
  const addAddress = () => setAddresses((rows) => [...rows, ''])
  const removeAddress = (i: number) => setAddresses((rows) => rows.filter((_, idx) => idx !== i))

  async function checkout(gateway: 'crypto' | 'card') {
    const clean = addresses.map((a) => a.trim()).filter(Boolean)
    if (!email.trim()) {
      setError('Enter a work email to start checkout.')
      return
    }
    if (clean.length === 0) {
      setError('Add at least one address or entity to watch.')
      return
    }
    setBusy('checkout')
    setError('')
    try {
      // Register the watchlist BEFORE checkout — the rows land as 'pending'
      // and the payment webhook activates them. Skipping this step is why the
      // daily screen previously ran against an empty watchlist.
      const watchRes = await fetch('/api/tools/ofac-watcher/watch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), addresses: clean }),
      })
      if (!watchRes.ok) {
        const watchData = await watchRes.json().catch(() => ({}))
        setError(
          watchData.error === 'rate_limited'
            ? 'Too many attempts — please wait a minute and retry.'
            : 'We could not save your watchlist, so checkout was not started. Please retry.',
        )
        setBusy('idle')
        return
      }

      const res = await fetch('/api/pay/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: 'ofac_watch_monthly',
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
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 32px' }}>
      <span className="section-label">Sanctions · OFAC SDN / UN / EU · $29/mo</span>
      <h1 style={{ marginBottom: 8, fontSize: 'clamp(28px,5vw,48px)' }}>OFAC Sanctions List Watcher</h1>
      <p style={{ color: 'var(--on-surface-var)', marginBottom: 8, lineHeight: 1.7 }}>
        Register the addresses and entities you need to watch. Every day we diff the{' '}
        <strong>OFAC SDN, UN, and EU sanctions lists</strong> against your watchlist and email you the moment a
        new match appears — with the list entry and source URL cited.
      </p>
      <p style={{ fontSize: 12, color: 'var(--outline)', lineHeight: 1.6, marginBottom: 32 }}>
        Alerts are <strong>possible matches — verify independently against the official list before acting</strong>.
        This is monitoring intelligence, not a legal opinion, and carries no guarantee against false positives or
        negatives. The lists change daily; we screen against the latest cached snapshot.
      </p>

      {error && (
        <div style={{ marginBottom: 20, padding: '14px 18px', borderRadius: '10px', background: '#fdecea', border: '1px solid #f5c6c0', color: '#c0392b', fontSize: 13, lineHeight: 1.6 }}>
          {error}
        </div>
      )}

      <div className="card" style={{ padding: '28px', background: 'var(--bg-mid)', marginBottom: 28 }}>
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

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--on-surface-var)' }}>
            Watched addresses / entities
          </label>
          {addresses.map((addr, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input
                value={addr}
                onChange={(e) => updateAddress(i, e.target.value)}
                placeholder="0x… or entity name"
                style={INPUT_STYLE}
              />
              {addresses.length > 1 && (
                <button
                  onClick={() => removeAddress(i)}
                  style={{ padding: '0 12px', borderRadius: 8, border: '1px solid var(--outline-var)', background: 'transparent', color: 'var(--on-surface-var)', cursor: 'pointer' }}
                  aria-label="Remove address"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addAddress}
            style={{ marginTop: 4, padding: '8px 14px', borderRadius: 8, border: '1px dashed var(--outline-var)', background: 'transparent', color: 'var(--primary)', cursor: 'pointer', fontSize: 12 }}
          >
            + Add another
          </button>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={() => checkout('card')}
            disabled={busy === 'checkout'}
            style={{ padding: '12px 22px', borderRadius: 10, border: 'none', background: 'var(--primary)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}
          >
            {busy === 'checkout' ? 'Opening checkout…' : 'Subscribe — $29/mo'}
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
          Cancel anytime. After checkout you&apos;ll receive a confirmation email; add or change watched addresses
          by replying to any alert. <Link href="/tools" style={{ color: 'var(--primary)' }}>← Back to tools</Link>
        </p>
      </div>
    </div>
  )
}
