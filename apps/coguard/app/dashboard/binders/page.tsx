'use client'

import { useState } from 'react'

interface Binder {
  id: string
  status: string
  pdf_url?: string
  message_count?: number
  bates_start?: number
  bates_end?: number
  created_at: string
}

export default function BindersPage() {
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [loading, setLoading] = useState(false)
  const [binders, setBinders] = useState<Binder[]>([])
  const [error, setError] = useState('')
  const [generated, setGenerated] = useState<string | null>(null)

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/binder/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date_from: dateFrom, date_to: dateTo }),
      })
      const data = await res.json() as { binder_id?: string; error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Failed to start binder')
      setGenerated(data.binder_id ?? null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
    } finally {
      setLoading(false)
    }
  }

  async function checkStatus(binderId: string) {
    try {
      const res = await fetch(`/api/binder/status/${binderId}`)
      const data = await res.json() as Binder
      setBinders(prev => {
        const idx = prev.findIndex(b => b.id === binderId)
        if (idx >= 0) return prev.map(b => b.id === binderId ? data : b)
        return [data, ...prev]
      })
    } catch { /* silent */ }
  }

  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: 'clamp(2rem, 4vw, 3rem) 1.5rem' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Court Binders</h1>

      <form onSubmit={handleGenerate} style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 32, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Generate new binder</h2>
        <p style={{ margin: 0, color: '#6b7280', fontSize: 14 }}>
          Includes all logged communications in the date range with SHA-256 verification, Bates numbering, and an attorney access code.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>From date</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} required style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14 }} />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>To date</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} required style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14 }} />
          </div>
        </div>
        {error && <p style={{ color: '#dc2626', fontSize: 14, margin: 0 }}>{error}</p>}
        {generated && (
          <div style={{ background: '#f0fdf4', border: '1px solid #a7f3d0', borderRadius: 8, padding: 12, fontSize: 14, color: '#065f46' }}>
            Binder is generating… ID: <code>{generated}</code>
            <button type="button" onClick={() => checkStatus(generated)} style={{ marginLeft: 12, fontSize: 13, color: '#059669', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
              Check status
            </button>
          </div>
        )}
        <button type="submit" disabled={loading || !dateFrom || !dateTo} style={{ alignSelf: 'flex-start', background: '#111827', color: '#fff', padding: '10px 20px', borderRadius: 7, fontWeight: 600, fontSize: 14, border: 'none', cursor: loading || !dateFrom || !dateTo ? 'not-allowed' : 'pointer', opacity: loading || !dateFrom || !dateTo ? 0.6 : 1 }}>
          {loading ? 'Requesting…' : 'Generate binder →'}
        </button>
      </form>

      {binders.length > 0 && (
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 14 }}>Your binders</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {binders.map(b => (
              <div key={b.id} style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{b.created_at.slice(0, 10)}</div>
                  <div style={{ fontSize: 13, color: '#6b7280' }}>
                    {b.message_count ?? '–'} messages · Bates {b.bates_start ?? '?'}–{b.bates_end ?? '?'}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 9999, background: b.status === 'ready' ? '#d1fae5' : b.status === 'failed' ? '#fee2e2' : '#fef3c7', color: b.status === 'ready' ? '#065f46' : b.status === 'failed' ? '#991b1b' : '#92400e' }}>
                    {b.status}
                  </span>
                  {b.status === 'ready' && b.pdf_url && (
                    <a href={b.pdf_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}>
                      Download PDF →
                    </a>
                  )}
                  {b.status === 'generating' && (
                    <button onClick={() => checkStatus(b.id)} style={{ fontSize: 13, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                      Refresh
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  )
}
