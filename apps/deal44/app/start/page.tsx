'use client'

import { useState } from 'react'
import { t } from '@/lib/i18n'

/**
 * Async intake. Five fields, one button, no calendar widget.
 *
 * The founder does not take calls and never books one, so the conversion here is
 * a written brief he answers with a written proposal and an invoice. A "book a
 * demo" button would be a dead end that also contradicts the operating book.
 */

const L = 'he-IL' as const

export default function StartPage() {
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setState('sending')
    const form = new FormData(event.currentTarget)
    try {
      const res = await fetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(form.entries())),
      })
      setState(res.ok ? 'done' : 'error')
    } catch {
      setState('error')
    }
  }

  if (state === 'done') {
    return (
      <main>
        <h1>{t(L, 'intake.h1')}</h1>
        <div className="card">
          <p>{t(L, 'intake.thanks')}</p>
        </div>
      </main>
    )
  }

  return (
    <main>
      <h1>{t(L, 'intake.h1')}</h1>
      <p className="muted" style={{ marginBottom: '1.5rem' }}>
        {t(L, 'intake.sub')}
      </p>

      <form onSubmit={submit} className="card">
        <label className="field">
          <span>{t(L, 'intake.name')}</span>
          <input name="name" required maxLength={120} autoComplete="name" />
        </label>
        <label className="field">
          <span>{t(L, 'intake.email')}</span>
          <input name="email" type="email" required maxLength={200} autoComplete="email" />
        </label>
        <label className="field">
          <span>{t(L, 'intake.phone')}</span>
          <input name="phone" maxLength={40} autoComplete="tel" />
        </label>
        <label className="field">
          <span>{t(L, 'intake.deals_per_month')}</span>
          <input name="deals_per_month" maxLength={40} inputMode="numeric" />
        </label>
        <label className="field">
          <span>{t(L, 'intake.next_signing')}</span>
          <input name="next_signing" maxLength={60} />
        </label>
        <label className="field">
          <span>{t(L, 'intake.notes')}</span>
          <textarea name="notes" maxLength={2000} />
        </label>

        {state === 'error' && (
          <p style={{ color: 'var(--danger)', fontSize: '0.875rem' }}>{t(L, 'intake.error')}</p>
        )}

        <button className="btn" type="submit" disabled={state === 'sending'}>
          {state === 'sending' ? t(L, 'intake.sending') : t(L, 'intake.submit')}
        </button>
      </form>

      <footer>
        <p className="muted">{t(L, 'landing.disclaimer')}</p>
      </footer>
    </main>
  )
}
