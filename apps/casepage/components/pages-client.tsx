'use client'
import { useState } from 'react'
import { GALLERY_SEEDS } from '@/data/gallery'

export interface MatterRow {
  id: string
  title: string
  template: string
  jurisdiction: string
  milestones: Array<{ title: string; doneAt: string | null }>
  status: 'draft' | 'live' | 'archived'
  publicUrl: string
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
    const res = await fetch('/api/pages', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ title, template, jurisdiction, milestones }) })
    const data = await res.json()
    if (res.ok) { form.reset(); window.location.reload() }
    else if (data.paywall) { setErr('Page limit reached. Upgrade at /pricing to create more pages.') }
    else setErr(data.error ?? 'failed')
  }

  async function setMilestoneDone(id: string, idx: number) {
    const next = items.map((p) => p.id === id ? { ...p, milestones: p.milestones.map((m, i) => i === idx ? { ...m, doneAt: new Date().toISOString() } : m) } : p)
    setItems(next)
    await fetch(`/api/pages/${id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ milestones: next.find((p) => p.id === id)?.milestones }) })
  }

  async function setStatus(id: string, status: MatterRow['status']) {
    const res = await fetch(`/api/pages/${id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setErr(data.error ?? 'status_update_failed')
      return
    }
    setItems((current) => current.map((page) => page.id === id ? { ...page, status } : page))
  }

  return (
    <>
      {err && <p style={{ color: 'red' }}>{err}</p>}
      <h3>Your matter pages</h3>
      <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1rem' }}>
        {items.map((p) => (
          <div key={p.id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: '1rem' }}>
            <strong>{p.title}</strong> <span style={{ fontSize: '0.8rem', color: '#888' }}>#{p.template} · {p.jurisdiction}</span>
            <div style={{ marginTop: '0.5rem' }}>
              {p.status === 'live' ? (
                <>
                  <a href={p.publicUrl} target="_blank" rel="noreferrer">Open client page</a>{' '}
                  <button onClick={() => setStatus(p.id, 'draft')}>Unpublish</button>
                </>
              ) : (
                <button onClick={() => setStatus(p.id, 'live')}>Publish client page</button>
              )}
            </div>
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
