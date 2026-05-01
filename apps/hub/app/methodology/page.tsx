import LegalShield from "@/components/layout/LegalShield"
import { DISCLAIMER_VERSION } from "@/lib/legal/disclaimer"
import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Methodology — BizLegal AI",
  description:
    "How BizLegal AI produces regulatory intelligence: data sources, human review, scoring, incident response.",
  alternates: { canonical: "/methodology" },
}

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Dataset",
  name: "BizLegal AI Regulatory Intelligence Methodology",
  description:
    "Published methodology for BizLegal AI regulatory intelligence outputs, including data sources, scoring signals, human review, and incident response.",
  url: "https://bizlegal-ai.com/methodology",
  creator: { "@type": "Organization", name: "BizLegal AI" },
  license: "https://bizlegal-ai.com/terms",
  keywords: [
    "regulatory intelligence",
    "compliance scoring",
    "human-in-the-loop review",
    "methodology",
  ],
  version: DISCLAIMER_VERSION,
}

interface MethodSection {
  id: string
  title: string
  body: string
}

const SECTIONS: MethodSection[] = [
  {
    id: "what-we-publish",
    title: "What we publish.",
    body: "We publish regulatory intelligence: structured summaries of publicly available regulatory texts, guidance, and enforcement actions; derived scores and risk indicators; and gap analyses against named frameworks. We do not publish legal advice, verdicts, certifications, or filings submitted on behalf of a customer.",
  },
  {
    id: "data-sources",
    title: "Data sources.",
    body: "Our intelligence is drawn from regulator-published sources. Frameworks like SEC EDGAR, FinCEN, ESMA, VARA, OFAC, UN sanctions consolidated lists, EU financial sanctions, GoldRush, Alchemy, and Covalent are canonical. Each published figure on our surfaces cites the regulator and the retrieval date. When an official source contradicts a prior assertion of ours, the regulator controls and we update the output, versioning the disclosure.",
  },
  {
    id: "scoring-signals",
    title: "Signals and scoring.",
    body: "Product scores (TRACR risk, LexAudit health, DocAI confidence, LeadForge intent) are produced from documented signal registries. Each signal carries a weight, a rationale, and the source it was derived from. The registries for every product are published under the product's methodology section.",
  },
  {
    id: "human-review",
    title: "Human review.",
    body: "No output ships without a named human reviewer signing off. This is a liability firewall, not a performance step. Human reviewers verify sources, flag uncertainty, and can hold delivery if any assertion cannot be substantiated. The signoff is recorded alongside the disclaimer version stamp on every output.",
  },
  {
    id: "uncertainty",
    title: "Handling uncertainty.",
    body: "When coverage is incomplete, ambiguous, or disputed, we say so rather than infer. 'Out of scope' is an acceptable output. 'Unverified' is an acceptable output. 'Requires counsel in your jurisdiction' is an acceptable output. We prefer a conservative admission to a confident fabrication, every time.",
  },
  {
    id: "versioning",
    title: "Versioning and reproducibility.",
    body: `Every output we publish carries a disclosure version stamp (${DISCLAIMER_VERSION} at the time this page was generated) and an issued_at timestamp. If an assertion is ever challenged, the stamp lets us reproduce exactly which disclosure was in force and which signal registry was active when the intelligence was produced.`,
  },
  {
    id: "incident-response",
    title: "Incident response.",
    body: "If a published output is challenged — by a customer, a regulator, or counsel — we follow the Liability Incident Response SOP: preserve the snapshot, preserve the disclaimer version, notify counsel, do not admit fault prior to review. The SOP is published in our workflows library and linked from the Trust page.",
  },
]

export default function MethodologyPage() {
  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "64px 24px" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />

      <header style={{ marginBottom: 48 }}>
        <p
          style={{
            fontFamily: "var(--font-mono, ui-monospace)",
            fontSize: 11,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--gold, var(--accent-mid))",
            margin: 0,
          }}
        >
          Disclosure {DISCLAIMER_VERSION}
        </p>
        <h1
          style={{
            fontFamily: "var(--font-display, ui-serif)",
            fontSize: 44,
            color: "var(--on-surface, var(--text))",
            margin: "10px 0 0",
          }}
        >
          Methodology.
        </h1>
        <p
          style={{
            marginTop: 16,
            maxWidth: 720,
            fontSize: 16,
            lineHeight: 1.6,
            color: "var(--on-surface-var, var(--muted))",
          }}
        >
          This page exists so a plaintiff&apos;s expert reading it during discovery finds a
          coherent, conservative account of how we produce intelligence. It also exists so a
          prospective buyer evaluating the platform can see the guardrails before they sign
          anything.
        </p>
      </header>

      <nav
        aria-label="Methodology contents"
        style={{
          marginBottom: 40,
          padding: "16px 20px",
          border: "1px solid var(--outline-var)",
          borderRadius: 12,
          background: "var(--bg-low, var(--bg-2))",
        }}
      >
        <p
          style={{
            fontSize: 11,
            color: "var(--outline, var(--muted))",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            margin: "0 0 10px",
          }}
        >
          Contents
        </p>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 6 }}>
          {SECTIONS.map((section) => (
            <li key={section.id} style={{ fontSize: 14 }}>
              <a href={`#${section.id}`} style={{ color: "var(--on-surface-var, var(--muted))" }}>
                {section.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div style={{ display: "grid", gap: 40 }}>
        {SECTIONS.map((section) => (
          <section key={section.id} id={section.id}>
            <h2
              style={{
                fontFamily: "var(--font-display, ui-serif)",
                fontSize: 22,
                color: "var(--on-surface, var(--text))",
                margin: "0 0 10px",
              }}
            >
              {section.title}
            </h2>
            <p
              style={{
                fontSize: 15,
                lineHeight: 1.7,
                color: "var(--on-surface-var, var(--muted))",
                margin: 0,
              }}
            >
              {section.body}
            </p>
          </section>
        ))}
      </div>

      <section
        style={{
          marginTop: 56,
          padding: 24,
          border: "1px solid var(--outline-var)",
          borderRadius: 12,
          background: "var(--bg-low, var(--bg-2))",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-display, ui-serif)",
            fontSize: 20,
            color: "var(--on-surface, var(--text))",
            margin: "0 0 12px",
          }}
        >
          Published content (disclosure {DISCLAIMER_VERSION}).
        </h2>
        <p
          style={{
            fontSize: 13,
            color: "var(--on-surface-var, var(--muted))",
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          Long-form regulatory analysis is published at{" "}
          <Link
            href="https://blog.bizlegal-ai.com/blog"
            style={{ color: "var(--accent, var(--gold))", textDecoration: "underline" }}
          >
            blog.bizlegal-ai.com
          </Link>
          . Every post lists its source URLs in a footer block and carries a disclosure-version
          stamp. Drafts move through a manual-approval gate before publish — agents rank candidates,
          a human picks the topic, and a human approves the final page before it ships. Rejections
          are written to an audit log alongside the version stamp so any prior assertion is
          reproducible in discovery.
        </p>
      </section>

      <section
        style={{
          marginTop: 32,
          padding: 24,
          border: "1px solid var(--outline-var)",
          borderRadius: 12,
          background: "var(--bg-low, var(--bg-2))",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-display, ui-serif)",
            fontSize: 20,
            color: "var(--on-surface, var(--text))",
            margin: "0 0 12px",
          }}
        >
          Per-product methodology.
        </h2>
        <p
          style={{
            fontSize: 14,
            color: "var(--on-surface-var, var(--muted))",
            lineHeight: 1.6,
            margin: "0 0 12px",
          }}
        >
          Each product publishes its own methodology page linking back here. Those pages carry the
          signal registries, scoring weights, and known-gap lists that govern each product&apos;s
          output.
        </p>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 6 }}>
          <li>
            <Link
              href="https://tracr.bizlegal-ai.com/methodology"
              style={{ color: "var(--on-surface, var(--text))" }}
            >
              TRACR — chain intelligence composite score →
            </Link>
          </li>
          <li>
            <Link
              href="https://brai.bizlegal-ai.com/methodology"
              style={{ color: "var(--on-surface, var(--text))" }}
            >
              BRAI — compliance analysis methodology →
            </Link>
          </li>
          <li>
            <Link
              href="https://lexaudit.bizlegal-ai.com/methodology"
              style={{ color: "var(--on-surface, var(--text))" }}
            >
              LexAudit — health-score signal registry →
            </Link>
          </li>
          <li>
            <Link
              href="https://docai.bizlegal-ai.com/methodology"
              style={{ color: "var(--on-surface, var(--text))" }}
            >
              DocAI — retrieval and confidence scoring →
            </Link>
          </li>
          <li>
            <Link
              href="https://leadforge.bizlegal-ai.com/methodology"
              style={{ color: "var(--on-surface, var(--text))" }}
            >
              LeadForge — intent signal ranker →
            </Link>
          </li>
        </ul>
      </section>

      <LegalShield variant="full" />
    </main>
  )
}
