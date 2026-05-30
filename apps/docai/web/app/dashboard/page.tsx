import { getSession, getUserProfile } from '../../lib/auth'
import { getSupabaseAdmin } from '../../lib/supabase'
import { TIER_LIMITS, type TierName } from '../../lib/tier-gate'

const VERTICALS = [
  { key: 'contract', label: 'Contract Compliance', href: '/dashboard/contract', desc: 'Scan contracts, draft SQA answers, negotiate DPAs.', color: '#2563eb' },
  { key: 'ai-act', label: 'AI Act Compliance', href: '/dashboard/ai-act', desc: 'Classify AI risk tiers, analyze compliance gaps.', color: '#7c3aed' },
  { key: 'immigration', label: 'Immigration', href: '/dashboard/immigration', desc: 'Draft petitions, map visa requirements.', color: '#059669' },
  { key: 'tech-transfer', label: 'Tech-Transfer', href: '/dashboard/tech-transfer', desc: 'Generate incorporation templates, cross-border docs.', color: '#d97706' },
]

export default async function DashboardOverview() {
  const session = await getSession()
  if (!session) return null

  const profile = await getUserProfile(session.user.id)
  const tier = (profile?.tier ?? 'solo') as TierName
  const limits = TIER_LIMITS[tier]

  const admin = getSupabaseAdmin()
  const { data: recentReports } = await admin
    .from('conductor_reports')
    .select('id, vertical, report_type, title, risk_level, created_at')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div>
      <h1 style={{
        fontFamily: 'var(--bl-font-display, Fraunces, serif)',
        fontSize: '1.75rem',
        fontWeight: 700,
        marginBottom: '0.5rem',
      }}>
        Welcome back
      </h1>
      <p style={{ color: 'var(--bl-text-muted, #888)', marginBottom: '2rem' }}>
        {session.user.email} &middot; {tier.charAt(0).toUpperCase() + tier.slice(1)} plan
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '1rem',
        marginBottom: '2rem',
      }}>
        <UsageCard
          label="Scans"
          used={profile?.scans_this_month ?? 0}
          limit={limits.scans_per_month}
        />
        <UsageCard
          label="Drafts"
          used={profile?.drafts_this_month ?? 0}
          limit={limits.drafts_per_month}
        />
      </div>

      <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Verticals</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '2.5rem' }}>
        {VERTICALS.map(v => (
          <a
            key={v.key}
            href={v.href}
            style={{
              display: 'block',
              padding: '1.25rem',
              borderRadius: 10,
              border: '1px solid var(--bl-border, #e2e2e2)',
              background: 'var(--bl-surface, #fff)',
              textDecoration: 'none',
              color: 'var(--bl-text, #1a1a1a)',
            }}
          >
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: v.color, marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {v.label}
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--bl-text-muted, #666)' }}>{v.desc}</div>
          </a>
        ))}
      </div>

      {recentReports && recentReports.length > 0 && (
        <>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Recent Reports</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {recentReports.map((r: Record<string, unknown>) => (
              <a
                key={r.id as string}
                href={`/dashboard/reports/${r.id}`}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem 1rem',
                  borderRadius: 8,
                  border: '1px solid var(--bl-border, #e2e2e2)',
                  background: 'var(--bl-surface, #fff)',
                  textDecoration: 'none',
                  color: 'var(--bl-text, #1a1a1a)',
                  fontSize: '0.9rem',
                }}
              >
                <span>{(r.title as string) || (r.report_type as string)}</span>
                <span style={{
                  fontSize: '0.75rem',
                  padding: '0.15rem 0.5rem',
                  borderRadius: 4,
                  background: r.risk_level === 'critical' ? '#fecaca' : r.risk_level === 'high' ? '#fed7aa' : '#d1fae5',
                  color: r.risk_level === 'critical' ? '#991b1b' : r.risk_level === 'high' ? '#9a3412' : '#065f46',
                }}>
                  {(r.vertical as string)} &middot; {(r.risk_level as string) || 'complete'}
                </span>
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function UsageCard({ label, used, limit }: { label: string; used: number; limit: number }) {
  const pct = limit === Infinity ? 0 : Math.min(100, (used / limit) * 100)
  const display = limit === Infinity ? `${used} / ∞` : `${used} / ${limit}`
  return (
    <div style={{
      padding: '1rem 1.25rem',
      borderRadius: 10,
      border: '1px solid var(--bl-border, #e2e2e2)',
      background: 'var(--bl-surface, #fff)',
    }}>
      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--bl-text-muted, #888)', marginBottom: '0.5rem' }}>
        {label} this month
      </div>
      <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>{display}</div>
      <div style={{ height: 6, borderRadius: 3, background: '#e5e7eb', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          borderRadius: 3,
          background: pct > 90 ? '#ef4444' : pct > 70 ? '#f59e0b' : '#22c55e',
          transition: 'width 300ms',
        }} />
      </div>
    </div>
  )
}
