'use client'

import { LandingV2 } from '@bizlegal/themes'
import { FALSEECHO_CONTENT } from './landing-content'

/**
 * FalseEcho homepage — LandingV2 template (royal-dark/royal-light themes),
 * same fleet pattern as TRACR/BRAI. Nav + footer + sticky lead badge come
 * from SiteShell at layout level.
 */
export default function HomePage() {
  return (
    <LandingV2
      content={FALSEECHO_CONTENT}
      onLeadSubmit={async ({ email, name, scenario, source, turnstile_token }) => {
        try {
          const res = await fetch('/api/lead', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              email,
              source,
              ...(turnstile_token ? { turnstile_token } : {}),
              ...(name ? { name } : {}),
              ...(scenario ? { scenario } : {}),
            }),
          })
          if (!res.ok) {
            let detail = ''
            const ct = res.headers.get('content-type') ?? ''
            try {
              detail = ct.includes('application/json')
                ? JSON.stringify(await res.json())
                : await res.text()
            } catch (readErr) {
              // eslint-disable-next-line no-console
              console.error('[lead-submit:falseecho] body-read failed', readErr)
            }
            return { ok: false, error: detail.slice(0, 240) || `http_${res.status}` }
          }
          return { ok: true }
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('[lead-submit:falseecho] network/throw', err)
          return { ok: false, error: err instanceof Error ? err.message : String(err) }
        }
      }}
    />
  )
}
