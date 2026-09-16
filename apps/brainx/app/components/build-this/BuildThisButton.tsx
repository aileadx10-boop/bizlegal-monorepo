'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  readonly opportunityId: string
  readonly requestable: boolean
  readonly existingRequestId: string | null
}

type State = 'idle' | 'confirming' | 'submitting' | 'requested' | 'quota' | 'error'

export default function BuildThisButton({ opportunityId, requestable, existingRequestId }: Props): JSX.Element {
  const router = useRouter()
  const [state, setState] = useState<State>(existingRequestId ? 'requested' : 'idle')
  const [detail, setDetail] = useState<string | null>(null)

  async function confirm(): Promise<void> {
    setState('submitting')
    try {
      const res = await fetch('/api/build-this/request', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ opportunity_id: opportunityId }),
      })
      const json = (await res.json()) as { ok?: boolean; error?: string; limit?: number; used?: number; resets_at?: string }
      if (res.status === 201 && json.ok) {
        setState('requested')
        router.refresh()
        return
      }
      if (res.status === 402) {
        setState('quota')
        const resetDate = json.resets_at ? new Date(json.resets_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'next month'
        setDetail(`${json.used}/${json.limit} this month — resets ${resetDate}. Upgrade to Radar + Build for unlimited briefs.`)
        return
      }
      setState('error')
      setDetail(json.error ?? 'Something went wrong.')
    } catch {
      setState('error')
      setDetail('Network error — try again.')
    }
  }

  if (!requestable && state !== 'requested') {
    return <p className="bx-muted" style={{ fontSize: 13 }}>BUILD THIS is for subscribers. <a href="/pricing" className="bx-link">See pricing →</a></p>
  }

  if (state === 'requested') {
    return <p className="bx-notice bx-notice--ok" style={{ display: 'inline-block' }}>Brief requested — within 3 business days. We&apos;ll email you when it&apos;s ready.</p>
  }

  if (state === 'quota') {
    return <p className="bx-notice bx-notice--warn" style={{ display: 'inline-block' }}>{detail}</p>
  }

  if (state === 'confirming') {
    return (
      <div className="bx-card" style={{ maxWidth: 420 }}>
        <p style={{ fontSize: 14, marginBottom: 14 }}>
          BrainX writes an offer, buyer profile, deliverable, pricing hypothesis, sales angle, landing-page brief, delivery workflow, evidence pack and next actions — every claim cited to this opportunity&apos;s evidence. Turnaround: <strong>within 3 business days.</strong>
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="bx-btn-primary" onClick={confirm}>Request the brief</button>
          <button className="bx-btn-ghost" onClick={() => setState('idle')}>Cancel</button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <button className="bx-btn-primary" onClick={() => setState('confirming')} disabled={state === 'submitting'}>
        {state === 'submitting' ? 'Requesting…' : 'BUILD THIS →'}
      </button>
      {state === 'error' && <p className="bx-notice bx-notice--error">{detail}</p>}
    </div>
  )
}
