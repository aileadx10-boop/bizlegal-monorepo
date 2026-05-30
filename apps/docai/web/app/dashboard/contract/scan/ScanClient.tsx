'use client'

import { useState, useCallback } from 'react'

type ScanState = 'idle' | 'uploading' | 'scanning' | 'done' | 'error'

interface ScanResult {
  scan_id: string
  risk_level: string
  risk_score: number
  preview_issues: unknown[]
  total_issues: number
}

export default function ScanClient({ email }: { email: string }) {
  const [state, setState] = useState<ScanState>('idle')
  const [result, setResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState('')

  const handleFile = useCallback(async (file: File) => {
    setState('uploading')
    setError('')

    try {
      const text = await file.text()

      setState('scanning')
      const res = await fetch('/api/documents/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          filename: file.name,
          document_text: text.slice(0, 90000),
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Scan failed' }))
        throw new Error(err.error || 'Scan failed')
      }

      const data = await res.json()
      setResult(data)
      setState('done')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
      setState('error')
    }
  }, [email])

  return (
    <div>
      {state === 'idle' || state === 'error' ? (
        <div
          style={{
            border: '2px dashed var(--bl-border, #d0d0d0)',
            borderRadius: 12,
            padding: '3rem 2rem',
            textAlign: 'center',
            cursor: 'pointer',
          }}
          onDragOver={e => e.preventDefault()}
          onDrop={e => {
            e.preventDefault()
            const file = e.dataTransfer.files[0]
            if (file) handleFile(file)
          }}
          onClick={() => {
            const input = document.createElement('input')
            input.type = 'file'
            input.accept = '.pdf,.docx,.txt'
            input.onchange = () => { if (input.files?.[0]) handleFile(input.files[0]) }
            input.click()
          }}
        >
          <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            Drop a contract here or click to upload
          </p>
          <p style={{ color: 'var(--bl-text-muted, #888)', fontSize: '0.9rem' }}>
            PDF, DOCX, or TXT — up to 90,000 characters
          </p>
          {state === 'error' && (
            <p style={{ color: 'var(--bl-danger, #dc2626)', marginTop: '1rem' }}>{error}</p>
          )}
        </div>
      ) : state === 'uploading' || state === 'scanning' ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>
            {state === 'uploading' ? 'Uploading...' : 'Analyzing contract...'}
          </p>
          <p style={{ color: 'var(--bl-text-muted, #888)', fontSize: '0.9rem' }}>
            This may take 15-30 seconds.
          </p>
        </div>
      ) : result ? (
        <div style={{
          padding: '1.5rem',
          borderRadius: 10,
          border: '1px solid var(--bl-border, #e2e2e2)',
          background: 'var(--bl-surface, #fff)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontWeight: 600, margin: 0 }}>Scan Complete</h3>
            <span style={{
              padding: '0.25rem 0.75rem',
              borderRadius: 6,
              fontWeight: 600,
              fontSize: '0.85rem',
              background: result.risk_level === 'critical' ? '#fecaca' : result.risk_level === 'high' ? '#fed7aa' : '#d1fae5',
              color: result.risk_level === 'critical' ? '#991b1b' : result.risk_level === 'high' ? '#9a3412' : '#065f46',
            }}>
              {result.risk_level.toUpperCase()} — Score {result.risk_score}/100
            </span>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--bl-text-muted, #666)', marginBottom: '1rem' }}>
            Found {result.total_issues} issues. Showing preview of first {result.preview_issues.length}.
          </p>
          <a
            href={`/dashboard/reports/${result.scan_id}`}
            style={{
              display: 'inline-block',
              padding: '0.6rem 1.5rem',
              borderRadius: 8,
              background: 'var(--bl-accent, #2563eb)',
              color: '#fff',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '0.9rem',
            }}
          >
            View Full Report
          </a>
        </div>
      ) : null}
    </div>
  )
}
