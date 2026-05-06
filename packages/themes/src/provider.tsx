'use client'

import * as React from 'react'
import { applyTheme, getStoredTheme, setStoredTheme } from './apply'
import type { ThemeId } from './themes'

interface ThemeContextValue {
  readonly theme: ThemeId
  readonly primary: ThemeId
  readonly alternate: ThemeId | null
  readonly setTheme: (id: ThemeId) => void
  readonly toggle: () => void
}

const ThemeCtx = React.createContext<ThemeContextValue | null>(null)

export interface ThemeProviderProps {
  readonly primary: ThemeId
  readonly alternate?: ThemeId | null
  readonly storageKey: string
  readonly children: React.ReactNode
}

export function ThemeProvider(props: ThemeProviderProps): React.ReactElement {
  const { primary, alternate = null, storageKey, children } = props

  // First render uses the FOUC script's already-applied state. We mirror
  // it to React state by reading documentElement.dataset.theme (set by
  // the inline script) when the hook mounts. Server-render falls back
  // to `primary` so SSR + first-client-paint match.
  const [theme, setThemeState] = React.useState<ThemeId>(primary)

  React.useEffect(() => {
    const root = typeof document !== 'undefined' ? document.documentElement : null
    const fromAttr = root?.getAttribute('data-bl-theme-v2') as ThemeId | null
    const allowed = alternate ? [primary, alternate] : [primary]
    if (fromAttr && allowed.includes(fromAttr)) {
      setThemeState(fromAttr)
    } else {
      const stored = getStoredTheme(storageKey)
      const pick = stored && allowed.includes(stored) ? stored : primary
      setThemeState(pick)
      applyTheme(pick)
    }
    // Re-run when primary/alternate/storageKey change so a host that
    // swaps brand props at runtime (cookie-based brand swap, A/B test)
    // re-syncs the persisted state instead of staying on the stale theme.
  }, [primary, alternate, storageKey])

  const setTheme = React.useCallback(
    (id: ThemeId) => {
      const allowed = alternate ? [primary, alternate] : [primary]
      if (!allowed.includes(id)) return
      applyTheme(id)
      setStoredTheme(storageKey, id)
      setThemeState(id)
    },
    [primary, alternate, storageKey],
  )

  const toggle = React.useCallback(() => {
    if (!alternate) return
    setTheme(theme === primary ? alternate : primary)
  }, [theme, primary, alternate, setTheme])

  const value = React.useMemo<ThemeContextValue>(
    () => ({ theme, primary, alternate, setTheme, toggle }),
    [theme, primary, alternate, setTheme, toggle],
  )

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>
}

export function useTheme(): ThemeContextValue {
  const ctx = React.useContext(ThemeCtx)
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>')
  return ctx
}

/** Non-throwing variant for components that may render outside a
 *  provider (e.g. ThemeToggleButton mounted unconditionally in
 *  SiteShell). Returns null when no provider; caller should render
 *  null in that case rather than blanking the whole tree. */
export function useThemeOptional(): ThemeContextValue | null {
  return React.useContext(ThemeCtx)
}

/**
 * ThemeToggleButton — accessible 2-state switch. Renders nothing when
 * the active provider has no `alternate` (e.g. LeadForge, Forge are
 * Daybreak-only). Theme cross-fade is handled by a <body>::before
 * overlay that the host page declares in its CSS.
 */
export function ThemeToggleButton(props: {
  readonly className?: string
  readonly style?: React.CSSProperties
  readonly labelPrimary?: string
  readonly labelAlternate?: string
}): React.ReactElement | null {
  // Non-throwing optional consumer so a layout that mounts SiteShell
  // without ThemeProvider doesn't blank the entire shell tree.
  const ctx = useThemeOptional()
  if (!ctx) return null
  const { theme, primary, alternate, toggle } = ctx
  if (!alternate) return null
  const isPrimary = theme === primary
  const label = isPrimary
    ? props.labelPrimary ?? 'Switch to bright'
    : props.labelAlternate ?? 'Switch to dark'
  return (
    <button
      type="button"
      onClick={toggle}
      role="switch"
      aria-checked={!isPrimary}
      aria-label={label}
      title={label}
      className={props.className}
      style={{
        appearance: 'none',
        border: '1px solid var(--line)',
        background: 'var(--surface)',
        color: 'var(--paper-dim)',
        padding: '8px 12px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 500,
        letterSpacing: '0.04em',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        transition: 'background 200ms ease, color 200ms ease',
        ...props.style,
      }}
    >
      <span
        aria-hidden
        style={{
          width: 8,
          height: 8,
          borderRadius: 99,
          background: isPrimary ? 'var(--brand)' : 'var(--accent-a)',
          boxShadow: '0 0 8px currentColor',
        }}
      />
      {isPrimary ? 'Bright' : 'Dark'}
    </button>
  )
}
