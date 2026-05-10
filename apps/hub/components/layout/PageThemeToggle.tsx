'use client'

/**
 * PageThemeToggle — flips the hub apex between Daybreak and Ultraviolet.
 *
 * Both are light themes with body copy darker than its surface (the
 * brand contrast contract). The toggle just chooses the hue family —
 * cream-paper warm vs lavender-paper cool. Persists the choice to
 * localStorage so the FOUC script in app/layout.tsx picks it up on the
 * next navigation; that script's preference wins over the per-route
 * page default.
 *
 * Sister to the legacy ThemeToggle (data-theme=light|dark) — both can
 * coexist on NavBar without clobber, since they target different
 * attributes (data-bl-theme-v2 vs data-theme). The legacy one is for
 * the older Quantum dark-mode flow that some product surfaces still
 * read; this one drives the V2 bridge in app/styles/theme-v2.css.
 */

import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

const STORAGE_KEY = 'bizlegal-theme'

type HubPageTheme = 'daybreak' | 'ultraviolet'

function readCurrentTheme(): HubPageTheme {
  if (typeof document === 'undefined') return 'daybreak'
  const v = document.documentElement.getAttribute('data-bl-theme-v2')
  return v === 'ultraviolet' ? 'ultraviolet' : 'daybreak'
}

export function PageThemeToggle(): JSX.Element {
  // Initialise as daybreak on the SSR pass; the FOUC script + this
  // effect reconcile to the real value on the client.
  const [theme, setTheme] = useState<HubPageTheme>('daybreak')

  useEffect(() => {
    setTheme(readCurrentTheme())
    // Listen for storage events from other tabs so the toggle stays
    // in sync if the user opens two windows.
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setTheme(readCurrentTheme())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const flip = () => {
    const next: HubPageTheme = theme === 'daybreak' ? 'ultraviolet' : 'daybreak'
    setTheme(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* storage may be blocked by privacy mode; UI still updates */
    }
    document.documentElement.setAttribute('data-bl-theme-v2', next)
  }

  const isDay = theme === 'daybreak'
  const label = isDay ? 'Switch to ultraviolet' : 'Switch to daybreak'
  const Icon = isDay ? Moon : Sun

  return (
    <button
      type="button"
      onClick={flip}
      aria-label={label}
      title={label}
      style={{
        appearance: 'none',
        border: '1px solid var(--outline-var)',
        background: 'var(--bg-low)',
        color: 'var(--on-surface)',
        width: 32,
        height: 32,
        borderRadius: 999,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'background 200ms ease, color 200ms ease, border-color 200ms ease',
        flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        ;(e.currentTarget as HTMLElement).style.background = 'var(--bg-mid)'
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLElement).style.background = 'var(--bg-low)'
      }}
    >
      <Icon size={14} aria-hidden="true" />
    </button>
  )
}
