import type { Metadata } from "next"
import LegalPage from "@/components/layout/LegalPage"

export const metadata: Metadata = {
  title: "Trust — LexAudit",
  alternates: { canonical: "/trust" },
}

export default function TrustPage() {
  return (
    <LegalPage
      title="Trust."
      intro="Three artefacts you can inspect before you buy: data sources, the incident-response procedure, and the human-review chain. The seven-clause disclosure on every page is the fourth."
    >
      <section>
        <h2 className="lp-h2">Signal registry.</h2>
        <p>
          The published v1 signal set covers five frameworks — see the Methodology page for
          the full registry, control references, and weights. Each signal carries an evidence
          rule, a rationale, and a control reference back to its source framework.
        </p>
        <h2 className="lp-h2">Human review.</h2>
        <p>
          Every snapshot ships with a named analyst signoff. The analyst verifies that the
          evidence cited for each signal actually supports the assigned value, flags
          uncertainty the engine did not, and can hold delivery if any signal cannot be
          substantiated.
        </p>
        <h2 className="lp-h2">Incident response.</h2>
        <p>
          If an output is challenged, we follow the Liability Incident Response SOP: preserve
          the snapshot, preserve the disclosure version that was in force, notify counsel, do
          not admit fault prior to review. The SOP is published on the hub workflows library.
        </p>
      </section>
    </LegalPage>
  )
}
