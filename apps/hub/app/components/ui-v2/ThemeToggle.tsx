'use client'

import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

const STORAGE_KEY = 'bl-theme'

type Theme = 'light' | 'dark'

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  // Fall back to OS preference, defaulting to light if undetectable
  if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark'
  return 'light'
}

function applyTheme(theme: Theme): void {
  const html = document.documentElement
  html.dataset.theme = theme
  // Also toggle Tailwind's `dark` class so any tailwind dark: utilities
  // already in the codebase respect the user's choice.
  html.classList.toggle('dark', theme === 'dark')
  // Update theme-color meta for browser chrome
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta instanceof HTMLMetaElement) {
    meta.content = theme === 'dark' ? '#050608' : '#5b21b6'
  }
}

/**
 * ThemeToggle — Direction C adaptive theme switcher.
 *
 * Persists choice in localStorage[bl-theme]. On first mount, reads
 * stored value or falls back to prefers-color-scheme. Sets
 * `data-theme` on <html> + Tailwind's `dark` class.
 *
 * Render anywhere in the layout — no provider needed, the toggle
 * directly mutates document.documentElement.
 */
export function ThemeToggle({
  size = 36,
  className = '',
}: {
  size?: number
  className?: string
}) {
  const [theme, setTheme] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const initial = getInitialTheme()
    setTheme(initial)
    applyTheme(initial)
    setMounted(true)
  }, [])

  // React to OS-level theme changes only if the user has not explicitly
  // chosen one (i.e. localStorage is empty).
  useEffect(() => {
    if (!mounted) return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => {
      if (window.localStorage.getItem(STORAGE_KEY)) return
      const next: Theme = e.matches ? 'dark' : 'light'
      setTheme(next)
      applyTheme(next)
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [mounted])

  function toggle() {
    const next: Theme = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    applyTheme(next)
    window.localStorage.setItem(STORAGE_KEY, next)
  }

  // Avoid SSR hydration mismatch — render a placeholder until mounted.
  if (!mounted) {
    return (
      <button
        aria-label="Theme toggle (loading)"
        className={className}
        style={{
          width: size,
          height: size,
          borderRadius: 999,
          border: '1px solid var(--bl-border)',
          background: 'transparent',
        }}
      />
    )
  }

  const Icon = theme === 'light' ? Moon : Sun
  const label = theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={className}
      style={{
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 999,
        border: '1px solid var(--bl-border)',
        background: 'var(--bl-surface)',
        color: 'var(--bl-text)',
        cursor: 'pointer',
        transition: 'all var(--bl-duration-fast) var(--bl-ease-out-expo)',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget
        el.style.background = 'var(--bl-accent-soft)'
        el.style.color = 'var(--bl-accent)'
        el.style.borderColor = 'var(--bl-accent)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget
        el.style.background = 'var(--bl-surface)'
        el.style.color = 'var(--bl-text)'
        el.style.borderColor = 'var(--bl-border)'
      }}
    >
      <Icon size={size * 0.45} strokeWidth={2} />
    </button>
  )
}

export default ThemeToggle
