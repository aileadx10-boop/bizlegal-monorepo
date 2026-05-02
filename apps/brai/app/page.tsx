import Link from "next/link"
import LegalShield from "@/components/layout/LegalShield"
import { DISCLAIMER_VERSION } from "@/lib/legal/disclaimer"

export default function HomePage() {
  return (
    <>
      <section style={{ maxWidth: 960, margin: "0 auto", padding: "80px 24px" }}>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--accent)",
            margin: 0,
          }}
        >
          Disclosure {DISCLAIMER_VERSION}
        </p>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 48,
            color: "var(--on-surface)",
            margin: "10px 0 24px",
            lineHeight: 1.1,
          }}
        >
          Blockchain regulatory intelligence.
          <br />
          Source-cited. Human-reviewed.
        </h1>
        <p style={{ fontSize: 16, color: "var(--on-surface-var)", maxWidth: 720, lineHeight: 1.6 }}>
          BRAI evaluates the regulatory posture of digital-asset ventures across US, EU, UAE,
          and Singapore frameworks. Every output ships with cited regulator sources, a
          reviewer signoff, and a disclosure-version stamp. We are not a law firm and this is
          not legal advice.
        </p>
        <div style={{ marginTop: 32, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link
            href="/methodology"
            style={{
              padding: "12px 20px",
              border: "1px solid var(--accent)",
              background: "var(--accent)",
              color: "var(--bg)",
              textDecoration: "none",
              fontWeight: 600,
              borderRadius: 4,
            }}
          >
            See the methodology →
          </Link>
          <Link
            href="/pricing"
            style={{
              padding: "12px 20px",
              border: "1px solid var(--outline-var)",
              color: "var(--on-surface)",
              textDecoration: "none",
              fontWeight: 600,
              borderRadius: 4,
            }}
          >
            Pricing
          </Link>
        </div>
      </section>
      <LegalShield variant="micro" />
    </>
  )
}
