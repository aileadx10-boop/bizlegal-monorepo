"use client"

import Link from "next/link"
import { useState } from "react"
import { Loader2, FileText, AlertCircle, CheckCircle, Trash2, Lock, ShieldAlert } from "lucide-react"

const JURISDICTIONS = ["US", "EU", "UK", "IN", "CA", "AU", "SG", "OTHER"] as const

interface KbItem {
  id: string
  source_name: string
  source_url: string
  jurisdiction: string
  topics: string[]
  text: string
  last_updated: string
}

export function SqaKbClient() {
  const [email, setEmail] = useState("")
  const [busy, setBusy] = useState(false)
  const [unlocked, setUnlocked] = useState(false)
  const [items, setItems] = useState<KbItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Add-form state
  const [newId, setNewId] = useState("")
  const [newSrcName, setNewSrcName] = useState("")
  const [newSrcUrl, setNewSrcUrl] = useState("")
  const [newJurisdiction, setNewJurisdiction] = useState<(typeof JURISDICTIONS)[number]>("OTHER")
  const [newTopics, setNewTopics] = useState("")
  const [newText, setNewText] = useState("")

  async function unlock(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`/api/sqa/kb/list?email=${encodeURIComponent(email)}`)
      const data = (await res.json().catch(() => ({}))) as { items?: KbItem[]; error?: string; count?: number }
      if (res.status === 402) {
        setError("This email does not have an active Firm-tier subscription. Upgrade at /pricing to access KB upload.")
        return
      }
      if (!res.ok) {
        setError(data.error ?? `Failed (${res.status})`)
        return
      }
      setItems(data.items ?? [])
      setUnlocked(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error.")
    } finally {
      setBusy(false)
    }
  }

  async function addItem(e: React.FormEvent) {
    e.preventDefault()
    if (busy || !unlocked) return
    setBusy(true)
    setError(null)
    setSuccess(null)
    try {
      const item = {
        id: newId.trim(),
        source_name: newSrcName.trim(),
        source_url: newSrcUrl.trim(),
        jurisdiction: newJurisdiction,
        topics: newTopics
          .split(",")
          .map((t) => t.trim().toLowerCase())
          .filter((t) => t.length > 0),
        text: newText.trim(),
      }
      const res = await fetch("/api/sqa/kb/upload", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, items: [item] }),
      })
      const data = (await res.json().catch(() => ({}))) as {
        inserted?: number
        errors?: Array<{ id: string; error: string }>
        error?: string
      }
      if (!res.ok) {
        setError(data.error ?? `Upload failed (${res.status})`)
        return
      }
      if (data.errors && data.errors.length > 0) {
        setError(data.errors.map((e) => `${e.id}: ${e.error}`).join(" · "))
        return
      }
      setSuccess(`Added ${data.inserted} item.`)
      // Reset add form + refresh list
      setNewId("")
      setNewSrcName("")
      setNewSrcUrl("")
      setNewTopics("")
      setNewText("")
      void refreshList()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error.")
    } finally {
      setBusy(false)
    }
  }

  async function deleteItem(id: string) {
    if (busy || !unlocked) return
    if (!confirm(`Delete clause "${id}"? This cannot be undone.`)) return
    setBusy(true)
    setError(null)
    try {
      const res = await fetch("/api/sqa/kb/delete", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, id }),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        setError(data.error ?? `Delete failed (${res.status})`)
        return
      }
      setSuccess(`Deleted ${id}.`)
      void refreshList()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error.")
    } finally {
      setBusy(false)
    }
  }

  async function refreshList() {
    const res = await fetch(`/api/sqa/kb/list?email=${encodeURIComponent(email)}`)
    const data = (await res.json().catch(() => ({}))) as { items?: KbItem[] }
    setItems(data.items ?? [])
  }

  if (!unlocked) {
    return (
      <section
        className="bl-hero-bg"
        style={{ minHeight: "100vh", paddingTop: "clamp(4rem, 2rem + 4vw, 6rem)", paddingBottom: "clamp(2rem, 1.5rem + 2vw, 3rem)" }}
      >
        <div className="bl-container" style={{ maxWidth: 560 }}>
          <span className="bl-tag" style={{ marginBottom: "1rem" }}>
            <Lock size={14} /> Firm-tier KB management
          </span>
          <h1
            style={{
              fontFamily: "var(--bl-font-display)",
              fontSize: "var(--bl-text-h2)",
              fontWeight: 800,
              letterSpacing: "-0.025em",
              lineHeight: 1.1,
              color: "var(--bl-text)",
              margin: "1.5rem 0 1rem",
            }}
          >
            Unlock your <span className="bl-grad-text">firm playbook.</span>
          </h1>
          <p
            style={{
              fontSize: "1.05rem",
              color: "var(--bl-text-muted)",
              lineHeight: 1.6,
              margin: "0 0 1.5rem",
            }}
          >
            Enter the email tied to your active <strong>DocAI Firm</strong> subscription. We&apos;ll match it
            against the payment ledger and unlock KB management for that account.
          </p>

          <form onSubmit={unlock} className="bl-card" style={{ display: "grid", gap: "1rem" }}>
            <Field label="Firm subscription email">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="firm-admin@yourfirm.com"
                required
                autoComplete="email"
                style={inputStyle}
              />
            </Field>

            <button
              type="submit"
              disabled={busy || !email}
              className="bl-btn-primary"
              style={{ justifyContent: "center", opacity: busy || !email ? 0.6 : 1 }}
            >
              {busy ? <Loader2 size={16} className="spin" /> : <Lock size={16} />}
              {busy ? "Verifying…" : "Unlock KB management"}
            </button>

            {error && <ErrorBlock message={error} />}
          </form>

          <p style={{ fontSize: 12, color: "var(--bl-text-subtle)", lineHeight: 1.55, fontStyle: "italic", marginTop: 16 }}>
            Don&apos;t have a Firm subscription yet?{" "}
            <Link href="/pricing" style={{ color: "var(--bl-accent)" }}>
              Upgrade
            </Link>{" "}
            ($99/mo) to unlock KB upload + 150 SQA drafts/mo + API access.
          </p>
        </div>
        <style>{`.spin{animation:spin 0.9s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </section>
    )
  }

  return (
    <>
      <section
        className="bl-hero-bg"
        style={{ paddingTop: "clamp(3rem, 2rem + 3vw, 5rem)", paddingBottom: "clamp(1rem, 1rem + 1vw, 2rem)" }}
      >
        <div className="bl-container" style={{ maxWidth: 880 }}>
          <span className="bl-tag" style={{ marginBottom: "1rem", color: "var(--bl-success)" }}>
            <CheckCircle size={14} /> Firm tier active · {email}
          </span>
          <h1
            style={{
              fontFamily: "var(--bl-font-display)",
              fontSize: "var(--bl-text-h2)",
              fontWeight: 800,
              letterSpacing: "-0.025em",
              color: "var(--bl-text)",
              margin: "1rem 0",
            }}
          >
            Your firm KB · {items.length} clauses
          </h1>
          <p style={{ color: "var(--bl-text-muted)", lineHeight: 1.6, margin: 0 }}>
            Items uploaded here are blended with our regulator-curated seed KB at retrieval time. Your clauses are
            cited inline in SQA drafts as first-party material distinct from public regulatory text.
          </p>
        </div>
      </section>

      <section className="bl-section" style={{ paddingTop: "clamp(1rem, 0.5rem + 1vw, 2rem)" }}>
        <div className="bl-container" style={{ maxWidth: 880 }}>
          <form onSubmit={addItem} className="bl-card" style={{ display: "grid", gap: "1rem" }}>
            <h2
              style={{
                fontFamily: "var(--bl-font-display)",
                fontSize: "1.25rem",
                fontWeight: 700,
                color: "var(--bl-text)",
                margin: 0,
              }}
            >
              Add a clause
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
              <Field label="Item id (alphanumeric, dot, hyphen, underscore)">
                <input
                  type="text"
                  value={newId}
                  onChange={(e) => setNewId(e.target.value)}
                  placeholder="firm.aml-policy-2024"
                  required
                  pattern="[a-zA-Z0-9_.\-]+"
                  maxLength={80}
                  style={inputStyle}
                />
              </Field>

              <Field label="Jurisdiction">
                <select
                  value={newJurisdiction}
                  onChange={(e) => setNewJurisdiction(e.target.value as typeof newJurisdiction)}
                  style={inputStyle}
                >
                  {JURISDICTIONS.map((j) => (
                    <option key={j} value={j}>
                      {j}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Source name">
              <input
                type="text"
                value={newSrcName}
                onChange={(e) => setNewSrcName(e.target.value)}
                placeholder="Firm AML Policy 2024 — section 4.2"
                required
                maxLength={200}
                style={inputStyle}
              />
            </Field>

            <Field label="Source URL (https://… — your firm's intranet doc URL is fine)">
              <input
                type="url"
                value={newSrcUrl}
                onChange={(e) => setNewSrcUrl(e.target.value)}
                placeholder="https://intranet.yourfirm.com/policies/aml-2024"
                required
                maxLength={500}
                style={inputStyle}
              />
            </Field>

            <Field label="Topics (comma-separated)">
              <input
                type="text"
                value={newTopics}
                onChange={(e) => setNewTopics(e.target.value)}
                placeholder="aml, kyc, customer-due-diligence"
                maxLength={500}
                style={inputStyle}
              />
            </Field>

            <Field label="Clause text">
              <textarea
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                rows={6}
                placeholder="The actual clause text that the Sonnet drafter will retrieve and cite. ≥20 chars; max 12000."
                required
                minLength={20}
                maxLength={12000}
                style={{ ...inputStyle, resize: "vertical" as const, fontFamily: "inherit", lineHeight: 1.6 }}
              />
              <div style={{ fontSize: 11, color: "var(--bl-text-subtle)", marginTop: 4, fontFamily: "var(--bl-font-mono)" }}>
                {newText.length}/12000 chars
              </div>
            </Field>

            <button
              type="submit"
              disabled={busy || !newId || !newSrcName || !newSrcUrl || newText.length < 20}
              className="bl-btn-primary"
              style={{
                justifyContent: "center",
                opacity: busy || !newId || newText.length < 20 ? 0.6 : 1,
              }}
            >
              {busy ? <Loader2 size={16} className="spin" /> : <FileText size={16} />}
              {busy ? "Saving…" : "Add to KB"}
            </button>

            {error && <ErrorBlock message={error} />}
            {success && (
              <div
                role="status"
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 8,
                  padding: "10px 12px",
                  background: "rgba(22,163,74,0.08)",
                  color: "var(--bl-success)",
                  borderRadius: "var(--bl-radius-md)",
                  fontSize: 13,
                  lineHeight: 1.5,
                }}
              >
                <CheckCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>{success}</span>
              </div>
            )}
          </form>
        </div>
      </section>

      {items.length > 0 && (
        <section className="bl-section">
          <div className="bl-container" style={{ maxWidth: 880 }}>
            <h2
              style={{
                fontFamily: "var(--bl-font-display)",
                fontSize: "1.25rem",
                fontWeight: 700,
                color: "var(--bl-text)",
                margin: "0 0 1rem",
              }}
            >
              Existing KB items
            </h2>
            <div style={{ display: "grid", gap: 12 }}>
              {items.map((it) => (
                <div
                  key={it.id}
                  className="bl-card"
                  style={{ padding: "16px 20px", display: "grid", gap: 8 }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span className="bl-label" style={{ fontSize: 10 }}>
                        {it.id}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--bl-font-mono)",
                          fontSize: 10,
                          fontWeight: 600,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          color: "var(--bl-text-subtle)",
                          padding: "2px 6px",
                          background: "var(--bl-surface-soft)",
                          border: "1px solid var(--bl-border)",
                          borderRadius: 4,
                        }}
                      >
                        {it.jurisdiction}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteItem(it.id)}
                      disabled={busy}
                      style={{
                        background: "transparent",
                        border: "1px solid var(--bl-border)",
                        color: "var(--bl-danger)",
                        borderRadius: "var(--bl-radius-sm)",
                        padding: "6px 10px",
                        fontSize: 12,
                        fontFamily: "var(--bl-font-mono)",
                        cursor: busy ? "not-allowed" : "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                  <strong style={{ color: "var(--bl-text)", fontSize: 14 }}>{it.source_name}</strong>
                  <a
                    href={it.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "var(--bl-accent)", fontSize: 12, wordBreak: "break-all" }}
                  >
                    {it.source_url}
                  </a>
                  {it.topics.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {it.topics.map((t) => (
                        <span
                          key={t}
                          style={{
                            fontFamily: "var(--bl-font-mono)",
                            fontSize: 10,
                            color: "var(--bl-text-muted)",
                            background: "var(--bl-surface-soft)",
                            padding: "2px 8px",
                            borderRadius: 4,
                          }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                  <p
                    style={{
                      fontSize: 13,
                      color: "var(--bl-text-muted)",
                      lineHeight: 1.55,
                      margin: 0,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {it.text.slice(0, 320)}
                    {it.text.length > 320 ? "…" : ""}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="bl-section">
        <div className="bl-container" style={{ maxWidth: 720 }}>
          <div
            className="bl-card"
            style={{
              padding: "16px 20px",
              background: "rgba(220,38,38,0.04)",
              border: "1px solid rgba(220,38,38,0.2)",
              display: "flex",
              gap: 12,
              alignItems: "flex-start",
            }}
          >
            <ShieldAlert size={18} style={{ color: "var(--bl-danger)", flexShrink: 0, marginTop: 2 }} />
            <div style={{ fontSize: 13, color: "var(--bl-text-muted)", lineHeight: 1.6 }}>
              <strong style={{ color: "var(--bl-danger)" }}>Customer-managed library.</strong> BizLegal does not
              vet KB content. Items uploaded here become first-party material that the SQA drafter retrieves and
              cites alongside our regulator-curated seed entries. Your firm is responsible for the accuracy and
              currency of what you upload.
            </div>
          </div>
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

function ErrorBlock({ message }: { message: string }) {
  return (
    <div
      role="alert"
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 8,
        padding: "10px 12px",
        background: "rgba(220,38,38,0.08)",
        color: "var(--bl-danger)",
        borderRadius: "var(--bl-radius-md)",
        fontSize: 13,
        lineHeight: 1.5,
      }}
    >
      <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
      <span>{message}</span>
    </div>
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
