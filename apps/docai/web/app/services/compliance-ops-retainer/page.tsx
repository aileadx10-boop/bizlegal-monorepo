import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Managed Compliance Ops Retainer — DocAI",
  description:
    "A practiced commercial attorney and AI compliance engine working as your outsourced compliance team. $2,500/mo. EU/US/APAC coverage.",
  alternates: { canonical: "https://docai.bizlegal-ai.com/services/compliance-ops-retainer" },
  openGraph: {
    title: "Managed Compliance Ops Retainer — DocAI",
    description:
      "Your compliance obligations tracked, briefed, and actioned — every week — without hiring a CCO.",
    url: "https://docai.bizlegal-ai.com/services/compliance-ops-retainer",
  },
}

const WHAT_WE_COVER = [
  "Weekly regulatory watch across your active jurisdictions (EU, US, APAC)",
  "Plain-English brief every Monday — what changed, what it means for you, what to do",
  "Contract risk scan (SQA) on every new agreement before you sign",
  "Data processing agreement (DPA) drafts and negotiation support",
  "BOI/CTA, VARA, MiCA, GDPR, and framework-specific filings tracked with deadlines",
  "AI Act compliance mapping if you deploy AI in EU-facing products",
  "On-call async response: submit compliance questions, get attorney answers within 24h",
  "Quarterly compliance health report (LexAudit score + remediation roadmap)",
]

const HOW_IT_WORKS = [
  {
    step: "1",
    title: "Intake call",
    body:
      "60-minute structured intake. We map your jurisdictions, products, and exposure. No questionnaire — you talk, we build the profile.",
  },
  {
    step: "2",
    title: "Week 1 baseline",
    body:
      "We run a full compliance health scan across your contracts, policies, and active jurisdictions. You get a prioritized remediation list within 5 business days.",
  },
  {
    step: "3",
    title: "Ongoing ops",
    body:
      "Every week: a regulatory brief. Every new contract: a risk scan. Every deadline: a 14-day advance notice. Every question: an attorney response.",
  },
]

const FAQS = [
  {
    q: "Is this legal advice?",
    a: "The retainer includes attorney-drafted work product and attorney responses to your compliance questions. It is legal services, not SaaS. If your jurisdiction requires a formal engagement letter, we provide one.",
  },
  {
    q: "What jurisdictions do you cover?",
    a: "Core coverage: EU (MiCA, GDPR, AI Act, eIDAS 2.0), US (FinCEN/BSA, SOC 2 readiness, state-level MSB), Singapore/MAS, UAE/VARA, and UK (post-Brexit FCA framework). Other jurisdictions scoped on request.",
  },
  {
    q: "Can I cancel?",
    a: "Month-to-month. Cancel with 30 days' written notice. No lock-in. The $5,000 setup fee covers the intake, baseline scan, and onboarding documentation — it is not refundable after the baseline report is delivered.",
  },
  {
    q: "What if I just need a one-time contract review?",
    a: "A single SQA contract risk scan is $97 at docai.bizlegal-ai.com. The retainer is for teams with ongoing compliance obligations — a new regulatory notice every week, contracts flowing through legal regularly, and a need for a standing compliance resource.",
  },
  {
    q: "How is this different from a law firm?",
    a: "Law firms bill by the hour, respond when called, and hand you memos. We run a standing ops layer: proactive monitoring, weekly briefs, async Q&A, and filed work product — all on a flat monthly fee. You get coverage, not invoices.",
  },
]

const CHECKOUT_URL =
  "https://bizlegal-ai.com/api/pay/start?product=compliance_ops_retainer&tier=monthly&interval=monthly&amount_cents=250000&source=retainer_landing"

export default function ComplianceOpsRetainerPage() {
  return (
    <main className="retainer-page" style={{ maxWidth: "760px", margin: "0 auto", padding: "2rem 1.5rem" }}>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Service",
                name: "Managed Compliance Ops Retainer",
                provider: {
                  "@type": "LegalService",
                  name: "BizLegal AI",
                  url: "https://docai.bizlegal-ai.com",
                },
                description:
                  "Outsourced compliance operations for digital-asset and cross-border B2B teams. Weekly regulatory briefs, contract risk scans, attorney Q&A, and ongoing filing support.",
                offers: {
                  "@type": "Offer",
                  price: "2500",
                  priceCurrency: "USD",
                  priceSpecification: {
                    "@type": "UnitPriceSpecification",
                    price: "2500",
                    priceCurrency: "USD",
                    unitText: "MONTH",
                  },
                  availability: "https://schema.org/InStock",
                  url: "https://docai.bizlegal-ai.com/services/compliance-ops-retainer",
                },
                areaServed: ["EU", "US", "SG", "AE", "GB"],
                serviceType: "Regulatory Compliance Management",
              },
              {
                "@type": "FAQPage",
                mainEntity: FAQS.map((faq) => ({
                  "@type": "Question",
                  name: faq.q,
                  acceptedAnswer: { "@type": "Answer", text: faq.a },
                })),
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Home", item: "https://docai.bizlegal-ai.com" },
                  {
                    "@type": "ListItem",
                    position: 2,
                    name: "Services",
                    item: "https://docai.bizlegal-ai.com/services",
                  },
                  {
                    "@type": "ListItem",
                    position: 3,
                    name: "Compliance Ops Retainer",
                    item: "https://docai.bizlegal-ai.com/services/compliance-ops-retainer",
                  },
                ],
              },
            ],
          }),
        }}
      />

      {/* Hero */}
      <section style={{ borderBottom: "1px solid var(--color-border, #e5e7eb)", paddingBottom: "2.5rem", marginBottom: "2.5rem" }}>
        <p style={{ fontSize: "0.85rem", letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.6, marginBottom: "0.75rem" }}>
          Managed Compliance Ops
        </p>
        <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 700, lineHeight: 1.15, marginBottom: "1.25rem" }}>
          Your outsourced compliance team.<br />
          Flat monthly fee.
        </h1>
        <p style={{ fontSize: "1.1rem", lineHeight: 1.7, maxWidth: "600px", marginBottom: "2rem", opacity: 0.85 }}>
          A practicing commercial attorney plus an AI compliance engine tracking your regulatory
          exposure — every week, every contract, every deadline — so you don&apos;t have to.
        </p>

        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
          <a
            href={CHECKOUT_URL}
            style={{
              display: "inline-block",
              padding: "0.875rem 2rem",
              background: "var(--color-accent, #1a56db)",
              color: "#fff",
              borderRadius: "8px",
              fontWeight: 600,
              fontSize: "1rem",
              textDecoration: "none",
            }}
          >
            Start today — $2,500/mo
          </a>
          <a
            href="mailto:moses@bizlegal-ai.com?subject=Compliance%20Ops%20Retainer%20inquiry"
            style={{
              display: "inline-block",
              padding: "0.875rem 1.5rem",
              border: "1.5px solid var(--color-border, #d1d5db)",
              borderRadius: "8px",
              fontWeight: 500,
              fontSize: "1rem",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            Ask a question first
          </a>
        </div>

        <p style={{ marginTop: "1rem", fontSize: "0.85rem", opacity: 0.55 }}>
          $5,000 setup fee covers intake + baseline scan. Month-to-month thereafter. Cancel with 30 days&apos; notice.
        </p>
      </section>

      {/* What we cover */}
      <section style={{ marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: "1.35rem", fontWeight: 700, marginBottom: "1.25rem" }}>What the retainer covers</h2>
        <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {WHAT_WE_COVER.map((item) => (
            <li key={item} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", lineHeight: 1.6 }}>
              <span style={{ color: "var(--color-accent, #1a56db)", fontWeight: 700, flexShrink: 0 }}>✓</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* How it works */}
      <section style={{ marginBottom: "2.5rem", borderTop: "1px solid var(--color-border, #e5e7eb)", paddingTop: "2rem" }}>
        <h2 style={{ fontSize: "1.35rem", fontWeight: 700, marginBottom: "1.5rem" }}>How it works</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {HOW_IT_WORKS.map(({ step, title, body }) => (
            <div key={step} style={{ display: "flex", gap: "1.25rem" }}>
              <div
                style={{
                  width: "2rem",
                  height: "2rem",
                  borderRadius: "50%",
                  background: "var(--color-accent, #1a56db)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  flexShrink: 0,
                  marginTop: "0.15rem",
                }}
              >
                {step}
              </div>
              <div>
                <strong style={{ display: "block", marginBottom: "0.35rem" }}>{title}</strong>
                <p style={{ margin: 0, lineHeight: 1.65, opacity: 0.85 }}>{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing box */}
      <section
        style={{
          marginBottom: "2.5rem",
          border: "1.5px solid var(--color-accent, #1a56db)",
          borderRadius: "12px",
          padding: "2rem",
        }}
      >
        <h2 style={{ fontSize: "1.35rem", fontWeight: 700, marginBottom: "0.5rem" }}>Pricing</h2>
        <p style={{ opacity: 0.7, marginBottom: "1.5rem", lineHeight: 1.6 }}>
          One flat monthly fee. No billable hours. No surprises.
        </p>
        <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
          <div>
            <p style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.06em", opacity: 0.55, marginBottom: "0.25rem" }}>
              Setup (one-time)
            </p>
            <p style={{ fontSize: "2rem", fontWeight: 700, margin: 0 }}>$5,000</p>
            <p style={{ fontSize: "0.85rem", opacity: 0.6, margin: "0.25rem 0 0" }}>Intake, baseline scan, onboarding docs</p>
          </div>
          <div>
            <p style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.06em", opacity: 0.55, marginBottom: "0.25rem" }}>
              Monthly retainer
            </p>
            <p style={{ fontSize: "2rem", fontWeight: 700, margin: 0 }}>$2,500<span style={{ fontSize: "1rem", fontWeight: 400, opacity: 0.6 }}>/mo</span></p>
            <p style={{ fontSize: "0.85rem", opacity: 0.6, margin: "0.25rem 0 0" }}>Cancel with 30 days&apos; notice</p>
          </div>
        </div>
        <a
          href={CHECKOUT_URL}
          style={{
            display: "inline-block",
            padding: "0.875rem 2rem",
            background: "var(--color-accent, #1a56db)",
            color: "#fff",
            borderRadius: "8px",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Start today
        </a>
        <p style={{ marginTop: "0.75rem", fontSize: "0.8rem", opacity: 0.55 }}>
          Or email{" "}
          <a href="mailto:moses@bizlegal-ai.com" style={{ color: "inherit" }}>
            moses@bizlegal-ai.com
          </a>{" "}
          to discuss scope first.
        </p>
      </section>

      {/* FAQ */}
      <section style={{ marginBottom: "3rem" }}>
        <h2 style={{ fontSize: "1.35rem", fontWeight: 700, marginBottom: "1.25rem" }}>Questions</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {FAQS.map(({ q, a }) => (
            <div key={q}>
              <p style={{ fontWeight: 600, marginBottom: "0.4rem" }}>{q}</p>
              <p style={{ lineHeight: 1.7, opacity: 0.85, margin: 0 }}>{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section
        style={{
          borderTop: "1px solid var(--color-border, #e5e7eb)",
          paddingTop: "2rem",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "1rem" }}>
          Ready to stop tracking compliance manually?
        </p>
        <a
          href={CHECKOUT_URL}
          style={{
            display: "inline-block",
            padding: "0.875rem 2.5rem",
            background: "var(--color-accent, #1a56db)",
            color: "#fff",
            borderRadius: "8px",
            fontWeight: 600,
            textDecoration: "none",
            marginBottom: "0.75rem",
          }}
        >
          Start the retainer — $2,500/mo
        </a>
        <p style={{ fontSize: "0.85rem", opacity: 0.5 }}>
          Month-to-month. No lock-in. Attorney-delivered work product.
        </p>
      </section>
    </main>
  )
}
