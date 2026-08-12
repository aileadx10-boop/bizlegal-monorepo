"use client"

import Link from "next/link"
import { useState } from "react"

interface Hit {
  list: string
  listName: string
  sourceUrl: string
  retrievedAt: string | null
  listVersion: string | null
}

interface ScreenResult {
  address: string
  status: "hit" | "clean" | "list-not-found" | "unsupported"
  reason: string
  hits: Hit[]
  listsLoaded: string[]
  listsMissing: string[]
  checkedAt: string
}

const STATUS_META: Record<ScreenResult["status"], { label: string; color: string }> = {
  hit: { label: "MATCH FOUND", color: "#f87171" },
  clean: { label: "NO MATCH", color: "#10b981" },
  "list-not-found": { label: "COULD NOT VERIFY", color: "#fbbf24" },
  unsupported: { label: "NOT SCREENED", color: "#fbbf24" },
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: "10px",
  border: "1px solid var(--outline-var)",
  background: "rgba(14,22,36,0.72)",
  color: "var(--white)",
  fontSize: "14px",
  fontFamily: "var(--font-mono)",
  outline: "none",
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "11px",
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  color: "var(--muted)",
  marginBottom: "8px",
  fontFamily: "var(--font-body)",
}

function LiabilityNote() {
  return (
    <div
      style={{
        display: "flex",
        gap: "10px",
        padding: "12px 16px",
        borderRadius: "10px",
        border: "1px solid rgba(165,180,252,0.14)",
        background: "rgba(165,180,252,0.05)",
        fontSize: "12px",
        lineHeight: 1.7,
        color: "var(--on-surface-var)",
      }}
    >
      <span style={{ flexShrink: 0 }}>⚖️</span>
      <span>
        This is a <strong>screening snapshot</strong>, not a legal opinion. It checks one address
        against the loaded versions of the OFAC, UN and EU lists at the time of your request. Lists
        change daily — a clear result does not guarantee a clean counterparty, and no outcome is
        guaranteed. For ongoing monitoring, see the{" "}
        <Link href="/agents/boi-tracker" style={{ color: "var(--accent)" }}>
          compliance monitor
        </Link>
        .
      </span>
    </div>
  )
}

export default function WalletScreenerClient() {
  const [address, setAddress] = useState("")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ScreenResult | null>(null)
  const [error, setError] = useState("")

  async function runScreen(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setResult(null)
    if (!address.trim()) {
      setError("Enter an Ethereum address to screen (0x + 40 hex characters).")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/tools/wallet-screener", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, email: email || undefined }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Screening failed. Please try again.")
        return
      }
      setResult(data)
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const meta = result ? STATUS_META[result.status] : null

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <span
          style={{
            display: "inline-block",
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            color: "var(--accent)",
            fontWeight: 700,
            marginBottom: 12,
          }}
        >
          Free tool · no account required
        </span>
        <h1
          style={{
            fontSize: "clamp(1.8rem, 1rem + 2.5vw, 2.6rem)",
            fontWeight: 700,
            color: "var(--white)",
            letterSpacing: "-0.02em",
            lineHeight: 1.15,
            marginBottom: 12,
          }}
        >
          Sanctions &amp; Wallet Screener
        </h1>
        <p style={{ fontSize: 15, color: "var(--on-surface-var)", lineHeight: 1.7, maxWidth: 560, margin: "0 auto" }}>
          Paste one Ethereum address to check it against the OFAC SDN, UN Consolidated, and EU
          Financial Sanctions lists. Instant result with list citations — the same data a CASP must
          screen against under MiCA.
        </p>
      </div>

      {/* Input */}
      <form
        onSubmit={runScreen}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          padding: 24,
          borderRadius: 14,
          border: "1px solid rgba(165,180,252,0.12)",
          background: "rgba(7,9,26,0.6)",
          marginBottom: 16,
        }}
      >
        <div>
          <label style={labelStyle}>Wallet address (EVM)</label>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="0x…"
            style={inputStyle}
            inputMode="text"
            autoComplete="off"
            spellCheck={false}
          />
        </div>
        <div>
          <label style={labelStyle}>
            Email <span style={{ opacity: 0.6 }}>(optional — get a re-check reminder, never required)</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@firm.com"
            style={inputStyle}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "13px 20px",
            borderRadius: "10px",
            border: "none",
            background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)",
            color: "#050509",
            fontWeight: 700,
            fontSize: 14,
            cursor: loading ? "wait" : "pointer",
            fontFamily: "var(--font-body)",
          }}
        >
          {loading ? "Screening…" : "Screen address"}
        </button>
        {error && (
          <p style={{ margin: 0, fontSize: 13, color: "#f87171" }}>{error}</p>
        )}
      </form>

      {/* Result */}
      {result && meta && (
        <div
          style={{
            padding: 20,
            borderRadius: 14,
            border: `1px solid ${meta.color}30`,
            background: `${meta.color}08`,
            marginBottom: 16,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
            <div>
              <span
                style={{
                  display: "inline-block",
                  padding: "3px 10px",
                  borderRadius: "100px",
                  fontSize: 10,
                  fontWeight: 700,
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: meta.color,
                  border: `1px solid ${meta.color}40`,
                  background: `${meta.color}10`,
                  marginBottom: 8,
                }}
              >
                {meta.label}
              </span>
              <div style={{ fontSize: 13, color: "var(--on-surface-var)", lineHeight: 1.6 }}>
                {result.reason}
              </div>
              <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--font-mono)", marginTop: 6 }}>
                {result.address.slice(0, 10)}…{result.address.slice(-8)}
                {result.listsLoaded.length > 0 && (
                  <>
                    {" · "}checked {result.listsLoaded.map((l) => l.toUpperCase()).join(", ")}
                  </>
                )}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4 }}>
                Checked at
              </div>
              <div style={{ fontSize: 11, color: "var(--on-surface-var)", fontFamily: "var(--font-mono)" }}>
                {new Date(result.checkedAt).toISOString().slice(0, 19).replace("T", " ")}Z
              </div>
            </div>
          </div>

          {result.hits.length > 0 && (
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
              {result.hits.map((h) => (
                <div
                  key={h.list}
                  style={{
                    padding: "12px 14px",
                    borderRadius: "10px",
                    border: "1px solid rgba(248,113,113,0.22)",
                    background: "rgba(248,113,113,0.05)",
                  }}
                >
                  <div style={{ fontSize: 13, color: "#fca5a5", fontWeight: 600, marginBottom: 4 }}>
                    {h.listName}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--font-mono)", lineHeight: 1.7 }}>
                    source: <a href={h.sourceUrl} target="_blank" rel="noreferrer" style={{ color: "var(--accent)" }}>{h.sourceUrl}</a>
                    {h.listVersion && <> · version: {h.listVersion}</>}
                    {h.retrievedAt && <> · list retrieved: {h.retrievedAt.slice(0, 10)}</>}
                  </div>
                </div>
              ))}
              <p style={{ margin: "4px 0 0", fontSize: 12, color: "#f87171", lineHeight: 1.6 }}>
                If this is a customer or counterparty wallet, stop onboarding and escalate to your
                compliance officer for a full review.
              </p>
            </div>
          )}
        </div>
      )}

      <LiabilityNote />

      {/* Cross-sell */}
      <div
        style={{
          marginTop: 32,
          padding: 20,
          borderRadius: 14,
          border: "1px solid rgba(212,168,83,0.18)",
          background: "linear-gradient(135deg, rgba(212,168,83,0.06) 0%, rgba(10,21,32,0.4) 100%)",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: 12, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 8px" }}>
          Need ongoing monitoring?
        </p>
        <p style={{ fontSize: 15, color: "var(--white)", fontWeight: 600, margin: "0 0 12px" }}>
          Watch every counterparty wallet continuously
        </p>
        <p style={{ fontSize: 13, color: "var(--on-surface-var)", lineHeight: 1.6, maxWidth: 460, margin: "0 auto 16px" }}>
          The free screen is one snapshot. CASPs under MiCA need daily re-screening of every
          customer wallet. TRACR gives you continuous sanctions monitoring with alerts.
        </p>
        <Link
          href="/tracr"
          style={{
            display: "inline-block",
            padding: "11px 24px",
            borderRadius: "8px",
            background: "linear-gradient(135deg, #c9a84c 0%, #e6c86e 100%)",
            color: "#050509",
            fontWeight: 700,
            fontSize: 13,
            textDecoration: "none",
          }}
        >
          Explore TRACR monitoring →
        </Link>
      </div>
    </div>
  )
}
