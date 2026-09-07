'use client'

import { useEffect, useState } from 'react'
import { t, dirFor, langFor, type Locale } from '@/lib/i18n'

/**
 * One intake form, both languages.
 *
 * Hebrew and English render from the same dictionary keys, so a field added to
 * one can never quietly go missing from the other. The document direction is
 * re-stamped for English because the root layout is Hebrew/RTL — English text
 * laid out right-to-left reads as broken software.
 *
 * There is no calendar widget and no "book a call" anywhere on this page by
 * design: the founder does not take calls, and the conversion here is a written
 * brief answered with a written proposal.
 */
export default function IntakeForm({ locale }: { locale: Locale }) {
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')

  useEffect(() => {
    if (locale === 'he-IL') return
    const el = document.documentElement
    const prevLang = el.lang
    const prevDir = el.dir
    el.lang = langFor(locale)
    el.dir = dirFor(locale)
    return () => {
      el.lang = prevLang
      el.dir = prevDir
    }
  }, [locale])

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setState('sending')
    const form = new FormData(event.currentTarget)
    try {
      const res = await fetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...Object.fromEntries(form.entries()), locale }),
      })
      setState(res.ok ? 'done' : 'error')
    } catch {
      setState('error')
    }
  }

  if (state === 'done') {
    return (
      <main>
        <h1>{t(locale, 'intake.h1')}</h1>
        <div className="card">
          <p>{t(locale, 'intake.thanks')}</p>
        </div>
      </main>
    )
  }

  const field = (name: string, key: Parameters<typeof t>[1], extra: Record<string, unknown> = {}) => (
    <label className="field">
      <span>{t(locale, key)}</span>
      <input name={name} {...extra} />
    </label>
  )

  return (
    <main>
      <h1>{t(locale, 'intake.h1')}</h1>
      <p className="muted" style={{ marginBottom: '1.5rem' }}>
        {t(locale, 'intake.sub')}
      </p>

      <form onSubmit={submit} className="card">
        {field('name', 'intake.name', { required: true, maxLength: 120, autoComplete: 'name' })}
        {field('email', 'intake.email', { type: 'email', required: true, maxLength: 200, autoComplete: 'email' })}
        {field('phone', 'intake.phone', { maxLength: 40, autoComplete: 'tel' })}
        {field('deals_per_month', 'intake.deals_per_month', { maxLength: 40, inputMode: 'numeric' })}
        {field('next_signing', 'intake.next_signing', { maxLength: 60 })}

        <label className="field">
          <span>{t(locale, 'intake.notes')}</span>
          <textarea name="notes" maxLength={2000} />
        </label>

        {state === 'error' && (
          <p style={{ color: 'var(--danger)', fontSize: '0.875rem' }}>{t(locale, 'intake.error')}</p>
        )}

        <button className="btn" type="submit" disabled={state === 'sending'}>
          {state === 'sending' ? t(locale, 'intake.sending') : t(locale, 'intake.submit')}
        </button>
      </form>

      <footer>
        <p className="muted">{t(locale, 'landing.disclaimer')}</p>
      </footer>
    </main>
  )
}
