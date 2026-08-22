'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

const C = {
  bg: '#0b0d12',
  surface: '#111520',
  border: '#1e2430',
  text: '#e8e6e3',
  muted: '#8b93a7',
  body: '#c3c9d6',
  accent: '#3b72e8',
  success: '#2db66e',
  warn: '#e8a325',
  danger: '#e05450',
} as const

interface DdLease {
  id: string
  lease_type: string | null
  confidence_score: number | null
  engine: string | null
  parsed_at: string | null
  created_at: string
}

interface DdTransaction {
  id: string
  transaction_type: string
  closing_date: string
  status: string
  created_at: string
}

interface DdProperty {
  id: string
  address: string
  city: string | null
  country: string | null
  region: string | null
  postcode: string | null
  created_at: string
  leaseparse_leases: DdLease[]
  closeflow_transactions: DdTransaction[]
}

const TX_LABELS: Record<string, string> = {
  residential_purchase: 'Residential Purchase',
  residential_refi: 'Refinance',
  commercial: 'Commercial',
  exchange_1031: '1031 Exchange',
}

function fmtDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  })
}

function pct(n: number): string {
  return `${Math.round(n * 100)}%`
}

export default function DashboardPage() {
  const [email, setEmail] = useState('')
  const [savedEmail, setSavedEmail] = useState<string | null>(null)
  const [properties, setProperties] = useState<DdProperty[]>([])
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const [showAddProp, setShowAddProp] = useState(false)
  const [propForm, setPropForm] = useState({ address: '', city: '', region: '', postcode: '' })

  const [uploadFor, setUploadFor] = useState<string | null>(null)
  const [closingFor, setClosingFor] = useState<string | null>(null)

  const [leaseFile, setLeaseFile] = useState<File | null>(null)
  const [leaseType, setLeaseType] = useState('office')
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'parsing' | 'done' | 'error'>('idle')
  const [uploadMsg, setUploadMsg] = useState('')

  const [closingForm, setClosingForm] = useState({
    transaction_type: 'residential_purchase',
    closing_date: '',
    state: '',
  })
  const [closingStatus, setClosingStatus] = useState<'idle' | 'saving' | 'error'>('idle')

  useEffect(() => {
    const stored = localStorage.getItem('dd_email')
    if (stored) {
      setSavedEmail(stored)
      setEmail(stored)
    }
  }, [])

  const loadProperties = useCallback(async (em: string) => {
    setLoading(true)
    setErr(null)
    try {
      const res = await fetch(`/api/properties?email=${encodeURIComponent(em)}`)
      const data = await res.json() as { ok: boolean; properties: DdProperty[]; error?: string }
      if (data.ok) {
        setProperties(data.properties)
      } else {
        setErr(data.error ?? 'failed_to_load')
      }
    } catch {
      setErr('network_error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (savedEmail) void loadProperties(savedEmail)
  }, [savedEmail, loadProperties])

  function saveEmail() {
    const e = email.trim().toLowerCase()
    if (!e.includes('@')) return
    localStorage.setItem('dd_email', e)
    setSavedEmail(e)
  }

  async function addProperty() {
    if (!savedEmail || !propForm.address) return
    const res = await fetch('/api/properties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: savedEmail, ...propForm }),
    })
    const data = await res.json() as { ok: boolean }
    if (data.ok) {
      setShowAddProp(false)
      setPropForm({ address: '', city: '', region: '', postcode: '' })
      await loadProperties(savedEmail)
    }
  }

  async function uploadLease(propertyId: string) {
    if (!leaseFile || !savedEmail) return
    setUploadStatus('uploading')
    setUploadMsg('Requesting upload URL...')

    try {
      const urlRes = await fetch('/api/leases/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: savedEmail,
          filename: leaseFile.name,
          size_bytes: leaseFile.size,
          lease_type: leaseType,
          property_id: propertyId,
        }),
      })
      const urlData = await urlRes.json() as {
        ok: boolean; upload_url: string; lease_id: string; storage_path: string; error?: string
      }
      if (!urlData.ok) throw new Error(urlData.error ?? 'upload_url_failed')

      setUploadMsg('Uploading PDF to storage...')
      const putRes = await fetch(urlData.upload_url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/pdf' },
        body: leaseFile,
      })
      if (!putRes.ok) throw new Error(`storage_put_${putRes.status}`)

      setUploadStatus('parsing')
      setUploadMsg('Extracting abstract — 15–60s with Claude Haiku...')
      const ingestRes = await fetch('/api/leases/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lease_id: urlData.lease_id, storage_path: urlData.storage_path }),
      })
      const ingestData = await ingestRes.json() as {
        ok: boolean; confidence: number; engine: string; error?: string
      }
      if (!ingestData.ok) throw new Error(ingestData.error ?? 'ingest_failed')

      setUploadStatus('done')
      setUploadMsg(`Done — ${pct(ingestData.confidence)} confidence (${ingestData.engine})`)
      setLeaseFile(null)
      setUploadFor(null)
      await loadProperties(savedEmail)
    } catch (e) {
      setUploadStatus('error')
      setUploadMsg(e instanceof Error ? e.message : 'upload_failed')
    }
  }

  async function addClosing(propertyId: string) {
    if (!savedEmail || !closingForm.closing_date) return
    setClosingStatus('saving')
    try {
      const res = await fetch('/api/closings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: savedEmail, property_id: propertyId, ...closingForm }),
      })
      const data = await res.json() as { ok: boolean }
      if (data.ok) {
        setClosingStatus('idle')
        setClosingForm({ transaction_type: 'residential_purchase', closing_date: '', state: '' })
        setClosingFor(null)
        await loadProperties(savedEmail)
      } else {
        setClosingStatus('error')
      }
    } catch {
      setClosingStatus('error')
    }
  }

  const inp: React.CSSProperties = {
    background: '#0e1118',
    border: `1px solid ${C.border}`,
    borderRadius: '5px',
    color: C.text,
    padding: '0.45rem 0.7rem',
    fontSize: '0.875rem',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  }

  function btn(variant: 'primary' | 'ghost' = 'primary'): React.CSSProperties {
    return {
      background: variant === 'primary' ? C.accent : 'transparent',
      border: variant === 'ghost' ? `1px solid ${C.border}` : 'none',
      borderRadius: '5px',
      color: C.text,
      padding: '0.4rem 0.85rem',
      fontSize: '0.85rem',
      cursor: 'pointer',
      fontWeight: 500,
    }
  }

  const card: React.CSSProperties = {
    background: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: '8px',
    padding: '1rem 1.25rem',
    marginBottom: '0.75rem',
  }

  const inlinePanel: React.CSSProperties = {
    marginTop: '0.75rem',
    padding: '0.85rem 1rem',
    background: '#0e1118',
    borderRadius: '6px',
    border: `1px solid ${C.border}`,
  }

  // ─── Email gate ──────────────────────────────────────────────────────────────

  if (!savedEmail) {
    return (
      <main style={{ maxWidth: '36rem', margin: '4rem auto', padding: '0 1.5rem' }}>
        <h1 style={{ fontSize: '1.6rem', margin: '0 0 0.5rem' }}>LeaseParse</h1>
        <p style={{ color: C.muted, marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Lease abstracts and closing checklists. Enter your email to continue.
        </p>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            style={{ ...inp, flex: 1 }}
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && saveEmail()}
            autoFocus
          />
          <button style={btn()} onClick={saveEmail}>Enter</button>
        </div>
      </main>
    )
  }

  // ─── Dashboard ───────────────────────────────────────────────────────────────

  return (
    <main style={{ maxWidth: '52rem', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.35rem' }}>LeaseParse</h1>
        <span style={{ fontSize: '0.8rem', color: C.muted }}>
          {savedEmail} ·{' '}
          <button
            style={{ background: 'none', border: 'none', color: C.accent, cursor: 'pointer', fontSize: '0.8rem', padding: 0 }}
            onClick={() => { localStorage.removeItem('dd_email'); setSavedEmail(null) }}
          >
            switch
          </button>
        </span>
      </div>

      {/* Add property */}
      <div style={{ marginBottom: '1.25rem' }}>
        {!showAddProp ? (
          <button style={btn('ghost')} onClick={() => setShowAddProp(true)}>+ Add Property</button>
        ) : (
          <div style={card}>
            <p style={{ margin: '0 0 0.75rem', fontWeight: 600, fontSize: '0.9rem' }}>New Property</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.6rem' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <input style={inp} placeholder="Street address *" value={propForm.address}
                  onChange={e => setPropForm(p => ({ ...p, address: e.target.value }))} />
              </div>
              <input style={inp} placeholder="City" value={propForm.city}
                onChange={e => setPropForm(p => ({ ...p, city: e.target.value }))} />
              <input style={inp} placeholder="Region / Emirate" value={propForm.region}
                onChange={e => setPropForm(p => ({ ...p, region: e.target.value }))} />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button style={btn()} onClick={() => void addProperty()}>Save Property</button>
              <button style={btn('ghost')} onClick={() => setShowAddProp(false)}>Cancel</button>
            </div>
          </div>
        )}
      </div>

      {/* Status */}
      {loading && <p style={{ color: C.muted, fontSize: '0.875rem' }}>Loading properties...</p>}
      {err && <p style={{ color: C.danger, fontSize: '0.875rem' }}>Error: {err}</p>}
      {!loading && !err && properties.length === 0 && (
        <p style={{ color: C.muted, fontSize: '0.875rem' }}>No properties yet — add one to get started.</p>
      )}

      {/* Property cards */}
      {properties.map(prop => (
        <div key={prop.id} style={card}>
          {/* Property header row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <p style={{ margin: 0, fontWeight: 600, fontSize: '0.95rem' }}>{prop.address}</p>
              {(prop.city || prop.region) && (
                <p style={{ margin: '0.15rem 0 0', color: C.muted, fontSize: '0.8rem' }}>
                  {[prop.city, prop.region].filter(Boolean).join(', ')}
                </p>
              )}
            </div>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button
                style={btn('ghost')}
                onClick={() => {
                  setUploadFor(uploadFor === prop.id ? null : prop.id)
                  setClosingFor(null)
                  setUploadStatus('idle')
                  setUploadMsg('')
                  setLeaseFile(null)
                }}
              >
                ↑ Lease
              </button>
              <button
                style={btn('ghost')}
                onClick={() => {
                  setClosingFor(closingFor === prop.id ? null : prop.id)
                  setUploadFor(null)
                }}
              >
                + Closing
              </button>
            </div>
          </div>

          {/* Leases list */}
          {prop.leaseparse_leases.length > 0 && (
            <div style={{ marginBottom: '0.6rem' }}>
              <p style={{ margin: '0 0 0.3rem', fontSize: '0.7rem', color: C.muted, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Leases</p>
              {prop.leaseparse_leases.map(lease => (
                <div key={lease.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.3rem 0', borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: '0.85rem', color: C.body }}>
                    {lease.lease_type ?? 'lease'} ·{' '}
                    {lease.parsed_at ? (
                      <span style={{ color: C.success }}>
                        parsed {fmtDate(lease.parsed_at)} · {pct(lease.confidence_score ?? 0)} · {lease.engine}
                      </span>
                    ) : (
                      <span style={{ color: C.warn }}>not parsed</span>
                    )}
                  </span>
                  <Link href={`/dashboard/leases/${lease.id}`} style={{ color: C.accent, fontSize: '0.8rem', textDecoration: 'none' }}>
                    View →
                  </Link>
                </div>
              ))}
            </div>
          )}

          {/* Closings list */}
          {prop.closeflow_transactions.length > 0 && (
            <div style={{ marginBottom: '0.6rem' }}>
              <p style={{ margin: '0 0 0.3rem', fontSize: '0.7rem', color: C.muted, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Closings</p>
              {prop.closeflow_transactions.map(tx => (
                <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.3rem 0', borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: '0.85rem', color: C.body }}>
                    {TX_LABELS[tx.transaction_type] ?? tx.transaction_type} · closes {fmtDate(tx.closing_date)} ·{' '}
                    <span style={{ color: tx.status === 'active' ? C.success : C.muted }}>{tx.status}</span>
                  </span>
                  <Link href={`/dashboard/closings/${tx.id}`} style={{ color: C.accent, fontSize: '0.8rem', textDecoration: 'none' }}>
                    View →
                  </Link>
                </div>
              ))}
            </div>
          )}

          {/* Upload lease inline form */}
          {uploadFor === prop.id && (
            <div style={inlinePanel}>
              <p style={{ margin: '0 0 0.6rem', fontWeight: 600, fontSize: '0.875rem' }}>Upload lease — {prop.address}</p>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                <select style={{ ...inp, width: 'auto' }} value={leaseType} onChange={e => setLeaseType(e.target.value)}>
                  <option value="office">Office</option>
                  <option value="retail">Retail</option>
                  <option value="industrial">Industrial</option>
                  <option value="other">Other</option>
                </select>
                <input
                  type="file"
                  accept=".pdf"
                  style={{ color: C.muted, fontSize: '0.8rem' }}
                  onChange={e => setLeaseFile(e.target.files?.[0] ?? null)}
                />
              </div>
              {uploadStatus !== 'idle' && (
                <p style={{
                  fontSize: '0.8rem',
                  margin: '0 0 0.5rem',
                  color: uploadStatus === 'error' ? C.danger : uploadStatus === 'done' ? C.success : C.warn,
                }}>
                  {uploadMsg}
                </p>
              )}
              <button
                style={btn()}
                disabled={!leaseFile || uploadStatus === 'uploading' || uploadStatus === 'parsing'}
                onClick={() => void uploadLease(prop.id)}
              >
                {uploadStatus === 'uploading' ? 'Uploading...' : uploadStatus === 'parsing' ? 'Parsing...' : 'Upload & Parse'}
              </button>
            </div>
          )}

          {/* Add closing inline form */}
          {closingFor === prop.id && (
            <div style={inlinePanel}>
              <p style={{ margin: '0 0 0.6rem', fontWeight: 600, fontSize: '0.875rem' }}>New closing — {prop.address}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <select style={inp} value={closingForm.transaction_type}
                    onChange={e => setClosingForm(f => ({ ...f, transaction_type: e.target.value }))}>
                    <option value="residential_purchase">Residential Purchase</option>
                    <option value="residential_refi">Refinance</option>
                    <option value="commercial">Commercial</option>
                    <option value="exchange_1031">1031 Exchange</option>
                  </select>
                </div>
                <input type="date" style={inp} value={closingForm.closing_date}
                  onChange={e => setClosingForm(f => ({ ...f, closing_date: e.target.value }))} />
                <input style={inp} placeholder="State (FL)" maxLength={2} value={closingForm.state}
                  onChange={e => setClosingForm(f => ({ ...f, state: e.target.value.toUpperCase() }))} />
              </div>
              {closingStatus === 'error' && (
                <p style={{ fontSize: '0.8rem', color: C.danger, margin: '0 0 0.5rem' }}>Failed — check closing date is in the future.</p>
              )}
              <button style={btn()} disabled={closingStatus === 'saving'} onClick={() => void addClosing(prop.id)}>
                {closingStatus === 'saving' ? 'Creating...' : 'Create Checklist'}
              </button>
            </div>
          )}
        </div>
      ))}
    </main>
  )
}
