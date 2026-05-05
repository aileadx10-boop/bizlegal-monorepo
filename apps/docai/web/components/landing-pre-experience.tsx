'use client'

/**
 * Pre-experience header rendered above the existing <HomeExperience />
 * scan flow. Adds:
 *   - Hero CTA pointing at /decision-tree (the privacy lead magnet)
 *   - "What you get" 3-step brief
 *
 * Phase AA Subdomain Design Pass — DocAI rebrand-only path. Theme is
 * royal-dark by default with a toggle to royal-light, applied via
 * ThemeProvider in layout.tsx (so all CSS vars cascade here).
 */

import * as React from 'react'

const SECTION_STYLE: React.CSSProperties = {
  padding: '64px 24px 24px',
  background: 'var(--audits-bg, var(--bl-bg, #03060F))',
  color: 'var(--paper, #E8EEFF)',
  fontFamily: 'var(--lex-body, "Inter", system-ui, sans-serif)',
}

const INNER_STYLE: React.CSSProperties = {
  maxWidth: 1080,
  margin: '0 auto',
  display: 'flex',
  flexDirection: 'column',
  gap: 32,
}

const CTA_PRIMARY: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 10,
  padding: '14px 22px',
  borderRadius: 999,
  background: 'var(--brand, #2B5BFF)',
  color: '#fff',
  fontSize: 14,
  fontWeight: 600,
  textDecoration: 'none',
  boxShadow: '0 18px 40px -18px rgba(43,91,255,0.6), inset 0 1px 0 rgba(255,255,255,0.2)',
  transition: 'transform 200ms ease',
  alignSelf: 'flex-start',
}

const BRIEF_GRID: React.CSSProperties = {
  display: 'grid',
  gap: 16,
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
}

const BRIEF_CARD: React.CSSProperties = {
  position: 'relative',
  padding: '24px 22px',
  border: '1px solid var(--line, rgba(232,238,255,.1))',
  borderRadius: 18,
  background: 'var(--surface, rgba(8,12,28,.6))',
  backdropFilter: 'blur(12px)',
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
}

const BRIEF_NUM: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 32,
  height: 32,
  borderRadius: 10,
  background: 'color-mix(in srgb, var(--brand, #2B5BFF) 18%, transparent)',
  color: 'var(--brand, #2B5BFF)',
  fontFamily: 'var(--lex-display, "Fraunces", serif)',
  fontSize: 16,
  marginBottom: 12,
}

const BRIEF_STEPS = [
  {
    title: 'Run the screen',
    body: '60-second privacy-exposure screen across GDPR, CCPA-CPRA, and US state privacy laws. No signup until you see the verdict.',
  },
  {
    title: 'Get the brief',
    body: "Within 5 minutes: a one-page DocAI scan shape — document-by-document PII inventory + redaction map + jurisdiction citations.",
  },
  {
    title: 'Decide your move',
    body: 'Run the full DocAI scanner, run a DPIA, or talk to a privacy counsel we route you to. The 4-email educational sequence keeps you sharp either way.',
  },
] as const

export function DocAILandingPreExperience(): React.ReactElement {
  return (
    <section style={SECTION_STYLE} aria-label="DocAI lead magnet brief">
      <div style={INNER_STYLE}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ flex: '1 1 320px', maxWidth: 640 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                padding: '6px 14px',
                border: '1px solid var(--line)',
                borderRadius: 999,
                color: 'var(--paper-dim, #9AA8CC)',
                fontSize: 11,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                background: 'var(--surface, rgba(8,12,28,.6))',
                marginBottom: 16,
              }}
            >
              <span
                aria-hidden
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 99,
                  background: 'var(--brand, #2B5BFF)',
                  boxShadow: '0 0 12px var(--brand, #2B5BFF)',
                }}
              />
              Free 60-second privacy screen
            </span>
            <h2
              style={{
                fontFamily: 'var(--lex-display, "Fraunces", serif)',
                fontWeight: 300,
                letterSpacing: '-0.02em',
                fontSize: 'clamp(28px, 3.4vw, 40px)',
                lineHeight: 1.15,
                margin: 0,
              }}
            >
              Privacy exposure, screened in 60 seconds.
            </h2>
            <p style={{ marginTop: 12, color: 'var(--paper-dim, #9AA8CC)', maxWidth: 560, fontSize: 15, lineHeight: 1.6 }}>
              Run the 5-question screen first — get a real preliminary signal before deciding whether
              to run the full DocAI scan below.
            </p>
          </div>
          <a href="/decision-tree" style={CTA_PRIMARY}>
            <span
              aria-hidden
              style={{
                width: 8,
                height: 8,
                borderRadius: 99,
                background: '#fff',
              }}
            />
            Run privacy screen →
          </a>
        </div>

        <div style={BRIEF_GRID}>
          {BRIEF_STEPS.map((s, i) => (
            <div key={s.title} style={BRIEF_CARD}>
              <span style={BRIEF_NUM}>{i + 1}</span>
              <h3 style={{ fontSize: 16, fontFamily: 'var(--lex-display, "Fraunces", serif)', fontWeight: 400, margin: 0 }}>
                {s.title}
              </h3>
              <p style={{ color: 'var(--paper-dim, #9AA8CC)', fontSize: 13.5, lineHeight: 1.6, margin: 0 }}>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
