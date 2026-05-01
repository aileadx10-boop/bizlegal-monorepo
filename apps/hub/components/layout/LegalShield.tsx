import { DISCLAIMER_VERSION } from "@/lib/legal/disclaimer"
import { DISCLAIMER_FOOTER_LINE, SEVEN_CLAUSES } from "@/lib/legal/shield-clauses"
import Link from "next/link"

interface LegalShieldProps {
  variant?: "full" | "micro"
  className?: string
}

/**
 * BizLegal AI — LegalShield component.
 *
 * `full` variant: renders the 7-clause disclosure with a version stamp and
 *   links to Trust / Methodology / Incident Response. Mount on every
 *   legal route and on any page that publishes assertions a reviewer signed.
 *
 * `micro` variant: renders a single-line footer disclosure plus the stamped
 *   disclaimer version. Use on marketing pages and product pages where the
 *   full disclosure would drown the page but a visible disclaimer must ship.
 *
 * Every output that references BizLegal intelligence should carry one of
 * these two variants. The disclaimer version stamp is the audit anchor —
 * it lets us reproduce exactly which disclosure governed the output.
 */
export default function LegalShield({ variant = "full", className }: LegalShieldProps) {
  if (variant === "micro") {
    return (
      <div
        className={className}
        data-legal-shield="micro"
        data-disclaimer-version={DISCLAIMER_VERSION}
        style={{
          padding: "20px 24px",
          borderTop: "1px solid var(--outline-var)",
          background: "var(--bg-low)",
          fontFamily: "var(--font-body, ui-sans-serif)",
          fontSize: "12px",
          lineHeight: 1.5,
          color: "var(--on-surface-var)",
        }}
      >
        <p style={{ margin: 0, maxWidth: 880 }}>{DISCLAIMER_FOOTER_LINE}</p>
        <p
          style={{
            margin: "6px 0 0",
            fontSize: "11px",
            color: "var(--outline)",
            letterSpacing: "0.04em",
          }}
        >
          Disclosure {DISCLAIMER_VERSION} · Links:{" "}
          <Link href="/disclaimer" style={{ color: "inherit", textDecoration: "underline" }}>
            Disclaimer
          </Link>{" "}
          ·{" "}
          <Link href="/trust" style={{ color: "inherit", textDecoration: "underline" }}>
            Trust
          </Link>{" "}
          ·{" "}
          <Link href="/methodology" style={{ color: "inherit", textDecoration: "underline" }}>
            Methodology
          </Link>
        </p>
      </div>
    )
  }

  return (
    <section
      className={className}
      data-legal-shield="full"
      data-disclaimer-version={DISCLAIMER_VERSION}
      style={{
        padding: "64px 32px",
        background: "var(--bg-low, var(--bg-highest))",
        borderTop: "1px solid var(--outline-var)",
        borderBottom: "1px solid var(--outline-var)",
        marginTop: "64px",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: 24 }}>
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
          <h2
            style={{
              fontFamily: "var(--font-display, ui-serif)",
              fontSize: 24,
              color: "var(--on-surface, var(--text))",
              margin: "8px 0 0",
            }}
          >
            What we are. What we are not.
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 32,
          }}
        >
          {SEVEN_CLAUSES.map((clause) => (
            <div key={clause.id} id={`shield-${clause.id}`}>
              <h3
                style={{
                  fontFamily: "var(--font-display, ui-serif)",
                  fontSize: 16,
                  color: "var(--on-surface, var(--text))",
                  margin: "0 0 10px",
                }}
              >
                {clause.heading}
              </h3>
              <p
                style={{
                  fontFamily: "var(--font-body, ui-sans-serif)",
                  fontSize: 13,
                  lineHeight: 1.6,
                  color: "var(--on-surface-var, var(--muted))",
                  margin: 0,
                }}
              >
                {clause.body}
              </p>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: 48,
            paddingTop: 24,
            borderTop: "1px solid var(--outline-var)",
            display: "flex",
            flexWrap: "wrap",
            gap: 24,
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-body, ui-sans-serif)",
              fontSize: 12,
              color: "var(--outline, var(--muted))",
              margin: 0,
              maxWidth: 720,
              lineHeight: 1.6,
            }}
          >
            {DISCLAIMER_FOOTER_LINE}
          </p>
          <div style={{ display: "flex", gap: 16, fontSize: 12 }}>
            <Link href="/trust" style={{ color: "var(--on-surface-var, var(--muted))" }}>
              Trust →
            </Link>
            <Link href="/methodology" style={{ color: "var(--on-surface-var, var(--muted))" }}>
              Methodology →
            </Link>
            <Link href="/disclaimer" style={{ color: "var(--on-surface-var, var(--muted))" }}>
              Disclaimer →
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
