"use client"

import { DISCLAIMER_VERSION } from "@/lib/legal/disclaimer"
import { type FormEvent, useState } from "react"

export interface LeadMagnetFormProps {
  /** Short promise delivered by this lead magnet (e.g. "MiCA CASP checklist"). */
  deliverable: string
  /** POST endpoint that accepts { email, source, disclaimer_version }. */
  endpoint: string
  /** Page or campaign tag so the backend can attribute the lead. */
  source: string
  /** Optional CTA label override. */
  ctaLabel?: string
  /** Optional short line shown under the form. */
  footnote?: string
  className?: string
}

type SubmissionState =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "done" }
  | { kind: "error"; message: string }

/**
 * BizLegal AI — LeadMagnetForm.
 *
 * Email capture that POSTs to a provided endpoint and stamps the active
 * DISCLAIMER_VERSION so the intake record ties back to exactly which
 * disclosure was visible when the submitter agreed. The success state is
 * intentionally plain: no loud "you're in" copy, no auto-subscribe to
 * unrelated marketing streams — the compliance posture is what the brand
 * is selling.
 */
export function LeadMagnetForm({
  deliverable,
  endpoint,
  source,
  ctaLabel,
  footnote,
  className,
}: LeadMagnetFormProps) {
  const [email, setEmail] = useState("")
  const [state, setState] = useState<SubmissionState>({ kind: "idle" })

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!email) return
    setState({ kind: "submitting" })
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          source,
          deliverable,
          disclaimer_version: DISCLAIMER_VERSION,
          submitted_at: new Date().toISOString(),
        }),
      })
      if (!response.ok) {
        const message = `Submission failed (${response.status}).`
        setState({ kind: "error", message })
        return
      }
      setState({ kind: "done" })
      setEmail("")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Network error."
      setState({ kind: "error", message })
    }
  }

  if (state.kind === "done") {
    return (
      <div
        className={className}
        data-disclaimer-version={DISCLAIMER_VERSION}
        style={{
          padding: 20,
          border: "1px solid var(--outline-var)",
          borderRadius: 12,
          background: "var(--bg-low, var(--bg-2))",
          fontFamily: "var(--font-body, ui-sans-serif)",
        }}
      >
        <p style={{ margin: 0, fontSize: 14, color: "var(--on-surface, var(--text))" }}>
          Got it. The {deliverable} is on its way once a human reviewer signs off on the current
          version.
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={onSubmit}
      className={className}
      data-disclaimer-version={DISCLAIMER_VERSION}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        padding: 20,
        border: "1px solid var(--outline-var)",
        borderRadius: 12,
        background: "var(--bg-low, var(--bg-2))",
        fontFamily: "var(--font-body, ui-sans-serif)",
      }}
    >
      <label
        htmlFor="lead-magnet-email"
        style={{ fontSize: 13, color: "var(--on-surface, var(--text))", fontWeight: 600 }}
      >
        {deliverable}
      </label>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input
          id="lead-magnet-email"
          name="email"
          type="email"
          required
          placeholder="you@company.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={state.kind === "submitting"}
          style={{
            flex: "1 1 220px",
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid var(--outline-var)",
            background: "var(--bg, var(--card))",
            color: "var(--on-surface, var(--text))",
            fontSize: 14,
          }}
        />
        <button
          type="submit"
          disabled={state.kind === "submitting"}
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            border: "1px solid var(--gold, var(--accent))",
            background: "var(--gold, var(--accent))",
            color: "var(--bg, #fff)",
            fontSize: 14,
            fontWeight: 600,
            cursor: state.kind === "submitting" ? "not-allowed" : "pointer",
          }}
        >
          {state.kind === "submitting" ? "Sending…" : (ctaLabel ?? "Send me the brief")}
        </button>
      </div>
      {footnote ? (
        <p style={{ margin: 0, fontSize: 11, color: "var(--outline, var(--muted))" }}>{footnote}</p>
      ) : null}
      {state.kind === "error" ? (
        <p style={{ margin: 0, fontSize: 12, color: "var(--red)" }} role="alert">
          {state.message}
        </p>
      ) : null}
      <p
        style={{
          margin: 0,
          fontSize: 10,
          color: "var(--outline, var(--muted))",
          letterSpacing: "0.04em",
        }}
      >
        Disclosure {DISCLAIMER_VERSION} · We do not share your email with third parties.
      </p>
    </form>
  )
}

export default LeadMagnetForm
