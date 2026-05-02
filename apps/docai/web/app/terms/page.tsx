import type { Metadata } from "next"
import LegalPage from "@/components/layout/LegalPage"

export const metadata: Metadata = {
  title: "Terms — DocAI",
  alternates: { canonical: "/terms" },
}

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms."
      intro="These Terms govern use of DocAI. By accessing the product or purchasing a report, you accept them. The canonical terms for the BizLegal AI family live at bizlegal-ai.com/terms; this page adds product-specific terms for DocAI."
    >
      <section>
        <h2 className="lp-h2">What you are buying.</h2>
        <p>
          A chain-intelligence report. DocAI analyses the wallet address or transaction hash
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
      </section>
    </LegalPage>
  )
}
