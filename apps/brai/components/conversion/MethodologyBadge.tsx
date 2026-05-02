import Link from "next/link"

export interface MethodologyBadgeProps {
  /** Optional product slug for subdomain-specific methodology pages. */
  product?: "hub" | "trcr" | "brai" | "lexaudit" | "docai" | "leadforge" | "safe"
  /** Optional override label. */
  label?: string
  className?: string
}

/**
 * BizLegal AI — MethodologyBadge.
 *
 * Tiny link badge linking to /methodology. Mounts anywhere we publish a
 * figure, a score, or a ranking — gives the reader one click to see how
 * the number was produced.
 *
 * The badge is the discovery artefact: in Liability_Incident_Response,
 * the first thing a plaintiff's expert reads is whether the claim had a
 * visible "how we got this" path. This is that path.
 */
export function MethodologyBadge({
  product,
  label = "Methodology",
  className,
}: MethodologyBadgeProps) {
  const href = product && product !== "hub" ? `/methodology#${product}` : "/methodology"
  return (
    <Link
      href={href}
      className={className}
      aria-label="How we produced this: read the methodology"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "3px 10px",
        borderRadius: 999,
        border: "1px solid var(--outline-var)",
        background: "transparent",
        fontFamily: "var(--font-mono, ui-monospace)",
        fontSize: 10,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "var(--on-surface-var, var(--muted))",
        textDecoration: "none",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 6,
          height: 6,
          borderRadius: 999,
          background: "var(--gold, var(--accent))",
        }}
      />
      {label} →
    </Link>
  )
}

export default MethodologyBadge
