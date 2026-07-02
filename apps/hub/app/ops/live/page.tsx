import OpsLiveClient from './OpsLiveClient'

export const dynamic = 'force-dynamic'

/**
 * /ops/live
 *
 * Phase 1 of PLATFORM-BUILD-2026-07-02 — live process inspection.
 *
 * Operator dashboard. Token-gated via ?t=TOKEN (same OPS_DASHBOARD_TOKEN as
 * /api/ops/health). Streams from /api/ops/live/stream via SSE.
 */
export default function Page({ searchParams }: { searchParams: { t?: string } }) {
  const token = searchParams.t || ''
  if (!token) {
    return (
      <main style={{ fontFamily: 'ui-sans-serif, system-ui, sans-serif', background: '#0a0a0a', color: '#e5e5e5', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h1>🔒 /ops/live</h1>
          <p>Append <code>?t=&lt;OPS_DASHBOARD_TOKEN&gt;</code> to your URL.</p>
        </div>
      </main>
    )
  }
  return <OpsLiveClient token={token} />
}
