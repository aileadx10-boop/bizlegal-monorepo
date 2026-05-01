"use client"

import { useEffect, useState } from "react"
import LegalShield from "@/components/layout/LegalShield"
import { DISCLAIMER_VERSION } from "@/lib/legal/disclaimer"
import ScarcityBanner from "@/components/conversion/ScarcityBanner"

interface Deadline {
  headline: string
  regulator: string
  deadline: string
  sourceUrl: string
}

const DEADLINES: Deadline[] = [
  {
    headline: "MiCA CASP authorisation window closes",
    regulator: "ESMA / European Commission",
    deadline: "2026-07-01T00:00:00Z",
    sourceUrl: "https://www.esma.europa.eu/policy-activities/crypto-assets-and-your-rights",
  },
  {
    headline: "VARA VASP CAR filing deadline (Q2)",
    regulator: "Virtual Assets Regulatory Authority (Dubai)",
    deadline: "2026-06-30T00:00:00Z",
    sourceUrl: "https://www.vara.ae/",
  },
  {
    headline: "FinCEN BOI reporting deadline",
    regulator: "Financial Crimes Enforcement Network (US)",
    deadline: "2026-03-21T00:00:00Z",
    sourceUrl: "https://www.fincen.gov/boi",
  },
]

export default function RegulatoryClockPage() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "64px 24px" }}>
      <header style={{ marginBottom: 32 }}>
        <p
          style={{
            fontFamily: "var(--font-mono, ui-monospace)",
            fontSize: 11,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--gold, var(--accent-mid))",
            margin: 0,
          }}
        >
          Disclosure {DISCLAIMER_VERSION}
        </p>
        <h1
          style={{
            fontFamily: "var(--font-display, ui-serif)",
            fontSize: 44,
            margin: "10px 0 0",
          }}
        >
          Live regulatory clock.
        </h1>
        <p style={{ marginTop: 16, color: "var(--on-surface-var, var(--muted))", fontSize: 15, lineHeight: 1.6 }}>
          Real regulator-published deadlines. Source-linked. Updated when
          the regulator updates its published position; the disclosure
          version bumps with every update.
        </p>
      </header>

      <div style={{ display: "grid", gap: 12 }}>
        {mounted
          ? DEADLINES.map((d) => (
              <ScarcityBanner
                key={d.headline}
                headline={d.headline}
                regulator={d.regulator}
                deadline={d.deadline}
                sourceUrl={d.sourceUrl}
              />
            ))
          : null}
      </div>

      <p style={{ marginTop: 24, color: "var(--on-surface-var, var(--muted))", fontSize: 13, lineHeight: 1.6 }}>
        If a deadline shown above is contradicted by the cited regulator
        page, the regulator controls — please flag the discrepancy to{" "}
        <a href="mailto:support@bizlegal-ai.com">support@bizlegal-ai.com</a>{" "}
        and we&apos;ll update per WAT-KB-001.
      </p>

      <LegalShield variant="micro" />
    </main>
  )
}
