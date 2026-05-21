import type { Metadata } from 'next'
import { SurfaceDashboard } from '../_components/SurfaceDashboard'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Ops · OCI — BizLegal AI',
  description: 'OCI deal-router: real-estate referral pipeline, partners, payouts.',
  robots: { index: false, follow: false, nocache: true },
}

interface PageProps {
  searchParams: { t?: string; token?: string }
}

function timingSafeEq(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

const REGISTRY = [
  { id: 'router', label: 'OCI Deal Router (FastAPI)', note: 'Oracle Cloud il-jerusalem-1 · Caddy + Cloudflare Tunnel', url: 'https://router.bizlegal-ai.com/health' },
  { id: 'partners', label: 'partners.py', note: 'Match score: jurisdiction × ticket × vertical' },
  { id: 'payout-reconciler', label: 'payout_reconciler.py', note: 'Fri 10:00 UTC weekly · fires referral.paid' },
  { id: 'payout-report', label: 'payout_report.py', note: '03:00 UTC daily · 90-day PII anonymizer' },
  { id: 'notify', label: 'notify.py', note: 'Telegram + Resend on HOT priority referrals' },
  { id: 'realestate-intake', label: 'realestate-intake proxy', note: 'Hub /api/realestate-intake → OCI /lead (HMAC)' },
]

export default function OpsOciPage({ searchParams }: PageProps) {
  const expected = process.env.OPS_DASHBOARD_TOKEN ?? ''
  const provided = (searchParams.token ?? searchParams.t ?? '').trim()
  if (!expected || !provided || !timingSafeEq(expected, provided)) {
    return <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--bl-font-mono)', fontSize: 14 }}>404 — not found</main>
  }
  return (
    <SurfaceDashboard
      token={provided}
      surfaceId="oci"
      title="OCI — Deal Router"
      subtitle="router.bizlegal-ai.com · real-estate referral pipeline (asymmetric pillar)"
      sources={['oci']}
      probeSources={['oci']}
      registry={REGISTRY}
    />
  )
}
