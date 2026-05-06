'use client'

import { LandingV2 } from '@bizlegal/themes'
import { TRACR_CONTENT } from './landing-content'

/**
 * TRACR homepage — Phase AA Subdomain Design Pass.
 * LandingV2 template (royal-dark/royal-light themes). Nav + footer +
 * sticky lead badge now provided by SiteShell at layout level.
 */
export default function HomePage() {
  return (
    <LandingV2
      content={TRACR_CONTENT}
      onLeadSubmit={async ({ email, name, scenario, source, turnstile_token }) => {
        try {
          const res = await fetch('/api/decision-tree/lead', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              email,
              verdict: 'home_capture',
              ...(turnstile_token ? { turnstile_token } : {}),
              answers: {
                home_capture: true,
                source,
                ...(name ? { name } : {}),
                ...(scenario ? { scenario } : {}),
              },
            }),
          })
          if (!res.ok) {
            // Try JSON first, fall back to text; never let a body-read
            // failure mask the original status by collapsing to ''.
            let detail = ''
            const ct = res.headers.get('content-type') ?? ''
            try {
              detail = ct.includes('application/json')
                ? JSON.stringify(await res.json())
                : await res.text()
            } catch (readErr) {
              // eslint-disable-next-line no-console
              console.error('[lead-submit:tracr] body-read failed', readErr)
            }
            return { ok: false, error: detail.slice(0, 240) || `http_${res.status}` }
          }
          return { ok: true }
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('[lead-submit:tracr] network/throw', err)
          return { ok: false, error: err instanceof Error ? err.message : String(err) }
        }
      }}
    />
  )
}
