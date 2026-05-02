"use client"

import { DISCLAIMER_VERSION } from "@/lib/legal/disclaimer"
import { useEffect, useState } from "react"

export interface ScarcityBannerProps {
  /** Human-readable headline, e.g. "FinCEN BOI filing window closes". */
  headline: string
  /** Regulator or framework being referenced. */
  regulator: string
  /** ISO 8601 deadline timestamp. */
  deadline: string
  /** Optional citation URL to the regulator's published deadline. */
  sourceUrl?: string
  className?: string
}

/**
 * BizLegal AI — ScarcityBanner.
 *
 * Regulatory deadline countdown. The scarcity is real (published by the
 * regulator, sourced at sourceUrl), not manufactured. This widget exists
 * to convert on genuine time-sensitive intelligence, not to fabricate
 * urgency. If you find yourself tempted to drop this on a page without
 * a cited regulator deadline, you are using the wrong widget.
 */
export function ScarcityBanner({
  headline,
  regulator,
  deadline,
  sourceUrl,
  className,
}: ScarcityBannerProps) {
  const target = new Date(deadline).getTime()
  const [remaining, setRemaining] = useState<number>(() => target - Date.now())

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining(target - Date.now())
    }, 1000)
    return () => clearInterval(id)
  }, [target])

  const d = Math.max(0, Math.floor(remaining / 86_400_000))
  const h = Math.max(0, Math.floor((remaining % 86_400_000) / 3_600_000))
  const m = Math.max(0, Math.floor((remaining % 3_600_000) / 60_000))
  const s = Math.max(0, Math.floor((remaining % 60_000) / 1_000))

  return (
    <aside
      role="note"
      className={className}
      data-disclaimer-version={DISCLAIMER_VERSION}
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        padding: "14px 20px",
        border: "1px solid var(--outline-var)",
        borderLeft: "3px solid var(--gold, var(--amber))",
        borderRadius: 8,
        background: "var(--bg-low, var(--bg-2))",
        fontFamily: "var(--font-body, ui-sans-serif)",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <strong
          style={{
            fontSize: 13,
            color: "var(--on-surface, var(--text))",
            fontWeight: 600,
          }}
        >
          {headline}
        </strong>
        <span
          style={{
            fontSize: 11,
            color: "var(--outline, var(--muted))",
          }}
        >
          {sourceUrl ? (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "inherit", textDecoration: "underline" }}
            >
              {regulator}
            </a>
          ) : (
            regulator
          )}
          {" · as of "}
          {new Date(deadline).toISOString().slice(0, 10)}
        </span>
      </div>
      <div
        aria-live="polite"
        style={{
          fontFamily: "var(--font-mono, ui-monospace)",
          fontSize: 13,
          color: "var(--gold, var(--accent))",
          letterSpacing: "0.04em",
        }}
      >
        {remaining > 0
          ? `${d}d ${h.toString().padStart(2, "0")}h ${m
              .toString()
              .padStart(2, "0")}m ${s.toString().padStart(2, "0")}s`
          : "Deadline passed"}
      </div>
    </aside>
  )
}

export default ScarcityBanner
