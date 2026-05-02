import type { Metadata } from "next"
import LegalPage from "@/components/layout/LegalPage"

export const metadata: Metadata = {
  title: "Acceptable Use — LexAudit",
  alternates: { canonical: "/acceptable-use" },
}

export default function AcceptableUsePage() {
  return (
    <LegalPage
      title="Acceptable use."
      intro="LexAudit is for lawful investigative, compliance, litigation-support, and asset-recovery work. The list below is illustrative, not exhaustive."
    >
      <section>
        <h2 className="lp-h2">Permitted.</h2>
        <ul>
          <li>Regulatory due diligence and sanctions screening.</li>
          <li>Disputes counsel, enforcement, and asset-recovery investigations.</li>
          <li>Internal compliance reviews by corporate treasury and exchange teams.</li>
        </ul>
        <h2 className="lp-h2">Prohibited.</h2>
        <ul>
          <li>Targeted harassment, stalking, or doxxing of individuals.</li>
          <li>
            Using the platform to plan, execute, or cover up financial crimes or sanctions
            evasion.
          </li>
          <li>Resale of bulk reports without written consent.</li>
        </ul>
        <p>
          Violations suspend access immediately and may be reported to the relevant authority.
        </p>
      </section>
    </LegalPage>
  )
}
