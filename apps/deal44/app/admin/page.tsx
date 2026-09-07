'use client'

import { useState } from 'react'

/**
 * Phase-0 room builder. Moses only.
 *
 * Deliberately plain: this exists so ten rooms can be created by hand in week
 * one without a login system on the critical path. The secret is typed in and
 * held in component state, never stored — the route checks it server-side.
 *
 * Phase 1 deletes this page in favour of a magic-link broker dashboard calling
 * the same `createRoom()`.
 */

interface PersonDraft {
  role: string
  name: string
  email: string
}

const ROLES = ['broker', 'buyer', 'seller', 'buyer_lawyer', 'seller_lawyer', 'mortgage_broker']

export default function AdminPage() {
  const [secret, setSecret] = useState('')
  const [title, setTitle] = useState('')
  const [signing, setSigning] = useState('')
  const [closing, setClosing] = useState('')
  const [templateId, setTemplateId] = useState('')
  const [broker, setBroker] = useState<PersonDraft>({ role: 'broker', name: '', email: '' })
  const [parties, setParties] = useState<PersonDraft[]>([{ role: 'buyer', name: '', email: '' }])
  const [result, setResult] = useState<string>('')
  const [busy, setBusy] = useState(false)

  function updateParty(index: number, patch: Partial<PersonDraft>) {
    setParties((rows) => rows.map((row, i) => (i === index ? { ...row, ...patch } : row)))
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    setResult('')
    const anchors: Record<string, string> = {}
    if (signing) anchors.signing = signing
    if (closing) anchors.closing = closing

    try {
      const res = await fetch('/api/admin/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-internal-secret': secret },
        body: JSON.stringify({
          title,
          locale: 'he-IL',
          currency: 'ILS',
          template_id: templateId || null,
          anchors,
          broker,
          parties: parties.filter((p) => p.email && p.name),
          send_invites: false,
        }),
      })
      setResult(JSON.stringify(await res.json(), null, 2))
    } catch (err) {
      setResult(String(err))
    } finally {
      setBusy(false)
    }
  }

  const person = (value: PersonDraft, onChange: (patch: Partial<PersonDraft>) => void, lockRole = false) => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
      <select value={value.role} onChange={(e) => onChange({ role: e.target.value })} disabled={lockRole}>
        {ROLES.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
      <input placeholder="name" value={value.name} onChange={(e) => onChange({ name: e.target.value })} />
      <input placeholder="email" value={value.email} onChange={(e) => onChange({ email: e.target.value })} />
    </div>
  )

  return (
    <main dir="ltr" lang="en">
      <h1>Create a room</h1>
      <p className="muted">
        Phase 0 only. Invites stay off: the links come back below and are forwarded by hand until the
        spam-law position is confirmed. Tokens are shown once and are not recoverable.
      </p>

      <form onSubmit={submit} className="card">
        <label className="field">
          <span>Internal secret</span>
          <input type="password" value={secret} onChange={(e) => setSecret(e.target.value)} />
        </label>
        <label className="field">
          <span>Room title</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>
        <label className="field">
          <span>Template (blank = manual room, no template dates)</span>
          <input
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
            placeholder="il-residential"
          />
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          <label className="field">
            <span>Signing date</span>
            <input type="date" value={signing} onChange={(e) => setSigning(e.target.value)} />
          </label>
          <label className="field">
            <span>Delivery / closing date</span>
            <input type="date" value={closing} onChange={(e) => setClosing(e.target.value)} />
          </label>
        </div>

        <p className="label" style={{ marginBottom: '0.4rem' }}>
          Broker
        </p>
        {person(broker, (patch) => setBroker((b) => ({ ...b, ...patch })), true)}

        <p className="label" style={{ margin: '0.8rem 0 0.4rem' }}>
          Parties
        </p>
        {parties.map((p, i) => (
          <div key={i}>{person(p, (patch) => updateParty(i, patch))}</div>
        ))}
        <p>
          <button
            type="button"
            className="btn"
            style={{ background: 'var(--border)' }}
            onClick={() => setParties((rows) => [...rows, { role: 'seller', name: '', email: '' }])}
          >
            Add party
          </button>
        </p>

        <button className="btn" type="submit" disabled={busy}>
          {busy ? 'Creating...' : 'Create room'}
        </button>
      </form>

      {result && (
        <pre className="card" style={{ whiteSpace: 'pre-wrap', fontSize: '0.8rem', overflowX: 'auto' }}>
          {result}
        </pre>
      )}
    </main>
  )
}
