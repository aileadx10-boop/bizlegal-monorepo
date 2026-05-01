import type { Metadata } from "next"
import Link from "next/link"
import LegalShield from "@/components/layout/LegalShield"
import { DISCLAIMER_VERSION } from "@/lib/legal/disclaimer"

export const metadata: Metadata = {
  title: "Methodology Library — BizLegal AI",
  description: "Index of per-product methodology pages across the BizLegal AI family.",
  alternates: { canonical: "/methodology-library" },
}

interface Entry {
  product: string
  summary: string
  href: string
}

const ENTRIES: Entry[] = [
  {
    product: "Hub",
    summary:
      "SEO content style rules: banned openers, required $ + regulator + date + citation URL, sentence CoV > 0.4.",
    href: "/methodology",
  },
  {
    product: "TRACR",
    summary:
      "Chain-intelligence composite score across 5 signals (direct sanctions, indirect sanctions, mixer, counterparty, jurisdiction).",
    href: "https://tracr.bizlegal-ai.com/methodology",
  },
  {
    product: "BRAI",
    summary:
      "Blockchain regulatory posture across US / EU / UAE / Singapore frameworks. Same composite stack as TRACR.",
    href: "https://brai.bizlegal-ai.com/methodology",
  },
  {
    product: "LexAudit",
    summary:
      "60-signal health-score registry across SOC 2 / ISO 27001 / GDPR / HIPAA / DPDP. Attestation-not-certification framing.",
    href: "https://lexaudit.bizlegal-ai.com/methodology",
  },
  {
    product: "DocAI",
    summary:
      "SQA retrieval + 4-component confidence scoring + canonical out-of-scope path. Fabrication-free.",
    href: "https://docai.bizlegal-ai.com/methodology",
  },
  {
    product: "LeadForge",
    summary:
      "4-source intent ranker (SEC EDGAR, DOJ, press wire, job signals). CAN-SPAM / GDPR / TCPA notice on every lead.",
    href: "https://leadforge.bizlegal-ai.com/methodology",
  },
  {
    product: "Forge",
    summary:
      "15-framework scanner rule registry + BOI Intelligence Kit (HITL-gated) + 12-market Regulatory Passport + Gap Monitor. Practitioner-vetted intelligence kits, not filing services.",
    href: "https://forge.bizlegal-ai.com/methodology",
  },
]

export default function MethodologyLibraryPage() {
  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "64px 24px" }}>
      <header style={{ marginBottom: 32 }}>
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
            margin: "10px 0 0",
          }}
        >
          Methodology library.
        </h1>
        <p style={{ marginTop: 16, color: "var(--on-surface-var, var(--muted))", fontSize: 15, lineHeight: 1.6 }}>
          Every product in the BizLegal AI family publishes its methodology.
          Scoring weights, signal registries, retrieval thresholds, and
          incident procedures are documented so a prospective buyer — or a
          plaintiff&apos;s expert — can reproduce an assertion.
        </p>
      </header>

      <div style={{ display: "grid", gap: 16 }}>
        {ENTRIES.map((e) => (
          <Link
            key={e.product}
            href={e.href}
            style={{
              display: "block",
              padding: 20,
              border: "1px solid var(--outline-var)",
              borderRadius: 12,
              textDecoration: "none",
              color: "var(--on-surface, var(--text))",
            }}
          >
            <strong style={{ fontFamily: "var(--font-display, ui-serif)", fontSize: 18 }}>
              {e.product} →
            </strong>
            <p style={{ marginTop: 6, fontSize: 14, color: "var(--on-surface-var, var(--muted))", lineHeight: 1.6 }}>
              {e.summary}
            </p>
          </Link>
        ))}
      </div>

      <LegalShield variant="micro" />
    </main>
  )
}
