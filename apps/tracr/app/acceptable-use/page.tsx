import Link from 'next/link'

export const metadata = {
  title: 'Acceptable Use Policy | TRACR — Powered by BizLegal AI',
  description: 'Acceptable use policy for TRACR regulatory risk intelligence platform by BizLegal AI (bizlegal-ai.com).',
}

const s = { minHeight: '100vh', background: '#0b1326', color: '#dae2fd', fontFamily: "'DM Sans', sans-serif", padding: '80px 32px' } as const
const inner = { maxWidth: '720px', margin: '0 auto' } as const
const h1 = { fontSize: '36px', fontWeight: 800, marginBottom: '8px', color: '#f0f2ff' } as const
const meta = { fontSize: '12px', color: '#636680', marginBottom: '40px' } as const
const h2 = { fontSize: '18px', fontWeight: 600, color: '#f0f2ff', marginBottom: '10px', marginTop: '32px' } as const
const p = { fontSize: '14px', color: '#94a3b8', lineHeight: 1.8, marginBottom: '20px' } as const
const a = { color: '#a5b4fc', textDecoration: 'none' } as const

export default function AcceptableUsePage() {
  return (
    <div style={s}><div style={inner}>
      <h1 style={h1}>Acceptable Use Policy</h1>
      <p style={{ fontSize: '13px', color: '#a5b4fc', marginBottom: '4px' }}>TRACR — Powered by <a href="https://bizlegal-ai.com" style={a}>BizLegal AI</a> (bizlegal-ai.com)</p>
      <p style={meta}>Last updated: April 2026</p>
      <h2 style={h2}>1. Purpose</h2>
      <p style={p}>This Acceptable Use Policy governs your use of TRACR, a regulatory risk intelligence platform operated by BizLegal AI. By using TRACR, you agree to comply with this policy.</p>
      <h2 style={h2}>2. Permitted Use</h2>
      <p style={p}>You may use TRACR to:</p>
      <ul style={{ ...p, paddingLeft: '24px', listStyleType: 'disc' }}>
        <li style={{ marginBottom: '8px' }}>Generate regulatory risk reports for your own business or clients</li>
        <li style={{ marginBottom: '8px' }}>Evaluate compliance posture across supported regulatory frameworks</li>
        <li style={{ marginBottom: '8px' }}>Share reports internally within your organisation for compliance purposes</li>
        <li style={{ marginBottom: '8px' }}>Use report findings to inform legal and business decisions (with independent legal counsel)</li>
      </ul>
      <h2 style={h2}>3. Prohibited Use</h2>
      <p style={p}>You may NOT use TRACR to:</p>
      <ul style={{ ...p, paddingLeft: '24px', listStyleType: 'disc' }}>
        <li style={{ marginBottom: '8px' }}>Resell, redistribute, or white-label reports without written permission</li>
        <li style={{ marginBottom: '8px' }}>Submit false, misleading, or fraudulent information for scanning</li>
        <li style={{ marginBottom: '8px' }}>Attempt to reverse-engineer, scrape, or automate access to the platform</li>
        <li style={{ marginBottom: '8px' }}>Use the platform to facilitate money laundering, sanctions evasion, or any illegal activity</li>
        <li style={{ marginBottom: '8px' }}>Overwhelm the service with excessive requests (rate limiting applies)</li>
        <li style={{ marginBottom: '8px' }}>Represent TRACR reports as legal advice or certified legal opinions</li>
        <li style={{ marginBottom: '8px' }}>Access or attempt to access other users&apos; data or reports</li>
      </ul>
      <h2 style={h2}>4. Data Integrity</h2>
      <p style={p}>You are responsible for the accuracy of information you submit to TRACR. Reports are only as reliable as the inputs provided. Submitting intentionally false data may result in account suspension.</p>
      <h2 style={h2}>5. Intellectual Property</h2>
      <p style={p}>TRACR reports, scoring algorithms, and platform content are the intellectual property of BizLegal AI. You receive a licence to use generated reports for your internal purposes only.</p>
      <h2 style={h2}>6. Enforcement</h2>
      <p style={p}>Violation of this policy may result in: suspension or termination of your account, refusal of future service, and, where applicable, legal action. We reserve the right to determine what constitutes a violation.</p>
      <h2 style={h2}>7. Contact</h2>
      <p style={p}>Questions about acceptable use: <a href="mailto:team@bizlegal-ai.com" style={a}>team@bizlegal-ai.com</a></p>
      <div style={{ borderTop: '1px solid #1e293b', marginTop: '40px', paddingTop: '20px', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        <Link href="/terms" style={a}>Terms of Service</Link>
        <Link href="/privacy" style={a}>Privacy Policy</Link>
        <Link href="/disclaimer" style={a}>Disclaimer</Link>
        <Link href="/refund" style={a}>Refund Policy</Link>
        <a href="https://bizlegal-ai.com" style={a}>&larr; Back to BizLegal AI</a>
      </div>
    </div></div>
  )
}
