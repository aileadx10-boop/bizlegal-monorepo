'use client'
import { useState } from 'react'

interface ObligationRow {
  id: string
  obligationType: string
  jurisdiction: string
  daysSince: number
  predictedDue: string | null
}

export default function ObligationsClient({ rows }: { rows: ObligationRow[] }) {
  const [items, setItems] = useState(rows)
  const [err, setErr] = useState<string | null>(null)

  async function addObligation(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const obligationType = (form.obligationType as unknown as HTMLInputElement).value
    const intervalDays = Number((form.intervalDays as unknown as HTMLInputElement).value)
    const jurisdiction = (form.jurisdiction as unknown as HTMLInputElement).value
    const res = await fetch('/api/obligations', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ obligationType, intervalDays, jurisdiction }) })
    const data = await res.json()
    if (res.ok) { window.location.reload() }
    else if (data.paywall) { setErr('Free tier covers up to 3 obligations. Upgrade to add more: /pricing') }
    else setErr(data.error ?? 'failed')
  }

  async function logDone(id: string) {
    await fetch(`/api/events/${id}`, { method: 'POST' })
    window.location.reload()
  }

  return (
    <>
      <div>
        <h3>Obligations</h3>
        {err && <p style={{ color: 'red' }}>{err}</p>}
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr><th style={{ border: '1px solid #ddd', padding: 8 }}>Obligation</th><th>Jurisdiction</th><th>Days since</th><th>Predicted due</th><th></th></tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.id}>
                <td style={{ border: '1px solid #ddd', padding: 8 }}>{r.obligationType}</td>
                <td style={{ border: '1px solid #ddd', padding: 8 }}>{r.jurisdiction}</td>
                <td style={{ border: '1px solid #ddd', padding: 8 }}>{r.daysSince}</td>
                <td style={{ border: '1px solid #ddd', padding: 8 }}>{r.predictedDue ? new Date(r.predictedDue).toLocaleDateString() : 'n/a'}</td>
                <td style={{ border: '1px solid #ddd', padding: 8 }}><button onClick={() => logDone(r.id)}>Log done</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <form onSubmit={addObligation} style={{ marginTop: '1rem', borderTop: '1px solid #ddd', paddingTop: '1rem' }}>
        <strong>Add obligation</strong><br />
        <input name="obligationType" placeholder="Obligation type (e.g. Trust recon)" required /><br />
        <input name="intervalDays" type="number" placeholder="Interval days (e.g. 90)" required /><br />
        <input name="jurisdiction" placeholder="Jurisdiction (e.g. US)" required /><br />
        <button type="submit">Add</button>
      </form>
    </>
  )
}
