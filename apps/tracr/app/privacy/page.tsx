import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy | TRACR — Powered by BizLegal AI',
  description: 'Privacy policy for TRACR regulatory risk intelligence platform by BizLegal AI (bizlegal-ai.com).',
}

const s = { minHeight: '100vh', background: '#0b1326', color: '#dae2fd', fontFamily: "'DM Sans', sans-serif", padding: '80px 32px' } as const
const inner = { maxWidth: '720px', margin: '0 auto' } as const
const h1 = { fontSize: '36px', fontWeight: 800, marginBottom: '8px', color: '#f0f2ff' } as const
const meta = { fontSize: '12px', color: '#636680', marginBottom: '40px' } as const
const h2 = { fontSize: '18px', fontWeight: 600, color: '#f0f2ff', marginBottom: '10px', marginTop: '32px' } as const
const p = { fontSize: '14px', color: '#94a3b8', lineHeight: 1.8, marginBottom: '20px' } as const
const a = { color: '#a5b4fc', textDecoration: 'none' } as const

export default function PrivacyPage() {
  return (
    <div style={s}><div style={inner}>
      <h1 style={h1}>Privacy Policy</h1>
      <p style={{ fontSize: '13px', color: '#a5b4fc', marginBottom: '4px' }}>TRACR — Powered by <a href="https://bizlegal-ai.com" style={a}>BizLegal AI</a> (bizlegal-ai.com)</p>
      <p style={meta}>Last updated: April 2026</p>
      <h2 style={h2}>1. What We Collect</h2>
      <p style={p}>We collect: your email address (for report delivery), business information you submit for scanning, payment information (processed by NOWPayments/Payoneer — we do not store card numbers), and usage analytics.</p>
      <h2 style={h2}>2. How We Use It</h2>
      <p style={p}>Data is used solely to generate regulatory risk reports, process payments, and deliver results. We do not sell, license, or share your data with third parties except as required to provide the service.</p>
      <h2 style={h2}>3. Data Storage & Security</h2>
      <p style={p}>Data is stored in Supabase (PostgreSQL) with AES-256 encryption at rest and TLS 1.3 in transit. Row-Level Security isolates each client’s data.</p>
      <h2 style={h2}>4. Your Rights (GDPR)</h2>
      <p style={p}>You have the right to: access your data, request correction, request deletion, data portability, and restrict processing. Email <a href="mailto:team@bizlegal-ai.com" style={a}>team@bizlegal-ai.com</a> to exercise these rights. We respond within 30 days.</p>
      <h2 style={h2}>5. Cookies</h2>
      <p style={p}>We use essential cookies only (session management). No tracking or advertising cookies.</p>
      <h2 style={h2}>6. Contact</h2>
      <p style={p}>Privacy inquiries: <a href="mailto:team@bizlegal-ai.com" style={a}>team@bizlegal-ai.com</a></p>
      <div style={{ borderTop: '1px solid #1e293b', marginTop: '40px', paddingTop: '20px', display: 'flex', gap: '24px' }}>
        <Link href="/terms" style={a}>← Terms of Service</Link>
        <Link href="/disclaimer" style={a}>Disclaimer →</Link>
      </div>
    </div></div>
  )
}
