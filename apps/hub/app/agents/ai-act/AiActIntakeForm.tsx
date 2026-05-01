'use client'

import { useState } from 'react'
import { Loader2, AlertCircle, ShieldCheck } from 'lucide-react'

interface ClassifyResponse {
  classification_id: string
  risk_tier: 'minimal' | 'limited' | 'high' | 'unacceptable'
  rationale: string
  articles_cited: string[]
  annex_sections_cited: string[]
  documentation_checklist: string[]
  legal_notice: string
  disclaimer_version: string
  generated_at: string
}

const TIER_COLOR: Record<ClassifyResponse['risk_tier'], string> = {
  minimal: 'var(--bl-success)',
  limited: 'var(--bl-info)',
  high: 'var(--bl-warning)',
  unacceptable: 'var(--bl-danger)',
}

const TIER_LABEL: Record<ClassifyResponse['risk_tier'], string> = {
  minimal: 'Minimal risk',
  limited: 'Limited risk · transparency obligations',
  high: 'HIGH risk · Article 6 obligations',
  unacceptable: 'UNACCEPTABLE · Article 5 prohibition',
}

export function AiActIntakeForm() {
  const [email, setEmail] = useState('')
  const [systemDescription, setSystemDescription] = useState('')
  const [usesBiometrics, setUsesBiometrics] = useState(false)
  const [makesCriticalDecisions, setMakesCriticalDecisions] = useState(false)
  const [usedInEducationOrEmployment, setUsedInEducationOrEmployment] = useState(false)
  const [usedInLawEnforcementOrJustice, setUsedInLawEnforcementOrJustice] = useState(false)
  const [isGeneralPurposeAi, setIsGeneralPurposeAi] = useState(false)
  const [euMarketAccess, setEuMarketAccess] = useState(true)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<ClassifyResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (busy) return
    if (systemDescription.trim().length < 40) {
      setError('System description must be at least 40 characters.')
      return
    }
    setBusy(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch('/api/ai-act/classify', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email,
          system_description: systemDescription,
          uses_biometrics: usesBiometrics,
          makes_critical_decisions: makesCriticalDecisions,
          used_in_education_or_employment: usedInEducationOrEmployment,
          used_in_law_enforcement_or_justice: usedInLawEnforcementOrJustice,
          is_general_purpose_ai: isGeneralPurposeAi,
          eu_market_access: euMarketAccess,
        }),
      })
      const data = (await res.json().catch(() => ({}))) as Partial<ClassifyResponse> & { error?: string }
      if (!res.ok) {
        setError(data.error ?? `Classifier failed (${res.status}). Please try again.`)
        return
      }
      if (data.risk_tier && data.rationale) {
        setResult(data as ClassifyResponse)
      } else {
        setError('Classifier returned empty. Please try again.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      <form onSubmit={submit} className="bl-card" style={{ display: 'grid', gap: '1rem' }}>
        <Field label="Email (we send the full classification PDF here)">
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@yourcompany.com"
            style={inputStyle}
          />
        </Field>

        <Field label="Describe the AI system or feature (40–4000 chars)">
          <textarea
            required
            minLength={40}
            maxLength={4000}
            value={systemDescription}
            onChange={(e) => setSystemDescription(e.target.value)}
            rows={6}
            placeholder="e.g., An AI-powered SOC 2 questionnaire drafter that ingests our customer's prior questionnaire responses and suggests answers. Used by sales engineers across our B2B SaaS team. No biometric data; no automated customer-facing decisions; outputs are reviewed by humans before sending."
            style={{ ...inputStyle, minHeight: 140, resize: 'vertical' }}
          />
          <div style={{ fontFamily: 'var(--bl-font-mono)', fontSize: 11, color: 'var(--bl-text-subtle)', marginTop: 4 }}>
            {systemDescription.length}/4000 chars · be specific about input data, decision-making role, and reviewer workflow.
          </div>
        </Field>

        <fieldset style={{ display: 'grid', gap: 8, border: 'none', padding: 0, margin: 0 }}>
          <legend
            style={{
              fontFamily: 'var(--bl-font-mono)',
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--bl-text-muted)',
              padding: 0,
              marginBottom: 4,
            }}
          >
            Six structured questions (yes/no)
          </legend>
          <CheckRow checked={euMarketAccess} onChange={setEuMarketAccess}>
            The system is or will be made available in the EU market (or used to provide outputs to EU users)
          </CheckRow>
          <CheckRow checked={usesBiometrics} onChange={setUsesBiometrics}>
            Processes biometric data (face, voiceprint, fingerprint) — Article 5 / Annex III(1)
          </CheckRow>
          <CheckRow checked={makesCriticalDecisions} onChange={setMakesCriticalDecisions}>
            Makes consequential automated decisions about people without meaningful human review — Annex III(5–8)
          </CheckRow>
          <CheckRow checked={usedInEducationOrEmployment} onChange={setUsedInEducationOrEmployment}>
            Used in education, vocational training, or employment context — Annex III(3–4)
          </CheckRow>
          <CheckRow checked={usedInLawEnforcementOrJustice} onChange={setUsedInLawEnforcementOrJustice}>
            Used in law enforcement, migration, or judicial context — Annex III(6–7)
          </CheckRow>
          <CheckRow checked={isGeneralPurposeAi} onChange={setIsGeneralPurposeAi}>
            Is a general-purpose AI model (foundation LLM, multi-purpose API) — Article 55 obligations apply
          </CheckRow>
        </fieldset>

        <button
          type="submit"
          disabled={busy || !email || systemDescription.trim().length < 40}
          className="bl-btn-primary"
          style={{
            opacity: busy || !email || systemDescription.trim().length < 40 ? 0.6 : 1,
            cursor: busy || !email || systemDescription.trim().length < 40 ? 'not-allowed' : 'pointer',
            justifyContent: 'center',
          }}
        >
          {busy ? <Loader2 size={16} className="ai-act-spin" /> : <ShieldCheck size={16} />}
          {busy ? 'Classifying…' : 'Classify against EU AI Act'}
        </button>

        <div
          style={{
            fontFamily: 'var(--bl-font-mono)',
            fontSize: 10,
            color: 'var(--bl-text-subtle)',
            textAlign: 'center',
          }}
        >
          Free preview classification. Decision-support intelligence — not a legal opinion.
        </div>

        {error && (
          <div
            role="alert"
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
              padding: '12px 14px',
              background: 'rgba(220,38,38,0.08)',
              color: 'var(--bl-danger)',
              borderRadius: 'var(--bl-radius-md)',
              fontSize: 13,
              lineHeight: 1.5,
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>{error}</span>
          </div>
        )}
      </form>

      {result && (
        <div
          className="bl-card"
          style={{
            display: 'grid',
            gap: '1rem',
            border: `1px solid color-mix(in oklab, ${TIER_COLOR[result.risk_tier]} 35%, var(--bl-border))`,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--bl-font-mono)',
                fontSize: 11,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--bl-text-subtle)',
              }}
            >
              Free preview classification
            </span>
            <span
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--bl-radius-pill)',
                background: `color-mix(in oklab, ${TIER_COLOR[result.risk_tier]} 14%, transparent)`,
                color: TIER_COLOR[result.risk_tier],
                border: `1px solid color-mix(in oklab, ${TIER_COLOR[result.risk_tier]} 35%, transparent)`,
                fontFamily: 'var(--bl-font-mono)',
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              {TIER_LABEL[result.risk_tier]}
            </span>
          </div>

          <p style={{ color: 'var(--bl-text)', lineHeight: 1.6, margin: 0 }}>{result.rationale}</p>

          {(result.articles_cited.length > 0 || result.annex_sections_cited.length > 0) && (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 6,
              }}
            >
              {[...result.articles_cited, ...result.annex_sections_cited].map((cite) => (
                <span
                  key={cite}
                  style={{
                    padding: '4px 10px',
                    background: 'var(--bl-surface-soft)',
                    color: 'var(--bl-text)',
                    border: '1px solid var(--bl-divider)',
                    borderRadius: 'var(--bl-radius-pill)',
                    fontFamily: 'var(--bl-font-mono)',
                    fontSize: 11,
                  }}
                >
                  {cite}
                </span>
              ))}
            </div>
          )}

          {result.documentation_checklist.length > 0 && (
            <div>
              <div
                style={{
                  fontFamily: 'var(--bl-font-mono)',
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--bl-text-muted)',
                  marginBottom: 8,
                }}
              >
                Documentation checklist (preview · 5 of {result.documentation_checklist.length})
              </div>
              <ul style={{ listStyle: 'disc', paddingLeft: '1.25rem', margin: 0, color: 'var(--bl-text-muted)', lineHeight: 1.6 }}>
                {result.documentation_checklist.slice(0, 5).map((line, i) => (
                  <li key={i} style={{ marginBottom: 6 }}>{line}</li>
                ))}
              </ul>
              {result.documentation_checklist.length > 5 && (
                <p
                  style={{
                    fontFamily: 'var(--bl-font-mono)',
                    fontSize: 11,
                    color: 'var(--bl-text-subtle)',
                    marginTop: 8,
                  }}
                >
                  Full checklist + Sonnet-drafted compliance file delivered with the $99 one-time tier below.
                </p>
              )}
            </div>
          )}

          <div
            style={{
              padding: '10px 12px',
              background: 'color-mix(in oklab, var(--bl-warning) 10%, transparent)',
              border: '1px solid color-mix(in oklab, var(--bl-warning) 30%, transparent)',
              borderRadius: 'var(--bl-radius-md)',
              fontSize: 12,
              color: 'var(--bl-warning)',
              lineHeight: 1.5,
            }}
          >
            <strong>{result.legal_notice}</strong>
          </div>
        </div>
      )}

      <style>{`.ai-act-spin{animation:ai-act-spin 0.9s linear infinite;margin-right:6px}@keyframes ai-act-spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'grid', gap: 6 }}>
      <span
        style={{
          fontFamily: 'var(--bl-font-mono)',
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--bl-text-muted)',
        }}
      >
        {label}
      </span>
      {children}
    </label>
  )
}

function CheckRow({
  checked,
  onChange,
  children,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  children: React.ReactNode
}) {
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        padding: '8px 10px',
        background: checked ? 'color-mix(in oklab, var(--bl-accent) 6%, transparent)' : 'transparent',
        border: `1px solid ${checked ? 'color-mix(in oklab, var(--bl-accent) 25%, var(--bl-divider))' : 'var(--bl-divider)'}`,
        borderRadius: 'var(--bl-radius-sm)',
        cursor: 'pointer',
        fontSize: 13,
        color: 'var(--bl-text)',
        lineHeight: 1.5,
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ marginTop: 2, flexShrink: 0 }}
      />
      <span>{children}</span>
    </label>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  background: 'var(--bl-surface)',
  border: '1px solid var(--bl-border)',
  borderRadius: 'var(--bl-radius-sm)',
  color: 'var(--bl-text)',
  fontFamily: 'var(--bl-font-body)',
  fontSize: 14,
  outline: 'none',
}
