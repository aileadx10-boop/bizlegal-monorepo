import { getSession, getUserProfile } from '../../../lib/auth'
import { TIER_LIMITS, type TierName } from '../../../lib/tier-gate'

export default async function SettingsPage() {
  const session = await getSession()
  if (!session) return null
  const profile = await getUserProfile(session.user.id)
  const tier = (profile?.tier ?? 'solo') as TierName
  const limits = TIER_LIMITS[tier]

  return (
    <div style={{ maxWidth: 600 }}>
      <h1 style={{ fontFamily: 'var(--bl-font-display, Fraunces, serif)', fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem' }}>Settings</h1>

      <section style={{ padding: '1.5rem', borderRadius: 10, border: '1px solid var(--bl-border, #e2e2e2)', background: 'var(--bl-surface, #fff)', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Account</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem 1rem', fontSize: '0.9rem' }}>
          <span style={{ fontWeight: 600 }}>Email</span><span>{session.user.email}</span>
          <span style={{ fontWeight: 600 }}>Name</span><span>{profile?.display_name || '—'}</span>
          <span style={{ fontWeight: 600 }}>Firm</span><span>{profile?.firm_name || '—'}</span>
          <span style={{ fontWeight: 600 }}>Tier</span>
          <span>
            <span style={{ padding: '0.15rem 0.5rem', borderRadius: 4, background: tier === 'firm' ? '#7c3aed' : tier === 'team' ? '#2563eb' : '#6b7280', color: '#fff', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>
              {tier}
            </span>
          </span>
        </div>
      </section>

      <section style={{ padding: '1.5rem', borderRadius: 10, border: '1px solid var(--bl-border, #e2e2e2)', background: 'var(--bl-surface, #fff)', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Usage This Month</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem 1rem', fontSize: '0.9rem' }}>
          <span style={{ fontWeight: 600 }}>Scans</span>
          <span>{profile?.scans_this_month ?? 0} / {limits.scans_per_month === Infinity ? '∞' : limits.scans_per_month}</span>
          <span style={{ fontWeight: 600 }}>Drafts</span>
          <span>{profile?.drafts_this_month ?? 0} / {limits.drafts_per_month === Infinity ? '∞' : limits.drafts_per_month}</span>
          <span style={{ fontWeight: 600 }}>Seats</span>
          <span>{profile?.seats_used ?? 1} / {limits.seats === Infinity ? '∞' : limits.seats}</span>
        </div>
      </section>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <a href="/dashboard/settings/billing" style={{ padding: '0.6rem 1.25rem', borderRadius: 8, border: '1px solid var(--bl-border, #d0d0d0)', textDecoration: 'none', color: 'var(--bl-text, #1a1a1a)', fontWeight: 600, fontSize: '0.9rem' }}>
          Manage Billing
        </a>
        {tier === 'firm' && (
          <a href="/dashboard/settings/kb" style={{ padding: '0.6rem 1.25rem', borderRadius: 8, border: '1px solid var(--bl-border, #d0d0d0)', textDecoration: 'none', color: 'var(--bl-text, #1a1a1a)', fontWeight: 600, fontSize: '0.9rem' }}>
            Manage Knowledge Base
          </a>
        )}
        {tier !== 'firm' && (
          <a href="/pricing" style={{ padding: '0.6rem 1.25rem', borderRadius: 8, background: 'var(--bl-accent, #2563eb)', color: '#fff', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
            Upgrade Plan
          </a>
        )}
      </div>
    </div>
  )
}
