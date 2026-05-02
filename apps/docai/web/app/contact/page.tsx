import type { Metadata } from "next"
import LegalPage from "@/components/layout/LegalPage"

export const metadata: Metadata = {
  title: "Contact — DocAI",
  alternates: { canonical: "/contact" },
}

export default function ContactPage() {
  return (
    <LegalPage
      title="Contact."
      intro="For product questions, support on an existing report, or intelligence-network intros, the channels below route directly to the right team."
    >
      <section>
        <ul>
          <li>
            <strong>Support on an existing report:</strong> support@bizlegal-ai.com
          </li>
          <li>
            <strong>Verified Intelligence Network intros:</strong> see{" "}
            <a href="/network">/network</a>
          </li>
          <li>
            <strong>Press and partnerships:</strong> press@bizlegal-ai.com
          </li>
          <li>
            <strong>Incident response for a challenged output:</strong> see <a href="/trust">/trust</a>
          </li>
        </ul>
      </section>
    </LegalPage>
  )
}
