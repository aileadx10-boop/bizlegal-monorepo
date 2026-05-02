import Link from 'next/link'

export const metadata = {
  title: 'Refund Policy | TRACR — Powered by BizLegal AI',
  description:
    'TRACR refund policy. Subscriptions cancellable anytime; one-time wallet-scan reports non-refundable once produced unless damaged or demonstrably defective.',
}

const s = {
  minHeight: '100vh',
  background: '#0b1326',
  color: '#dae2fd',
  fontFamily: "'DM Sans', sans-serif",
  padding: '80px 32px',
} as const
const inner = { maxWidth: '720px', margin: '0 auto' } as const
const h1 = { fontSize: '36px', fontWeight: 800, marginBottom: '8px', color: '#f0f2ff' } as const
const meta = { fontSize: '12px', color: '#636680', marginBottom: '40px' } as const
const h2 = { fontSize: '18px', fontWeight: 600, color: '#f0f2ff', marginBottom: '10px', marginTop: '32px' } as const
const p = { fontSize: '14px', color: '#94a3b8', lineHeight: 1.8, marginBottom: '20px' } as const
const a = { color: '#a5b4fc', textDecoration: 'none' } as const

export default function RefundPage() {
  return (
    <div style={s}>
      <div style={inner}>
        <h1 style={h1}>Refund &amp; Cancellation Policy</h1>
        <p style={{ fontSize: '13px', color: '#a5b4fc', marginBottom: '4px' }}>
          TRACR — Powered by{' '}
          <a href="https://bizlegal-ai.com" style={a}>
            BizLegal AI
          </a>{' '}
          (bizlegal-ai.com)
        </p>
        <p style={meta}>Last updated: April 2026</p>

        <h2 style={h2}>1. Subscriptions — cancel anytime</h2>
        <p style={p}>
          You can cancel any recurring TRACR subscription at any time, for any reason. Cancellation stops future
          billing immediately. Access to scans and reports continues until the end of the period you have already
          paid for. We do not pro-rate or refund mid-period unless we are at fault for an outage that prevented you
          from using the product.
        </p>

        <h2 style={h2}>2. One-time wallet scans &amp; reports — non-refundable once produced</h2>
        <p style={p}>
          Wallet scans, risk reports, and other one-time outputs are <strong style={{ color: '#f0f2ff' }}>non-refundable
          once produced and delivered</strong>. The work is bespoke; once analyst time and compute have been spent on
          your inputs, that cost cannot be returned to us. Two exceptions apply, and we honour them in full:
        </p>
        <ul style={{ ...p, paddingLeft: '24px', listStyleType: 'disc' }}>
          <li style={{ marginBottom: '8px' }}>
            <strong style={{ color: '#f0f2ff' }}>Damaged delivery</strong> — file is corrupted, unreadable, or missing
            material content.
          </li>
          <li style={{ marginBottom: '8px' }}>
            <strong style={{ color: '#f0f2ff' }}>Demonstrably defective output</strong> — wrong wallet address scanned,
            wrong chain, wrong jurisdiction, or factual error confirmed on review.
          </li>
        </ul>
        <p style={p}>
          In both cases we attempt redelivery first; if the corrected output still fails specification, we issue a
          full refund.
        </p>

        <h2 style={h2}>3. Pre-delivery cancellation</h2>
        <p style={p}>
          If we have not yet started production on your one-time order, we issue a full refund. For most TRACR scans
          we begin work within 5 minutes of payment confirmation; once started, the order falls under section 2.
        </p>

        <h2 style={h2}>4. Cryptocurrency payments</h2>
        <p style={p}>
          NOWPayments transactions that have already finalised on-chain cannot be reversed. Where a refund is approved
          under sections 2 or 3, we issue it in the original cryptocurrency at the prevailing exchange rate, or as a
          credit toward future TRACR scans at our discretion.
        </p>

        <h2 style={h2}>5. Chargebacks</h2>
        <p style={p}>
          Please contact us first. We respond within 2 business days and resolve almost all disputes directly.
          Chargebacks raised without prior contact may result in account suspension while we work through the dispute
          with the card network.
        </p>

        <h2 style={h2}>6. Contact</h2>
        <p style={p}>
          Refund &amp; cancellation inquiries:{' '}
          <a href="mailto:team@bizlegal-ai.com" style={a}>
            team@bizlegal-ai.com
          </a>
        </p>

        <div style={{ borderTop: '1px solid #1e293b', marginTop: '40px', paddingTop: '20px', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <Link href="/terms" style={a}>Terms of Service</Link>
          <Link href="/privacy" style={a}>Privacy Policy</Link>
          <Link href="/disclaimer" style={a}>Disclaimer</Link>
          <Link href="/acceptable-use" style={a}>Acceptable Use</Link>
          <a href="https://bizlegal-ai.com" style={a}>&larr; Back to BizLegal AI</a>
        </div>
      </div>
    </div>
  )
}
