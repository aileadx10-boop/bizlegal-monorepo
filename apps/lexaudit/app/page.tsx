'use client'

import { LandingV2 } from '@bizlegal/themes'
import { LEXAUDIT_CONTENT } from './landing-content'

/**
 * LexAudit homepage — Phase AA Subdomain Design Pass.
 *
 * The previous email-capture form + Tools selector lived here; that
 * UX is now folded into LandingV2's hero quick-capture form (top of
 * page) + bottom intake form. The legacy form's "tools" field is no
 * longer required — the new screen at /decision-tree replaces it
 * with the 5-question compliance-cadence screener.
 */
export default function HomePage() {
  return (
    <LandingV2
      content={LEXAUDIT_CONTENT}
      onLeadSubmit={async ({ email, name, scenario, source }) => {
        try {
          const res = await fetch('/api/decision-tree/lead', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              email,
              verdict: 'home_capture',
              answers: {
                home_capture: true,
                source,
                ...(name ? { name } : {}),
                ...(scenario ? { scenario } : {}),
              },
            }),
          })
          if (!res.ok) {
            const detail = await res.text().catch(() => '')
            return { ok: false, error: detail.slice(0, 160) || `http_${res.status}` }
          }
          return { ok: true }
        } catch (err) {
          return { ok: false, error: (err as Error).message }
        }
      }}
    />
  )
}
