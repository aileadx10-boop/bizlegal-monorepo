import { DISCLAIMER_VERSION } from "@/lib/legal/disclaimer"

export interface DataStatProps {
  /** The figure itself, e.g. "$500" or "177". Pre-formatted. */
  value: string
  /** Short label below the figure. */
  label: string
  /** Regulator or authoritative body that sourced the figure. */
  regulator: string
  /** ISO date for when the figure was last verified. */
  asOf: string
  /** Public citation URL (regulator publication, press release, filing). */
  sourceUrl: string
  /** Optional short context line, e.g. "per late day". */
  unit?: string
  className?: string
}

/**
 * BizLegal AI — DataStat.
 *
 * A single stat that ships with provenance. Every published figure must
 * include (a) the dollar/count value, (b) the regulator that published it,
 * (c) the date it was last verified, and (d) a citation URL — so any
 * reader or auditor can reproduce the number.
 *
 * This is the common pattern on hub SEO pages and product marketing
 * surfaces. Intentionally small and self-contained.
 */
export function DataStat({
  value,
  label,
  regulator,
  asOf,
  sourceUrl,
  unit,
  className,
}: DataStatProps) {
  return (
    <figure
      className={className}
      data-disclaimer-version={DISCLAIMER_VERSION}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
        padding: "16px 20px",
        border: "1px solid var(--outline-var)",
        borderRadius: 12,
        background: "var(--bg-low, var(--bg-2))",
        margin: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <strong
          style={{
            fontFamily: "var(--font-display, ui-serif)",
            fontSize: 28,
            color: "var(--on-surface, var(--text))",
            lineHeight: 1,
          }}
        >
          {value}
        </strong>
        {unit ? (
          <span
            style={{
              fontSize: 12,
              color: "var(--on-surface-var, var(--muted))",
            }}
          >
            {unit}
          </span>
        ) : null}
      </div>
      <figcaption
        style={{
          fontFamily: "var(--font-body, ui-sans-serif)",
          fontSize: 13,
          color: "var(--on-surface-var, var(--muted))",
          lineHeight: 1.4,
        }}
      >
        {label}
      </figcaption>
      <p
        style={{
          margin: 0,
          fontSize: 11,
          color: "var(--outline, var(--muted))",
          lineHeight: 1.45,
        }}
      >
        Source:{" "}
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "inherit", textDecoration: "underline" }}
        >
          {regulator}
        </a>{" "}
        · verified {asOf}
      </p>
    </figure>
  )
}

export default DataStat
