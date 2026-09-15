'use client'
import { useState } from 'react'
import { GALLERY_SEEDS } from '@/data/gallery'

export interface MatterRow {
  id: string
  title: string
  template: string
  jurisdiction: string
  milestones: Array<{ title: string; doneAt: string | null }>
}

export default function PagesClient({ pages }: { pages: MatterRow[] }) {
  const [items, setItems] = useState(pages)
  const [err, setErr] = useState<string | null>(null)

  async function createPage(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const title = (form.title as unknown as HTMLInputElement).value
    const template = (form.template as unknown as HTMLInputElement).value
    const jurisdiction = (form.jurisdiction as unknown as HTMLInputElement).value
    const milestones = GALLERY_SEEDS.find((g) => g.slug === template)
      ? [{ title: 'Signed', doneAt: null }, { title: 'In progress', doneAt: null }]
      : []
    const res = await fetch('C:/Users/Moshe Dor/bizlegal-monorepo/apps/casepage/app/api/pages/route.ts', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ title, template, jurisdiction, milestones }) })
    const data = await res.json()
    if (res.ok) { form.reset(); window.location.reload() }
    else if (data.paywall) { setErr('Free limit reached. Upgrade to create more pages: /pricing') }
    else setErr(data.error ?? 'failed')
  }

  async function setMilestoneDone(id: string, idx: number) {
    const next = items.map((p) => p.id === id ? { ...p, milestones: p.milestones.map((m, i) => i === idx ? { ...m, doneAt: new Date().toISOString() } : m) } : p)
    setItems(next)
    await fetch(`/api/pages/${id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ milestones: next.find((p) => p.id === id)?.milestones }) })
  }

  return (
    <>
      {err && <p style={{ color: 'red' }}>{err}</p>}
      <h3>Your matter pages</h3>
      <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1rem' }}>
        {items.map((p) => (
          <div key={p.id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: '1rem' }}>
            <strong>{p.title}</strong> <span style={{ fontSize: '0.8rem', color: '#888' }}>#{p.template} · {p.jurisdiction}</span>
            <ul>
              {p.milestones.map((m, i) => (
                <li key={i}>
                  {m.title} — {m.doneAt ? 'done ✓' : <button onClick={() => setMilestoneDone(p.id, i)}>mark done</button>}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <form onSubmit={createPage} style={{ borderTop: '1px solid #ddd', paddingTop: '1rem' }}>
        <strong>New matter page</strong><br />
        <input name="title" placeholder="Matter title (e.g. Smith closing)" required /><br />
        <input name="template" list="templates" placeholder="Template slug (e.g. residential-closing-dubai)" required />
        <datalist id="templates">
          {GALLERY_SEEDS.map((g) => <option key={g.slug} value={g.slug} />)}
        </datalist>
        <br />
        <input name="jurisdiction" placeholder="Jurisdiction (e.g. us / dubai)" defaultValue="us" /><br />
        <button type="submit">Create page</button>
      </form>
    </>
  )
}
