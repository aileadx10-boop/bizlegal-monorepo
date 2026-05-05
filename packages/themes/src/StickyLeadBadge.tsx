'use client'

import * as React from 'react'

/**
 * StickyLeadBadge — bottom-right pill that slides in after 50% scroll.
 * Single shared component; rendered at the bottom of every subdomain
 * homepage. Dismissible — dismissal persists 24h via localStorage.
 *
 * Styling is theme-aware via `var(--brand)` + `var(--surface-2)`.
 */

const DISMISS_KEY = 'bl-sticky-lead-dismissed-until'
const ONE_DAY_MS = 24 * 60 * 60 * 1000

export interface StickyLeadBadgeProps {
  readonly href: string
  readonly label?: string
  /** Threshold in 0..1 (default 0.5 = 50% of viewport scrolled). */
  readonly threshold?: number
}

function getDismissedUntil(): number {
  if (typeof localStorage === 'undefined') return 0
  try {
    const v = localStorage.getItem(DISMISS_KEY)
    return v ? Number(v) || 0 : 0
  } catch {
    return 0
  }
}

function setDismissed(): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(DISMISS_KEY, String(Date.now() + ONE_DAY_MS))
  } catch {
    /* ignore */
  }
}

export function StickyLeadBadge(props: StickyLeadBadgeProps): React.ReactElement | null {
  const { href, label = 'Run free 60-second screen →', threshold = 0.5 } = props
  const [visible, setVisible] = React.useState(false)
  const [dismissed, setDismissed_] = React.useState(false)

  React.useEffect(() => {
    if (Date.now() < getDismissedUntil()) {
      setDismissed_(true)
      return
    }
    const onScroll = () => {
      const doc = document.documentElement
      const scrolled = doc.scrollTop / Math.max(1, doc.scrollHeight - doc.clientHeight)
      setVisible(scrolled >= threshold)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])

  if (dismissed) return null

  return (
    <div
      aria-hidden={!visible}
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 60,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '12px 16px 12px 18px',
        borderRadius: 999,
        background: 'var(--surface-2, rgba(20,14,40,.85))',
        color: 'var(--paper, #fff)',
        border: '1px solid var(--line, rgba(255,255,255,.12))',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        boxShadow: '0 18px 40px -16px rgba(0,0,0,.45)',
        fontSize: 13,
        fontWeight: 500,
        letterSpacing: '0.01em',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(16px)',
        transition: 'opacity 180ms ease, transform 180ms ease',
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      <a
        href={href}
        style={{
          color: 'var(--paper, #fff)',
          textDecoration: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span
          aria-hidden
          style={{
            width: 8,
            height: 8,
            borderRadius: 99,
            background: 'var(--brand, #6E5CFF)',
            boxShadow: '0 0 12px currentColor',
          }}
        />
        {label}
      </a>
      <button
        type="button"
        onClick={() => {
          setDismissed()
          setDismissed_(true)
        }}
        aria-label="Dismiss"
        style={{
          marginLeft: 4,
          background: 'transparent',
          border: 'none',
          color: 'var(--paper-dim, rgba(255,255,255,.6))',
          cursor: 'pointer',
          padding: 0,
          width: 18,
          height: 18,
          fontSize: 14,
          lineHeight: '18px',
        }}
      >
        ×
      </button>
    </div>
  )
}

export default StickyLeadBadge
