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
    <>
      <LandingV2
      content={LEXAUDIT_CONTENT}
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
            // C3 fix — try JSON first, log body-read failures, preserve full error.
            let detail = ''
            const ct = res.headers.get('content-type') ?? ''
            try {
              detail = ct.includes('application/json')
                ? JSON.stringify(await res.json())
                : await res.text()
            } catch (readErr) {
              // eslint-disable-next-line no-console
              console.error('[lead-submit:lexaudit] body-read failed', readErr)
            }
            return { ok: false, error: detail.slice(0, 240) || `http_${res.status}` }
          }
          return { ok: true }
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('[lead-submit:lexaudit] network/throw', err)
          return { ok: false, error: err instanceof Error ? err.message : String(err) }
        }
      }}
    />
      <section style={{ padding: '56px 24px', background: '#050509', color: '#e2e8f0', textAlign: 'center', borderTop: '1px solid #1e293b' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <p style={{ color: '#c9a84c', fontSize: '11px', letterSpacing: '4px', marginBottom: '12px' }}>CONTRACT RISK SCAN</p>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.8rem, 1.3rem + 2vw, 2.6rem)', margin: '0 0 14px' }}>Need a quick read on a counterparty draft?</h2>
          <p style={{ color: '#94a3b8', fontSize: '16px', lineHeight: 1.6, margin: '0 auto 24px', maxWidth: '620px' }}>
            Upload a PDF or DOCX for a free evidence-cited preview. The full $97 report is formatted for attorney action. This is not legal advice.
          </p>
          <a
            href="https://docai.bizlegal-ai.com/#scan?utm_source=lexaudit&utm_medium=homepage_cta&utm_campaign=contract_risk_scan"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg,#c9a84c,#a07830)', color: '#0a0a0f', borderRadius: '8px', padding: '14px 24px', fontWeight: 800, textDecoration: 'none' }}
          >
            Free contract risk scan <span aria-hidden="true">→</span>
          </a>
        </div>
      </section>
    </>
  )
}
