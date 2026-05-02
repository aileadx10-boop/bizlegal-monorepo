import type { Metadata } from "next"
import LegalPage from "@/components/layout/LegalPage"
import { DEFAULT_COMPOSITE_WEIGHTS } from "@/lib/chain"
import { DISCLAIMER_VERSION } from "@/lib/legal/disclaimer"

export const metadata: Metadata = {
  title: "Methodology — BRAI",
  alternates: { canonical: "/methodology" },
}

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Dataset",
  name: "BRAI Blockchain Regulatory Intelligence Methodology",
  description:
    "Published methodology for BRAI regulatory-posture reports, including data providers, sanctions screening, composite score weights, and human review.",
  url: "https://brai.bizlegal-ai.com/methodology",
  creator: { "@type": "Organization", name: "BizLegal AI" },
  license: "https://brai.bizlegal-ai.com/terms",
  version: DISCLAIMER_VERSION,
}

export default function MethodologyPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
      <LegalPage
        title="BRAI methodology."
        intro="How BRAI produces blockchain regulatory intelligence: framework coverage, signal registries, composite scoring, human review, uncertainty handling, versioning, and incident response."
      >
        <section>
          <h2 className="lp-h2">Framework coverage.</h2>
          <p>
            BRAI evaluates digital-asset compliance posture against US (SEC, FinCEN), EU
            (MiCA, GDPR), UAE (VARA, DFSA), and Singapore (MAS, PSA) frameworks. Coverage is
            published; gaps are stated rather than inferred.
          </p>

          <h2 className="lp-h2">Composite chain-intelligence score.</h2>
          <p>
            The composite score is a weighted combination of five signals. Active weights at
            disclosure {DISCLAIMER_VERSION}:
          </p>
          <ul style={{ fontSize: 13, lineHeight: 1.7, marginTop: 8 }}>
            <li>
              <strong>
                Direct sanctions exposure (
                {Math.round(DEFAULT_COMPOSITE_WEIGHTS.direct_sanctions * 100)}%)
              </strong>{" "}
              — an address appearing directly on OFAC, UN, or EU lists forces tier to
              critical independent of other signals.
            </li>
            <li>
              <strong>
                Indirect sanctions exposure (
                {Math.round(DEFAULT_COMPOSITE_WEIGHTS.indirect_sanctions * 100)}%)
              </strong>{" "}
              — n-hop distance from a sanctioned address with a decay from 1 hop (0.75) to
              4+ hops (0.1).
            </li>
            <li>
              <strong>
                Mixer / tumbler exposure ({Math.round(DEFAULT_COMPOSITE_WEIGHTS.mixer * 100)}
                %)
              </strong>{" "}
              — peak fractional exposure across identified mixers.
            </li>
            <li>
              <strong>
                Counterparty exposure (
                {Math.round(DEFAULT_COMPOSITE_WEIGHTS.counterparty * 100)}%)
              </strong>{" "}
              — weighted by counterparty risk tier and exposure fraction.
            </li>
            <li>
              <strong>
                Jurisdiction-of-flow risk (
                {Math.round(DEFAULT_COMPOSITE_WEIGHTS.jurisdiction * 100)}%)
              </strong>{" "}
              — weighted by jurisdictional risk tier and flow fraction.
            </li>
          </ul>

          <h2 className="lp-h2">Data providers.</h2>
          <p>
            On-chain data is drawn from GoldRush, Alchemy, and Covalent. Sanctions screening
            hits OFAC SDN, UN consolidated sanctions, and EU financial-sanctions lists daily.
            Every published figure cites the provider and the retrieval timestamp.
          </p>

          <h2 className="lp-h2">Human review.</h2>
          <p>
            No report ships without a named human analyst signing off. The reviewer verifies
            each cited source supports the assertion, flags uncertainty the model did not,
            and can hold delivery when any claim cannot be defended.
          </p>

          <h2 className="lp-h2">Handling uncertainty.</h2>
          <p>
            When a provider returns inconsistent values, when a sanctions-list entry is
            ambiguous, or when jurisdictional assignment cannot be made with confidence, the
            report says so. &quot;Unresolved,&quot; &quot;conflicting sources,&quot; and
            &quot;insufficient signal&quot; are acceptable outputs.
          </p>

          <h2 className="lp-h2">Versioning.</h2>
          <p>
            Every BRAI snapshot carries a disclosure version stamp ({DISCLAIMER_VERSION} at
            the time this page was generated) and an issued_at timestamp. The stamp lets us
            reproduce which disclosure was in force and which composite weights were active
            at issue time.
          </p>

          <h2 className="lp-h2">Incident response.</h2>
          <p>
            If a BRAI output is challenged by a customer, counsel, or a regulator, we follow
            the Liability Incident Response SOP published on the hub workflows library.
            Preservation first, notification to counsel next, no fault admission prior to
            review.
          </p>
        </section>
      </LegalPage>
    </>
  )
}
