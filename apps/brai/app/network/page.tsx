"use client"

import { type FormEvent, useState } from "react"
import LegalPage from "@/components/layout/LegalPage"
import { DISCLAIMER_VERSION } from "@/lib/legal/disclaimer"
import { VIN_TERMS_PARAGRAPH } from "@/lib/legal/vin-terms"

type State =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "done" }
  | { kind: "error"; message: string }

export default function NetworkPage() {
  const [state, setState] = useState<State>({ kind: "idle" })
  const [form, setForm] = useState({
    email: "",
    organisation: "",
    use_case: "",
    jurisdictions: "",
    timeline: "",
    budget: "",
  })

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setState({ kind: "submitting" })
    try {
      const res = await fetch("/api/network/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          product: "brai",
          disclaimer_version: DISCLAIMER_VERSION,
          submitted_at: new Date().toISOString(),
        }),
      })
      if (!res.ok) {
        setState({ kind: "error", message: `Submission failed (${res.status}).` })
        return
      }
      setState({ kind: "done" })
    } catch (err) {
      const message = err instanceof Error ? err.message : "Network error."
      setState({ kind: "error", message })
    }
  }

  return (
    <LegalPage
      title="Verified Intelligence Network."
      intro="For hedge funds, family offices, and corporate treasury desks requiring human-verified intelligence at enterprise scale. We introduce you to vetted third-party analysts, investigators, and compliance counsel drawn from our partner network. BizLegal does not perform the work or guarantee outcomes — we match, we introduce, we step back."
    >
      <section style={{ marginTop: 8 }}>
        <h2 className="lp-h2">Request an introduction</h2>
        {state.kind === "done" ? (
          <p style={{ fontSize: 14, padding: 20, border: "1px solid var(--outline-var)", borderRadius: 8 }}>
            Your request is in. A member of the network team will respond within
            two business days. The response will come from a human, not an
            auto-reply — we review every intake before routing.
          </p>
        ) : (
          <form
            onSubmit={onSubmit}
            style={{
              display: "grid",
              gap: 12,
              padding: 20,
              border: "1px solid var(--outline-var)",
              borderRadius: 12,
              background: "var(--bg-low, var(--bg-2))",
              maxWidth: 640,
            }}
          >
            <Field
              label="Contact email"
              required
              type="email"
              value={form.email}
              onChange={(v) => setForm({ ...form, email: v })}
            />
            <Field
              label="Organisation"
              required
              value={form.organisation}
              onChange={(v) => setForm({ ...form, organisation: v })}
            />
            <Field
              label="Use case (brief)"
              required
              multiline
              value={form.use_case}
              onChange={(v) => setForm({ ...form, use_case: v })}
            />
            <Field
              label="Jurisdictions of interest"
              required
              value={form.jurisdictions}
              onChange={(v) => setForm({ ...form, jurisdictions: v })}
              placeholder="e.g. US, EU, UAE"
            />
            <Field
              label="Timeline"
              required
              value={form.timeline}
              onChange={(v) => setForm({ ...form, timeline: v })}
              placeholder="e.g. 30 days / ongoing"
            />
            <Field
              label="Budget range"
              value={form.budget}
              onChange={(v) => setForm({ ...form, budget: v })}
              placeholder="Intro fee from $5,000; analyst retainers negotiated directly"
            />

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button
                type="submit"
                disabled={state.kind === "submitting"}
                style={{
                  padding: "10px 18px",
                  background: "var(--accent, var(--gold))",
                  color: "#fff",
                  border: "1px solid var(--accent, var(--gold))",
                  borderRadius: 8,
                  fontWeight: 600,
                  cursor: state.kind === "submitting" ? "not-allowed" : "pointer",
                }}
              >
                {state.kind === "submitting" ? "Submitting…" : "Request an introduction →"}
              </button>
              {state.kind === "error" ? (
                <span style={{ color: "var(--red)", fontSize: 13 }} role="alert">
                  {state.message}
                </span>
              ) : null}
            </div>

            <p style={{ fontSize: 11, color: "var(--outline, var(--muted))" }}>
              Disclosure {DISCLAIMER_VERSION}. No payment is collected here;
              intro fees start at $5,000 and analyst retainers are negotiated
              directly between you and the analyst.
            </p>
          </form>
        )}
      </section>

      <section style={{ marginTop: 32 }}>
        <h2 className="lp-h2">What you agree to by requesting</h2>
        <p style={{ fontSize: 13, color: "var(--on-surface-var, var(--muted))", lineHeight: 1.7 }}>
          {VIN_TERMS_PARAGRAPH}
        </p>
      </section>
    </LegalPage>
  )
}

interface FieldProps {
  label: string
  value: string
  onChange: (v: string) => void
  required?: boolean
  type?: string
  placeholder?: string
  multiline?: boolean
}

function Field({ label, value, onChange, required, type, placeholder, multiline }: FieldProps) {
  const baseStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid var(--outline-var)",
    background: "var(--bg, var(--card))",
    color: "var(--on-surface, var(--text))",
    fontSize: 14,
    fontFamily: "inherit",
  }
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ fontSize: 12, color: "var(--on-surface-var, var(--muted))" }}>
        {label}
        {required ? " *" : ""}
      </span>
      {multiline ? (
        <textarea
          required={required}
          rows={3}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          style={baseStyle}
        />
      ) : (
        <input
          required={required}
          type={type ?? "text"}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          style={baseStyle}
        />
      )}
    </label>
  )
}
