import type { Metadata } from 'next'
import { SurfaceDashboard } from '../_components/SurfaceDashboard'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Ops · Main — BizLegal AI',
  description: 'Hub-only ops: crons, payments, leads, framework changes, agents.',
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
  { id: 'agents', label: '/agents page', note: '12 agents · $19 one-time or $49/mo', url: 'https://bizlegal-ai.com/agents' },
  { id: 'checkout', label: '/checkout (unified)', note: 'Crypto · PayPal · Wire USD/EUR ≥$500', url: 'https://bizlegal-ai.com/checkout?product=hub&tier=pro&interval=monthly&amount=14900&name=Hub+Pro' },
  { id: 'cron-billing', label: 'cron: charge-due', note: '07:00 UTC daily' },
  { id: 'cron-ops', label: 'cron: ops-alerts', note: 'Every 15 min' },
  { id: 'cron-boi', label: 'cron: boi/check', note: '14:00 UTC daily' },
  { id: 'cron-policy', label: 'cron: policy-refresh', note: '12:00 UTC daily' },
  { id: 'cron-aiact', label: 'cron: ai-act-monitor', note: '11:00 UTC daily' },
  { id: 'cron-smoke', label: 'cron: smoke', note: '09:00 UTC daily' },
  { id: 'ea', label: 'EA autonomous agents (Phase RR)', note: 'cron-triggered Claude tasks → Telegram + ops_event' },
]

export default function OpsMainPage({ searchParams }: PageProps) {
  const expected = process.env.OPS_DASHBOARD_TOKEN ?? ''
  const provided = (searchParams.token ?? searchParams.t ?? '').trim()
  if (!expected || !provided || !timingSafeEq(expected, provided)) {
    return <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--bl-font-mono)', fontSize: 14 }}>404 — not found</main>
  }
  const registry = [
    { id: 'command', label: '/ops/command', note: 'Command — every move, one screen', url: `/ops/command?t=${encodeURIComponent(provided)}` },
    ...REGISTRY,
  ]
  return (
    <SurfaceDashboard
      token={provided}
      surfaceId="main"
      title="Main — Hub"
      subtitle="bizlegal-ai.com · the brain — payments, crons, agents, ops chain"
      sources={['hub', 'ea']}
      probeSources={['hub']}
      registry={registry}
    />
  )
}
