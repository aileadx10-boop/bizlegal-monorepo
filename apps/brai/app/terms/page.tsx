import type { Metadata } from "next"
import LegalPage from "@/components/layout/LegalPage"
import { VIN_TERMS_PARAGRAPH } from "@/lib/legal/vin-terms"

export const metadata: Metadata = {
  title: "Terms — BRAI",
  alternates: { canonical: "/terms" },
}

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms."
      intro="These Terms govern use of BRAI. By accessing the product or purchasing a report, you accept them. The canonical terms for the BizLegal AI family live at bizlegal-ai.com/terms; this page adds product-specific terms for BRAI."
    >
      <section>
        <h2 className="lp-h2">What you are buying.</h2>
        <p>
          A blockchain regulatory-posture report. BRAI analyses the venture, wallets, and chain parameters
          you submit and produces a machine-assisted intelligence package reviewed by a human
          analyst before delivery. The report is intelligence, not legal advice, not a filing,
          not a verdict.
        </p>
        <h2 className="lp-h2">Refunds.</h2>
        <p>
          See <a href="/refund">/refund</a>.
        </p>
        <h2 className="lp-h2">Acceptable use.</h2>
        <p>
          See <a href="/acceptable-use">/acceptable-use</a>.
        </p>
        <h2 className="lp-h2">Verified Intelligence Network.</h2>
        <p>{VIN_TERMS_PARAGRAPH}</p>
      </section>
    </LegalPage>
  )
}
