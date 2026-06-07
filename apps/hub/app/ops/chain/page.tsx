import { createClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { AGENT_CONFIGS } from '@/lib/agents/chain/types'

export const dynamic = 'force-dynamic'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export default async function RevenueChainDashboard({ searchParams }: { searchParams: { t?: string } }) {
  if (searchParams.t !== process.env.OPS_DASHBOARD_TOKEN) {
    redirect('/ops?error=unauthorized')
  }

  const db = getAdmin()

  const [
    { data: recentRuns },
    { data: pitchStats },
    { data: partnerStats },
    { data: subscriberCount },
    { data: revenueData },
  ] = await Promise.all([
    db.from('agent_runs').select('*').order('created_at', { ascending: false }).limit(30),
    db.from('lead_outreach').select('status'),
    db.from('partner_outreach').select('status'),
    db.from('newsletter_subscribers').select('id').is('unsubscribed_at', null),
    db.from('payment_orders').select('amount_cents').eq('status', 'confirmed'),
  ])

  const pitchCounts = { drafted: 0, sent: 0, opened: 0, replied: 0, converted: 0 }
  for (const p of pitchStats ?? []) { pitchCounts[p.status as keyof typeof pitchCounts]++ }

  const partnerCounts = { drafted: 0, sent: 0, responded: 0, signed: 0 }
  for (const p of partnerStats ?? []) {
    if (p.status in partnerCounts) partnerCounts[p.status as keyof typeof partnerCounts]++
  }

  const totalRevenue = (revenueData ?? []).reduce((sum, r) => sum + (r.amount_cents || 0), 0)
  const mrrDisplay = `$${(totalRevenue / 100).toFixed(0)}`

  const channels = [
    { name: 'Leads', agent: 'lead_commander', metric: `${pitchCounts.sent} sent / ${pitchCounts.replied} replied`, target: 10, current: pitchCounts.sent, color: '#2563eb' },
    { name: 'Deals', agent: 'deal_closer', metric: `${partnerCounts.signed} signed / ${partnerCounts.sent} sent`, target: 5, current: partnerCounts.signed, color: '#7c3aed' },
    { name: 'Newsletter', agent: 'newsletter_engine', metric: `${subscriberCount?.length ?? 0} subscribers`, target: 100, current: subscriberCount?.length ?? 0, color: '#059669' },
    { name: 'Partners', agent: 'partner_seeder', metric: `${partnerCounts.signed} signed`, target: 3, current: partnerCounts.signed, color: '#d97706' },
    { name: 'BOI', agent: 'boi_hunter', metric: '$0 revenue', target: 1, current: 0, color: '#dc2626' },
    { name: 'Affiliates', agent: null, metric: 'TOMBSTONED', target: 0, current: 0, color: '#6b7280' },
  ]

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Revenue Chain Dashboard</h1>
        <span style={{ fontSize: '1.5rem', fontWeight: 700, color: totalRevenue > 0 ? '#059669' : '#dc2626' }}>
          {mrrDisplay} revenue
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {channels.map(ch => (
          <div key={ch.name} style={{ padding: '1rem', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff' }}>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: ch.color, marginBottom: '0.5rem' }}>{ch.name}</div>
            <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.5rem' }}>{ch.metric}</div>
            <div style={{ height: 6, borderRadius: 3, background: '#e5e7eb' }}>
              <div style={{ height: '100%', borderRadius: 3, background: ch.color, width: `${Math.min(100, ch.target > 0 ? (ch.current / ch.target) * 100 : 0)}%` }} />
            </div>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Agent Status</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '2rem' }}>
        {AGENT_CONFIGS.map(ac => {
          const lastRun = (recentRuns ?? []).find(r => (r as Record<string, unknown>).agent_name === ac.name)
          return (
            <div key={ac.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.75rem', borderRadius: 6, border: '1px solid #e5e7eb', background: '#fff', fontSize: '0.85rem' }}>
              <span>
                <span style={{ color: ac.enabled ? '#22c55e' : '#ef4444' }}>{ac.enabled ? '●' : '○'}</span>{' '}
                <strong>{ac.name}</strong> ({ac.autonomy_level})
              </span>
              <span style={{ color: '#888' }}>
                {lastRun ? `Last: ${new Date((lastRun as Record<string, string>).created_at).toLocaleString()}` : 'Never run'}
              </span>
            </div>
          )
        })}
      </div>

      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Live Event Feed</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', maxHeight: 400, overflow: 'auto' }}>
        {(recentRuns ?? []).map((run: Record<string, unknown>) => (
          <div key={run.id as string} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0.75rem', borderRadius: 4, background: '#f9fafb', fontSize: '0.8rem' }}>
            <span>
              <span style={{ color: run.status === 'success' ? '#22c55e' : run.status === 'failed' ? '#ef4444' : '#f59e0b' }}>
                {run.status === 'success' ? '🟢' : run.status === 'failed' ? '🔴' : '🟡'}
              </span>{' '}
              <strong>{run.agent_name as string}</strong> {run.action as string}
              {run.target_email ? ` → ${run.target_email}` : ''}
            </span>
            <span style={{ color: '#888' }}>{new Date(run.created_at as string).toLocaleTimeString()}</span>
          </div>
        ))}
        {!(recentRuns ?? []).length && <p style={{ color: '#888', textAlign: 'center', padding: '2rem' }}>No agent activity yet. Trigger a cron to start.</p>}
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', borderRadius: 8, background: '#f0f9ff', fontSize: '0.85rem' }}>
        <strong>Pipeline Metrics</strong><br />
        Pitches: {pitchCounts.drafted} drafted → {pitchCounts.sent} sent → {pitchCounts.opened} opened → {pitchCounts.replied} replied → {pitchCounts.converted} converted<br />
        Partners: {partnerCounts.drafted} drafted → {partnerCounts.sent} sent → {partnerCounts.responded} responded → {partnerCounts.signed} signed<br />
        Newsletter: {subscriberCount?.length ?? 0} active subscribers
      </div>
    </div>
  )
}
