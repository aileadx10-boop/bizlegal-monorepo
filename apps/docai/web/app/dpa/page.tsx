import type { Metadata } from "next"
import { DpaClient } from "./DpaClient"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "DPA Negotiator — DocAI",
  description:
    "Paste your standard DPA + the customer's redline. Get a 3-column comparison with regulatory citations and suggested compromises grounded in GDPR Art 28, EU SCCs, CCPA, and HIPAA. Decision-support only — review with counsel.",
  alternates: { canonical: "https://docai.bizlegal-ai.com/dpa" },
}

export default function DpaPage() {
  return <DpaClient />
}
