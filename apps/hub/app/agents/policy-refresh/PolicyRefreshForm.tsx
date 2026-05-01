'use client'

import { useState } from 'react'
import { Loader2, AlertCircle, Search } from 'lucide-react'
import { FRAMEWORK_LABELS } from '@/lib/policy-refresh/frameworks'

interface AuditFinding {
  framework: string
  severity: 'low' | 'medium' | 'high'
  finding: string
  policy_quote: string
  suggested_language: string
}

interface AuditResponse {
  audit_id: string
  policy_url: string
  policy_title: string | null
  frameworks_touched: string[]
  findings: AuditFinding[]
  summary: string
  legal_notice: string
  disclaimer_version: string
  generated_at: string
}

const SEVERITY_COLOR: Record<AuditFinding['severity'], string> = {
  low: 'var(--bl-text-muted)',
  medium: 'var(--bl-warning)',
  high: 'var(--bl-danger)',
}

export function PolicyRefreshForm() {
  const [email, setEmail] = useState('')
  const [policyUrl, setPolicyUrl] = useState('')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<AuditResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (busy) return
    if (!/^https?:\/\//.test(policyUrl)) {
      setError('Policy URL must start with https://')
      return
    }
    setBusy(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch('/api/policy-refresh/audit', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, policy_url: policyUrl }),
      })
      const data = (await res.json().catch(() => ({}))) as Partial<AuditResponse> & { error?: string }
      if (!res.ok) {
        setError(data.error ?? `Audit failed (${res.status}). Please try again.`)
        return
      }
      if (data.audit_id !== undefined && Array.isArray(data.findings)) {
        setResult(data as AuditResponse)
      } else {
        setError('Auditor returned empty. Please try again.')
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
        <Field label="Email (we send the redline + monitoring offer here)">
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

        <Field label="Privacy policy URL (https://)">
          <input
            type="url"
            required
            value={policyUrl}
            onChange={(e) => setPolicyUrl(e.target.value)}
            placeholder="https://example.com/privacy"
            style={inputStyle}
          />
        </Field>

        <button
          type="submit"
          disabled={busy || !email || !policyUrl}
          className="bl-btn-primary"
          style={{
            opacity: busy || !email || !policyUrl ? 0.6 : 1,
            cursor: busy || !email || !policyUrl ? 'not-allowed' : 'pointer',
            justifyContent: 'center',
          }}
        >
          {busy ? <Loader2 size={16} className="pr-spin" /> : <Search size={16} />}
          {busy ? 'Auditing 7 frameworks…' : 'Run free 7-framework audit'}
        </button>

        <div
          style={{
            fontFamily: 'var(--bl-font-mono)',
            fontSize: 10,
            color: 'var(--bl-text-subtle)',
            textAlign: 'center',
          }}
        >
          GDPR · CCPA · CPRA · Quebec Law 25 · Colorado · Connecticut · Texas DPSA. No card.
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
        <div className="bl-card" style={{ display: 'grid', gap: '1.25rem' }}>
          <div>
            <span
              style={{
                fontFamily: 'var(--bl-font-mono)',
                fontSize: 11,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--bl-text-subtle)',
              }}
            >
              Free preview audit · {result.frameworks_touched.length} framework
              {result.frameworks_touched.length === 1 ? '' : 's'} evaluated
            </span>
            {result.policy_title && (
              <h3
                style={{
                  fontFamily: 'var(--bl-font-display)',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  letterSpacing: '-0.01em',
                  margin: '6px 0 0',
                }}
              >
                {result.policy_title}
              </h3>
            )}
          </div>

          <p style={{ color: 'var(--bl-text)', lineHeight: 1.6, margin: 0 }}>{result.summary}</p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {result.frameworks_touched.map((f) => (
              <span
                key={f}
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
                {FRAMEWORK_LABELS[f] ?? f}
              </span>
            ))}
          </div>

          {result.findings.length > 0 ? (
            <div style={{ display: 'grid', gap: 10 }}>
              <div
                style={{
                  fontFamily: 'var(--bl-font-mono)',
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--bl-text-muted)',
                }}
              >
                Findings ({Math.min(3, result.findings.length)} of {result.findings.length} shown · full redline gated behind subscription)
              </div>
              {result.findings.slice(0, 3).map((f, i) => (
                <div
                  key={i}
                  style={{
                    padding: 12,
                    background: 'var(--bl-surface-soft)',
                    border: `1px solid ${SEVERITY_COLOR[f.severity]}33`,
                    borderLeft: `3px solid ${SEVERITY_COLOR[f.severity]}`,
                    borderRadius: 'var(--bl-radius-md)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      gap: 10,
                      alignItems: 'center',
                      fontFamily: 'var(--bl-font-mono)',
                      fontSize: 10,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: SEVERITY_COLOR[f.severity],
                      fontWeight: 700,
                    }}
                  >
                    <span>{f.severity}</span>
                    <span style={{ color: 'var(--bl-text-muted)' }}>·</span>
                    <span style={{ color: 'var(--bl-text-muted)' }}>{FRAMEWORK_LABELS[f.framework] ?? f.framework}</span>
                  </div>
                  <p style={{ margin: '6px 0 0', color: 'var(--bl-text)', lineHeight: 1.55, fontSize: 14 }}>
                    {f.finding}
                  </p>
                  {f.policy_quote && (
                    <p
                      style={{
                        margin: '6px 0 0',
                        fontFamily: 'var(--bl-font-mono)',
                        fontSize: 11,
                        color: 'var(--bl-text-subtle)',
                        fontStyle: 'italic',
                      }}
                    >
                      &ldquo;{f.policy_quote}&rdquo;
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                padding: 12,
                background: 'color-mix(in oklab, var(--bl-success) 8%, transparent)',
                border: '1px solid color-mix(in oklab, var(--bl-success) 30%, transparent)',
                borderRadius: 'var(--bl-radius-md)',
                fontSize: 13,
                color: 'var(--bl-success)',
              }}
            >
              No findings against the 7 frameworks. Subscribe to keep monitoring as the rules amend.
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

      <style>{`.pr-spin{animation:pr-spin 0.9s linear infinite;margin-right:6px}@keyframes pr-spin{to{transform:rotate(360deg)}}`}</style>
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
