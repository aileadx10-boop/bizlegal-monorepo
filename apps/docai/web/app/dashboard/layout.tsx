import { redirect } from 'next/navigation'
import { getSession, getUserProfile } from '../../lib/auth'

const NAV_ITEMS = [
  { label: 'Overview', href: '/dashboard', icon: '◈' },
  { label: 'Contract Compliance', href: '/dashboard/contract', icon: '📄' },
  { label: 'AI Act Compliance', href: '/dashboard/ai-act', icon: '🤖' },
  { label: 'Immigration', href: '/dashboard/immigration', icon: '🌐' },
  { label: 'Tech-Transfer', href: '/dashboard/tech-transfer', icon: '🏢' },
  { label: 'Reports', href: '/dashboard/reports', icon: '📊' },
  { label: 'Review Queue', href: '/dashboard/review-queue', icon: '⚖️' },
  { label: 'Upgrade', href: '/dashboard/upgrade', icon: '⭐' },
  { label: 'Settings', href: '/dashboard/settings', icon: '⚙️' },
]

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/login')

  const profile = await getUserProfile(session.user.id)
  const tier = profile?.tier ?? 'solo'

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bl-bg-low, #f8f8f8)' }}>
      <aside style={{
        width: 260,
        background: 'var(--bl-surface, #fff)',
        borderRight: '1px solid var(--bl-border, #e2e2e2)',
        padding: '1.5rem 0',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}>
        <div style={{ padding: '0 1.25rem 1.5rem', borderBottom: '1px solid var(--bl-divider, #eee)' }}>
          <h2 style={{
            fontFamily: 'var(--bl-font-display, Fraunces, serif)',
            fontSize: '1.25rem',
            fontWeight: 700,
            color: 'var(--bl-text, #1a1a1a)',
            margin: 0,
          }}>
            AI Conductor
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--bl-text-muted, #888)', margin: '0.25rem 0 0' }}>
            {session.user.email}
          </p>
        </div>

        <nav style={{ flex: 1, padding: '1rem 0.75rem' }}>
          {NAV_ITEMS.map(item => (
            <a
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.6rem 0.75rem',
                borderRadius: 8,
                textDecoration: 'none',
                color: 'var(--bl-text, #1a1a1a)',
                fontSize: '0.9rem',
                fontWeight: 500,
                transition: 'background 150ms',
              }}
            >
              <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
              {item.label}
            </a>
          ))}
        </nav>

        <div style={{
          padding: '1rem 1.25rem',
          borderTop: '1px solid var(--bl-divider, #eee)',
          fontSize: '0.8rem',
        }}>
          <div style={{
            display: 'inline-block',
            padding: '0.2rem 0.6rem',
            borderRadius: 4,
            background: tier === 'firm' ? '#7c3aed' : tier === 'team' ? '#2563eb' : '#6b7280',
            color: '#fff',
            fontWeight: 600,
            textTransform: 'uppercase',
            fontSize: '0.7rem',
            letterSpacing: '0.05em',
          }}>
            {tier}
          </div>
          <div style={{ marginTop: '0.5rem', color: 'var(--bl-text-muted, #888)' }}>
            {profile ? `${profile.scans_this_month}/${tier === 'firm' ? '∞' : tier === 'team' ? '50' : '10'} scans` : '—'}
          </div>
        </div>
      </aside>

      <main style={{ flex: 1, padding: '2rem', overflow: 'auto' }}>
        {children}
      </main>
    </div>
  )
}
