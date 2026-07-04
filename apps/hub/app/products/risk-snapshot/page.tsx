import type { Metadata } from "next"
import { RiskSnapshotClient } from "./client"

export const metadata: Metadata = {
  title: "AI Compliance Risk Snapshot — $19, 2 minutes | BizLegal AI",
  description: "Drop your URL. Get a 60-second compliance risk score with 3 flags and 1 fix. Same engine as our $40K builds. $19 one-time.",
  keywords: ["compliance risk", "GDPR check", "CCPA audit", "AI compliance report"],
  openGraph: {
    title: "AI Compliance Risk Snapshot — $19, 2 minutes",
    description: "Drop your URL. Get 3 specific risk flags + 1 fix you can ship this week.",
    type: "website",
    url: "https://hub.bizlegal-ai.com/products/risk-snapshot",
  },
  alternates: { canonical: "https://hub.bizlegal-ai.com/products/risk-snapshot" },
}

export default function Page() { return <RiskSnapshotClient /> }
