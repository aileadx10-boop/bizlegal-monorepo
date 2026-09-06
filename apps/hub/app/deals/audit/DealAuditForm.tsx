'use client'

import { useState } from 'react'

type FindingKind = 'conflict' | 'missing' | 'expired' | 'upcoming' | 'insufficient_evidence'
type Severity = 'critical' | 'high' | 'medium' | 'low'

interface Finding {
  kind: FindingKind
  severity: Severity
  summary: string
  claimant_document_ids: string[]
  fact_ids: string[]
}

interface AuditResponse {
  ok?: boolean
  findings?: Finding[]
  error?: string
  message?: string
}

type Status = 'idle' | 'submitting' | 'results' | 'not_ready' | 'error'

const SEVERITY_META: Record<Severity, { label: string; color: string }> = {
  critical: { label: 'Critical', color: '#ff4d4f' },
  high: { label: 'High', color: '#ff5a1f' },
  medium: { label: 'Medium', color: '#e9c349' },
  low: { label: 'Low', color: '#9fa3c0' },
}

const KIND_LABELS: Record<FindingKind, string> = {
  conflict: 'Conflicting facts',
  missing: 'Missing',
  expired: 'Expired',
  upcoming: 'Upcoming',
  insufficient_evidence: 'Needs manual check',
}

const labelStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'var(--secondary)',
  display: 'block',
  marginBottom: 6,
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  background: 'var(--bg-mid, var(--card))',
  border: '1px solid var(--outline-var)',
  borderRadius: 8,
  color: 'var(--on-surface, var(--text))',
  fontSize: 14,
  outline: 'none',
}

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: 'var(--on-surface-var)',
  marginBottom: 14,
}

export function DealAuditForm() {
  const [status, setStatus] = useState<Status>('idle')
  const [findings, setFindings] = useState<Finding[]>([])
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('submitting')
    setError(null)

    const fd = new FormData(e.currentTarget)
    const payload = {
      closingDate: String(fd.get('closingDate') ?? '').trim(),
      purchasePrice: String(fd.get('purchasePrice') ?? '').trim(),
      sellerName: String(fd.get('sellerName') ?? '').trim(),
      buyerName: String(fd.get('buyerName') ?? '').trim(),
      propertyAddress: String(fd.get('propertyAddress') ?? '').trim(),
      depositAmount: String(fd.get('depositAmount') ?? '').trim(),
      propertyArea: String(fd.get('propertyArea') ?? '').trim(),
      closingDateAlt: String(fd.get('closingDateAlt') ?? '').trim() || undefined,
      purchasePriceAlt: String(fd.get('purchasePriceAlt') ?? '').trim() || undefined,
      nocExpiry: String(fd.get('nocExpiry') ?? '').trim() || undefined,
      mortgageLetterExpiry: String(fd.get('mortgageLetterExpiry') ?? '').trim() || undefined,
      serviceChargeExpiry: String(fd.get('serviceChargeExpiry') ?? '').trim() || undefined,
    }

    try {
      const res = await fetch('/api/deals/audit', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = (await res.json().catch(() => ({}))) as AuditResponse
      if (res.status === 409) {
        setStatus('not_ready')
        return
      }
      if (!res.ok) {
        setStatus('error')
        setError(data.message || data.error || `Server returned ${res.status}.`)
        return
      }
      setFindings(data.findings ?? [])
      setStatus('results')
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Network error — try again.')
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 40, alignItems: 'start' }}>
      <div>
        <form
          onSubmit={onSubmit}
          style={{
            background: 'var(--bg-low)',
            border: '0.5px solid var(--outline-var)',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
          }}
        >
          <div>
            <span className="section-label">The deal</span>
            <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--on-surface-var)', marginTop: 4 }}>
              Enter what you know. Leave a field blank and the audit will flag it
              as something a lawyer would want to see.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={labelStyle}>Closing / transfer date</label>
              <input name="closingDate" type="date" required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Purchase price (AED)</label>
              <input name="purchasePrice" required placeholder="e.g. 2,500,000" style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={labelStyle}>Seller name</label>
              <input name="sellerName" required placeholder="As it appears on the MOU" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Buyer name</label>
              <input name="buyerName" required placeholder="As it appears on the MOU" style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={labelStyle}>Property address</label>
              <input name="propertyAddress" required placeholder="e.g. Marina Gate, Dubai Marina" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Deposit amount (AED)</label>
              <input name="depositAmount" required placeholder="e.g. 250,000" style={inputStyle} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Property area</label>
            <input
              name="propertyArea"
              required
              placeholder="e.g. 1200 sqm or 12,916 sq ft"
              style={inputStyle}
            />
          </div>

          <div
            style={{
              border: '1px dashed var(--outline-var)',
              padding: '18px',
              background: 'rgba(22,27,43,0.4)',
            }}
          >
            <div style={sectionTitleStyle}>Seen it in a second document?</div>
            <p style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--on-surface-var)', marginBottom: 14 }}>
              The two facts where Dubai deals most often disagree: the date and
              price on the title deed vs the MOU. Enter them and the audit will
              flag a conflict.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={labelStyle}>Closing date per title deed</label>
                <input name="closingDateAlt" type="date" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Price per title deed (AED)</label>
                <input name="purchasePriceAlt" placeholder="e.g. 2,500,000" style={inputStyle} />
              </div>
            </div>
          </div>

          <div
            style={{
              border: '1px dashed var(--outline-var)',
              padding: '18px',
              background: 'rgba(22,27,43,0.4)',
            }}
          >
            <div style={sectionTitleStyle}>Document expiry dates (optional)</div>
            <p style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--on-surface-var)', marginBottom: 14 }}>
              A certificate that expires before closing is a real problem. Add
              the dates you have.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
              <div>
                <label style={labelStyle}>Developer NOC</label>
                <input name="nocExpiry" type="date" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Mortgage letter</label>
                <input name="mortgageLetterExpiry" type="date" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Service charge</label>
                <input name="serviceChargeExpiry" type="date" style={inputStyle} />
              </div>
            </div>
          </div>

          {status === 'error' && error && (
            <div
              style={{
                border: '1px solid var(--outline-var)',
                padding: '10px 12px',
                background: 'var(--bg-mid)',
                color: 'var(--on-surface-var)',
                fontSize: 13,
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-cta"
            style={{ justifyContent: 'center' }}
            disabled={status === 'submitting'}
          >
            {status === 'submitting' ? 'Running the audit…' : 'Run the audit →'}
          </button>

          <p style={{ fontSize: 11, color: 'var(--secondary)', lineHeight: 1.6, marginTop: 2 }}>
            Free, deterministic, no sign-up. The audit flags what needs a human
            look — it is not legal advice and does not tell you whether to close.
          </p>
        </form>

        {status === 'not_ready' && (
          <div
            style={{
              marginTop: 20,
              border: '1px solid var(--outline-var)',
              borderLeft: '3px solid var(--gold)',
              padding: '20px 24px',
              background: 'var(--bg-low)',
            }}
          >
            <span className="section-label">Under review</span>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--on-surface)', marginTop: 8 }}>
              The Dubai audit is being reviewed by a practising Dubai lawyer
              before it goes live. The checklist is real; the freshness windows
              are being verified. Check back shortly — or{' '}
              <a href="/contact" style={{ color: 'var(--gold)' }}>
                tell us you want to know when it ships
              </a>
              .
            </p>
          </div>
        )}

        {status === 'results' && (
          <div style={{ marginTop: 20 }}>
            <div
              style={{
                border: '1px solid var(--outline-var)',
                padding: '20px 24px',
                background: 'var(--bg-low)',
                marginBottom: 16,
              }}
            >
              <span className="section-label">Audit complete</span>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--on-surface)', marginTop: 8 }}>
                {findings.length === 0
                  ? 'No red flags on the facts you entered. A lawyer would still want to see the actual documents — that is what the deep-dive does.'
                  : `${findings.length} ${findings.length === 1 ? 'item' : 'items'} to check before closing, most urgent first.`}
              </p>
            </div>

            {findings.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {findings.map((f, i) => {
                  const sev = SEVERITY_META[f.severity]
                  return (
                    <div
                      key={`${f.kind}-${i}`}
                      style={{
                        background: 'var(--bg-low)',
                        border: '0.5px solid var(--outline-var)',
                        borderLeft: `3px solid ${sev.color}`,
                        padding: '14px 18px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        <span
                          style={{
                            display: 'inline-block',
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: sev.color,
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            color: sev.color,
                          }}
                        >
                          {sev.label}
                        </span>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            color: 'var(--on-surface-var)',
                          }}
                        >
                          {KIND_LABELS[f.kind]}
                        </span>
                      </div>
                      <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--on-surface-var)' }}>
                        {f.summary}
                      </p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <aside style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div
          style={{
            background: 'var(--bg-low)',
            border: '0.5px solid var(--outline-var)',
            padding: '24px',
          }}
        >
          <span className="section-label">The paid deep-dive</span>
          <h2 style={{ fontSize: 20, marginTop: 8, marginBottom: 10 }}>
            Your documents, compared against each other.
          </h2>
          <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--on-surface-var)' }}>
            The free audit checks the facts you type in. The deep-dive reads
            your actual documents — MOU, title deed, NOC, mortgage letter — and
            produces a written findings report with each conflict, missing item
            and expiry cited to the page it came from.
          </p>
          <a
            href="/contact"
            className="btn-cta"
            style={{ marginTop: 16, justifyContent: 'center', width: '100%' }}
          >
            Request the deep-dive →
          </a>
          <p style={{ fontSize: 11, color: 'var(--secondary)', lineHeight: 1.6, marginTop: 12 }}>
            Reviewed by a practising Dubai real-estate lawyer. No outcome
            guarantees — you get the findings, you decide.
          </p>
        </div>

        <div
          style={{
            background: 'var(--bg-low)',
            border: '0.5px solid var(--outline-var)',
            padding: '24px',
          }}
        >
          <span className="section-label">What the audit does not do</span>
          <ul style={{ fontSize: 12, lineHeight: 1.8, paddingLeft: 18, marginTop: 8, color: 'var(--on-surface-var)' }}>
            <li>It does not tell you whether to close.</li>
            <li>It does not read uploaded documents on the free tier.</li>
            <li>It is not legal advice and creates no lawyer-client relationship.</li>
          </ul>
        </div>
      </aside>
    </div>
  )
}
