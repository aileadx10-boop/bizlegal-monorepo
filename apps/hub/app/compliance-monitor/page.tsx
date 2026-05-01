import type { Metadata } from 'next'
import Link from 'next/link'
import { ComplianceMonitorClient } from './ComplianceMonitorClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'Compliance Monitor — BizLegal AI',
  description:
    'Daily monitoring of SOC 2, ISO 27001, GDPR, HIPAA, DPDP, and NIST 800-53 source publications. We hash canonical regulator URLs and email you when they change. Decision-support only — not a compliance attestation.',
  alternates: { canonical: 'https://bizlegal-ai.com/compliance-monitor' },
}

const FRAMEWORK_SLUGS = ['soc2', 'iso27001', 'gdpr', 'hipaa', 'dpdp', 'nist-800-53']

interface FrameworkSnapshot {
  framework_id: string
  framework_label: string
  signal_count: number
  source_url: string
  source_version: string | null
  last_checked: string
  changes_last_7d: number
  most_recent_change: { fetched_at: string; affected_signal_ids: string[] } | null
}

interface CheckPayload {
  frameworks: FrameworkSnapshot[]
  generated_at: string
}

async function fetchSnapshots(): Promise<FrameworkSnapshot[]> {
  const lexUrl =
    process.env.LEXAUDIT_MONITOR_URL ?? 'https://lexaudit.bizlegal-ai.com/api/monitor/check'
  try {
    const res = await fetch(`${lexUrl}?frameworks=${FRAMEWORK_SLUGS.join(',')}`, {
      headers: { 'User-Agent': 'BizLegal-AI-Hub/1.0' },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      next: { revalidate: 300 } as any,
    })
    if (!res.ok) return []
    const data = (await res.json()) as CheckPayload
    return data.frameworks ?? []
  } catch {
    return []
  }
}

export default async function ComplianceMonitorPage() {
  const snapshots = await fetchSnapshots()

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
            SOC 2 · ISO 27001 · GDPR · HIPAA · DPDP · NIST 800-53
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
            The regulator changes. <span className="bl-grad-text">You hear about it the same day.</span>
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
            We hash the canonical source URL for every framework you track, every day at 06:00 UTC. When the source
            content changes — even one published clause — we email you with the link. You decide what to do.
            Decision-support service, not a compliance attestation.
          </p>
        </div>
      </section>

      <section className="bl-section" style={{ paddingTop: 'clamp(2rem, 1rem + 2vw, 3rem)' }}>
        <div className="bl-container" style={{ maxWidth: 1100 }}>
          <h2
            style={{
              fontFamily: 'var(--bl-font-display)',
              fontSize: 'var(--bl-text-h2)',
              fontWeight: 800,
              color: 'var(--bl-text)',
              margin: '0 0 1.5rem',
            }}
          >
            Live framework index
          </h2>

          {snapshots.length === 0 ? (
            <div className="bl-card" style={{ padding: '24px', color: 'var(--bl-text-muted)' }}>
              Index is initialising. The daily cron has not yet populated this view, or the LexAudit backend is
              warming up. Refresh in a minute.
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: 'clamp(1rem, 0.75rem + 1vw, 1.5rem)',
              }}
            >
              {snapshots.map((s) => (
                <FrameworkCard key={s.framework_id} snapshot={s} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section
        className="bl-section"
        style={{ background: 'var(--bl-bg-low)', borderTop: '1px solid var(--bl-divider)' }}
      >
        <div className="bl-container" style={{ maxWidth: 720 }}>
          <span className="bl-label" style={{ color: 'var(--bl-accent)' }}>— Subscribe</span>
          <h2
            style={{
              fontFamily: 'var(--bl-font-display)',
              fontSize: 'var(--bl-text-h2)',
              fontWeight: 800,
              color: 'var(--bl-text)',
              margin: '0.5rem 0 1rem',
            }}
          >
            Pick the frameworks you care about · $99/mo
          </h2>
          <p style={{ color: 'var(--bl-text-muted)', lineHeight: 1.6, margin: '0 0 1.5rem' }}>
            One email when something changes. No opinions, no attestations — just the link to the source so you can
            assess yourself or trigger a fresh Compliance Health Score with our team.
          </p>
          <ComplianceMonitorClient />
        </div>
      </section>

      <section className="bl-section">
        <div className="bl-container-narrow" style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--bl-text-muted)', lineHeight: 1.6, marginBottom: 16 }}>
            Want a deeper picture of your firm&apos;s compliance posture against these signals?{' '}
            <Link href="https://lexaudit.bizlegal-ai.com" style={{ color: 'var(--bl-accent)' }}>
              Run a LexAudit Health Score
            </Link>
            {' '}— signed off by a named reviewer with a SHA-256 tamper-evident snapshot.
          </p>
          <p style={{ fontSize: 12, color: 'var(--bl-text-subtle)', lineHeight: 1.5 }}>
            Disclosure v1.0.0-p4 — Compliance Monitor is a source-watching service. We do not interpret regulatory
            changes, attest your posture, or guarantee compliance. Consult licensed counsel for binding
            determinations.
          </p>
        </div>
      </section>
    </>
  )
}

function FrameworkCard({ snapshot }: { snapshot: FrameworkSnapshot }) {
  const lastCheckedDate =
    snapshot.last_checked && snapshot.last_checked !== new Date(0).toISOString()
      ? new Date(snapshot.last_checked).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : 'pending'
  const recent = snapshot.most_recent_change
  const recentDate = recent
    ? new Date(recent.fetched_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null

  return (
    <div
      className="bl-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        borderColor: snapshot.changes_last_7d > 0 ? 'var(--bl-warning)' : 'var(--bl-border)',
        borderWidth: snapshot.changes_last_7d > 0 ? 2 : 1,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div
            style={{
              fontFamily: 'var(--bl-font-mono)',
              fontSize: 10,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--bl-text-muted)',
              marginBottom: 4,
            }}
          >
            {snapshot.framework_id}
          </div>
          <h3
            style={{
              fontFamily: 'var(--bl-font-display)',
              fontSize: '1.05rem',
              fontWeight: 700,
              color: 'var(--bl-text)',
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            {snapshot.framework_label}
          </h3>
        </div>
        {snapshot.changes_last_7d > 0 && (
          <span
            style={{
              padding: '4px 10px',
              background: 'var(--bl-warning)',
              color: '#0e0b1a',
              fontFamily: 'var(--bl-font-mono)',
              fontSize: 11,
              fontWeight: 700,
              borderRadius: 'var(--bl-radius-pill)',
              whiteSpace: 'nowrap',
            }}
          >
            {snapshot.changes_last_7d} change{snapshot.changes_last_7d > 1 ? 's' : ''} · 7d
          </span>
        )}
      </div>

      <dl
        style={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          gap: '4px 12px',
          fontSize: 12,
          color: 'var(--bl-text-muted)',
          lineHeight: 1.5,
          margin: 0,
        }}
      >
        <dt style={{ fontFamily: 'var(--bl-font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 10 }}>Version</dt>
        <dd style={{ margin: 0, color: 'var(--bl-text)' }}>{snapshot.source_version ?? '—'}</dd>

        <dt style={{ fontFamily: 'var(--bl-font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 10 }}>Signals</dt>
        <dd style={{ margin: 0, color: 'var(--bl-text)' }}>{snapshot.signal_count}</dd>

        <dt style={{ fontFamily: 'var(--bl-font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 10 }}>Last check</dt>
        <dd style={{ margin: 0, color: 'var(--bl-text)' }}>{lastCheckedDate}</dd>

        {recent && (
          <>
            <dt style={{ fontFamily: 'var(--bl-font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 10 }}>Last change</dt>
            <dd style={{ margin: 0, color: 'var(--bl-warning)' }}>{recentDate}</dd>
          </>
        )}
      </dl>

      {snapshot.source_url && (
        <a
          href={snapshot.source_url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--bl-accent)', fontSize: 12, textDecoration: 'none', wordBreak: 'break-all' }}
        >
          Source: {new URL(snapshot.source_url).hostname} →
        </a>
      )}
    </div>
  )
}
