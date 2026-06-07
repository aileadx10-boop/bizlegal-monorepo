import { getSession, getUserProfile } from '../../../lib/auth'
import { getSupabaseAdmin } from '../../../lib/supabase'

export default async function ReviewQueuePage() {
  const session = await getSession()
  if (!session) return null
  const profile = await getUserProfile(session.user.id)

  if (!profile || (profile.tier !== 'team' && profile.tier !== 'firm')) {
    return (
      <div style={{ maxWidth: 500, margin: '3rem auto', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--bl-font-display, Fraunces, serif)', fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>
          Attorney Review Queue
        </h1>
        <p style={{ color: 'var(--bl-text-muted, #888)', marginBottom: '1.5rem' }}>
          The review queue is available on Team and Firm plans. Flag reports for attorney review and track approval status.
        </p>
        <a href="/pricing" style={{ display: 'inline-block', padding: '0.6rem 1.5rem', borderRadius: 8, background: 'var(--bl-accent, #2563eb)', color: '#fff', textDecoration: 'none', fontWeight: 600 }}>
          Upgrade to Team
        </a>
      </div>
    )
  }

  const admin = getSupabaseAdmin()
  const { data: reviews } = await admin
    .from('conductor_reviews')
    .select('id, report_id, priority, status, reviewer_email, created_at, reviewed_at, conductor_reports(title, vertical)')
    .eq('firm_email', session.user.email)
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--bl-font-display, Fraunces, serif)', fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem' }}>
        Attorney Review Queue
      </h1>

      {!reviews?.length ? (
        <p style={{ color: 'var(--bl-text-muted, #888)' }}>
          No reviews pending. Flag a report for review using the &quot;Flag for Review&quot; button on any report detail page.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {reviews.map((r: Record<string, unknown>) => (
            <div key={r.id as string} style={{
              padding: '1rem', borderRadius: 8,
              border: '1px solid var(--bl-border, #e2e2e2)', background: 'var(--bl-surface, #fff)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                  {((r as Record<string, unknown>).conductor_reports as Record<string, string>)?.title || 'Untitled Report'}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--bl-text-muted, #888)', marginLeft: '0.75rem' }}>
                  {new Date(r.created_at as string).toLocaleDateString()}
                </span>
              </div>
              <span style={{
                padding: '0.2rem 0.6rem', borderRadius: 4, fontSize: '0.75rem', fontWeight: 600,
                background: r.status === 'approved' ? '#d1fae5' : r.status === 'rejected' ? '#fecaca' : '#fef3c7',
                color: r.status === 'approved' ? '#065f46' : r.status === 'rejected' ? '#991b1b' : '#92400e',
              }}>
                {r.priority === 'urgent' ? '🔴 ' : ''}{r.status as string}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
