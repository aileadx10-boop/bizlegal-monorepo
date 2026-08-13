import { createClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { verifyChain, type AuditChainRow } from '@/lib/audit-chain'

export const dynamic = 'force-dynamic'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

interface OpsEventRow {
  id: number
  event_type: string
  source: string
  ref_id: string | null
  ref_email: string | null
  amount_cents: number | null
  status: string | null
  created_at: string
}

const AGENT_NAMES = [
  'lead_commander',
  'deal_closer',
  'newsletter_engine',
  'partner_seeder',
  'boi_hunter',
  'aeo_revenue_agent',
  'conversion_funnel_agent',
  'enterprise_closer_agent',
]

const SOURCES = [
  'hub', 'docai', 'lexaudit', 'tracr', 'brai', 'forge', 'leadforge', 'blog',
  'oci', 'worker', 'curator', 'ea', 'gsc-bot',
]

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function statusColor(status: string | null): string {
  if (status === 'success' || status === 'ok' || status === 'active' || status === 'paid') return '#059669'
  if (status === 'failed' || status === 'error') return '#dc2626'
  return '#d97706'
}

export default async function AuditDashboard({ searchParams }: { searchParams: { t?: string; agent?: string; source?: string; date?: string } }) {
  if (searchParams.t !== process.env.OPS_DASHBOARD_TOKEN) {
    redirect('/ops?error=unauthorized')
  }

  const db = getAdmin()
  const agent = searchParams.agent?.trim() || ''
  const source = searchParams.source?.trim() || ''
  const date = searchParams.date?.trim() || ''

  let runsQuery = db
    .from('agent_runs')
    .select('id, agent_name, workflow_id, action, status, details, target_email, created_at, payload_hash, prev_hash, chain_status')
    .order('created_at', { ascending: false })
    .limit(200)
  if (agent) runsQuery = runsQuery.eq('agent_name', agent)
  if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const next = new Date(date)
    next.setUTCDate(next.getUTCDate() + 1)
    runsQuery = runsQuery.gte('created_at', `${date}T00:00:00.000Z`).lt('created_at', next.toISOString())
  }

  let eventsQuery = db
    .from('ops_events')
    .select('id, event_type, source, ref_id, ref_email, amount_cents, status, created_at')
    .order('created_at', { ascending: false })
    .limit(200)
  if (source) eventsQuery = eventsQuery.eq('source', source)
  if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const next = new Date(date)
    next.setUTCDate(next.getUTCDate() + 1)
    eventsQuery = eventsQuery.gte('created_at', `${date}T00:00:00.000Z`).lt('created_at', next.toISOString())
  }

  const [{ data: runs }, { data: events }] = await Promise.all([runsQuery, eventsQuery])

  const runRows = (runs ?? []) as AuditChainRow[]
  const eventRows = (events ?? []) as OpsEventRow[]
  const chain = verifyChain(runRows)

  const chainedCount = runRows.filter((r) => r.chain_status === 'chained').length
  const gapCount = runRows.filter((r) => r.chain_status === 'chain_gap').length

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Agent Audit Trail</h1>
          <p style={{ fontSize: '0.8rem', color: '#666', margin: '0.25rem 0 0' }}>
            Hash-chained action log. Tamper-evident, not tamper-proof: it proves the log was altered, not that the outcome was correct.
          </p>
        </div>
        <a
          href={`/api/ops/audit/verify?t=${encodeURIComponent(searchParams.t ?? '')}`}
          style={{ fontSize: '0.8rem', color: '#2563eb', textDecoration: 'none' }}
        >
          Verify endpoint →
        </a>
      </div>

      {/* Chain status */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ padding: '0.9rem', borderRadius: 8, border: '1px solid #e5e7eb', background: chain.valid ? '#f0fdf4' : '#fef2f2' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: chain.valid ? '#059669' : '#dc2626', marginBottom: '0.25rem' }}>Chain status</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: chain.valid ? '#059669' : '#dc2626' }}>{chain.valid ? 'VALID' : 'BROKEN'}</div>
        </div>
        <div style={{ padding: '0.9rem', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#666', marginBottom: '0.25rem' }}>Rows checked</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{chain.checked}</div>
        </div>
        <div style={{ padding: '0.9rem', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#666', marginBottom: '0.25rem' }}>Chained</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#059669' }}>{chainedCount}</div>
        </div>
        <div style={{ padding: '0.9rem', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#666', marginBottom: '0.25rem' }}>Chain gaps</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: gapCount > 0 ? '#d97706' : '#666' }}>{gapCount}</div>
        </div>
      </div>

      {!chain.valid && chain.reason ? (
        <div style={{ padding: '0.75rem 1rem', borderRadius: 8, background: '#fef2f2', border: '1px solid #fecaca', fontSize: '0.85rem', color: '#991b1b', marginBottom: '1.5rem' }}>
          <strong>Chain break:</strong> {chain.reason}
        </div>
      ) : null}

      {/* Filters */}
      <form method="get" style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: '1.5rem', padding: '1rem', borderRadius: 8, border: '1px solid #e5e7eb', background: '#f9fafb' }}>
        <input type="hidden" name="t" value={searchParams.t ?? ''} />
        <div>
          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#666', marginBottom: '0.25rem' }}>Agent</label>
          <select name="agent" defaultValue={agent} style={{ padding: '0.4rem 0.6rem', borderRadius: 6, border: '1px solid #d1d5db', fontSize: '0.85rem', background: '#fff' }}>
            <option value="">All agents</option>
            {AGENT_NAMES.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#666', marginBottom: '0.25rem' }}>Event source</label>
          <select name="source" defaultValue={source} style={{ padding: '0.4rem 0.6rem', borderRadius: 6, border: '1px solid #d1d5db', fontSize: '0.85rem', background: '#fff' }}>
            <option value="">All sources</option>
            {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#666', marginBottom: '0.25rem' }}>Date</label>
          <input type="date" name="date" defaultValue={date} style={{ padding: '0.4rem 0.6rem', borderRadius: 6, border: '1px solid #d1d5db', fontSize: '0.85rem', background: '#fff' }} />
        </div>
        <button type="submit" style={{ padding: '0.4rem 1rem', borderRadius: 6, border: '1px solid #2563eb', background: '#2563eb', color: '#fff', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>Filter</button>
        <a href={`/ops/audit?t=${encodeURIComponent(searchParams.t ?? '')}`} style={{ fontSize: '0.8rem', color: '#666', textDecoration: 'none', padding: '0.4rem 0' }}>Clear</a>
      </form>

      {/* Agent runs (hash-chained) */}
      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Agent runs <span style={{ fontSize: '0.75rem', fontWeight: 400, color: '#888' }}>(hash-chained)</span></h2>
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden', marginBottom: '2rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
          <thead>
            <tr style={{ background: '#f9fafb', textAlign: 'left' }}>
              <th style={{ padding: '0.5rem 0.75rem', fontWeight: 600, color: '#666' }}>Time</th>
              <th style={{ padding: '0.5rem 0.75rem', fontWeight: 600, color: '#666' }}>Agent</th>
              <th style={{ padding: '0.5rem 0.75rem', fontWeight: 600, color: '#666' }}>Action</th>
              <th style={{ padding: '0.5rem 0.75rem', fontWeight: 600, color: '#666' }}>Status</th>
              <th style={{ padding: '0.5rem 0.75rem', fontWeight: 600, color: '#666' }}>Target</th>
              <th style={{ padding: '0.5rem 0.75rem', fontWeight: 600, color: '#666' }}>Chain</th>
            </tr>
          </thead>
          <tbody>
            {runRows.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: '1.5rem', textAlign: 'center', color: '#888' }}>No agent runs match the filters.</td></tr>
            ) : runRows.map((r) => (
              <tr key={r.id} style={{ borderTop: '1px solid #f3f4f6' }}>
                <td style={{ padding: '0.5rem 0.75rem', color: '#666', whiteSpace: 'nowrap' }}>{fmtTime(r.created_at ?? '')}</td>
                <td style={{ padding: '0.5rem 0.75rem', fontWeight: 600 }}>{r.agent_name}</td>
                <td style={{ padding: '0.5rem 0.75rem' }}>{r.action}</td>
                <td style={{ padding: '0.5rem 0.75rem', color: statusColor(r.status), fontWeight: 600 }}>{r.status}</td>
                <td style={{ padding: '0.5rem 0.75rem', color: '#666' }}>{r.target_email ?? '—'}</td>
                <td style={{ padding: '0.5rem 0.75rem' }}>
                  {r.chain_status === 'chained' ? (
                    <span style={{ color: '#059669', fontSize: '0.7rem', fontWeight: 600 }}>🔗 chained</span>
                  ) : (
                    <span style={{ color: '#d97706', fontSize: '0.7rem', fontWeight: 600 }}>gap</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Ops events (telemetry) */}
      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Ops events <span style={{ fontSize: '0.75rem', fontWeight: 400, color: '#888' }}>(telemetry)</span></h2>
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
          <thead>
            <tr style={{ background: '#f9fafb', textAlign: 'left' }}>
              <th style={{ padding: '0.5rem 0.75rem', fontWeight: 600, color: '#666' }}>Time</th>
              <th style={{ padding: '0.5rem 0.75rem', fontWeight: 600, color: '#666' }}>Event</th>
              <th style={{ padding: '0.5rem 0.75rem', fontWeight: 600, color: '#666' }}>Source</th>
              <th style={{ padding: '0.5rem 0.75rem', fontWeight: 600, color: '#666' }}>Status</th>
              <th style={{ padding: '0.5rem 0.75rem', fontWeight: 600, color: '#666' }}>Ref</th>
            </tr>
          </thead>
          <tbody>
            {eventRows.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: '1.5rem', textAlign: 'center', color: '#888' }}>No ops events match the filters.</td></tr>
            ) : eventRows.map((e) => (
              <tr key={e.id} style={{ borderTop: '1px solid #f3f4f6' }}>
                <td style={{ padding: '0.5rem 0.75rem', color: '#666', whiteSpace: 'nowrap' }}>{fmtTime(e.created_at)}</td>
                <td style={{ padding: '0.5rem 0.75rem', fontWeight: 600 }}>{e.event_type}</td>
                <td style={{ padding: '0.5rem 0.75rem', color: '#666' }}>{e.source}</td>
                <td style={{ padding: '0.5rem 0.75rem', color: statusColor(e.status), fontWeight: 600 }}>{e.status ?? '—'}</td>
                <td style={{ padding: '0.5rem 0.75rem', color: '#666' }}>{e.ref_email ?? e.ref_id ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: '#888', lineHeight: 1.6 }}>
        The hash chain proves the log was not silently altered — it does not prove the agent&rsquo;s outcome was correct. Rows written before the chain shipped are marked <strong>gap</strong> and are excluded from verification.
      </p>
    </div>
  )
}
