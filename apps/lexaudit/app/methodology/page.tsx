import type { Metadata } from "next"
import LegalPage from "@/components/layout/LegalPage"
import { DISCLAIMER_VERSION } from "@/lib/legal/disclaimer"
import { FRAMEWORK_LABELS, SIGNALS, signalsByFramework, type FrameworkId } from "@/lib/health-score"

export const metadata: Metadata = {
  title: "Methodology — LexAudit",
  alternates: { canonical: "/methodology" },
}

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Dataset",
  name: "LexAudit Compliance Health-Score Methodology",
  description:
    "Published methodology for LexAudit compliance health-score reports, including framework coverage, signal registries, scoring, human review, and the attestation artefact.",
  url: "https://lexaudit.bizlegal-ai.com/methodology",
  creator: { "@type": "Organization", name: "BizLegal AI" },
  license: "https://lexaudit.bizlegal-ai.com/terms",
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
        title="LexAudit methodology."
        intro="How LexAudit produces compliance health-score intelligence and attestation artefacts. Framework coverage, signal registries, scoring weights, human review, and what the attestation is and is not."
      >
        <section>
          <h2 className="lp-h2">Framework coverage.</h2>
          <p>
            LexAudit evaluates a customer&apos;s posture against five frameworks. The signal
            registry below is the v{DISCLAIMER_VERSION} published set — {SIGNALS.length}{" "}
            signals total, 12 per framework, each mapped to a real published control in its
            source framework.
          </p>

          <div style={{ marginTop: 20, marginBottom: 32, display: "grid", gap: 16 }}>
            {(Object.keys(FRAMEWORK_LABELS) as FrameworkId[]).map((fw) => {
              const sigs = signalsByFramework(fw)
              return (
                <div
                  key={fw}
                  style={{
                    padding: "16px 20px",
                    border: "1px solid #1e293b",
                    borderRadius: 8,
                    background: "#0f172a",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      marginBottom: 10,
                    }}
                  >
                    <strong style={{ fontSize: 13, color: "#e2e8f0" }}>
                      {FRAMEWORK_LABELS[fw]}
                    </strong>
                    <span
                      style={{
                        fontSize: 11,
                        color: "#64748b",
                        fontFamily: "'JetBrains Mono', ui-monospace",
                      }}
                    >
                      {sigs.length} signals
                    </span>
                  </div>
                  <ul
                    style={{
                      listStyle: "none",
                      padding: 0,
                      margin: 0,
                      display: "grid",
                      gap: 4,
                      fontSize: 11,
                      color: "#94a3b8",
                    }}
                  >
                    {sigs.slice(0, 4).map((s) => (
                      <li key={s.id}>
                        <code style={{ color: "#64748b" }}>{s.control_ref}</code> · {s.name}
                      </li>
                    ))}
                    {sigs.length > 4 ? (
                      <li style={{ color: "#64748b", fontStyle: "italic" }}>
                        …and {sigs.length - 4} more in the full registry
                      </li>
                    ) : null}
                  </ul>
                </div>
              )
            })}
          </div>

          <h2 className="lp-h2">Signals and scoring.</h2>
          <p>
            Each signal carries a weight, a rationale, and an evidence-collection rule
            describing what artefact substantiates the signal. Scores are deterministic given
            the evidence; if evidence is missing, the signal is marked &quot;insufficient
            evidence&quot; rather than defaulted.
          </p>

          <h2 className="lp-h2">Human review.</h2>
          <p>
            Every score and every attestation artefact is reviewed by a named analyst before
            release. The analyst verifies that the evidence cited for each signal actually
            supports the assigned value, flags uncertainty the engine did not, and can hold
            delivery if any signal cannot be substantiated.
          </p>

          <h2 className="lp-h2">What the attestation artefact is, and is not.</h2>
          <p>
            The LexAudit attestation artefact is a process record: it attests that a
            customer&apos;s documented AI-assisted workflow followed its published process,
            with the evidence timestamps and reviewer signoff preserved. It does{" "}
            <strong>not</strong> certify the customer as compliant with any framework; a
            framework compliance finding is made by an independent auditor or a regulator,
            neither of which LexAudit is. The seven-clause disclosure on every page governs.
          </p>

          <h2 className="lp-h2">Handling uncertainty.</h2>
          <p>
            When evidence is missing, when a framework signal maps ambiguously, or when a
            review reveals inconsistency, we say so. &quot;Insufficient evidence,&quot;
            &quot;conflicting sources,&quot; and &quot;out of scope&quot; are acceptable
            outputs. We prefer a conservative admission to a confident fabrication.
          </p>

          <h2 className="lp-h2">Versioning.</h2>
          <p>
            Every health-score report and every attestation artefact carries a disclosure
            version stamp ({DISCLAIMER_VERSION} at the time this page was generated) and an
            issued_at timestamp. If an assertion is ever challenged, the stamp lets us
            reproduce exactly which disclosure was in force and which signal weights were
            active at issue time.
          </p>

          <h2 className="lp-h2">Incident response.</h2>
          <p>
            If an attestation or a health-score is challenged — by a customer, an auditor, or
            a regulator — we follow the Liability Incident Response SOP published on the hub
            workflows library. Preservation first, notification to counsel next, no fault
            admission prior to review.
          </p>
        </section>
      </LegalPage>
    </>
  )
}
