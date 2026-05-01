import type { Metadata } from "next"
import LegalShield from "@/components/layout/LegalShield"
import { DISCLAIMER_VERSION } from "@/lib/legal/disclaimer"

export const metadata: Metadata = {
  title: "Data Sources — BizLegal AI",
  description: "The regulator-published and industry sources that power BizLegal AI intelligence outputs.",
  alternates: { canonical: "/data-sources" },
}

interface Source {
  name: string
  jurisdiction: string
  url: string
  used_by: string
}

const SOURCES: Source[] = [
  { name: "SEC EDGAR", jurisdiction: "US", url: "https://www.sec.gov/edgar", used_by: "leadforge, hub SEO" },
  { name: "FinCEN", jurisdiction: "US", url: "https://www.fincen.gov/", used_by: "hub SEO, brai, forge" },
  { name: "FinCEN BOI FAQ", jurisdiction: "US", url: "https://www.fincen.gov/boi-faqs", used_by: "forge" },
  { name: "DOJ press wire", jurisdiction: "US", url: "https://www.justice.gov/news", used_by: "leadforge" },
  { name: "CFPB enforcement", jurisdiction: "US", url: "https://www.consumerfinance.gov/enforcement/", used_by: "hub SEO" },
  { name: "ESMA", jurisdiction: "EU", url: "https://www.esma.europa.eu/", used_by: "brai, hub SEO" },
  { name: "EU financial sanctions", jurisdiction: "EU", url: "https://webgate.ec.europa.eu/fsd/fsf", used_by: "tracr, brai" },
  { name: "VARA", jurisdiction: "UAE / Dubai", url: "https://www.vara.ae/", used_by: "brai" },
  { name: "DFSA", jurisdiction: "UAE / DIFC", url: "https://www.dfsa.ae/", used_by: "brai" },
  { name: "MAS", jurisdiction: "Singapore", url: "https://www.mas.gov.sg/", used_by: "brai" },
  { name: "UN consolidated sanctions", jurisdiction: "Multilateral", url: "https://scsanctions.un.org/", used_by: "tracr, brai" },
  { name: "OFAC SDN", jurisdiction: "US (sanctions)", url: "https://ofac.treasury.gov/", used_by: "tracr, brai" },
  { name: "GoldRush (Covalent)", jurisdiction: "On-chain data", url: "https://goldrush.dev/", used_by: "tracr, brai" },
  { name: "Alchemy", jurisdiction: "On-chain data", url: "https://www.alchemy.com/", used_by: "tracr, brai" },
  { name: "Covalent", jurisdiction: "On-chain data", url: "https://www.covalenthq.com/", used_by: "tracr, brai" },
]

export default function DataSourcesPage() {
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
          Data sources.
        </h1>
        <p style={{ marginTop: 16, color: "var(--on-surface-var, var(--muted))", fontSize: 15, lineHeight: 1.6 }}>
          Every BizLegal AI output cites its source. The table below is the
          canonical list of regulator-published and vetted third-party
          sources we draw from. Each entry links to the canonical URL
          maintained by the source; the retrieval timestamp on every
          emitted output pins the version of the source that was in force
          at issue time.
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
              <th style={th}>Source</th>
              <th style={th}>Jurisdiction</th>
              <th style={th}>Used by</th>
            </tr>
          </thead>
          <tbody>
            {SOURCES.map((s) => (
              <tr key={s.name} style={{ borderTop: "1px solid var(--outline-var)" }}>
                <td style={td}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--on-surface, var(--text))" }}>
                    {s.name} →
                  </a>
                </td>
                <td style={td}>{s.jurisdiction}</td>
                <td style={td}>
                  <code style={{ fontSize: 12, color: "var(--on-surface-var, var(--muted))" }}>{s.used_by}</code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ color: "var(--on-surface-var, var(--muted))", fontSize: 13, lineHeight: 1.6 }}>
        When a cited source contradicts an assertion we published, the
        regulator controls. The entry is updated per{" "}
        <a href="/methodology#incident-response">WAT-KB-001</a> and the
        disclosure version bumps. Prior outputs remain reproducible against
        the snapshot in force at issue time.
      </p>

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
