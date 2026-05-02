import type { Metadata } from "next"
import LegalPage from "@/components/layout/LegalPage"

export const metadata: Metadata = {
  title: "About — DocAI",
  alternates: { canonical: "/about" },
}

export default function AboutPage() {
  return (
    <LegalPage
      title="About DocAI."
      intro="DocAI is the chain-intelligence product in the BizLegal AI family. It produces wallet risk intelligence, transaction flow analysis, and sanctions-screened reports for legal, compliance, and investigative teams."
    >
      <section>
        <h2 className="lp-h2">What we build.</h2>
        <p>
          A document-analysis confidence score derived from documented on-chain data providers
          (GoldRush, Alchemy, Covalent), sanctions lists (OFAC, UN, EU), and an internal risk
          engine. Every output is reviewed by a human analyst before release.
        </p>
        <h2 className="lp-h2">Who we serve.</h2>
        <p>
          Disputes counsel, asset-recovery teams, compliance officers, and treasury desks that
          need defensible, source-cited document intelligence — not a verdict, not a filing.
        </p>
      </section>
    </LegalPage>
  )
}
