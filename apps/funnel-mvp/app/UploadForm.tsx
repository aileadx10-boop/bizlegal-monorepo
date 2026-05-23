'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type State = 'idle' | 'uploading' | 'extracting' | 'success' | 'error'

export function UploadForm() {
  const router = useRouter()
  const [state, setState] = useState<State>('idle')
  const [email, setEmail] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) {
      setError('Pick a contract file (PDF or DOCX)')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Valid email so we can email you the receipt + report link')
      return
    }
    setError(null)
    setState('uploading')

    const formData = new FormData()
    formData.append('file', file)
    formData.append('email', email.trim())

    try {
      setState('extracting')
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = (await res.json().catch(() => ({}))) as { jobId?: string; next_url?: string; error?: string }
      if (!res.ok || !data.jobId) {
        setError(data.error ?? `upload failed (${res.status})`)
        setState('error')
        return
      }
      setState('success')
      router.push(data.next_url ?? `/report/${data.jobId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'network error')
      setState('error')
    }
  }

  return (
    <form onSubmit={submit} className="card">
      <div className="label-row">
        <label htmlFor="contract-file">Contract file (PDF or DOCX, max 4MB)</label>
        <input
          id="contract-file"
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          disabled={state === 'uploading' || state === 'extracting'}
        />
        {file && (
          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-subtle)' }}>
            {file.name} · {(file.size / 1024).toFixed(0)} KB
          </p>
        )}
      </div>

      <div className="label-row">
        <label htmlFor="email">Email (for the receipt + report link)</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          autoComplete="email"
          required
          disabled={state === 'uploading' || state === 'extracting'}
        />
      </div>

      {error && (
        <p role="alert" style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 12 }}>
          {error}
        </p>
      )}

      <button type="submit" className="btn" disabled={state !== 'idle' && state !== 'error'}>
        {state === 'idle' && 'Get free preview →'}
        {state === 'uploading' && 'Uploading…'}
        {state === 'extracting' && 'Reviewing your contract (~15s)…'}
        {state === 'success' && 'Redirecting…'}
        {state === 'error' && 'Try again'}
      </button>

      <p style={{ margin: '12px 0 0', fontSize: 11, color: 'var(--text-subtle)', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>
        no card needed for preview · we never train on your documents
      </p>
    </form>
  )
}
