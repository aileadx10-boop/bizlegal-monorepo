'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Loader2, ShieldAlert, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react'

const PROCESSORS = [
  { value: 'stripe', label: 'Stripe' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'square', label: 'Square' },
  { value: 'mercury', label: 'Mercury' },
  { value: 'wise', label: 'Wise Business' },
  { value: 'revolut', label: 'Revolut Business' },
] as const

interface AuditResponse {
  audit_id: string
  mode: 'prevention' | 'recovery'
  analysis: string
  flagged_aup_clauses: ReadonlyArray<{ source_name: string; source_url: string; processor: string; category: string }>
  recommended_processors?: ReadonlyArray<string>
  appeal_path?: string
  regulator_pathways?: ReadonlyArray<{ source_name: string; source_url: string }>
  legal_notice: string
  disclaimer_version: string
  issued_at: string
}

export function PspRiskClient() {
  const [mode, setMode] = useState<'prevention' | 'recovery'>('prevention')
  const [businessDesc, setBusinessDesc] = useState('')
  const [vertical, setVertical] = useState('')
  const [processor, setProcessor] = useState<(typeof PROCESSORS)[number]['value']>('stripe')
  const [revenue, setRevenue] = useState<number | ''>('')
  const [freezeEmail, setFreezeEmail] = useState('')
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<AuditResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (busy) return
    if (businessDesc.trim().length < 40) {
      setError('Business description must be at least 40 characters.')
      return
    }
    if (mode === 'recovery' && freezeEmail.trim().length < 20) {
      setError('Paste at least 20 characters of the freeze / limitation email or reason.')
      return
    }
    setBusy(true)
    setResult(null)
    setError(null)
    try {
      const res = await fetch('/api/psp-risk/audit', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          mode,
          business_description: businessDesc,
          current_processor: processor,
          vertical: vertical || undefined,
          monthly_revenue_usd: typeof revenue === 'number' ? revenue : undefined,
          freeze_email_text: mode === 'recovery' ? freezeEmail : undefined,
          email: email || undefined,
        }),
      })
      const data = (await res.json().catch(() => ({}))) as Partial<AuditResponse> & { error?: string }
      if (!res.ok) {
        setError(data.error ?? `Audit failed (${res.status}). Please try again.`)
        return
      }
      if (data.audit_id && data.analysis) {
        setResult(data as AuditResponse)
      } else {
        setError('Audit returned empty. Please try again.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <section
        className="bl-hero-bg"
        style={{
          paddingTop: 'clamp(4rem, 2rem + 4vw, 6rem)',
          paddingBottom: 'clamp(2rem, 1.5rem + 2vw, 3rem)',
        }}
      >
        <div className="bl-container" style={{ maxWidth: 880 }}>
          <span className="bl-tag" style={{ marginBottom: '1rem' }}>
            <ShieldAlert size={14} /> Stripe · PayPal · Square · Mercury · Wise · Revolut
          </span>
          <h1
            style={{
              fontFamily: 'var(--bl-font-display)',
              fontSize: 'var(--bl-text-h1)',
              fontWeight: 800,
              letterSpacing: '-0.025em',
              lineHeight: 1.05,
              color: 'var(--bl-text)',
              margin: '1.5rem 0 1rem',
            }}
          >
            Don&apos;t lose your processor. <span className="bl-grad-text">Audit before you apply.</span>
          </h1>
          <p
            style={{
              fontSize: 'clamp(1.05rem, 0.95rem + 0.4vw, 1.2rem)',
              color: 'var(--bl-text-muted)',
              lineHeight: 1.6,
              margin: 0,
              maxWidth: 720,
            }}
          >
            Two modes. <strong style={{ color: 'var(--bl-text)' }}>Prevention:</strong> describe your business, pick
            your target processor, and we surface the AUP clauses you&apos;re likely to trigger plus a
            documentation plan to mitigate. <strong style={{ color: 'var(--bl-text)' }}>Recovery:</strong> paste the
            freeze email and we draft an appeal-letter outline plus regulator-escalation pathway. Public-source
            patterns only — outcome of any specific application or appeal is not guaranteed.
          </p>

          <div
            style={{
              marginTop: '1.75rem',
              padding: '1rem 1.25rem',
              background: 'color-mix(in oklab, var(--bl-warning) 8%, var(--bl-surface))',
              border: '1px solid color-mix(in oklab, var(--bl-warning) 30%, var(--bl-border))',
              borderRadius: 'var(--bl-radius-md)',
              maxWidth: 720,
            }}
          >
            <div
              style={{
                fontFamily: 'var(--bl-font-mono)',
                fontSize: 11,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--bl-warning)',
                marginBottom: 8,
                fontWeight: 700,
              }}
            >
              Who actually uses this
            </div>
            <ul
              style={{
                listStyle: 'disc',
                margin: 0,
                paddingLeft: '1.25rem',
                color: 'var(--bl-text-muted)',
                fontSize: '0.95rem',
                lineHeight: 1.6,
              }}
            >
              <li><strong style={{ color: 'var(--bl-text)' }}>Crypto-adjacent SaaS</strong> — KYC tooling, on-chain analytics, custody dashboards, NFT marketplaces. Stripe and PayPal default-deny these even when the activity is fully compliant; we map the AUP clauses they invoke and the documentation that gets the appeal escalated to a human.</li>
              <li><strong style={{ color: 'var(--bl-text)' }}>DAO treasury managers</strong> — moving stablecoin or token grants through Mercury / Wise / Revolut Business. Frozen 4-7 days after the first 6-figure inflow when the bank&apos;s automated rule fires.</li>
              <li><strong style={{ color: 'var(--bl-text)' }}>OTC desks + cross-border invoicing</strong> — payment volumes that look like layering to monitoring rules even when the underlying trades are legitimate. We draft the documentation pack that rebuts the layering narrative.</li>
              <li><strong style={{ color: 'var(--bl-text)' }}>High-risk e-commerce</strong> — supplements, regulated cannabis, gambling-adjacent tools, adult-content tooling. The AUP clauses are well-documented; most founders trip them not knowing they exist.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="bl-section" style={{ paddingTop: 'clamp(2rem, 1rem + 2vw, 3rem)' }}>
        <div className="bl-container" style={{ maxWidth: 880 }}>
          <form onSubmit={submit} className="bl-card" style={{ display: 'grid', gap: '1rem' }}>
            <div role="tablist" style={{ display: 'flex', gap: 8, padding: 4, background: 'var(--bl-surface-soft)', borderRadius: 'var(--bl-radius-pill)' }}>
              {(['prevention', 'recovery'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  role="tab"
                  aria-selected={mode === m}
                  onClick={() => setMode(m)}
                  style={{
                    flex: 1,
                    padding: '8px 16px',
                    background: mode === m ? 'var(--bl-accent)' : 'transparent',
                    color: mode === m ? 'var(--bl-text-on-accent)' : 'var(--bl-text-muted)',
                    border: 'none',
                    borderRadius: 'var(--bl-radius-pill)',
                    fontFamily: 'var(--bl-font-mono)',
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    transition: 'all 150ms',
                  }}
                >
                  {m === 'prevention' ? 'Pre-flight audit' : 'Freeze recovery'}
                </button>
              ))}
            </div>

            <Field label="Target processor">
              <select value={processor} onChange={(e) => setProcessor(e.target.value as typeof processor)} style={inputStyle}>
                {PROCESSORS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Business description (what you sell, who buys, how you charge)">
              <textarea
                value={businessDesc}
                onChange={(e) => setBusinessDesc(e.target.value)}
                rows={6}
                placeholder="e.g., B2B SaaS for compliance teams. Sell monthly subscriptions ($49-599) + one-time intelligence reports ($149-799). Customers in US/EU/UAE/SG. No physical goods, no crypto custody. ~$5K/mo revenue."
                maxLength={6000}
                required
                style={{ ...inputStyle, resize: 'vertical' as const, fontFamily: 'inherit', lineHeight: 1.6 }}
              />
              <div style={{ fontSize: 11, color: 'var(--bl-text-subtle)', marginTop: 4, fontFamily: 'var(--bl-font-mono)' }}>
                {businessDesc.length}/6000 chars · min 40
              </div>
            </Field>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <Field label="Vertical (optional)">
                <input
                  type="text"
                  value={vertical}
                  onChange={(e) => setVertical(e.target.value)}
                  placeholder="SaaS, e-commerce, marketplace…"
                  style={inputStyle}
                />
              </Field>

              <Field label="Monthly revenue USD (optional)">
                <input
                  type="number"
                  value={revenue}
                  onChange={(e) => setRevenue(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="5000"
                  min={0}
                  style={inputStyle}
                />
              </Field>
            </div>

            {mode === 'recovery' && (
              <Field label="Freeze / limitation email or reason code (paste from the processor)">
                <textarea
                  value={freezeEmail}
                  onChange={(e) => setFreezeEmail(e.target.value)}
                  rows={6}
                  placeholder="Paste the email you received from the processor explaining the freeze, limitation, or account closure. Redact any PII you don't want included in the analysis."
                  maxLength={6000}
                  style={{ ...inputStyle, resize: 'vertical' as const, fontFamily: 'inherit', lineHeight: 1.6 }}
                />
                <div style={{ fontSize: 11, color: 'var(--bl-text-subtle)', marginTop: 4, fontFamily: 'var(--bl-font-mono)' }}>
                  {freezeEmail.length}/6000 chars · min 20
                </div>
              </Field>
            )}

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
              disabled={busy || businessDesc.trim().length < 40}
              className="bl-btn-primary"
              style={{
                opacity: busy || businessDesc.trim().length < 40 ? 0.6 : 1,
                cursor: busy || businessDesc.trim().length < 40 ? 'not-allowed' : 'pointer',
                justifyContent: 'center',
              }}
            >
              {busy ? <Loader2 size={16} className="spin" /> : <ShieldAlert size={16} />}
              {busy
                ? 'Auditing — ~15s'
                : mode === 'prevention'
                  ? 'Run pre-flight audit (free first)'
                  : 'Draft recovery plan (free first)'}
            </button>

            <p style={{ fontSize: 12, color: 'var(--bl-text-subtle)', lineHeight: 1.55, fontStyle: 'italic' }}>
              Decision-support only. We surface public AUP patterns and published appeal pathways. We do not
              guarantee approval, account reinstatement, or any specific outcome. Consult licensed counsel for
              binding determinations.
            </p>

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
                <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>
                  <strong>Audit failed:</strong> {error}
                </span>
              </div>
            )}
          </form>

          {result && (
            <div
              className="bl-card"
              style={{
                marginTop: '1.5rem',
                background: 'var(--bl-surface)',
                borderColor: 'var(--bl-accent)',
                borderWidth: 2,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <CheckCircle size={18} style={{ color: 'var(--bl-accent)' }} />
                <span className="bl-label" style={{ color: 'var(--bl-accent)', fontSize: 11 }}>
                  {result.mode === 'prevention' ? 'Pre-flight audit complete' : 'Recovery plan drafted'} ·{' '}
                  {result.flagged_aup_clauses.length} sources cited
                </span>
              </div>

              <h2
                style={{
                  fontFamily: 'var(--bl-font-display)',
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: 'var(--bl-text)',
                  margin: '0 0 0.5rem',
                }}
              >
                {result.mode === 'prevention' ? 'Pre-flight findings' : 'Freeze recovery plan'}
              </h2>

              <div
                style={{
                  fontFamily: 'var(--bl-font-body)',
                  fontSize: 14,
                  lineHeight: 1.75,
                  color: 'var(--bl-text)',
                  whiteSpace: 'pre-wrap',
                  marginBottom: '1.25rem',
                }}
              >
                {result.analysis}
              </div>

              {result.flagged_aup_clauses.length > 0 && (
                <div
                  style={{
                    paddingTop: 12,
                    borderTop: '1px solid var(--bl-divider)',
                    fontFamily: 'var(--bl-font-mono)',
                    fontSize: 11,
                    color: 'var(--bl-text-subtle)',
                  }}
                >
                  <strong style={{ color: 'var(--bl-text-muted)' }}>Public sources cited:</strong>
                  <ul style={{ margin: '8px 0 0', paddingLeft: 16 }}>
                    {result.flagged_aup_clauses.map((c) => (
                      <li key={c.source_name} style={{ marginBottom: 4 }}>
                        <a href={c.source_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--bl-accent)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          {c.source_name}
                          <ExternalLink size={10} />
                        </a>
                        <span style={{ color: 'var(--bl-text-subtle)', marginLeft: 6 }}>
                          [{c.processor}/{c.category}]
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div
                style={{
                  marginTop: 16,
                  padding: '14px 16px',
                  background: 'rgba(220,38,38,0.06)',
                  border: '1px solid rgba(220,38,38,0.2)',
                  borderRadius: 'var(--bl-radius-md)',
                  fontSize: 12,
                  color: 'var(--bl-text-muted)',
                  lineHeight: 1.6,
                  display: 'flex',
                  gap: 10,
                }}
              >
                <ShieldAlert size={16} style={{ flexShrink: 0, color: 'var(--bl-danger)', marginTop: 1 }} />
                <span>
                  <strong style={{ color: 'var(--bl-danger)' }}>Disclosure {result.disclaimer_version}:</strong>{' '}
                  {result.legal_notice}
                </span>
              </div>

              <p
                style={{
                  marginTop: 16,
                  fontSize: 12,
                  color: 'var(--bl-text-subtle)',
                  lineHeight: 1.5,
                }}
              >
                Need this for multiple processors or recurring monitoring?{' '}
                <Link href="/agents" style={{ color: 'var(--bl-accent)' }}>
                  See the PSP & MoR Risk Manager agent ($99/mo retainer)
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
