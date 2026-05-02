import type { ReactNode } from "react"
import LegalShield from "@/components/layout/LegalShield"
import { DISCLAIMER_VERSION } from "@/lib/legal/disclaimer"

export interface LegalPageProps {
  title: string
  intro?: string
  children?: ReactNode
  /** Render LegalShield `full` (default) or `micro`. */
  shield?: "full" | "micro"
}

/**
 * Shared page frame used by the 10 legal/marketing routes in TRACR.
 * Keeps each route small and uniform — the page itself just supplies
 * title, intro, and body; the frame renders the structure and mounts
 * LegalShield with DISCLAIMER_VERSION stamped.
 */
export default function LegalPage({ title, intro, children, shield = "full" }: LegalPageProps) {
  return (
    <>
      <article style={pageShell} data-disclaimer-version={DISCLAIMER_VERSION}>
        <header style={{ marginBottom: 32 }}>
          <p style={eyebrow}>Disclosure {DISCLAIMER_VERSION}</p>
          <h1 style={heading}>{title}</h1>
          {intro ? <p style={introStyle}>{intro}</p> : null}
        </header>
        {children}
      </article>
      <LegalShield variant={shield} />
    </>
  )
}

const pageShell = {
  maxWidth: 880,
  margin: "0 auto",
  padding: "56px 24px",
}

const eyebrow = {
  fontFamily: "var(--font-mono, ui-monospace)",
  fontSize: 11,
  letterSpacing: "0.1em",
  textTransform: "uppercase" as const,
  color: "var(--gold, var(--accent))",
  margin: 0,
}

const heading = {
  fontFamily: "var(--font-display, ui-serif)",
  fontSize: 40,
  color: "var(--on-surface, var(--text))",
  margin: "10px 0 0",
}

const introStyle = {
  marginTop: 16,
  maxWidth: 680,
  fontSize: 16,
  lineHeight: 1.6,
  color: "var(--on-surface-var, var(--muted))",
}
