"use client"

import { type MicaAreaScore, type MicaGap, type MicaReport, QUESTIONS } from "@/lib/mica-readiness"
import Link from "next/link"
import { useState } from "react"

const TIER_COLORS: Record<string, string> = {
  "Critical Gap": "#f87171",
  "At Risk": "#fbbf24",
  "Nearly Ready": "#7dd3fc",
  Ready: "#10b981",
}

const SEVERITY_COLORS: Record<string, string> = {
  Critical: "#f87171",
  High: "#fbbf24",
  Medium: "#7dd3fc",
  Low: "#636680",
}

const STATUS_COLORS: Record<string, string> = {
  OK: "#10b981",
  PARTIAL: "#fbbf24",
  GAP: "#f87171",
}

function tierColor(tier: string): string {
  return TIER_COLORS[tier] ?? "#a5b4fc"
}

function optionButtonStyle(selected: boolean): React.CSSProperties {
  return {
    width: "100%",
    textAlign: "left",
    padding: "14px 16px",
    borderRadius: "10px",
    border: selected ? "1px solid rgba(212,168,83,0.45)" : "1px solid var(--outline-var)",
    background: selected ? "rgba(212,168,83,0.08)" : "rgba(14,22,36,0.72)",
    color: selected ? "var(--white)" : "var(--on-surface-var)",
    fontSize: "13px",
    lineHeight: 1.55,
    cursor: "pointer",
    fontFamily: "var(--font-body)",
    transition: "border-color 0.15s, background 0.15s",
  }
}

function LiabilityNote({ icon, color, text }: { icon: string; color: string; text: string }) {
  return (
    <div
      style={{
        display: "flex",
        gap: "10px",
        padding: "12px 16px",
        borderRadius: "10px",
        border: `1px solid ${color}30`,
        background: `${color}08`,
        fontSize: "12px",
        lineHeight: 1.7,
        color: "var(--on-surface-var)",
      }}
    >
      <span style={{ flexShrink: 0 }}>{icon}</span>
      <span>{text}</span>
    </div>
  )
}

function GapCard({ gap }: { gap: MicaGap }) {
  const color = SEVERITY_COLORS[gap.severity] ?? "#636680"
  return (
    <div
      style={{
        padding: "20px 20px 20px 24px",
        borderRadius: "12px",
        border: "1px solid rgba(165,180,252,0.1)",
        background: "rgba(7,9,26,0.6)",
        borderLeft: `3px solid ${color}`,
      }}
    >
      <div
        style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}
      >
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "17px",
            color: "var(--white)",
            marginBottom: "4px",
          }}
        >
          {gap.title}
        </div>
        <span
          style={{
            padding: "3px 10px",
            borderRadius: "100px",
            fontSize: "10px",
            fontWeight: 700,
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color,
            border: `1px solid ${color}40`,
            background: `${color}10`,
            alignSelf: "flex-start",
          }}
        >
          {gap.severity}
        </span>
      </div>
      <div
        style={{
          fontSize: "10px",
          color: "var(--muted)",
          fontFamily: "var(--font-mono)",
          marginBottom: "8px",
        }}
      >
        {gap.category}
      </div>
      <p
        style={{
          fontSize: "13px",
          color: "var(--on-surface-var)",
          lineHeight: 1.7,
          marginBottom: "8px",
        }}
      >
        {gap.detail}
      </p>
      <p style={{ fontSize: "12px", color: "var(--muted)", lineHeight: 1.7, marginBottom: "10px" }}>
        <span style={{ color: "#f0c97a" }}>Citation: </span>
        {gap.citation}
      </p>
      <p style={{ fontSize: "12px", color: "#7dd3fc", lineHeight: 1.7 }}>
        <span style={{ fontWeight: 700 }}>Recommended next step: </span>
        {gap.recommendation}
      </p>
    </div>
  )
}

function AreaRow({ area }: { area: MicaAreaScore }) {
  const color = STATUS_COLORS[area.status] ?? "#636680"
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto",
        gap: "12px",
        alignItems: "center",
        padding: "10px 0",
        borderBottom: "1px solid rgba(165,180,252,0.05)",
      }}
    >
      <div>
        <div style={{ fontSize: "13px", color: "var(--white)" }}>{area.category}</div>
        <div
          style={{
            height: "4px",
            borderRadius: "2px",
            background: "rgba(165,180,252,0.08)",
            overflow: "hidden",
            marginTop: "6px",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${area.score}%`,
              background: color,
              borderRadius: "2px",
            }}
          />
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div
          style={{ fontSize: "14px", color, fontFamily: "var(--font-display)", fontWeight: 600 }}
        >
          {area.score}
        </div>
        <div
          style={{
            fontSize: "9px",
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.1em",
            color: "var(--muted)",
          }}
        >
          {area.status}
        </div>
      </div>
    </div>
  )
}

function ReportView({ report, onReset }: { report: MicaReport; onReset: () => void }) {
  const color = tierColor(report.tier)
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "22px",
        animation: "fade-up 0.5s ease",
      }}
    >
      {/* Score header */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "200px 1fr",
          gap: "20px",
          alignItems: "center",
        }}
        className="glass-card"
      >
        <div style={{ textAlign: "center", padding: "24px 16px" }}>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "72px",
              lineHeight: 1,
              color,
              fontWeight: 500,
            }}
          >
            {report.score}
          </div>
          <div
            style={{
              fontSize: "10px",
              fontFamily: "var(--font-mono)",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--muted)",
              marginTop: "6px",
            }}
          >
            Readiness score
          </div>
          <div
            style={{
              display: "inline-block",
              marginTop: "10px",
              padding: "5px 14px",
              borderRadius: "100px",
              fontSize: "11px",
              fontWeight: 700,
              fontFamily: "var(--font-mono)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color,
              border: `1px solid ${color}40`,
              background: `${color}10`,
            }}
          >
            {report.tier}
          </div>
        </div>
        <div style={{ padding: "24px 24px 24px 8px" }}>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "22px",
              color: "var(--white)",
              lineHeight: 1.35,
              marginBottom: "10px",
            }}
          >
            MiCA readiness snapshot
          </div>
          <p style={{ fontSize: "13px", color: "var(--muted)", lineHeight: 1.75 }}>
            {report.tierSummary}
          </p>
        </div>
      </div>

      {/* Liability notes */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <LiabilityNote icon="⚖️" color="#fbbf24" text={report.liability.disclaimer} />
        <LiabilityNote icon="🎯" color="#a5b4fc" text={report.liability.scope} />
        <LiabilityNote icon="👤" color="#10b981" text={report.liability.humanReview} />
      </div>

      {/* Prioritized gaps */}
      <div>
        <div className="quantum-label" style={{ marginBottom: "12px", color: "#f87171" }}>
          Prioritized gap list
        </div>
        {report.gaps.length === 0 ? (
          <div className="glass-card" style={{ padding: "20px 24px" }}>
            <p style={{ fontSize: "14px", color: "var(--on-surface-var)", lineHeight: 1.7 }}>
              No material gaps were identified for the obligations covered by this assessment.
              Verify the result with a qualified reviewer before any filing.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {report.gaps.map((gap) => (
              <GapCard key={gap.id} gap={gap} />
            ))}
          </div>
        )}
      </div>

      {/* Covered areas */}
      {report.covered.length > 0 && (
        <div>
          <div className="quantum-label" style={{ marginBottom: "10px", color: "#10b981" }}>
            Covered areas
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {report.covered.map((c) => (
              <span
                key={c}
                style={{
                  padding: "5px 12px",
                  borderRadius: "100px",
                  fontSize: "11px",
                  fontFamily: "var(--font-mono)",
                  color: "#10b981",
                  border: "1px solid rgba(16,185,129,0.3)",
                  background: "rgba(16,185,129,0.06)",
                }}
              >
                ✓ {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Area breakdown */}
      <div className="glass-card" style={{ padding: "20px 24px" }}>
        <div className="quantum-label" style={{ marginBottom: "6px" }}>
          Area breakdown
        </div>
        <div style={{ marginTop: "6px" }}>
          {report.areas.map((area) => (
            <AreaRow key={area.id} area={area} />
          ))}
        </div>
      </div>

      {/* CTA */}
      <div
        style={{
          padding: "24px",
          borderRadius: "14px",
          border: "1px solid rgba(212,168,83,0.2)",
          background: "rgba(212,168,83,0.05)",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--gold)",
            marginBottom: "10px",
          }}
        >
          Full MiCA gap analysis
        </div>
        <p
          style={{
            fontSize: "13px",
            color: "var(--on-surface-var)",
            lineHeight: 1.75,
            marginBottom: "14px",
          }}
        >
          This snapshot prioritises where to look next. For a formal, evidence-backed gap analysis
          with a remediation roadmap across eight regulatory modules — including MiCA — run the
          Forge compliance scanner. A qualified reviewer verifies findings before any regulatory
          filing.
        </p>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <Link href="/forge" className="btn-quantum" style={{ fontSize: "13px" }}>
            Start Forge compliance scan →
          </Link>
          <Link href="/contact" className="btn-ghost-quantum" style={{ fontSize: "13px" }}>
            Talk to a reviewer
          </Link>
          <button
            type="button"
            onClick={onReset}
            className="btn-ghost-quantum"
            style={{ fontSize: "13px" }}
          >
            Restart assessment
          </button>
        </div>
      </div>
    </div>
  )
}

export default function MicaReadinessClient() {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [step, setStep] = useState(0)
  const [email, setEmail] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [report, setReport] = useState<MicaReport | null>(null)

  const total = QUESTIONS.length
  const current = QUESTIONS[step]
  const isReview = step >= total
  const answeredCount = QUESTIONS.filter((q) => answers[q.id]).length
  const progress = Math.round((answeredCount / total) * 100)

  function selectAnswer(questionId: string, value: string) {
    const next = { ...answers, [questionId]: value }
    setAnswers(next)
    setError("")
    if (step < total - 1) {
      setStep(step + 1)
    } else {
      setStep(total)
    }
  }

  async function submit() {
    setSubmitting(true)
    setError("")
    try {
      const res = await fetch("/api/mica-readiness", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, email: email.trim() || undefined }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Failed to compute your report. Please try again.")
        return
      }
      setReport(data as MicaReport)
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  function reset() {
    setAnswers({})
    setStep(0)
    setEmail("")
    setReport(null)
    setError("")
  }

  return (
    <div data-product="forge" style={{ maxWidth: "820px", margin: "0 auto", padding: "0 20px" }}>
      {/* Hero */}
      <div style={{ textAlign: "center", marginBottom: "36px" }}>
        <div className="eyebrow-pill" style={{ display: "inline-flex", marginBottom: "20px" }}>
          <span className="dot" />
          MiCA · Compliance Tool
        </div>
        <h1 style={{ marginBottom: "14px" }}>
          MiCA Readiness <em style={{ fontStyle: "italic" }}>Assessment</em>
        </h1>
        <p
          style={{
            color: "var(--on-surface-var)",
            maxWidth: "620px",
            margin: "0 auto",
            fontSize: "15px",
            lineHeight: 1.75,
          }}
        >
          Ten questions, sixty seconds. See how your firm maps against the core MiCA licensing
          obligations every CASP must handle, with a prioritized gap list and regulation citations.
        </p>
      </div>

      {/* Progress */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
          <span
            style={{
              fontSize: "10px",
              fontFamily: "var(--font-mono)",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--muted)",
            }}
          >
            {isReview ? "Review" : `Question ${step + 1} of ${total}`}
          </span>
          <span style={{ fontSize: "10px", fontFamily: "var(--font-mono)", color: "var(--muted)" }}>
            {progress}%
          </span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {report ? (
        <ReportView report={report} onReset={reset} />
      ) : !isReview && current ? (
        <div className="glass-card" style={{ padding: "28px", borderRadius: "18px" }}>
          <div
            style={{
              fontSize: "10px",
              fontFamily: "var(--font-mono)",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--gold)",
              marginBottom: "10px",
            }}
          >
            {current.category}
          </div>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "20px",
              color: "var(--white)",
              lineHeight: 1.45,
              marginBottom: "8px",
            }}
          >
            {current.prompt}
          </div>
          {current.help && (
            <p
              style={{
                fontSize: "12px",
                color: "var(--muted)",
                lineHeight: 1.7,
                marginBottom: "20px",
              }}
            >
              {current.help}
            </p>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "20px" }}>
            {(current.options ?? []).map((option) => {
              const selected = answers[current.id] === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => selectAnswer(current.id, option.value)}
                  style={optionButtonStyle(selected)}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
          <div style={{ marginTop: "18px" }}>
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              style={{
                background: "none",
                border: "none",
                fontSize: "12px",
                color: step === 0 ? "var(--dim)" : "var(--muted)",
                cursor: step === 0 ? "not-allowed" : "pointer",
                fontFamily: "var(--font-mono)",
              }}
            >
              ← Back
            </button>
          </div>
        </div>
      ) : (
        /* Review step */
        <div className="glass-card" style={{ padding: "28px", borderRadius: "18px" }}>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--gold)",
              marginBottom: "12px",
            }}
          >
            Review your answers
          </div>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "20px" }}
          >
            {QUESTIONS.map((q, i) => {
              const label =
                (q.options ?? []).find((o) => o.value === answers[q.id])?.label ?? "Not answered"
              const answered = Boolean(answers[q.id])
              return (
                <div
                  key={q.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "12px",
                    padding: "8px 0",
                    borderBottom: "1px solid rgba(165,180,252,0.05)",
                    fontSize: "13px",
                  }}
                >
                  <span style={{ color: "var(--on-surface-var)", flex: 1 }}>
                    <span
                      style={{
                        color: "var(--muted)",
                        fontFamily: "var(--font-mono)",
                        fontSize: "11px",
                        marginRight: "8px",
                      }}
                    >
                      {i + 1}.
                    </span>
                    {q.category}
                  </span>
                  <span style={{ color: answered ? "#f0c97a" : "var(--dim)", textAlign: "right" }}>
                    {label}
                  </span>
                </div>
              )
            })}
          </div>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Work email (optional — for follow-up on your gaps)"
            className="conversion-input"
            style={{ marginBottom: "12px" }}
          />

          {error && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1px solid rgba(248,113,113,0.3)",
                background: "rgba(248,113,113,0.06)",
                color: "#f87171",
                fontSize: "13px",
                marginBottom: "12px",
              }}
            >
              {error}
            </div>
          )}

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={submit}
              disabled={submitting}
              className="btn-quantum"
              style={{
                fontSize: "13px",
                opacity: submitting ? 0.7 : 1,
                cursor: submitting ? "not-allowed" : "pointer",
              }}
            >
              {submitting ? "Computing..." : "Get my readiness report →"}
            </button>
            <button
              type="button"
              onClick={() => setStep(0)}
              className="btn-ghost-quantum"
              style={{ fontSize: "13px" }}
            >
              ← Start over
            </button>
          </div>
          <p
            style={{ fontSize: "11px", color: "var(--muted)", marginTop: "12px", lineHeight: 1.7 }}
          >
            This is an informational snapshot, not legal advice. Your answers are used only to
            compute the report; the email is optional and only for follow-up.
          </p>
        </div>
      )}
    </div>
  )
}
