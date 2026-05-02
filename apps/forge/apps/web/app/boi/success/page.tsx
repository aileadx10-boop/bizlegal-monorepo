import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Order Confirmed — Forge Compliance Engine',
  description: 'Your BOI compliance report order has been confirmed.',
}

export default function BOISuccessPage() {
  return (
    <main
      className="min-h-screen px-6 py-20"
      style={{ background: 'var(--forge-dark, #0a0b0f)', color: 'var(--forge-text, #f1f5f9)' }}
    >
      <div className="max-w-2xl mx-auto text-center">
        <div className="text-green-400 text-sm font-mono tracking-widest uppercase mb-6">
          Order Confirmed
        </div>

        <h1 className="text-3xl font-light mb-4 tracking-tight">
          Your BOI report is being prepared.
        </h1>

        <p className="max-w-md mx-auto mb-10 leading-relaxed" style={{ color: '#94a3b8' }}>
          You&apos;ll receive your complete BOI Compliance Report within 24 hours at the email
          address you provided. Check your inbox (and spam folder).
        </p>

        {/* ─── Cross-sell: CTA-2024 BOI Tracker ──────────────────────── */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(91,33,182,0.12) 0%, rgba(236,72,153,0.08) 100%)',
            border: '1px solid rgba(91,33,182,0.4)',
            borderRadius: 16,
            padding: '28px 24px',
            textAlign: 'left',
            marginBottom: 32,
          }}
        >
          <div
            style={{
              fontFamily: 'monospace',
              fontSize: 11,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: '#c4b5fd',
              marginBottom: 12,
            }}
          >
            ⚡ Stay ahead of the next change
          </div>
          <h2 className="text-xl font-medium mb-3" style={{ color: '#f1f5f9' }}>
            Add the CTA-2024 BOI Tracker — $29/mo
          </h2>
          <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>
            FinCEN keeps amending the rule mid-flight. Subscribe to our daily monitor and we&apos;ll
            email you when the rule changes for your entity type or your 30-day refile window
            opens. Penalty for missed filings is up to $500/day capped at $10K — don&apos;t leave
            it to your tax software.
          </p>
          <ul style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.8, paddingLeft: 0, listStyle: 'none', marginBottom: 18 }}>
            <li>✓ Daily federalregister.gov monitoring</li>
            <li>✓ 30/7/3/1-day deadline alerts</li>
            <li>✓ 1 entity (Solo) · up to 50 entities (Firm $99/mo)</li>
            <li>✓ Cancel anytime; data delivery non-refundable once produced</li>
          </ul>
          <a
            href="https://bizlegal-ai.com/agents/boi-tracker"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              background: '#5b21b6',
              color: '#fff',
              borderRadius: 8,
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            Add BOI Tracker → $29/mo
          </a>
        </div>

        <div className="flex gap-4 flex-wrap justify-center">
          <Link
            href="/audit"
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium text-sm hover:bg-indigo-500 transition"
          >
            Run a Free Scan &rarr;
          </Link>
          <Link
            href="/"
            className="px-6 py-3 border border-gray-700 text-gray-400 rounded-lg text-sm hover:border-gray-500 transition"
          >
            &larr; Back to Forge
          </Link>
        </div>

        <p className="text-xs mt-10" style={{ color: '#475569' }}>
          Decision-support service. Not legal advice. Consult licensed counsel for binding
          determinations.
        </p>
      </div>
    </main>
  )
}
