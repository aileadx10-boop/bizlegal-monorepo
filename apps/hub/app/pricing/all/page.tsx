import type { Metadata } from "next"
import LegalShield from "@/components/layout/LegalShield"
import { DISCLAIMER_VERSION } from "@/lib/legal/disclaimer"

export const metadata: Metadata = {
  title: "Fleet Pricing — BizLegal AI",
  description:
    "Canonical fleet-wide pricing comparison across every BizLegal AI product. Subdomain prices must match these numbers.",
  alternates: { canonical: "/pricing/all" },
}

interface Row {
  product: string
  tier: string
  price: string
  unit: string
  link: string
}

const ROWS: Row[] = [
  { product: "Hub", tier: "Free scan", price: "Free", unit: "/ scan", link: "https://bizlegal-ai.com/pricing" },
  { product: "Hub", tier: "BOI report", price: "$149", unit: "/ report", link: "https://bizlegal-ai.com/pricing" },
  { product: "Hub", tier: "Reg Passport", price: "$1,500", unit: "/ roadmap", link: "https://bizlegal-ai.com/pricing" },

  { product: "TRACR", tier: "Standard chain-intelligence report", price: "$149", unit: "/ report", link: "https://tracr.bizlegal-ai.com/pricing" },
  { product: "TRACR", tier: "Priority (12h)", price: "$249", unit: "/ report", link: "https://tracr.bizlegal-ai.com/pricing" },
  { product: "TRACR", tier: "Extended sanctions screening", price: "$500", unit: "/ report", link: "https://tracr.bizlegal-ai.com/pricing" },

  { product: "BRAI", tier: "Standard blockchain regulatory-posture report", price: "$149", unit: "/ report", link: "https://brai.bizlegal-ai.com/pricing" },
  { product: "BRAI", tier: "Priority (12h)", price: "$249", unit: "/ report", link: "https://brai.bizlegal-ai.com/pricing" },
  { product: "BRAI", tier: "Extended sanctions screening", price: "$500", unit: "/ report", link: "https://brai.bizlegal-ai.com/pricing" },

  { product: "LexAudit", tier: "Single-matter attestation artefact", price: "$49", unit: "/ matter", link: "https://lexaudit.bizlegal-ai.com/pricing" },
  { product: "LexAudit", tier: "Health-score scan (one framework)", price: "$149", unit: "/ scan", link: "https://lexaudit.bizlegal-ai.com/pricing" },
  { product: "LexAudit", tier: "Team plan", price: "$299", unit: "/ month", link: "https://lexaudit.bizlegal-ai.com/pricing" },
  { product: "LexAudit", tier: "Firm plan", price: "$499", unit: "/ month", link: "https://lexaudit.bizlegal-ai.com/pricing" },

  { product: "DocAI", tier: "Free (public KB questions)", price: "Free", unit: "", link: "https://docai.bizlegal-ai.com/pricing" },
  { product: "DocAI", tier: "Starter", price: "$29", unit: "/ month", link: "https://docai.bizlegal-ai.com/pricing" },
  { product: "DocAI", tier: "Team", price: "$69", unit: "/ month", link: "https://docai.bizlegal-ai.com/pricing" },
  { product: "DocAI", tier: "Firm", price: "$99", unit: "/ month", link: "https://docai.bizlegal-ai.com/pricing" },

  { product: "LeadForge", tier: "Starter", price: "$99", unit: "/ month", link: "https://leadforge.bizlegal-ai.com/pricing" },
  { product: "LeadForge", tier: "Growth", price: "$249", unit: "/ month", link: "https://leadforge.bizlegal-ai.com/pricing" },
  { product: "LeadForge", tier: "Scale", price: "$499", unit: "/ month", link: "https://leadforge.bizlegal-ai.com/pricing" },

  { product: "Forge", tier: "Free Scanner", price: "Free", unit: "/ scan", link: "https://forge.bizlegal-ai.com/pricing" },
  { product: "Forge", tier: "BOI Intelligence Kit", price: "$149", unit: "/ report", link: "https://forge.bizlegal-ai.com/boi" },
  { product: "Forge", tier: "Regulatory Passport Intelligence", price: "$1,500", unit: "/ roadmap", link: "https://forge.bizlegal-ai.com/passport" },
  { product: "Forge", tier: "Gap Monitor", price: "$999", unit: "/ month", link: "https://forge.bizlegal-ai.com/gap" },
]

export default function PricingAllPage() {
  return (
    <main style={{ maxWidth: 1000, margin: "0 auto", padding: "64px 24px" }}>
      <header style={{ marginBottom: 24 }}>
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
          Fleet pricing.
        </h1>
        <p style={{ marginTop: 16, color: "var(--on-surface-var, var(--muted))", fontSize: 15, lineHeight: 1.6 }}>
          Canonical comparison across every BizLegal AI product. Subdomain
          pricing pages must match these numbers; a pre-push script diffs
          them to keep the fleet in sync.
        </p>
      </header>

      <div
        style={{
          border: "1px solid var(--outline-var)",
          borderRadius: 12,
          overflow: "hidden",
          marginBottom: 32,
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ background: "var(--bg-low, var(--bg-2))" }}>
              <th style={th}>Product</th>
              <th style={th}>Tier</th>
              <th style={{ ...th, textAlign: "right" }}>Price</th>
              <th style={th}>Unit</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r, i) => (
              <tr
                key={`${r.product}-${r.tier}-${i}`}
                style={{
                  borderTop: "1px solid var(--outline-var)",
                }}
              >
                <td style={td}>
                  <a href={r.link} target="_blank" rel="noopener noreferrer" style={{ color: "var(--on-surface, var(--text))", fontWeight: 600 }}>
                    {r.product}
                  </a>
                </td>
                <td style={td}>{r.tier}</td>
                <td style={{ ...td, textAlign: "right", fontFamily: "var(--font-mono, ui-monospace)" }}>{r.price}</td>
                <td style={td}>
                  <span style={{ color: "var(--on-surface-var, var(--muted))", fontSize: 12 }}>{r.unit}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section
        id="verified-intelligence-network"
        style={{
          padding: 28,
          border: "1px solid var(--outline-var)",
          borderRadius: 12,
          background: "var(--bg-low, var(--bg-2))",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-mono, ui-monospace)",
            fontSize: 11,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--accent, var(--gold))",
            margin: 0,
          }}
        >
          Verified Intelligence Network
        </p>
        <p style={{ marginTop: 4, fontSize: 13, color: "var(--on-surface-var, var(--muted))" }}>
          Contact Us · Intro fee from $5,000 · Analyst retainers negotiated directly · Available on TRACR + BRAI
        </p>
        <p style={{ marginTop: 16, fontSize: 14, lineHeight: 1.7 }}>
          For hedge funds, family offices, and corporate treasury desks requiring
          human-verified intelligence at enterprise scale. BizLegal introduces
          you to vetted third-party analysts, investigators, and compliance
          counsel drawn from our partner network — we match, we introduce, we
          step back.
        </p>
        <div style={{ marginTop: 16, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a
            href="https://tracr.bizlegal-ai.com/network"
            target="_blank"
            rel="noopener noreferrer"
            style={linkBtn}
          >
            TRACR — See wallet report pricing →
          </a>
          <a
            href="https://brai.bizlegal-ai.com/network"
            target="_blank"
            rel="noopener noreferrer"
            style={linkBtn}
          >
            BRAI — See risk report pricing →
          </a>
        </div>
      </section>

      <LegalShield variant="micro" />
    </main>
  )
}

const th: React.CSSProperties = {
  textAlign: "left",
  padding: "12px 16px",
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "var(--on-surface-var, var(--muted))",
  fontFamily: "var(--font-mono, ui-monospace)",
}

const td: React.CSSProperties = {
  padding: "12px 16px",
  verticalAlign: "top",
}

const linkBtn: React.CSSProperties = {
  display: "inline-block",
  padding: "10px 18px",
  background: "transparent",
  color: "var(--on-surface, var(--text))",
  textDecoration: "none",
  fontWeight: 600,
  borderRadius: 8,
  border: "1px solid var(--outline-var)",
}
