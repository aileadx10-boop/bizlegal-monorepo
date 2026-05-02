import type { Metadata } from "next"
import LegalPage from "@/components/layout/LegalPage"

export const metadata: Metadata = {
  title: "Terms — LexAudit",
  alternates: { canonical: "/terms" },
}

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms."
      intro="These Terms govern use of LexAudit. By accessing the product or purchasing a report, you accept them. The canonical terms for the BizLegal AI family live at bizlegal-ai.com/terms; this page adds product-specific terms for LexAudit."
    >
      <section>
        <h2 className="lp-h2">What you are buying.</h2>
        <p>
          A Compliance Health Score snapshot. LexAudit ingests your AI-assisted matter
          workflow and produces a versioned, source-cited score with written rationale,
          reviewed by a named analyst before release. The snapshot is regulatory intelligence,
          not legal advice, not a filing, not a verdict, and not a finding of compliance
          with any framework.
        </p>
        <h2 className="lp-h2">Refunds.</h2>
        <p>
          See <a href="/refund">/refund</a>.
        </p>
        <h2 className="lp-h2">Acceptable use.</h2>
        <p>
          See <a href="/acceptable-use">/acceptable-use</a>.
        </p>
      </section>
    </LegalPage>
  )
}
