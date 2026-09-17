'use client'
import { useState } from 'react'

export default function LoginPage() {
  const [err, setErr] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const email = (form.email as unknown as HTMLInputElement).value
    const res = await fetch('/api/auth/session', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email }) })
    const data = await res.json()
    if (res.ok) {
      if (data.verify_url) window.location.href = data.verify_url
      else setSent(true)
    } else {
      setErr(data.error ?? 'signin_failed')
    }
  }
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 480, margin: '3rem auto', padding: '0 1rem' }}>
      <h1>Sign in to SinceFiled</h1>
      <p>We will email a private, 15-minute sign-in link.</p>
      {err && <p style={{ color: 'red' }}>{err}</p>}
      {sent ? <p>Check your inbox for the sign-in link.</p> : <form onSubmit={submit}>
        <input name="email" type="email" placeholder="you@firm.com" required />
        <button type="submit">Continue</button>
      </form>}
    </main>
  )
}
