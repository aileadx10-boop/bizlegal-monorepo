"use client";

import Link from "next/link";
import { useState } from "react";
import { Loader2, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { TurnstileWidget } from "@/components/TurnstileWidget";

const FRAMEWORKS = [
  { value: "soc2", label: "SOC 2 (AICPA)" },
  { value: "caiq", label: "CAIQ (CSA Cloud Controls Matrix)" },
  { value: "sig-lite", label: "SIG-Lite" },
  { value: "sig", label: "SIG (full)" },
  { value: "nist", label: "NIST 800-53 / CSF" },
] as const;

interface AskResponse {
  draft_id: string;
  question: string;
  answer: string;
  citations: ReadonlyArray<{ source_name: string; source_url: string }>;
  confidence: { score: number; tier: "auto_deliver" | "human_review" | "hold" };
  out_of_scope: boolean;
  disclaimer_version: string;
  issued_at: string;
  free_questions_remaining: number;
  free_questions_per_day: number;
}

// Matches the apex checkout link pattern used on /pricing verbatim.
function apexCheckout(
  product: string,
  tier: string,
  interval: "one-time" | "monthly" | "yearly",
  amountCents: number,
  name: string,
): string {
  const params = new URLSearchParams({
    product,
    tier,
    interval,
    amount: String(amountCents),
    name,
  });
  return `https://bizlegal-ai.com/checkout?${params.toString()}`;
}

const TEAM_MONTHLY_URL = apexCheckout("docai", "team", "monthly", 6900, "DOCAI team monthly");

const TEAM_FEATURES = [
  "50 SQA drafts / mo (SOC 2, CAIQ, SIG-Lite, SIG, NIST)",
  "50 contract analyses / mo",
  "DPA Negotiator (GDPR / CCPA / HIPAA) included",
  "AI drafting (clauses + redlines)",
  "Vendor questionnaire library",
  "Priority support",
];

export function FreeKbClient() {
  const [question, setQuestion] = useState("");
  const [framework, setFramework] = useState<(typeof FRAMEWORKS)[number]["value"]>("soc2");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState<AskResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [limitHit, setLimitHit] = useState(false);
  const [questionsAsked, setQuestionsAsked] = useState(0);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (question.trim().length < 8) {
      setError("Type at least 8 characters of your question.");
      return;
    }
    setBusy(true);
    setError(null);
    setLimitHit(false);
    try {
      const res = await fetch("/api/free-kb/ask", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          question,
          framework,
          email: email || undefined,
          ...(token ? { turnstile_token: token } : {}),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as Partial<AskResponse> & {
        error?: string;
        message?: string;
      };
      if (res.status === 429) {
        setLimitHit(true);
        setError(data.message ?? "Free question limit reached for today.");
        return;
      }
      if (!res.ok) {
        setError(data.error ?? `Request failed (${res.status}). Please try again.`);
        return;
      }
      if (data.draft_id && data.answer) {
        setDraft(data as AskResponse);
        setQuestionsAsked((n) => n + 1);
      } else {
        setError("Answer returned empty. Please try again.");
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
            <FileText size={14} /> Free · 3 questions / day · No card
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
            Ask the security <span className="bl-grad-text">knowledge base.</span>
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
            Free Q&amp;A against DocAI&apos;s public security-compliance
            knowledge base — SOC 2, CAIQ, SIG-Lite, GDPR coverage. Every
            answer is grounded in cited sources; when coverage is thin, it
            says so instead of guessing. Three free questions a day. The
            Team tier lifts the cap and adds full questionnaire auto-fill.
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

            <Field label="Your question">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={5}
                placeholder="e.g., What should a SOC 2 response say about encryption at rest and key management?"
                maxLength={4000}
                style={{ ...inputStyle, resize: "vertical" as const, fontFamily: "inherit", lineHeight: 1.6 }}
              />
              <div style={{ fontSize: 11, color: "var(--bl-text-subtle)", marginTop: 4, fontFamily: "var(--bl-font-mono)" }}>
                {question.length}/4000 chars
              </div>
            </Field>

            <Field label="Email (optional — get a copy + occasional compliance notes)">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@yourcompany.com"
                style={inputStyle}
                autoComplete="email"
              />
            </Field>

            <TurnstileWidget onToken={setToken} />

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
              {busy ? "Answering — ~10s" : "Ask the knowledge base (free)"}
            </button>

            <p
              style={{
                fontSize: 11,
                color: "var(--bl-text-subtle)",
                fontFamily: "var(--bl-font-mono)",
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              Informational only — not legal, compliance, or audit advice.
              Answers are AI-generated from a public seed knowledge base and
              must be reviewed against your own policies before use.
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
                <span>{error}</span>
              </div>
            )}
          </form>

          {limitHit && <TeamUpgradeCard heading="That's your 3 free questions for today." />}

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
                    : `Answered · confidence ${draft.confidence.tier.replace("_", " ")}`}
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
                Answer
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
                Disclosure {draft.disclaimer_version} — Informational only, not legal
                advice. Verify against your firm&apos;s actual policies before
                sending to a customer or auditor.
                {"free_questions_remaining" in draft
                  ? ` ${draft.free_questions_remaining} of ${draft.free_questions_per_day} free questions left today.`
                  : ""}
              </p>
            </div>
          )}

          {draft && (
            <TeamUpgradeCard
              heading={
                questionsAsked > 0 && draft.free_questions_remaining === 0
                  ? "That's your 3 free questions for today."
                  : "Need this for a whole questionnaire?"
              }
            />
          )}
        </div>
      </section>

      <section
        className="bl-section"
        style={{ background: "var(--bl-bg-low)", borderTop: "1px solid var(--bl-divider)" }}
      >
        <div className="bl-container-narrow" style={{ textAlign: "center" }}>
          <span className="bl-label" style={{ color: "var(--bl-accent)" }}>— Public seed KB only</span>
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
            This demo cites generic sources. <span className="bl-grad-text">Paid tiers cite yours.</span>
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
            The free demo answers from DocAI&apos;s public seed knowledge
            base. On the Firm tier, upload your own policy library and every
            draft grounds in your playbook — with a full questionnaire
            auto-fill pipeline, not one question at a time.
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

function TeamUpgradeCard({ heading }: { heading: string }) {
  return (
    <div
      className="bl-card"
      style={{
        marginTop: "1.5rem",
        borderColor: "var(--bl-accent)",
        display: "grid",
        gap: "1rem",
      }}
    >
      <div>
        <span className="bl-tag" style={{ marginBottom: "0.5rem" }}>Team tier — $69/mo</span>
        <h2
          style={{
            fontFamily: "var(--bl-font-display)",
            fontSize: "1.35rem",
            fontWeight: 800,
            color: "var(--bl-text)",
            margin: "0.5rem 0 0",
          }}
        >
          {heading}
        </h2>
        <p
          style={{
            fontSize: "var(--bl-text-small)",
            color: "var(--bl-text-muted)",
            lineHeight: 1.6,
            margin: "0.5rem 0 0",
          }}
        >
          Team lifts the cap to 50 SQA drafts a month and turns one-off
          questions into full questionnaire auto-fill — the workflow B2B SaaS
          sales + revops teams run daily.
        </p>
      </div>
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "grid",
          gap: 8,
        }}
      >
        {TEAM_FEATURES.map((f) => (
          <li
            key={f}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              fontFamily: "var(--bl-font-body)",
              fontSize: "var(--bl-text-small)",
              color: "var(--bl-text)",
              lineHeight: 1.5,
            }}
          >
            <span aria-hidden="true" style={{ color: "var(--bl-accent)", fontWeight: 700, flexShrink: 0 }}>
              ✓
            </span>
            {f}
          </li>
        ))}
      </ul>
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        <a
          href={TEAM_MONTHLY_URL}
          className="bl-btn-primary"
          style={{ justifyContent: "center" }}
        >
          Start Team — $69/mo
          <span aria-hidden="true">→</span>
        </a>
        <Link href="/pricing" className="bl-btn-ghost" style={{ justifyContent: "center" }}>
          Compare all tiers
        </Link>
      </div>
      <p
        style={{
          fontSize: 11,
          color: "var(--bl-text-subtle)",
          fontFamily: "var(--bl-font-mono)",
          margin: 0,
        }}
      >
        Card via PayPal · crypto via NOWPayments · cancel anytime.
      </p>
    </div>
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
