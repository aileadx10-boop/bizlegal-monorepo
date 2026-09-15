'use client'
import { useState } from 'react'
import { readFirmState } from '@/lib/state/store'

export default async function EmailTokenPage() {
  const firm = await readFirmState()
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 520, margin: '3rem auto', padding: '0 1rem' }}>
      <h1>Email log tokens (demo)</h1>
      <p>Generate an opaque token per obligation for future email reply-to-log.</p>
      <EmailTokenForm firmName={firm.firmName} obligations={firm.obligations.map((o) => ({ id: o.id, obligationType: o.obligationType }))} />
    </main>
  )
}

function EmailTokenForm({ firmName, obligations }: { firmName: string; obligations: Array<{ id: string; obligationType: string }> }) {
  const [msg, setMsg] = useState<string | null>(null)
  async function gen(id: string) {
    const res = await fetch('/api/emails/token', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ obligationId: id }) })
    const data = await res.json()
    setMsg(data.ok ? `token: ${data.token}` : (data.error ?? 'failed'))
  }
  return (
    <>
      <p>Firm: {firmName}</p>
      {msg && <pre>{msg}</pre>}
      <ul>
        {obligations.map((o) => (
          <li key={o.id}>{o.obligationType} <button onClick={() => gen(o.id)}>Generate token</button></li>
        ))}
      </ul>
    </>
  )
}
