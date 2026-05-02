"use client"

import Link from "next/link"
import { useState } from "react"
import { Loader2, FileText, AlertCircle, CheckCircle, ShieldAlert } from "lucide-react"

const FRAMEWORKS = [
  { value: "gdpr", label: "GDPR Art 28 + EU SCCs" },
  { value: "ccpa", label: "CCPA / CPRA" },
  { value: "hipaa", label: "HIPAA BAA" },
] as const

interface NegotiateResponse {
  draft_id: string
  framework: string
  analysis: string
  citations: ReadonlyArray<{ source_name: string; source_url: string }>
  confidence: { value: number; band: string }
  out_of_scope: boolean
  disclaimer_version: string
  issued_at: string
  legal_notice: string
}

export function DpaClient() {
  const [yourDpa, setYourDpa] = useState("")
  const [redline, setRedline] = useState("")
  const [framework, setFramework] = useState<(typeof FRAMEWORKS)[number]["value"]>("gdpr")
  const [email, setEmail] = useState("")
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<NegotiateResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (redline.trim().length < 40) {
      setError("Paste at least 40 characters of the customer's redline.")
      return
    }
    setBusy(true)
    setResult(null)
    setError(null)
    try {
      const res = await fetch("/api/dpa/negotiate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          your_dpa_text: yourDpa || undefined,
          customer_redline_text: redline,
          framework,
          email: email || undefined,
        }),
      })
      const data = (await res.json().catch(() => ({}))) as Partial<NegotiateResponse> & { error?: string }
      if (!res.ok) {
        setError(data.error ?? `Analysis failed (${res.status}). Please try again.`)
        return
      }
      if (data.draft_id && data.analysis) {
        setResult(data as NegotiateResponse)
      } else {
        setError("Analysis returned empty. Please try again.")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <section
        className="bl-hero-bg"
        style={{
          paddingTop: "clamp(4rem, 2rem + 4vw, 6rem)",
          paddingBottom: "clamp(2rem, 1.5rem + 2vw, 3rem)",
        }}
      >
        <div className="bl-container" style={{ maxWidth: 880 }}>
          <span className="bl-tag" style={{ marginBottom: "1rem" }}>
            <FileText size={14} /> Decision-support · GDPR · CCPA · HIPAA
          </span>
          <h1
            style={{
              fontFamily: "var(--bl-font-display)",
              fontSize: "var(--bl-text-h1)",
              fontWeight: 800,
              letterSpacing: "-0.025em",
              lineHeight: 1.05,
              color: "var(--bl-text)",
              margin: "1.5rem 0 1rem",
            }}
          >
            DPA redline? <span className="bl-grad-text">Categorised in 60s.</span>
          </h1>
          <p
            style={{
              fontSize: "clamp(1.05rem, 0.95rem + 0.4vw, 1.2rem)",
              color: "var(--bl-text-muted)",
              lineHeight: 1.6,
              margin: 0,
              maxWidth: 720,
            }}
          >
            Paste the customer's redline. Pick your framework. Get a 3-column comparison classifying every material
            delta (procedural / liability / sub-processor / residency) with citations to GDPR Article 28, EU SCCs,
            CCPA, or HIPAA — and suggested compromises grounded in industry baselines.{" "}
            <strong style={{ color: "var(--bl-text)" }}>Decision-support only.</strong> Review with your counsel
            before signing.
          </p>
        </div>
      </section>

      <section className="bl-section" style={{ paddingTop: "clamp(2rem, 1rem + 2vw, 3rem)" }}>
        <div className="bl-container" style={{ maxWidth: 880 }}>
          <form onSubmit={submit} className="bl-card" style={{ display: "grid", gap: "1rem" }}>
            <Field label="Framework">
              <select
                value={framework}
                onChange={(e) => setFramework(e.target.value as typeof framework)}
                style={inputStyle}
              >
                {FRAMEWORKS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Your standard DPA (optional — paste excerpt for tighter comparison)">
              <textarea
                value={yourDpa}
                onChange={(e) => setYourDpa(e.target.value)}
                rows={5}
                placeholder="Paste the relevant clauses from your standard vendor DPA. Leave blank to compare the customer's redline against regulatory anchors only."
                maxLength={16000}
                style={{ ...inputStyle, resize: "vertical" as const, fontFamily: "inherit", lineHeight: 1.6 }}
              />
              <div style={{ fontSize: 11, color: "var(--bl-text-subtle)", marginTop: 4, fontFamily: "var(--bl-font-mono)" }}>
                {yourDpa.length}/16000 chars
              </div>
            </Field>

            <Field label="Customer's redline (required)">
              <textarea
                value={redline}
                onChange={(e) => setRedline(e.target.value)}
                rows={8}
                placeholder="Paste the customer's marked-up DPA — show the changes they're asking for. Tracked-changes formatting is fine; we'll work from the resulting text."
                maxLength={16000}
                required
                style={{ ...inputStyle, resize: "vertical" as const, fontFamily: "inherit", lineHeight: 1.6 }}
              />
              <div style={{ fontSize: 11, color: "var(--bl-text-subtle)", marginTop: 4, fontFamily: "var(--bl-font-mono)" }}>
                {redline.length}/16000 chars · min 40
              </div>
            </Field>

            <Field label="Email (optional — to email you a copy)">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@yourcompany.com"
                style={inputStyle}
                autoComplete="email"
              />
            </Field>

            <button
              type="submit"
              disabled={busy || redline.trim().length < 40}
              className="bl-btn-primary"
              style={{
                opacity: busy || redline.trim().length < 40 ? 0.6 : 1,
                cursor: busy || redline.trim().length < 40 ? "not-allowed" : "pointer",
                justifyContent: "center",
              }}
            >
              {busy ? <Loader2 size={16} className="spin" /> : <FileText size={16} />}
              {busy ? "Analysing — ~15s" : "Analyse redline (free first)"}
            </button>

            <p style={{ fontSize: 12, color: "var(--bl-text-subtle)", lineHeight: 1.55, fontStyle: "italic" }}>
              Output is decision-support, not legal advice. Cited regulatory text is the authority; this tool only
              patterns the customer's redline against it. Review with licensed counsel before signing.
            </p>

            {error && (
              <div
                role="alert"
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 8,
                  padding: "12px 14px",
                  background: "rgba(220,38,38,0.08)",
                  color: "var(--bl-danger)",
                  borderRadius: "var(--bl-radius-md)",
                  fontSize: 13,
                  lineHeight: 1.5,
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>
                  <strong>Analysis failed:</strong> {error}
                </span>
              </div>
            )}
          </form>

          {result && (
            <div
              className="bl-card"
              style={{
                marginTop: "1.5rem",
                background: "var(--bl-surface)",
                borderColor: result.out_of_scope ? "var(--bl-warning)" : "var(--bl-accent)",
                borderWidth: 2,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                {result.out_of_scope ? (
                  <AlertCircle size={18} style={{ color: "var(--bl-warning)" }} />
                ) : (
                  <CheckCircle size={18} style={{ color: "var(--bl-accent)" }} />
                )}
                <span
                  className="bl-label"
                  style={{ color: result.out_of_scope ? "var(--bl-warning)" : "var(--bl-accent)", fontSize: 11 }}
                >
                  {result.out_of_scope
                    ? "Out of current KB scope · admitting limits"
                    : `Analysed · ${result.framework.toUpperCase()} · confidence ${result.confidence.band}`}
                </span>
              </div>

              <h2
                style={{
                  fontFamily: "var(--bl-font-display)",
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  color: "var(--bl-text)",
                  margin: "0 0 0.5rem",
                }}
              >
                Redline analysis
              </h2>

              <div
                style={{
                  fontFamily: "var(--bl-font-body)",
                  fontSize: 14,
                  lineHeight: 1.75,
                  color: "var(--bl-text)",
                  whiteSpace: "pre-wrap",
                  marginBottom: "1.25rem",
                }}
              >
                {result.analysis}
              </div>

              {result.citations.length > 0 && (
                <div
                  style={{
                    paddingTop: 12,
                    borderTop: "1px solid var(--bl-divider)",
                    fontFamily: "var(--bl-font-mono)",
                    fontSize: 11,
                    color: "var(--bl-text-subtle)",
                  }}
                >
                  <strong style={{ color: "var(--bl-text-muted)" }}>Sources cited:</strong>
                  <ul style={{ margin: "8px 0 0", paddingLeft: 16 }}>
                    {result.citations.map((c) => (
                      <li key={c.source_name} style={{ marginBottom: 4 }}>
                        <a href={c.source_url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--bl-accent)" }}>
                          {c.source_name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div
                style={{
                  marginTop: 16,
                  padding: "14px 16px",
                  background: "rgba(220,38,38,0.06)",
                  border: "1px solid rgba(220,38,38,0.2)",
                  borderRadius: "var(--bl-radius-md)",
                  fontSize: 12,
                  color: "var(--bl-text-muted)",
                  lineHeight: 1.6,
                  display: "flex",
                  gap: 10,
                }}
              >
                <ShieldAlert size={16} style={{ flexShrink: 0, color: "var(--bl-danger)", marginTop: 1 }} />
                <span>
                  <strong style={{ color: "var(--bl-danger)" }}>Disclosure {result.disclaimer_version}:</strong>{" "}
                  {result.legal_notice}
                </span>
              </div>

              <p
                style={{
                  marginTop: 16,
                  fontSize: 12,
                  color: "var(--bl-text-subtle)",
                  lineHeight: 1.5,
                }}
              >
                Need this every week?{" "}
                <Link href="/pricing" style={{ color: "var(--bl-accent)" }}>
                  DocAI Team includes unlimited DPA negotiations
                </Link>{" "}
                ·{" "}
                <Link href="/sqa" style={{ color: "var(--bl-accent)" }}>
                  Try the SQA auto-fill
                </Link>
                .
              </p>
            </div>
          )}
        </div>
      </section>

      <style>{`.spin{animation:spin 0.9s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span
        style={{
          fontFamily: "var(--bl-font-mono)",
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--bl-text-muted)",
        }}
      >
        {label}
      </span>
      {children}
    </label>
  )
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  background: "var(--bl-surface)",
  border: "1px solid var(--bl-border)",
  borderRadius: "var(--bl-radius-sm)",
  color: "var(--bl-text)",
  fontFamily: "var(--bl-font-body)",
  fontSize: 14,
  outline: "none",
}
