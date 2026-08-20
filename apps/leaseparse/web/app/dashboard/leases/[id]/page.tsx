import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getServiceClient } from '@/lib/db/client'
import { deriveCriticalDates } from '@/lib/extract/date-engine'
import type { LeaseAbstract } from '@/lib/extract/types'

const C = {
  surface: '#111520',
  border: '#1e2430',
  text: '#e8e6e3',
  muted: '#8b93a7',
  body: '#c3c9d6',
  accent: '#3b72e8',
  success: '#2db66e',
  warn: '#e8a325',
  danger: '#e05450',
  info: '#5b9dd6',
} as const

function fmtCents(cents: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(cents / 100)
}

function fmtDate(iso: string): string {
  if (!iso) return '—'
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  })
}

function tierColor(tier: number): string {
  if (tier <= 7) return C.danger
  if (tier <= 30) return C.warn
  return C.info
}

function severityColor(sev: string): string {
  if (sev === 'high') return C.danger
  if (sev === 'warn') return C.warn
  return C.info
}

interface RouteContext { params: { id: string } }

export default async function LeasePage({ params }: RouteContext) {
  const { id } = params

  const db = getServiceClient()
  const { data, error } = await db.from('leaseparse_leases').select('*').eq('id', id).single()
  if (error || !data) notFound()

  const abstract = data.extracted_json as LeaseAbstract | null

  let alerts: ReturnType<typeof deriveCriticalDates> = []
  if (abstract) {
    try {
      alerts = deriveCriticalDates(abstract)
    } catch { /* malformed abstract — no alerts */ }
  }

  const card: React.CSSProperties = {
    background: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: '8px',
    padding: '1rem 1.25rem',
    marginBottom: '1rem',
  }

  const label: React.CSSProperties = {
    fontSize: '0.7rem',
    color: C.muted,
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
    margin: '0 0 0.25rem',
  }

  const value: React.CSSProperties = {
    fontSize: '0.9rem',
    color: C.text,
    margin: '0 0 0.75rem',
  }

  const grid2: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0 1.5rem',
  }

  return (
    <main style={{ maxWidth: '52rem', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Nav */}
      <p style={{ margin: '0 0 1.5rem', fontSize: '0.875rem' }}>
        <Link href="/dashboard" style={{ color: C.accent, textDecoration: 'none' }}>← Dashboard</Link>
      </p>

      {/* Header */}
      <h1 style={{ fontSize: '1.3rem', margin: '0 0 0.25rem' }}>Lease Abstract</h1>
      <p style={{ fontSize: '0.8rem', color: C.muted, margin: '0 0 1.5rem' }}>
        {data.lease_type ?? 'unknown type'} ·{' '}
        {data.parsed_at
          ? `parsed ${fmtDate(data.parsed_at)} · ${Math.round((data.confidence_score ?? 0) * 100)}% confidence · ${data.engine}`
          : 'not yet parsed'
        }
      </p>

      {!abstract && (
        <div style={{ ...card, color: C.warn }}>
          This lease has not been parsed yet. Upload the PDF from the dashboard to extract the abstract.
        </div>
      )}

      {abstract && (
        <>
          {/* Upcoming alerts */}
          {alerts.length > 0 && (
            <div style={{ ...card, borderColor: C.warn }}>
              <p style={{ ...label, color: C.warn }}>Upcoming Alerts ({alerts.length})</p>
              {alerts.map(alert => (
                <div key={`${alert.key}-${alert.date}`} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.35rem 0',
                  borderBottom: `1px solid ${C.border}`,
                  fontSize: '0.875rem',
                }}>
                  <span style={{ color: tierColor(alert.tier) }}>
                    {alert.is_notice_deadline ? '⚠ Notice due: ' : ''}{alert.label}
                  </span>
                  <span style={{ color: C.muted, fontSize: '0.8rem', whiteSpace: 'nowrap', marginLeft: '1rem' }}>
                    {fmtDate(alert.date)} ({alert.days_until}d)
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Parties */}
          <div style={card}>
            <p style={{ ...label, margin: '0 0 0.75rem' }}>Parties</p>
            <div style={grid2}>
              <div>
                <p style={label}>Landlord</p>
                <p style={value}>{abstract.parties.landlord || '—'}</p>
              </div>
              <div>
                <p style={label}>Tenant</p>
                <p style={value}>{abstract.parties.tenant || '—'}</p>
              </div>
              {abstract.parties.guarantor && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <p style={label}>Guarantor</p>
                  <p style={value}>{abstract.parties.guarantor}</p>
                </div>
              )}
            </div>
          </div>

          {/* Premises */}
          <div style={card}>
            <p style={{ ...label, margin: '0 0 0.75rem' }}>Premises</p>
            <div style={grid2}>
              <div style={{ gridColumn: '1 / -1' }}>
                <p style={label}>Address</p>
                <p style={value}>{abstract.premises.address}, {abstract.premises.city}, {abstract.premises.state}</p>
              </div>
              {abstract.premises.square_feet && (
                <div>
                  <p style={label}>Square Feet</p>
                  <p style={value}>{abstract.premises.square_feet.toLocaleString()} SF</p>
                </div>
              )}
              {abstract.premises.suite && (
                <div>
                  <p style={label}>Suite</p>
                  <p style={value}>{abstract.premises.suite}</p>
                </div>
              )}
            </div>
          </div>

          {/* Term */}
          <div style={card}>
            <p style={{ ...label, margin: '0 0 0.75rem' }}>Lease Term</p>
            <div style={grid2}>
              <div>
                <p style={label}>Commencement</p>
                <p style={value}>{fmtDate(abstract.term.commencement)}</p>
              </div>
              <div>
                <p style={label}>Expiration</p>
                <p style={value}>{fmtDate(abstract.term.expiration)}</p>
              </div>
              {abstract.term.renewal_options && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <p style={label}>Renewal Options</p>
                  <p style={value}>{abstract.term.renewal_options}</p>
                </div>
              )}
            </div>
          </div>

          {/* Financials */}
          <div style={card}>
            <p style={{ ...label, margin: '0 0 0.75rem' }}>Financials</p>
            <div style={grid2}>
              <div>
                <p style={label}>Base Rent / mo</p>
                <p style={value}>{abstract.financial.base_rent_cents > 0 ? fmtCents(abstract.financial.base_rent_cents) : '—'}</p>
              </div>
              {abstract.financial.security_deposit_cents != null && abstract.financial.security_deposit_cents > 0 && (
                <div>
                  <p style={label}>Security Deposit</p>
                  <p style={value}>{fmtCents(abstract.financial.security_deposit_cents)}</p>
                </div>
              )}
              {abstract.financial.cam && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <p style={label}>CAM / Operating Expenses</p>
                  <p style={value}>{abstract.financial.cam}</p>
                </div>
              )}
              {abstract.financial.percentage_rent && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <p style={label}>Percentage Rent</p>
                  <p style={value}>{abstract.financial.percentage_rent}</p>
                </div>
              )}
            </div>

            {abstract.financial.escalations.length > 0 && (
              <>
                <p style={{ ...label, margin: '0.75rem 0 0.5rem' }}>Rent Escalations</p>
                {abstract.financial.escalations.map((esc, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0', fontSize: '0.875rem', color: C.body, borderBottom: `1px solid ${C.border}` }}>
                    <span>{fmtDate(esc.effective)}</span>
                    <span>{fmtCents(esc.base_rent_cents)} / mo</span>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Critical dates */}
          {abstract.critical_dates.length > 0 && (
            <div style={card}>
              <p style={{ ...label, margin: '0 0 0.75rem' }}>Critical Dates</p>
              {abstract.critical_dates.map(cd => (
                <div key={cd.key} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', borderBottom: `1px solid ${C.border}`, fontSize: '0.875rem' }}>
                  <span style={{ color: C.body }}>{cd.label}</span>
                  <span style={{ color: C.muted }}>
                    {fmtDate(cd.date)}
                    {cd.notice_window_days ? ` (${cd.notice_window_days}d notice)` : ''}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Risk flags */}
          {abstract.risk_flags.length > 0 && (
            <div style={card}>
              <p style={{ ...label, margin: '0 0 0.75rem' }}>Clauses to review with counsel</p>
              {abstract.risk_flags.map((flag, i) => (
                <div key={i} style={{ marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: severityColor(flag.severity) }}>
                      {flag.clause.replace(/_/g, ' ')}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: severityColor(flag.severity) }}>{flag.severity}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: C.muted, fontStyle: 'italic', lineHeight: 1.5 }}>
                    &ldquo;{flag.excerpt}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  )
}
