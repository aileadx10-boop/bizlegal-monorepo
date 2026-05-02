import type { Metadata } from "next"
import LegalPage from "@/components/layout/LegalPage"

export const metadata: Metadata = {
  title: "About — LexAudit",
  alternates: { canonical: "/about" },
}

export default function AboutPage() {
  return (
    <LegalPage
      title="About LexAudit."
      intro="LexAudit is the AI-workflow attestation product in the BizLegal AI family. It produces Compliance Health Scores and process-attestation snapshots for legal teams that use AI on client matters."
    >
      <section>
        <h2 className="lp-h2">What we build.</h2>
        <p>
          A Compliance Health Score derived from a published signal registry across five
          frameworks, plus a process-attestation snapshot of the AI-assisted matter workflow.
          Every output is reviewed by a named analyst before release.
        </p>
        <h2 className="lp-h2">Who we serve.</h2>
        <p>
          Legal ops, compliance, GCs, CISOs, and internal audit teams that need
          defensible, source-cited regulatory intelligence — not legal advice, not a verdict, not a filing.
        </p>
      </section>
    </LegalPage>
  )
}
