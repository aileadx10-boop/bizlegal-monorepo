import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Services — DocAI",
  description:
    "Attorney-delivered compliance services for digital-asset and cross-border B2B teams. From $97 one-time scans to $2,500/mo managed ops.",
  alternates: { canonical: "/services" },
  openGraph: {
    title: "Services — DocAI",
    description:
      "Contract risk scans, DPA negotiation, and full managed compliance operations. Flat fees, attorney-delivered.",
    url: "https://docai.bizlegal-ai.com/services",
  },
}

const SERVICES = [
  {
    name: "Managed Compliance Ops Retainer",
    price: "$5,000 setup + $2,500/mo",
    tag: "Flagship",
    tagColor: "#1a56db",
    description:
      "Your outsourced compliance team. Weekly regulatory briefs, SQA scans on every contract, DPA drafts, BOI/MiCA/GDPR deadline tracking, and on-call attorney answers — all on a flat monthly fee.",
    href: "/services/compliance-ops-retainer",
    bullets: [
      "Weekly regulatory watch (EU/US/APAC)",
      "Contract risk scan on every new agreement",
      "DPA drafts and negotiation support",
      "On-call async attorney Q&A (24h response)",
      "Quarterly LexAudit health report",
    ],
  },
  {
    name: "SQA Contract Risk Scan",
    price: "$97 one-time",
    tag: "Most popular",
    tagColor: "#059669",
    description:
      "Upload any contract — NDA, SaaS agreement, DPA, SOW. Get a risk-ranked review with attorney-grade findings in minutes. No subscription required.",
    href: "/sqa",
    bullets: [
      "Risk score across 8 contract dimensions",
      "Plain-English findings with suggested edits",
      "Clause-by-clause citation to risk factor",
      "Delivered as PDF + web view",
    ],
  },
  {
    name: "DPA Negotiator",
    price: "Included in DocAI Team ($69/mo)",
    tag: "GDPR-ready",
    tagColor: "#7c3aed",
    description:
      "AI-assisted DPA drafting and negotiation for GDPR Articles 28/29 compliance. Pre-loaded with Standard Contractual Clauses and jurisdiction-specific templates.",
    href: "/dpa",
    bullets: [
      "GDPR-compliant DPA drafts in minutes",
      "SCCs for EU → third-country transfers",
      "Controller-processor and processor-processor templates",
      "Tracks your DPA status across vendors",
    ],
  },
]

export default function ServicesPage() {
  return (
    <main style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem 1.5rem" }}>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Home", item: "https://docai.bizlegal-ai.com" },
                  { "@type": "ListItem", position: 2, name: "Services", item: "https://docai.bizlegal-ai.com/services" },
                ],
              },
              {
                "@type": "ItemList",
                name: "DocAI Compliance Services",
                itemListElement: SERVICES.map((s, i) => ({
                  "@type": "ListItem",
                  position: i + 1,
                  item: {
                    "@type": "Service",
                    name: s.name,
                    description: s.description,
                    offers: { "@type": "Offer", price: s.price, priceCurrency: "USD" },
                    url: `https://docai.bizlegal-ai.com${s.href}`,
                  },
                })),
              },
            ],
          }),
        }}
      />

      <section style={{ marginBottom: "2.5rem" }}>
        <p style={{ fontSize: "0.8rem", letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.55, marginBottom: "0.5rem" }}>
          Services
        </p>
        <h1 style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)", fontWeight: 700, lineHeight: 1.2, marginBottom: "1rem" }}>
          Attorney-delivered compliance work.<br />Flat fees, no billable hours.
        </h1>
        <p style={{ fontSize: "1.05rem", lineHeight: 1.7, maxWidth: "580px", opacity: 0.85 }}>
          From a $97 one-time contract scan to a $2,500/mo standing ops team — pick the coverage level that matches your compliance load.
        </p>
      </section>

      <section style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {SERVICES.map((service) => (
          <Link
            key={service.name}
            href={service.href}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <article
              style={{
                border: "1.5px solid var(--color-border, #e5e7eb)",
                borderRadius: "10px",
                padding: "1.75rem",
                transition: "border-color 0.15s",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.75rem" }}>
                <div>
                  <span
                    style={{
                      display: "inline-block",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: service.tagColor,
                      border: `1px solid ${service.tagColor}`,
                      borderRadius: "4px",
                      padding: "0.1rem 0.4rem",
                      marginBottom: "0.5rem",
                    }}
                  >
                    {service.tag}
                  </span>
                  <h2 style={{ fontSize: "1.15rem", fontWeight: 700, margin: 0 }}>{service.name}</h2>
                </div>
                <span style={{ fontWeight: 700, fontSize: "1rem", whiteSpace: "nowrap" }}>{service.price}</span>
              </div>

              <p style={{ lineHeight: 1.65, opacity: 0.82, marginBottom: "1rem", fontSize: "0.925rem" }}>{service.description}</p>

              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                {service.bullets.map((b) => (
                  <li key={b} style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start", fontSize: "0.875rem", opacity: 0.75 }}>
                    <span style={{ color: service.tagColor, flexShrink: 0, fontWeight: 700 }}>✓</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </article>
          </Link>
        ))}
      </section>

      <section style={{ marginTop: "2.5rem", borderTop: "1px solid var(--color-border, #e5e7eb)", paddingTop: "1.5rem", textAlign: "center" }}>
        <p style={{ opacity: 0.6, marginBottom: "0.5rem", fontSize: "0.9rem" }}>
          Not sure which service fits?
        </p>
        <a
          href="mailto:moses@bizlegal-ai.com?subject=Which DocAI service is right for me"
          style={{ color: "var(--color-accent, #1a56db)", textDecoration: "none", fontWeight: 600 }}
        >
          Email moses@bizlegal-ai.com — same-day response
        </a>
      </section>
    </main>
  )
}
