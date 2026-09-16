'use client'

import { useState } from 'react'

interface ProfileRow {
  id: string
  market_slug: string
  market_name: string
  label: string
  keywords: string[]
}

interface MarketRow {
  slug: string
  name: string
}

const MAX_PROFILES = 5

export default function ProfilesClient({ initialProfiles, markets }: { initialProfiles: readonly ProfileRow[]; markets: readonly MarketRow[] }): JSX.Element {
  const [profiles, setProfiles] = useState<readonly ProfileRow[]>(initialProfiles)
  const [marketSlug, setMarketSlug] = useState(markets[0]?.slug ?? '')
  const [label, setLabel] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function add(e: React.FormEvent): Promise<void> {
    e.preventDefault()
    if (!label.trim() || !marketSlug) return
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/radar/profiles', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ market_slug: marketSlug, label: label.trim() }),
      })
      const json = (await res.json()) as { ok?: boolean; id?: string; error?: string }
      if (!json.ok) {
        setError(json.error === 'profile_limit_reached' ? `You’ve reached the ${MAX_PROFILES}-profile limit.` : json.error ?? 'Could not add profile.')
        return
      }
      const market = markets.find((m) => m.slug === marketSlug)
      setProfiles((prev) => [...prev, { id: json.id!, market_slug: marketSlug, market_name: market?.name ?? marketSlug, label: label.trim(), keywords: [] }])
      setLabel('')
    } catch {
      setError('Network error — try again.')
    } finally {
      setBusy(false)
    }
  }

  async function remove(id: string): Promise<void> {
    setProfiles((prev) => prev.filter((p) => p.id !== id))
    await fetch(`/api/radar/profiles/${id}`, { method: 'DELETE' }).catch(() => {})
  }

  return (
    <div>
      <div className="bx-grid" style={{ gap: 10, marginBottom: 24 }}>
        {profiles.map((p) => (
          <div key={p.id} className="bx-card bx-card--flat" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontWeight: 600 }}>{p.label}</p>
              <p className="bx-eyebrow">{p.market_name}</p>
            </div>
            <button className="bx-btn-ghost" style={{ padding: '6px 14px', fontSize: 12 }} onClick={() => remove(p.id)}>Remove</button>
          </div>
        ))}
        {profiles.length === 0 && <p className="bx-muted" style={{ fontSize: 13 }}>No profiles yet — your radar shows all three verticals by default.</p>}
      </div>

      {profiles.length < MAX_PROFILES ? (
        <form onSubmit={add} className="bx-form" style={{ maxWidth: 420 }}>
          <label className="bx-label" htmlFor="market">Vertical</label>
          <select id="market" className="bx-input" value={marketSlug} onChange={(e) => setMarketSlug(e.target.value)} style={{ marginBottom: 10 }}>
            {markets.map((m) => <option key={m.slug} value={m.slug}>{m.name}</option>)}
          </select>
          <label className="bx-label" htmlFor="label">Label</label>
          <input id="label" className="bx-input" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Title company compliance" />
          <button type="submit" className="bx-btn-primary" style={{ marginTop: 12 }} disabled={busy}>{busy ? 'Adding…' : 'Add profile'}</button>
          {error && <p className="bx-notice bx-notice--error">{error}</p>}
        </form>
      ) : (
        <p className="bx-muted" style={{ fontSize: 13 }}>Profile limit reached ({MAX_PROFILES}/{MAX_PROFILES}).</p>
      )}
    </div>
  )
}
