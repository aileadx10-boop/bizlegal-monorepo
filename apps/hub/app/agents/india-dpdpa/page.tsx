import type { Metadata } from 'next'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'India DPDPA Readiness Kit — Gap audit + Significant Data Fiduciary tripwire',
  description:
    'One-time gap audit for B2B SaaS handling Indian users. Maps current posture to DPDPA notice + consent + DPO requirements. $19 one-time. First-mover positioning before late-2026 fines kick in.',
  alternates: { canonical: 'https://bizlegal-ai.com/agents/india-dpdpa' },
}

const FEATURES: ReadonlyArray<string> = [
  'Notice + consent gap audit (DPDPA §6, §7) — what you say today vs what India requires',
  'DPO appointment recommendation — when you cross the Significant Data Fiduciary threshold',
  'Data Principal rights checklist: access · correct · erase · nominate · grievance',
  'Significant Data Fiduciary tripwire analysis — volume / sensitivity / sovereignty criteria',
  'Children + minor-handling compliance (DPDPA §9) — explicit consent + harm prevention',
  'PDF report + auto-fill template for your DPO appointment letter',
]

const FAQ: ReadonlyArray<{ q: string; a: string }> = [
  {
    q: 'When do DPDPA fines actually kick in?',
    a: 'The Digital Personal Data Protection Act, 2023 became law in August 2023. The rules + Data Protection Board enforcement framework finalized in 2025. Fine regime — up to ₹250 crore (~$30M USD) per failure — is expected to begin enforcement late 2026. This audit positions you before the wave.',
  },
  {
    q: 'Do I need this if I\'m a US company?',
    a: 'If you have ANY India-resident users — paid or free — DPDPA applies extraterritorially. That includes a SaaS dashboard accessed from Bengaluru, a marketing email sent to a Mumbai contact, or an embed loading from a US CDN on an Indian site. There is no minimum-user threshold for the act to apply.',
  },
  {
    q: 'Why $19 one-time and not a subscription?',
    a: 'The gap audit is a one-shot diagnostic — it tells you whether you need to act and what to fix. Once you have the report, you act once (DPO letter, notice rewrite, consent flow). If you want ongoing monitoring after the act enforces, we offer Privacy Policy Auto-Refresh ($49/mo) which adds DPDPA to its 7-framework redline.',
  },
  {
    q: 'What\'s a Significant Data Fiduciary?',
    a: 'The Data Protection Board can designate any data fiduciary as "Significant" based on volume + sensitivity of data processed, risk to electoral democracy or sovereignty, and risk to data principals. Significant ones must: appoint a DPO based in India, conduct periodic Data Protection Impact Assessments, undergo independent audits. The tripwire analysis tells you if you\'re heading toward this designation.',
  },
]

const CHECKOUT_URL =
  'https://bizlegal-ai.com/checkout?product=agent_india_dpdpa&tier=India+DPDPA+Readiness+Kit&interval=one-time&amount=1900&name=India+DPDPA+Readiness+Kit'

export default function IndiaDpdpaPage() {
  return (
    <>
      <section className="bl-hero-bg" style={{ paddingTop: 'clamp(4rem, 2rem + 4vw, 6rem)', paddingBottom: 'clamp(2rem, 1.5rem + 2vw, 3rem)' }}>
        <div className="bl-container" style={{ maxWidth: 880 }}>
          <span className="bl-tag" style={{ marginBottom: '1rem' }}>
            India DPDPA · ₹250 crore fines · Late 2026 enforcement
          </span>
          <h1
            style={{
              fontFamily: 'var(--bl-font-display)',
              fontSize: 'var(--bl-text-h1)',
              fontWeight: 800,
              letterSpacing: '-0.025em',
              lineHeight: 1.05,
              color: 'var(--bl-text)',
              margin: '1.5rem 0 1rem',
            }}
          >
            One India user is enough to <span className="bl-grad-text">trigger DPDPA.</span>
          </h1>
          <p style={{ fontSize: 'clamp(1.05rem, 0.95rem + 0.4vw, 1.2rem)', color: 'var(--bl-text-muted)', lineHeight: 1.6, margin: 0, maxWidth: 720 }}>
            DPDPA applies extraterritorially. There is no minimum-user threshold. Fines reach ₹250 crore (~$30M USD) per failure. The Data Protection Board starts enforcing late 2026. $19 buys you the gap audit + the DPO letter template before the wave.
          </p>
          <div style={{ marginTop: '1.75rem', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href={CHECKOUT_URL} className="bl-btn-primary">
              Buy — $19 one-time →
            </Link>
            <Link href="/agents" className="bl-btn-ghost">All agents</Link>
          </div>
        </div>
      </section>

      <section className="bl-section">
        <div className="bl-container-narrow">
          <h2 style={{ fontFamily: 'var(--bl-font-display)', fontSize: 'var(--bl-text-h2)', fontWeight: 800, marginTop: 0, marginBottom: '1.5rem', letterSpacing: '-0.025em' }}>What you get</h2>
          <ul style={{ display: 'grid', gap: 12, listStyle: 'none', padding: 0, margin: 0 }}>
            {FEATURES.map((f) => (
              <li key={f} className="bl-card" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 12, alignItems: 'start', padding: '0.9rem 1rem' }}>
                <span aria-hidden="true" style={{ color: 'var(--bl-accent)', fontWeight: 700, fontSize: 18 }}>✓</span>
                <span style={{ fontSize: 14, lineHeight: 1.55 }}>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bl-section" style={{ background: 'var(--bl-bg-low)', borderTop: '1px solid var(--bl-divider)', borderBottom: '1px solid var(--bl-divider)' }}>
        <div className="bl-container-narrow">
          <h2 style={{ fontFamily: 'var(--bl-font-display)', fontSize: 'var(--bl-text-h2)', fontWeight: 800, marginTop: 0, marginBottom: '1.5rem', letterSpacing: '-0.025em' }}>FAQ</h2>
          <div style={{ display: 'grid', gap: 16 }}>
            {FAQ.map((item) => (
              <div key={item.q} className="bl-card">
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px' }}>{item.q}</h3>
                <p style={{ fontSize: 14, color: 'var(--bl-text-muted)', lineHeight: 1.6, margin: 0 }}>{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bl-section" style={{ background: 'var(--bl-accent-soft)' }}>
        <div className="bl-container-narrow" style={{ textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--bl-font-display)', fontSize: 'var(--bl-text-h2)', fontWeight: 800, margin: '0 0 1rem', letterSpacing: '-0.025em' }}>
            Audit your India exposure today.
          </h2>
          <p style={{ fontSize: 'var(--bl-text-body)', color: 'var(--bl-text-muted)', lineHeight: 1.6, margin: 0, marginBottom: '2rem' }}>
            $19 one-time. PDF delivered within 24 hours.
          </p>
          <Link href={CHECKOUT_URL} className="bl-btn-primary">Buy — $19 one-time →</Link>
          <p style={{ marginTop: '2rem', fontSize: 11, color: 'var(--bl-text-subtle)', fontFamily: 'var(--bl-font-mono)', letterSpacing: '0.04em' }}>
            Decision-support, not legal advice. For binding DPDPA opinions, retain India-licensed counsel.
          </p>
        </div>
      </section>
    </>
  )
}
