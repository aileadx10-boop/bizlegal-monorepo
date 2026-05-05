'use client'

/**
 * @bizlegal/turnstile-widget — conditional Cloudflare Turnstile bot
 * challenge as a shared React component.
 *
 * Phase AA D11 lift from 6 byte-identical vendor copies (forge / tracr
 * / docai / lexaudit / brai / leadforge). Each subdomain's
 * components/TurnstileWidget.tsx now thin re-exports from this package.
 *
 * Phase AA D9 origin (INTEGRATION-V3 F-2): mounts the Turnstile JS +
 * widget ONLY when `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is set, so dev and
 * pre-launch deploys keep working without a Turnstile account.
 *
 * Flow:
 *   - Loads the Turnstile JS once.
 *   - Renders a div Turnstile mounts into.
 *   - Calls onToken(token) when the user passes the challenge,
 *     onToken(null) when token expires (re-render).
 */

import { useEffect, useRef, useState } from 'react'

interface TurnstileWidgetProps {
  readonly onToken: (token: string | null) => void
  /** Override for the public site-key env var. */
  readonly siteKey?: string
  /** "auto" (default), "light", or "dark". */
  readonly theme?: 'auto' | 'light' | 'dark'
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        opts: { sitekey: string; theme?: string; callback: (token: string) => void; 'expired-callback'?: () => void; 'error-callback'?: () => void },
      ) => string
      reset: (widgetId?: string) => void
      remove: (widgetId?: string) => void
    }
  }
}

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
let scriptLoadingPromise: Promise<void> | null = null

function loadTurnstileScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  if (window.turnstile) return Promise.resolve()
  if (scriptLoadingPromise) return scriptLoadingPromise
  scriptLoadingPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[src^="${SCRIPT_SRC}"]`) as HTMLScriptElement | null
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('turnstile_script_error')), { once: true })
      return
    }
    const s = document.createElement('script')
    s.src = SCRIPT_SRC
    s.async = true
    s.defer = true
    s.addEventListener('load', () => resolve(), { once: true })
    s.addEventListener('error', () => reject(new Error('turnstile_script_error')), { once: true })
    document.head.appendChild(s)
  })
  return scriptLoadingPromise
}

export function TurnstileWidget(props: TurnstileWidgetProps): JSX.Element | null {
  const siteKey = props.siteKey ?? process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  const containerRef = useRef<HTMLDivElement | null>(null)
  const widgetIdRef = useRef<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!siteKey || !containerRef.current) return
    let cancelled = false

    loadTurnstileScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.turnstile) return
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme: props.theme ?? 'auto',
          callback: (token) => props.onToken(token),
          'expired-callback': () => props.onToken(null),
          'error-callback': () => props.onToken(null),
        })
      })
      .catch(() => {
        if (!cancelled) setError('Could not load bot challenge — please refresh.')
      })

    return () => {
      cancelled = true
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current)
        } catch {
          /* widget may already be gone */
        }
      }
    }
    // We intentionally don't depend on onToken to avoid re-rendering.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteKey, props.theme])

  if (!siteKey) return null
  return (
    <div>
      <div ref={containerRef} />
      {error && <p style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>{error}</p>}
    </div>
  )
}

export default TurnstileWidget
