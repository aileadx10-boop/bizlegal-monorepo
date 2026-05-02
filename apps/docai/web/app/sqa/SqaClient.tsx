"use client";

import Link from "next/link";
import { useState } from "react";
import { Loader2, FileText, AlertCircle, CheckCircle } from "lucide-react";

const FRAMEWORKS = [
  { value: "soc2", label: "SOC 2 (AICPA)" },
  { value: "caiq", label: "CAIQ (CSA Cloud Controls Matrix)" },
  { value: "sig-lite", label: "SIG-Lite" },
  { value: "sig", label: "SIG (full)" },
  { value: "nist", label: "NIST 800-53 / CSF" },
] as const;

interface DraftResponse {
  draft_id: string;
  question: string;
  answer: string;
  citations: ReadonlyArray<{ source_name: string; source_url: string }>;
  confidence: { value: number; band: string };
  out_of_scope: boolean;
  disclaimer_version: string;
  issued_at: string;
}

export function SqaClient() {
  const [question, setQuestion] = useState("");
  const [framework, setFramework] = useState<(typeof FRAMEWORKS)[number]["value"]>("soc2");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState<DraftResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (question.trim().length < 8) {
      setError("Paste at least 8 characters of the question.");
      return;
    }
    setBusy(true);
    setDraft(null);
    setError(null);
    try {
      const res = await fetch("/api/sqa/draft", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question, framework, email: email || undefined }),
      });
      const data = (await res.json().catch(() => ({}))) as Partial<DraftResponse> & { error?: string };
      if (!res.ok) {
        setError(data.error ?? `Draft failed (${res.status}). Please try again.`);
        return;
      }
      if (data.draft_id && data.answer) {
        setDraft(data as DraftResponse);
      } else {
        setError("Draft returned empty. Please try again.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error.");
    } finally {
      setBusy(false);
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
            <FileText size={14} /> Free first draft · No card · 60 seconds
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
            Vendor questionnaire? <span className="bl-grad-text">Drafted in 60s.</span>
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
            Paste the question. Pick your framework. Get a citation-grounded
            draft answer powered by Claude Sonnet 4.6 + DocAI's clause
            knowledge base. Free for the first one. Upgrade for unlimited
            on the Team or Firm tier.
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

            <Field label="Question (or pasted control text)">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={6}
                placeholder="e.g., Describe your encryption-at-rest controls for customer data, including key management."
                maxLength={4000}
                style={{ ...inputStyle, resize: "vertical" as const, fontFamily: "inherit", lineHeight: 1.6 }}
              />
              <div style={{ fontSize: 11, color: "var(--bl-text-subtle)", marginTop: 4, fontFamily: "var(--bl-font-mono)" }}>
                {question.length}/4000 chars
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
              disabled={busy || question.trim().length < 8}
              className="bl-btn-primary"
              style={{
                opacity: busy || question.trim().length < 8 ? 0.6 : 1,
                cursor: busy || question.trim().length < 8 ? "not-allowed" : "pointer",
                justifyContent: "center",
              }}
            >
              {busy ? <Loader2 size={16} className="spin" /> : <FileText size={16} />}
              {busy ? "Drafting — ~10s" : "Draft my response (free)"}
            </button>

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
                  <strong>Draft failed:</strong> {error}
                </span>
              </div>
            )}
          </form>

          {draft && (
            <div
              className="bl-card"
              style={{
                marginTop: "1.5rem",
                background: "var(--bl-surface)",
                borderColor: draft.out_of_scope ? "var(--bl-warning)" : "var(--bl-accent)",
                borderWidth: 2,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                {draft.out_of_scope ? (
                  <AlertCircle size={18} style={{ color: "var(--bl-warning)" }} />
                ) : (
                  <CheckCircle size={18} style={{ color: "var(--bl-accent)" }} />
                )}
                <span
                  className="bl-label"
                  style={{ color: draft.out_of_scope ? "var(--bl-warning)" : "var(--bl-accent)", fontSize: 11 }}
                >
                  {draft.out_of_scope
                    ? "Out of current KB scope · admitting limits"
                    : `Drafted · confidence ${draft.confidence.band}`}
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
                Draft response
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
                {draft.answer}
              </div>

              {draft.citations.length > 0 && (
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
                    {draft.citations.map((c) => (
                      <li key={c.source_name} style={{ marginBottom: 4 }}>
                        <a href={c.source_url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--bl-accent)" }}>
                          {c.source_name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <p
                style={{
                  marginTop: 16,
                  fontSize: 11,
                  color: "var(--bl-text-subtle)",
                  fontStyle: "italic",
                  lineHeight: 1.5,
                }}
              >
                Disclosure {draft.disclaimer_version} — Intelligence not legal advice. Review the
                draft against your firm's policy before sending. Need 50+ drafts a month?{" "}
                <Link href="/pricing" style={{ color: "var(--bl-accent)" }}>
                  Get the Team tier
                </Link>
                .
              </p>
            </div>
          )}
        </div>
      </section>

      <section
        className="bl-section"
        style={{ background: "var(--bl-bg-low)", borderTop: "1px solid var(--bl-divider)" }}
      >
        <div className="bl-container-narrow" style={{ textAlign: "center" }}>
          <span className="bl-label" style={{ color: "var(--bl-accent)" }}>— Why DocAI SQA</span>
          <h2
            style={{
              fontFamily: "var(--bl-font-display)",
              fontSize: "var(--bl-text-h2)",
              fontWeight: 800,
              letterSpacing: "-0.025em",
              color: "var(--bl-text)",
              margin: "0.5rem 0 1rem",
            }}
          >
            Citation-grounded. <span className="bl-grad-text">Anti-hallucination by design.</span>
          </h2>
          <p
            style={{
              fontSize: "var(--bl-text-body)",
              color: "var(--bl-text-muted)",
              lineHeight: 1.6,
              margin: "0 auto 1.5rem",
              maxWidth: 640,
            }}
          >
            DocAI never fabricates a control. If the knowledge base lacks
            material to answer a question, the draft admits the limit and
            flags it for human review — not a confidently wrong answer.
            Upload your firm's policy library on the Firm tier so every
            draft cites your own playbook.
          </p>
          <Link href="/pricing" className="bl-btn-primary">
            See pricing
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      <style>{`.spin{animation:spin 0.9s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </>
  );
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
  );
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
};
