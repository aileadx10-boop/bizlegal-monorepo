'use client'

import * as React from 'react'

/**
 * Forge homepage pre-banner — Phase AA Subdomain Design Pass
 * (rebrand-only). Sits above the existing Hero + IntelligenceCard
 * grid. Adds a BOI-screen CTA + 3-step brief in the Daybreak palette.
 */
export function ForgeLandingPreBanner(): React.ReactElement {
  return (
    <section
      style={{
        padding: '64px 24px 24px',
        background: 'var(--audits-bg, linear-gradient(180deg,#FBF9F4,#F4EFE2))',
        color: 'var(--paper, #1A1530)',
        fontFamily: 'var(--lex-body, "Inter", system-ui, sans-serif)',
      }}
      aria-label="Forge lead magnet brief"
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
                border: '1px solid var(--line, rgba(26,21,48,.12))',
                borderRadius: 999,
                color: 'var(--paper-dim, #5C5670)',
                fontSize: 11,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                background: 'var(--surface, rgba(255,255,255,.7))',
                marginBottom: 14,
              }}
            >
              <span
                aria-hidden
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 99,
                  background: 'var(--brand, #5B49E0)',
                  boxShadow: '0 0 12px var(--brand, #5B49E0)',
                }}
              />
              Free 60-second BOI screen
            </span>
            <h2
              style={{
                fontFamily: 'var(--lex-display, "Fraunces", serif)',
                fontWeight: 300,
                letterSpacing: '-0.02em',
                fontSize: 'clamp(28px, 3.4vw, 40px)',
                lineHeight: 1.15,
                margin: 0,
                color: 'var(--paper, #1A1530)',
              }}
            >
              Do you need to file a BOI report?
            </h2>
            <p style={{ marginTop: 12, color: 'var(--paper-dim, #5C5670)', maxWidth: 560, fontSize: 15, lineHeight: 1.6 }}>
              Run the 5-question screen first — get a real preliminary signal across the FinCEN
              CTA exemptions before deciding whether to buy the full report below.
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
              background: 'var(--brand, #5B49E0)',
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none',
              boxShadow: '0 18px 40px -18px rgba(91,73,224,0.6), inset 0 1px 0 rgba(255,255,255,0.2)',
            }}
          >
            <span aria-hidden style={{ width: 8, height: 8, borderRadius: 99, background: '#fff' }} />
            Run BOI screen →
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
                '5 questions across reporting-entity status, US presence, employee count, revenue, and formation date. No signup until verdict.',
            },
            {
              title: 'Get the brief',
              body:
                'Within 5 minutes: the BOI report shape — FinCEN-formatted entity + beneficial-owner records with citations to the relevant CTA sections.',
            },
            {
              title: 'Decide your move',
              body:
                'File the full report ($149 below), keep the exemption attestation template, or talk to a BOI counsel we route you to.',
            },
          ].map((s, i) => (
            <div
              key={s.title}
              style={{
                position: 'relative',
                padding: '24px 22px',
                border: '1px solid var(--line, rgba(26,21,48,.12))',
                borderRadius: 18,
                background: 'var(--surface, rgba(255,255,255,.7))',
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
                  background: 'color-mix(in srgb, var(--brand, #5B49E0) 14%, transparent)',
                  color: 'var(--brand, #5B49E0)',
                  fontFamily: 'var(--lex-display, "Fraunces", serif)',
                  fontSize: 16,
                  marginBottom: 10,
                }}
              >
                {i + 1}
              </span>
              <h3 style={{ fontSize: 16, fontFamily: 'var(--lex-display, "Fraunces", serif)', fontWeight: 400, margin: 0 }}>
                {s.title}
              </h3>
              <p style={{ color: 'var(--paper-dim, #5C5670)', fontSize: 13.5, lineHeight: 1.6, margin: 0 }}>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
