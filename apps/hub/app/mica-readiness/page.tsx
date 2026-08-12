import type { Metadata } from "next"
import MicaReadinessClient from "./MicaReadinessClient"

export const metadata: Metadata = {
  title: "MiCA Readiness Assessment — 60-second CASP Compliance Check",
  description:
    "Self-serve MiCA readiness assessment for crypto and fintech firms. Ten questions score your firm against core Markets in Crypto-Assets (MiCA) licensing obligations — authorisation, Travel Rule, sanctions screening, market-abuse detection and more — with a prioritized gap list and regulation citations.",
  keywords: [
    "MiCA assessment",
    "MiCA readiness",
    "CASP authorisation",
    "crypto compliance EU",
    "Travel Rule MiCA",
    "MiCA gap analysis",
    "markets in crypto-assets regulation",
  ],
  alternates: { canonical: "https://bizlegal-ai.com/mica-readiness" },
  openGraph: {
    title: "MiCA Readiness Assessment — 60-second CASP Compliance Check",
    description:
      "Score your firm against the core MiCA licensing obligations a CASP must handle, with a prioritized gap list and regulation citations.",
    url: "https://bizlegal-ai.com/mica-readiness",
  },
}

export default function MicaReadinessPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        paddingTop: "48px",
        paddingBottom: "96px",
      }}
    >
      <div className="quantum-container">
        <MicaReadinessClient />
      </div>
    </div>
  )
}
