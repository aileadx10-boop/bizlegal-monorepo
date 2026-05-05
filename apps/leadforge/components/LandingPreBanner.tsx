'use client'

import * as React from 'react'

/**
 * Pre-banner rendered above LeadForgeLanding. Adds a TCPA-screen CTA
 * + 3-step brief in the Daybreak palette. Phase AA Subdomain Design
 * Pass — LeadForge rebrand-only path.
 */
export function LeadForgeLandingPreBanner(): React.ReactElement {
  return (
    <section
      style={{
        padding: '64px 24px 24px',
        background:
          'radial-gradient(60% 50% at 18% 20%, rgba(91,73,224,.18), transparent 60%), radial-gradient(70% 60% at 82% 30%, rgba(184,133,45,.14), transparent 60%), linear-gradient(180deg, #FFFDF7, #FBF9F4)',
        color: '#1A1530',
        fontFamily: 'var(--font-sora, "Sora", system-ui, sans-serif)',
      }}
      aria-label="LeadForge lead magnet brief"
    >
      <div style={{ maxWidth: 1080, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ flex: '1 1 320px', maxWidth: 640 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                padding: '6px 14px',
                border: '1px solid rgba(26, 21, 48, 0.12)',
                borderRadius: 999,
                color: '#5C5670',
                fontSize: 11,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                background: 'rgba(255,255,255,.7)',
                marginBottom: 14,
              }}
            >
              <span
                aria-hidden
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 99,
                  background: '#5B49E0',
                  boxShadow: '0 0 12px #5B49E0',
                }}
              />
              Free 60-second TCPA screen
            </span>
            <h2
              style={{
                fontFamily: 'var(--font-syne, "Syne", system-ui, sans-serif)',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                fontSize: 'clamp(28px, 3.4vw, 40px)',
                lineHeight: 1.15,
                margin: 0,
                color: '#1A1530',
              }}
            >
              Are your campaigns at TCPA risk?
            </h2>
            <p style={{ marginTop: 12, color: '#5C5670', maxWidth: 560, fontSize: 15, lineHeight: 1.6 }}>
              Run the 5-question screen first — get a real preliminary signal across consent
              records, suppression lists, and autodialer use before you launch the next campaign.
            </p>
          </div>
          <a
            href="/decision-tree"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '14px 22px',
              borderRadius: 999,
              background: '#5B49E0',
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none',
              boxShadow: '0 18px 40px -18px rgba(91,73,224,0.6)',
            }}
          >
            <span aria-hidden style={{ width: 8, height: 8, borderRadius: 99, background: '#fff' }} />
            Run TCPA screen →
          </a>
        </div>

        <div
          style={{
            display: 'grid',
            gap: 16,
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          }}
        >
          {[
            {
              title: 'Run the screen',
              body:
                '5 questions across consent records, suppression-list refresh, and autodialer use. No signup until you see the verdict.',
            },
            {
              title: 'Get the brief',
              body:
                'Within 5 minutes: a one-page LeadForge audit shape — per-campaign consent + suppression certification trail + redline of common gaps.',
            },
            {
              title: 'Decide your move',
              body:
                'Run the full LeadForge audit, refresh your suppression list cadence, or talk to outside counsel we route you to.',
            },
          ].map((s, i) => (
            <div
              key={s.title}
              style={{
                position: 'relative',
                padding: '24px 22px',
                border: '1px solid rgba(26, 21, 48, 0.12)',
                borderRadius: 18,
                background: 'rgba(255,255,255,0.85)',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}
            >
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: 'rgba(91,73,224,.14)',
                  color: '#5B49E0',
                  fontFamily: 'var(--font-syne, "Syne", serif)',
                  fontSize: 16,
                  marginBottom: 10,
                }}
              >
                {i + 1}
              </span>
              <h3 style={{ fontSize: 16, fontFamily: 'var(--font-syne, "Syne", serif)', fontWeight: 700, margin: 0 }}>
                {s.title}
              </h3>
              <p style={{ color: '#5C5670', fontSize: 13.5, lineHeight: 1.6, margin: 0 }}>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
