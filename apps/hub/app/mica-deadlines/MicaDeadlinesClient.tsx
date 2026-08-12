"use client"

import Link from "next/link"
import { useState } from "react"
import type { MicaDeadlineView } from "@/lib/mica-deadlines"

const TYPE_LABEL: Record<string, string> = {
  deadline: "Deadline",
  transition: "Transition",
  guidance: "Guidance",
}

function typeColor(t: string): string {
  switch (t) {
    case "deadline":
      return "#f87171"
    case "transition":
      return "#fbbf24"
    case "guidance":
      return "#7dd3fc"
    default:
      return "#636680"
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

function DeadlineRow({ row }: { row: MicaDeadlineView }) {
  const color = typeColor(row.item_type)
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "132px 1fr",
        gap: "18px",
        padding: "18px 20px",
        borderRadius: "12px",
        border: "1px solid rgba(165,180,252,0.1)",
        background: "rgba(7,9,26,0.6)",
        borderLeft: row.isUrgent && !row.isPast ? "3px solid #f87171" : `3px solid ${color}55`,
      }}
    >
      <div style={{ textAlign: "right" }}>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "15px",
            color: row.isPast ? "var(--muted)" : "var(--white)",
            whiteSpace: "nowrap",
          }}
        >
          {row.deadline_date}
        </div>
        <div
          style={{
            fontSize: "9px",
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color,
            marginTop: "4px",
          }}
        >
          {TYPE_LABEL[row.item_type] ?? row.item_type}
        </div>
        {row.isPast ? (
          <div style={{ fontSize: "10px", color: "var(--dim)", marginTop: "4px" }}>Passed</div>
        ) : row.isUrgent ? (
          <div style={{ fontSize: "10px", color: "#f87171", fontWeight: 700, marginTop: "4px" }}>
            {row.daysUntil === 0 ? "Today" : `${row.daysUntil} days`}
          </div>
        ) : row.daysUntil !== null ? (
          <div style={{ fontSize: "10px", color: "var(--muted)", marginTop: "4px" }}>
            {row.daysUntil} days
          </div>
        ) : null}
      </div>
      <div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: "16px", color: "var(--white)", lineHeight: 1.4 }}>
          {row.title}
        </div>
        <div style={{ fontSize: "10px", color: "var(--muted)", fontFamily: "var(--font-mono)", margin: "4px 0 8px" }}>
          {row.jurisdiction} · {row.source_name}
        </div>
        <p style={{ fontSize: "13px", color: "var(--on-surface-var)", lineHeight: 1.7, marginBottom: "8px" }}>
          {row.description}
        </p>
        <a
          href={row.source_url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: "12px", color: "#7dd3fc", textDecoration: "none" }}
        >
          Source ↗
        </a>
      </div>
    </div>
  )
}

export default function MicaDeadlinesClient({ rows }: { rows: MicaDeadlineView[] }) {
  const [email, setEmail] = useState("")
  const [jurisdiction, setJurisdiction] = useState("EU")
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle")
  const [message, setMessage] = useState("")

  const urgent = rows.filter((r) => r.isUrgent && !r.isPast)
  const upcoming = rows.filter((r) => !r.isUrgent && !r.isPast)
  const past = rows.filter((r) => r.isPast)

  async function subscribe(e: React.FormEvent) {
    e.preventDefault()
    setStatus("sending")
    setMessage("")
    try {
      const res = await fetch("/api/mica-deadlines/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), jurisdiction }),
      })
      const data = await res.json()
      if (!res.ok) {
        setStatus("error")
        setMessage(data.error ?? "Could not subscribe. Try again.")
        return
      }
      setStatus("done")
      setMessage("Subscribed. Your first digest lands tomorrow.")
      setEmail("")
    } catch {
      setStatus("error")
      setMessage("Network error. Please try again.")
    }
  }

  return (
    <div style={{ maxWidth: "820px", margin: "0 auto", padding: "0 20px" }}>
      {/* Hero */}
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <div className="eyebrow-pill" style={{ display: "inline-flex", marginBottom: "20px" }}>
          <span className="dot" />
          MiCA · Intelligence Feed
        </div>
        <h1 style={{ marginBottom: "14px" }}>
          MiCA Deadline <em style={{ fontStyle: "italic" }}>Tracker</em>
        </h1>
        <p
          style={{
            color: "var(--on-surface-var)",
            maxWidth: "640px",
            margin: "0 auto",
            fontSize: "15px",
            lineHeight: 1.75,
          }}
        >
          Every statutory MiCA milestone for crypto-asset service providers — when it hits, who it
          hits, and where to verify. Curated from EUR-Lex and ESMA, refreshed daily.
        </p>
      </div>

      {/* Subscribe */}
      <div
        className="glass-card"
        style={{ padding: "22px 24px", borderRadius: "16px", marginBottom: "28px" }}
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
          Daily digest
        </div>
        <p style={{ fontSize: "13px", color: "var(--on-surface-var)", lineHeight: 1.7, marginBottom: "14px" }}>
          Get one email a day with upcoming deadlines, urgent items, and fresh ESMA activity.
          Free forever.
        </p>
        <form onSubmit={subscribe} style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Work email"
            required
            className="conversion-input"
            style={{ flex: "1 1 200px" }}
          />
          <input
            type="text"
            value={jurisdiction}
            onChange={(e) => setJurisdiction(e.target.value.toUpperCase())}
            placeholder="EU"
            maxLength={3}
            aria-label="Jurisdiction country code"
            className="conversion-input"
            style={{ width: "84px" }}
          />
          <button
            type="submit"
            disabled={status === "sending"}
            className="btn-quantum"
            style={{ fontSize: "13px", opacity: status === "sending" ? 0.7 : 1 }}
          >
            {status === "sending" ? "Subscribing..." : "Subscribe →"}
          </button>
        </form>
        {status === "done" && (
          <div style={{ marginTop: "10px", fontSize: "13px", color: "#10b981" }}>✓ {message}</div>
        )}
        {status === "error" && (
          <div style={{ marginTop: "10px", fontSize: "13px", color: "#f87171" }}>{message}</div>
        )}
        <p style={{ fontSize: "11px", color: "var(--muted)", marginTop: "10px", lineHeight: 1.7 }}>
          No spam. One email daily, unsubscribe anytime.
        </p>
      </div>

      {/* Liability notes */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "28px" }}>
        <LiabilityNote icon="⚖️" color="#fbbf24" text="Deadlines change. Every item carries a citation to the official source — verify the date against your National Competent Authority before acting." />
        <LiabilityNote icon="🎯" color="#a5b4fc" text="This tracker covers EU-wide statutory milestones and ESMA publications. It is not a per-firm obligation map and does not cover every NCA grandfathering window." />
        <LiabilityNote icon="👤" color="#10b981" text="Informational monitoring only — not legal advice. Confirm material obligations with a qualified compliance reviewer." />
      </div>

      {/* Urgent */}
      {urgent.length > 0 && (
        <div style={{ marginBottom: "28px" }}>
          <div className="quantum-label" style={{ marginBottom: "12px", color: "#f87171" }}>
            Urgent — within 90 days
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {urgent.map((r) => (
              <DeadlineRow key={r.id} row={r} />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div style={{ marginBottom: "28px" }}>
          <div className="quantum-label" style={{ marginBottom: "12px", color: "#fbbf24" }}>
            Upcoming
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {upcoming.map((r) => (
              <DeadlineRow key={r.id} row={r} />
            ))}
          </div>
        </div>
      )}

      {/* Passed */}
      {past.length > 0 && (
        <div style={{ marginBottom: "28px" }}>
          <div className="quantum-label" style={{ marginBottom: "12px", color: "var(--muted)" }}>
            Passed milestones
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {past.map((r) => (
              <DeadlineRow key={r.id} row={r} />
            ))}
          </div>
        </div>
      )}

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
          Not just when — what you must do
        </div>
        <p style={{ fontSize: "13px", color: "var(--on-surface-var)", lineHeight: 1.75, marginBottom: "14px" }}>
          Deadlines are only half the picture. Run the MiCA Readiness Assessment to see how your
          firm maps against the licensing obligations behind each milestone, with citations.
        </p>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <Link href="/mica-readiness" className="btn-quantum" style={{ fontSize: "13px" }}>
            Run the MiCA Readiness Assessment →
          </Link>
          <Link href="/tools" className="btn-ghost-quantum" style={{ fontSize: "13px" }}>
            More compliance tools
          </Link>
        </div>
      </div>
    </div>
  )
}
