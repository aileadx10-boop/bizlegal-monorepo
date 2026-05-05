'use client'

import { LandingV2, StickyLeadBadge } from '@bizlegal/themes'
import { BRAI_CONTENT } from './landing-content'

/**
 * BRAI homepage — Phase AA Subdomain Design Pass.
 * Replaces the prior pricing/methodology link page with the shared
 * LandingV2 template (royal-dark theme primary, royal-light alternate).
 */
export default function HomePage() {
  return (
    <>
      <LandingV2
        content={BRAI_CONTENT}
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
      <StickyLeadBadge href="/decision-tree" label="Run free BRAI screen →" />
    </>
  )
}
