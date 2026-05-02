import Link from 'next/link'

const sections = [
  {
    icon: '🔐', title: 'No document content stored',
    body: 'LexAudit never stores the actual text of your documents or AI outputs. Only metadata is logged: which tool was used, a summary of the prompt, what human edits were made, and who reviewed it. Your documents stay on your systems. Privilege is preserved by architecture, not by policy.'
  },
  {
    icon: '🛡️', title: 'PII redaction before AI inference',
    body: 'Before any matter title, prompt, or human-edits note is sent to Anthropic for the rationale draft, our redaction layer (lib/safe/redact.ts) strips: emails, phone numbers, SSNs, EINs, credit cards, IBANs, India Aadhaar, EU national IDs, UK/US postcodes, and IPv4 addresses. Each match is replaced with a structured token like [PII:EMAIL] so the AI can still reason about structure without seeing values. Per-redaction counts are logged for the audit trail; the original PII is never persisted server-side. This is decision-support — institutional review remains your responsibility for genuinely sensitive matters.'
  },
  {
    icon: '🏛️', title: 'Row-Level Security — firm isolation',
    body: 'Every firm\'s data is isolated at the database layer using Supabase Row-Level Security (RLS). Firm A cannot access Firm B\'s data under any circumstance — not even with a valid login token. This is enforced at the Postgres level, not the application layer.'
  },
  {
    icon: '🔏', title: 'Tamper-evident SHA-256 hashing',
    body: 'Every Compliance Health Score snapshot is hashed using SHA-256 at the moment of generation. The hash is stored alongside the snapshot. Any modification after release will produce a different hash — making tampering immediately detectable.'
  },
  {
    icon: '☁️', title: 'Infrastructure',
    body: 'LexAudit runs on Vercel (frontend) and Supabase (database/auth). Both hold independently attested SOC 2 Type II reports. Data is encrypted at rest (AES-256) and in transit (TLS 1.3). Supabase is GDPR-compliant and provides EU data residency options on request.'
  },
  {
    icon: '🚫', title: 'No IT approval required',
    body: 'LexAudit is a web application — no browser extension, no DMS integration, no API connection to Harvey, Legora, or any other AI tool. You log entries manually. This means no data flows between LexAudit and any third-party AI system. Nothing for your IT department to review.'
  },
  {
    icon: '📤', title: 'Data portability & deletion',
    body: 'You own your data. Export all matters, logs, and certificates at any time in JSON or CSV format. Request complete account deletion and all associated data is purged within 30 days. We do not sell, license, or share your data with any third party.'
  },
]

export default function SecurityPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#050509', color: '#e2e8f0', fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600;700&display=swap')`}</style>
      <nav style={{ borderBottom: '1px solid #0f172a', padding: '0 40px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <div style={{ width: '26px', height: '26px', background: 'linear-gradient(135deg,#c9a84c,#7a5c20)', borderRadius: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>⚖</div>
          <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: '17px', color: '#e2e8f0' }}>LexAudit</span>
        </Link>
        <Link href="/login" style={{ background: 'linear-gradient(135deg,#c9a84c,#a07830)', color: '#0a0a0f', borderRadius: '8px', padding: '9px 20px', fontWeight: 700, fontSize: '13px', textDecoration: 'none' }}>Get Started Free</Link>
      </nav>

      <section style={{ padding: '80px 40px 48px', maxWidth: '760px', margin: '0 auto' }}>
        <p style={{ color: '#c9a84c', fontSize: '11px', letterSpacing: '4px', marginBottom: '12px' }}>SECURITY & PRIVACY</p>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: '42px', fontWeight: 900, marginBottom: '16px', lineHeight: 1.15 }}>Built for lawyers.<br />Designed for privilege.</h1>
        <p style={{ color: '#64748b', fontSize: '16px', lineHeight: 1.7 }}>
          Every architecture decision in LexAudit was made with privilege and professional responsibility in mind. Here is exactly how your data is handled.
        </p>
      </section>

      <section style={{ padding: '0 40px 80px', maxWidth: '760px', margin: '0 auto' }}>
        {sections.map(s => (
          <div key={s.title} style={{ background: '#080810', border: '1px solid #1a1a2e', borderRadius: '14px', padding: '28px 28px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ fontSize: '24px', flexShrink: 0 }}>{s.icon}</div>
              <div>
                <h2 style={{ fontSize: '17px', fontWeight: 600, marginBottom: '10px' }}>{s.title}</h2>
                <p style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.75 }}>{s.body}</p>
              </div>
            </div>
          </div>
        ))}

        <div style={{ background: 'linear-gradient(135deg,#0f0f05,#0a0a15)', border: '1px solid #2a2010', borderRadius: '14px', padding: '28px', marginTop: '32px', textAlign: 'center' }}>
          <p style={{ color: '#c9a84c', fontSize: '11px', letterSpacing: '3px', marginBottom: '10px' }}>QUESTIONS ABOUT SECURITY?</p>
          <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '16px' }}>We're happy to discuss our architecture with your IT team or security counsel.</p>
          <a href="mailto:ai.leadx10@gmail.com" style={{ color: '#c9a84c', fontSize: '14px' }}>ai.leadx10@gmail.com</a>
        </div>
      </section>
    </div>
  )
}
