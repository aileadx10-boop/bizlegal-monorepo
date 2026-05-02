import type { Metadata } from "next"
import LegalPage from "@/components/layout/LegalPage"

export const metadata: Metadata = {
  title: "Privacy — LexAudit",
  alternates: { canonical: "/privacy" },
}

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy."
      intro="What data LexAudit collects, how we use it, and how long we keep it. The canonical privacy policy for the BizLegal AI family lives at bizlegal-ai.com/privacy; this page mirrors the product-specific data flows for LexAudit."
    >
      <section>
        <h2 className="lp-h2">Data we collect.</h2>
        <p>
          Matter identifiers, AI-workflow records, and documentation artefacts you submit for attestation;
          your email for report delivery and billing; standard HTTP server logs.
        </p>
        <h2 className="lp-h2">How we use it.</h2>
        <p>
          To run the analysis you requested, to email you the intelligence output, and to meet
          legal obligations (billing records, fraud prevention, sanctions screening).
        </p>
        <h2 className="lp-h2">How long we keep it.</h2>
        <p>
          Analysis artefacts are retained for 90 days after delivery unless you request earlier
          deletion. Billing records are retained as required by applicable law.
        </p>
        <h2 className="lp-h2">Data transfers.</h2>
        <p>
          LexAudit operates across multiple jurisdictions. Submissions may be processed in the
          United States, the European Union, and the United Arab Emirates.
        </p>
      </section>
    </LegalPage>
  )
}
