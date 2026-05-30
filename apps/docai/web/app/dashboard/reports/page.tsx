import { getSession } from '../../../lib/auth'
import { getSupabaseAdmin } from '../../../lib/supabase'

const VERTICAL_COLORS: Record<string, { bg: string; text: string }> = {
  contract: { bg: '#dbeafe', text: '#1e40af' },
  'ai-act': { bg: '#ede9fe', text: '#5b21b6' },
  immigration: { bg: '#d1fae5', text: '#065f46' },
  'tech-transfer': { bg: '#fef3c7', text: '#92400e' },
}

interface ReportRow {
  id: string
  vertical: string
  report_type: string
  title: string | null
  risk_level: string | null
  risk_score: number | null
  status: string
  created_at: string
}

export default async function ReportsPage() {
  const session = await getSession()
  if (!session) return null

  const admin = getSupabaseAdmin()
  const { data: reports } = await admin
    .from('conductor_reports')
    .select('id, vertical, report_type, title, risk_level, risk_score, status, created_at')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(50)
    .returns<ReportRow[]>()

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--bl-font-display, Fraunces, serif)', fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem' }}>
        Reports
      </h1>

      {!reports?.length ? (
        <p style={{ color: 'var(--bl-text-muted, #888)' }}>No reports yet. Run a scan or draft from any vertical to see results here.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {reports.map((r) => {
            const vc = VERTICAL_COLORS[r.vertical] ?? { bg: '#f3f4f6', text: '#374151' }
            return (
              <a
                key={r.id}
                href={`/dashboard/reports/${r.id}`}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.75rem 1rem', borderRadius: 8,
                  border: '1px solid var(--bl-border, #e2e2e2)', background: 'var(--bl-surface, #fff)',
                  textDecoration: 'none', color: 'var(--bl-text, #1a1a1a)', fontSize: '0.9rem',
                }}
              >
                <div>
                  <span style={{ fontWeight: 600 }}>{r.title || r.report_type}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--bl-text-muted, #888)', marginLeft: '0.75rem' }}>
                    {new Date(r.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span style={{ padding: '0.15rem 0.5rem', borderRadius: 4, fontSize: '0.75rem', fontWeight: 600, background: vc.bg, color: vc.text }}>
                    {r.vertical}
                  </span>
                  {r.risk_level && (
                    <span style={{
                      padding: '0.15rem 0.5rem', borderRadius: 4, fontSize: '0.75rem', fontWeight: 600,
                      background: r.risk_level === 'critical' ? '#fecaca' : r.risk_level === 'high' ? '#fed7aa' : '#d1fae5',
                      color: r.risk_level === 'critical' ? '#991b1b' : r.risk_level === 'high' ? '#9a3412' : '#065f46',
                    }}>
                      {r.risk_level}
                    </span>
                  )}
                </div>
              </a>
            )
          })}
        </div>
      )}
    </div>
  )
}
