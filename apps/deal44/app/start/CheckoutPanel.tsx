'use client'

import { useState } from 'react'
import { t, type Locale } from '@/lib/i18n'
import { fmtMoney } from '@/lib/i18n/format'
import {
  CURRENCIES,
  optionFor,
  railAllowed,
  type Deal44Currency,
  type Gateway,
} from '@/lib/checkout/rails'

/**
 * Self-serve purchase of one room, in either currency.
 *
 * The written brief above this panel stays the main path — a broker who wants
 * a proposal first still gets one, and still never gets a phone call. This is
 * for the one who has already decided.
 *
 * The card button is not rendered for shekels. That is the rail, not a policy:
 * PayPal cannot receive ILS, so the button would open a checkout that could
 * never settle. The panel says so and points at the invoice instead, rather
 * than showing a disabled control with no explanation.
 */
export default function CheckoutPanel({ locale }: { locale: Locale }) {
  const [currency, setCurrency] = useState<Deal44Currency>(
    locale === 'he-IL' ? 'ILS' : 'USD',
  )
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'working' | 'error'>('idle')

  const option = optionFor(currency)
  const price = fmtMoney(locale, option.amountMinorUnits, currency)
  const emailOk = email.includes('@')

  async function start(gateway: Gateway) {
    setState('working')
    try {
      const res = await fetch('/api/checkout/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currency, user_email: email, gateway }),
      })
      const data = (await res.json()) as { ok?: boolean; checkout_url?: string }
      if (data.ok && typeof data.checkout_url === 'string') {
        window.location.href = data.checkout_url
        return
      }
      setState('error')
    } catch {
      setState('error')
    }
  }

  return (
    <section className="card" aria-labelledby="buy-h2">
      <h2 id="buy-h2" style={{ marginBlockEnd: '0.4rem' }}>
        {t(locale, 'buy.h2')}
      </h2>
      <p className="muted">{t(locale, 'buy.price', { price })}</p>

      <label className="field">
        <span>{t(locale, 'buy.currency')}</span>
        <select
          name="currency"
          value={currency}
          onChange={(e) => setCurrency(e.target.value as Deal44Currency)}
        >
          {CURRENCIES.map((code) => (
            <option key={code} value={code}>
              {t(locale, code === 'ILS' ? 'buy.currency.ils' : 'buy.currency.usd')}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>{t(locale, 'buy.email')}</span>
        <input
          type="email"
          name="buy_email"
          autoComplete="email"
          maxLength={200}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>

      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
        {railAllowed(currency, 'card') && (
          <button
            type="button"
            className="btn"
            disabled={state === 'working' || !emailOk}
            onClick={() => void start('card')}
          >
            {state === 'working' ? t(locale, 'buy.working') : t(locale, 'buy.pay_card')}
          </button>
        )}
        <button
          type="button"
          className="btn"
          disabled={state === 'working' || !emailOk}
          onClick={() => void start('crypto')}
        >
          {state === 'working' ? t(locale, 'buy.working') : t(locale, 'buy.pay_crypto')}
        </button>
      </div>

      {!railAllowed(currency, 'card') && (
        <p className="muted" style={{ marginBlockStart: '0.75rem' }}>
          {t(locale, 'buy.card_unavailable')}
        </p>
      )}

      <p className="muted" style={{ marginBlockStart: '0.75rem', marginBlockEnd: 0 }}>
        {t(locale, 'buy.after')}
      </p>

      {state === 'error' && (
        <p style={{ color: 'var(--danger)', fontSize: '0.875rem', marginBlockStart: '0.75rem' }}>
          {t(locale, 'buy.error')}
        </p>
      )}
    </section>
  )
}
