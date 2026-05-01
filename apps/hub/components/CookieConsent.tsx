'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const STORAGE_KEY = 'bizlegal-cookie-consent-v1'
const CONSENT_TTL_DAYS = 365

type Choice = 'all' | 'necessary'

interface StoredConsent {
  readonly choice: Choice
  readonly setAt: string
  readonly version: number
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

function readConsent(): StoredConsent | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredConsent
    const setAt = Date.parse(parsed.setAt)
    if (Number.isNaN(setAt)) return null
    const ageDays = (Date.now() - setAt) / 86_400_000
    if (ageDays > CONSENT_TTL_DAYS) return null
    return parsed
  } catch {
    return null
  }
}

function writeConsent(choice: Choice): void {
  if (typeof window === 'undefined') return
  const payload: StoredConsent = {
    choice,
    setAt: new Date().toISOString(),
    version: 1,
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  if (typeof window.gtag === 'function') {
    window.gtag('consent', 'update', {
      analytics_storage: choice === 'all' ? 'granted' : 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    })
  }
}

/**
 * Cookie consent banner. Shown on first visit until the user picks
 * "Accept all" or "Necessary only". Choice persists for 365 days
 * in localStorage. Fires gtag consent update if Google Analytics
 * is loaded; ad-related categories stay denied (we don't run ads).
 *
 * Required for Paddle and LemonSqueezy MoR review — both expect a
 * visible consent UI, not just a paragraph in the privacy policy.
 */
export default function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const existing = readConsent()
    setVisible(existing === null)
  }, [])

  if (!visible) return null

  const handleAccept = (choice: Choice) => {
    writeConsent(choice)
    setVisible(false)
  }

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      style={{
        position: 'fixed',
        bottom: 16,
        left: 16,
        right: 16,
        zIndex: 9999,
        maxWidth: 720,
        margin: '0 auto',
        padding: '16px 20px',
        background: 'var(--bg-mid, #131b2e)',
        border: '1px solid var(--outline, rgba(165,180,252,0.2))',
        borderRadius: 12,
        boxShadow: '0 12px 40px rgba(0,0,0,0.55)',
        fontFamily: 'var(--font-body, system-ui)',
        color: 'var(--on-surface, #e8eaf6)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 16,
      }}
    >
      <p
        style={{
          margin: 0,
          flex: '1 1 320px',
          fontSize: 13,
          lineHeight: 1.55,
          color: 'var(--on-surface-var, #9fa3c0)',
        }}
      >
        We use cookies that are essential for the site to work, and (with your consent) anonymized
        analytics that help us improve. We do not run ad cookies.{' '}
        <Link
          href="/privacy"
          style={{ color: 'var(--accent, var(--gold))', textDecoration: 'underline' }}
        >
          Privacy
        </Link>
        .
      </p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => handleAccept('necessary')}
          style={{
            padding: '8px 14px',
            background: 'transparent',
            color: 'var(--on-surface-var, #9fa3c0)',
            border: '1px solid var(--outline, rgba(165,180,252,0.25))',
            borderRadius: 8,
            fontFamily: 'var(--font-mono, ui-monospace)',
            fontSize: 11,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}
        >
          Necessary only
        </button>
        <button
          type="button"
          onClick={() => handleAccept('all')}
          style={{
            padding: '8px 14px',
            background: 'var(--accent, var(--gold, #d4a853))',
            color: '#08080f',
            border: 'none',
            borderRadius: 8,
            fontFamily: 'var(--font-mono, ui-monospace)',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}
        >
          Accept all
        </button>
      </div>
    </div>
  )
}
