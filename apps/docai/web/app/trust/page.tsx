import type { Metadata } from "next"
import LegalPage from "@/components/layout/LegalPage"

export const metadata: Metadata = {
  title: "Trust — DocAI",
  alternates: { canonical: "/trust" },
}

export default function TrustPage() {
  return (
    <LegalPage
      title="Trust."
      intro="Three artefacts you can inspect before you buy: data sources, the incident-response procedure, and the human-review chain. The seven-clause disclosure on every page is the fourth."
    >
      <section>
        <h2 className="lp-h2">Data sources.</h2>
        <p>
          GoldRush, Alchemy, Covalent (chain data); OFAC SDN, UN consolidated sanctions, EU
          financial sanctions (screening). Each published figure on a DocAI report cites the
          regulator or provider and the retrieval timestamp.
        </p>
        <h2 className="lp-h2">Human review.</h2>
        <p>
          Every report ships with a named reviewer signoff. The reviewer verifies sources, flags
          uncertainty, and can hold delivery if any assertion cannot be substantiated.
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
