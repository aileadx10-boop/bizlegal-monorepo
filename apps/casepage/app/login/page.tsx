'use client'
import { useState } from 'react'

export default function LoginPage() {
  const [err, setErr] = useState<string | null>(null)
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const email = (form.email as unknown as HTMLInputElement).value
    const res = await fetch('/api/auth/session', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email }) })
    const data = await res.json()
    if (res.ok && data.token) {
      document.cookie = `cp_session=${data.token}; path=/; SameSite=Lax`
      window.location.href = '/dashboard'
    } else {
      setErr(data.error ?? 'signin_failed')
    }
  }
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 480, margin: '3rem auto', padding: '0 1rem' }}>
      <h1>Sign in to CasePage</h1>
      <p>Demo session (local token; real auth needs Supabase/email provider later).</p>
      {err && <p style={{ color: 'red' }}>{err}</p>}
      <form onSubmit={submit}>
        <input name="email" type="email" placeholder="you@firm.com" required />
        <button type="submit">Continue</button>
      </form>
    </main>
  )
}
