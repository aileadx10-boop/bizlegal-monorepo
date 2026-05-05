import type { Metadata } from 'next'
import Link from 'next/link'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'Compliance Triage — Where do you start? | BizLegal AI',
  description:
    "Six free 60-second decision trees across BOI, sanctions, privacy, crypto AML, TCPA, and multi-jurisdiction monitoring. Pick the one that fits — real preliminary signal, not a marketing quiz.",
  alternates: { canonical: 'https://bizlegal-ai.com/triage' },
  openGraph: {
    title: 'Compliance Triage | BizLegal AI',
    description:
      'Six free 60-second decision trees. Pick the area that fits and get a real preliminary signal.',
    url: 'https://bizlegal-ai.com/triage',
  },
}

interface TriageOption {
  readonly id: string
  readonly title: string
  readonly tagline: string
  readonly fits_when: string
  readonly href: string
  readonly cta: string
  readonly accent: string
}

const OPTIONS: ReadonlyArray<TriageOption> = [
  {
    id: 'boi',
    title: 'BOI / Corporate Transparency Act',
    tagline: 'FinCEN beneficial-ownership reporting (CTA)',
    fits_when:
      'You operate one or more US LLCs, corporations, or limited partnerships and are unsure whether the FinCEN BOI report applies (or whether you fall under one of the 23 exemptions).',
    href: 'https://forge.bizlegal-ai.com/decision-tree',
    cta: 'Run BOI screen',
    accent: '#a5b4fc',
  },
  {
    id: 'brai',
    title: 'Sanctions screening',
    tagline: 'OFAC / EU / UK / UN consolidated lists',
    fits_when:
      'You transact with counterparties in or via geographies that touch sanctions regimes — crypto, cross-border B2B, or businesses with layered ownership where you cannot independently verify the ultimate beneficial owners.',
    href: 'https://brai.bizlegal-ai.com/decision-tree',
    cta: 'Run sanctions screen',
    accent: '#00e5a0',
  },
  {
    id: 'tracr',
    title: 'Crypto / wallet trace',
    tagline: 'IRS digital-asset reporting + FinCEN MSB / Travel Rule',
    fits_when:
      'You hold or move crypto at meaningful volume, may need a defensible audit trail for tax disclosure, or have counterparty-risk questions about specific wallets.',
    href: 'https://tracr.bizlegal-ai.com/decision-tree',
    cta: 'Run wallet-trace screen',
    accent: '#6366f1',
  },
  {
    id: 'docai',
    title: 'Privacy / GDPR / CCPA',
    tagline: 'Personal-data inventory + DSAR readiness',
    fits_when:
      'You collect, store, or process personal data on EU/UK/CA subjects and are unsure whether your inventory + DSAR process is defensible against a regulator request or consumer complaint.',
    href: 'https://docai.bizlegal-ai.com/decision-tree',
    cta: 'Run privacy screen',
    accent: '#00c8ff',
  },
  {
    id: 'leadforge',
    title: 'TCPA / lead-gen',
    tagline: 'Consent + suppression-list audit',
    fits_when:
      'You send outbound SMS, autodialer calls, or marketing emails to consumers and want to know whether your consent records + suppression-list refresh process would survive a TCPA / CAN-SPAM challenge.',
    href: 'https://leadforge.bizlegal-ai.com/decision-tree',
    cta: 'Run TCPA screen',
    accent: '#19c37d',
  },
  {
    id: 'lexaudit',
    title: 'Multi-jurisdiction monitoring',
    tagline: "Pick this if you don't know which one fits",
    fits_when:
      "Your operations touch multiple regulators or jurisdictions, or you don't know which of the above categories applies most. The LexAudit screen helps you decide between continuous monitoring and a one-off baseline audit.",
    href: 'https://lexaudit.bizlegal-ai.com/decision-tree',
    cta: 'Run monitoring screen',
    accent: '#d4a853',
  },
]

export default function TriagePage(): JSX.Element {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg, #0a0e18)', color: 'var(--ink, #e2e8f0)' }}>
      <div style={{ maxWidth: 920, margin: '0 auto', padding: '64px 24px' }}>
        <header style={{ marginBottom: 48, textAlign: 'center' }}>
          <span style={{
            display: 'inline-block',
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
            color: 'var(--gold, #d4a853)',
            fontWeight: 700,
            marginBottom: 12,
          }}>
            Free triage · 60 seconds per screen
          </span>
          <h1 style={{
            fontFamily: '"Instrument Serif", Georgia, serif',
            fontSize: 56,
            fontWeight: 400,
            color: '#fff',
            letterSpacing: '-0.02em',
            lineHeight: 1.05,
            marginBottom: 16,
          }}>
            Where do you start?
          </h1>
          <p style={{
            fontSize: 18,
            color: '#9ba8c4',
            lineHeight: 1.7,
            maxWidth: 580,
            margin: '0 auto',
          }}>
            Pick the category that fits your scenario. Each link runs a 5-question
            preliminary screen with real signal — email-gated only after you see the answer,
            never before.
          </p>
        </header>

        <ul
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 16,
            listStyle: 'none',
            padding: 0,
            margin: 0,
          }}
        >
          {OPTIONS.map((opt) => (
            <li key={opt.id} style={{ display: 'flex' }}>
              <Link
                href={opt.href}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  background: 'rgba(14, 22, 36, 0.85)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 16,
                  padding: 24,
                  width: '100%',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'border-color 200ms, transform 200ms',
                }}
                aria-label={`${opt.cta} — ${opt.title}`}
              >
                <div
                  aria-hidden
                  style={{
                    width: 28,
                    height: 4,
                    background: opt.accent,
                    borderRadius: 2,
                    marginBottom: 18,
                  }}
                />
                <h2 style={{ fontSize: 19, fontWeight: 700, color: '#fff', marginBottom: 4, lineHeight: 1.25 }}>
                  {opt.title}
                </h2>
                <p style={{ fontSize: 12, color: opt.accent, fontWeight: 600, marginBottom: 14 }}>
                  {opt.tagline}
                </p>
                <p style={{ fontSize: 14, color: '#9ba8c4', lineHeight: 1.6, marginBottom: 20, flex: 1 }}>
                  {opt.fits_when}
                </p>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: opt.accent,
                    letterSpacing: '0.02em',
                  }}
                >
                  {opt.cta} →
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <footer style={{ marginTop: 56, textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: '#6b7793', lineHeight: 1.7 }}>
            Each screen is a preliminary signal based on your inputs, not legal advice.
            BizLegal-AI is software — final decisions should be confirmed with qualified counsel.
            Outcomes depend on your specific facts.
          </p>
        </footer>
      </div>
    </main>
  )
}
