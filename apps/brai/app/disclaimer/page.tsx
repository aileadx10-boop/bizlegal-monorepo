import type { Metadata } from "next"
import LegalPage from "@/components/layout/LegalPage"

export const metadata: Metadata = {
  title: "Disclaimer — BRAI",
  alternates: { canonical: "/disclaimer" },
}

export default function DisclaimerPage() {
  return (
    <LegalPage
      title="Disclaimer."
      intro="BRAI publishes blockchain regulatory intelligence. We are not a law firm and this is not legal advice. The seven clauses below control anywhere on this site; the LegalShield at the bottom of this page contains the full version."
    />
  )
}
