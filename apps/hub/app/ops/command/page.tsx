import OpsCommandClient from './OpsCommandClient'

export const dynamic = 'force-dynamic'

/**
 * /ops/command
 *
 * WP6 of REVENUE-MACHINE-24-7-2026-07-04 — every move, one screen.
 *
 * Operator command dashboard. Token-gated via ?t=TOKEN (same
 * OPS_DASHBOARD_TOKEN as /ops/live). Polls /api/ops/command every 30s and
 * rides /api/ops/live/stream (SSE) for the agent heartbeat strip.
 */
export default function Page({ searchParams }: { searchParams: { t?: string } }) {
  const token = searchParams.t || ''
  if (!token) {
    return (
      <main style={{ fontFamily: 'ui-sans-serif, system-ui, sans-serif', background: '#0a0a0a', color: '#e5e5e5', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h1>🔒 /ops/command</h1>
          <p>Append <code>?t=&lt;OPS_DASHBOARD_TOKEN&gt;</code> to your URL.</p>
        </div>
      </main>
    )
  }
  return <OpsCommandClient token={token} />
}
