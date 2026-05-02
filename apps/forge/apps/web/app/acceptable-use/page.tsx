export default function AcceptableUsePage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--forge-bg, #0f172a)', color: '#e2e8f0', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '80px 32px 120px' }}>
        <div style={{ fontSize: 11, fontFamily: 'monospace', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#4ade80', marginBottom: 12 }}>Legal — Acceptable Use Policy</div>
        <h1 style={{ fontSize: 36, fontWeight: 700, marginBottom: 8, color: '#fff' }}>Acceptable Use Policy</h1>
        <p style={{ fontSize: 13, color: '#64748b', marginBottom: 40 }}>Last updated: April 2026</p>

        <div style={{ borderTop: '1px solid #1e293b', marginBottom: 32 }} />

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: '#fff', marginBottom: 12 }}>Permitted Uses</h2>
          <ul style={{ paddingLeft: 20, lineHeight: 1.8, color: '#94a3b8' }}>
            <li style={{ marginBottom: 8 }}>✓ Filing BOI/CTA reports for your own business or clients (with authorization)</li>
            <li style={{ marginBottom: 8 }}>✓ Generating regulatory compliance reports for legitimate business purposes</li>
            <li style={{ marginBottom: 8 }}>✓ Using the web compliance scanner on websites you own or are authorized to audit</li>
            <li style={{ marginBottom: 8 }}>✓ Creating regulatory passports for jurisdictions where you operate</li>
            <li style={{ marginBottom: 8 }}>✓ Sharing compliance reports with your legal counsel or compliance team</li>
          </ul>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: '#fff', marginBottom: 12 }}>Prohibited Uses</h2>
          <ul style={{ paddingLeft: 20, lineHeight: 1.8, color: '#94a3b8' }}>
            <li style={{ marginBottom: 8 }}>✕ Using BOI reports to facilitate identity theft or fraud</li>
            <li style={{ marginBottom: 8 }}>✕ Filing false or misleading information with FinCEN or any government agency</li>
            <li style={{ marginBottom: 8 }}>✕ Using regulatory passports to misrepresent compliance status</li>
            <li style={{ marginBottom: 8 }}>✕ Scraping or reverse-engineering the platform</li>
            <li style={{ marginBottom: 8 }}>✕ Reselling reports without written permission</li>
          </ul>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: '#fff', marginBottom: 12 }}>Compliance-Specific Rules</h2>
          <ul style={{ paddingLeft: 20, lineHeight: 1.8, color: '#94a3b8' }}>
            <li style={{ marginBottom: 8 }}>✕ Do not use the platform to evade regulatory obligations</li>
            <li style={{ marginBottom: 8 }}>✕ Do not submit BOI reports containing knowingly false beneficial ownership information</li>
            <li style={{ marginBottom: 8 }}>✕ Do not use web scanner results to extort or harass website owners</li>
            <li style={{ marginBottom: 8 }}>✕ Do not represent Forge intelligence briefs as formal legal opinions</li>
          </ul>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: '#fff', marginBottom: 12 }}>Output Limitations</h2>
          <ul style={{ paddingLeft: 20, lineHeight: 1.8, color: '#94a3b8' }}>
            <li style={{ marginBottom: 8 }}>! BOI reports are machine-assisted and pass practitioner review before delivery; you remain the filer of record</li>
            <li style={{ marginBottom: 8 }}>! Compliance scores are estimates, not guarantees of regulatory compliance</li>
            <li style={{ marginBottom: 8 }}>! Web scanner results may not capture all regulatory requirements for every jurisdiction</li>
            <li style={{ marginBottom: 8 }}>! Regulatory passports should be verified by qualified legal counsel before reliance</li>
          </ul>
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: '#fff', marginBottom: 12 }}>Enforcement</h2>
          <ul style={{ paddingLeft: 20, lineHeight: 1.8, color: '#94a3b8' }}>
            <li style={{ marginBottom: 8 }}>→ Violations may result in immediate account suspension</li>
            <li style={{ marginBottom: 8 }}>→ Repeated violations result in permanent account termination</li>
            <li style={{ marginBottom: 8 }}>→ We reserve the right to report unlawful use to relevant authorities</li>
            <li style={{ marginBottom: 8 }}>→ Legal action may be taken for fraud, misrepresentation, or regulatory violations</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: '#fff', marginBottom: 12 }}>Contact</h2>
          <p style={{ color: '#94a3b8', lineHeight: 1.8 }}>
            BizLegal AI<br />
            Email: <a href="mailto:team@bizlegal-ai.com" style={{ color: '#4ade80' }}>team@bizlegal-ai.com</a>
          </p>
        </section>

        <div style={{ borderTop: '1px solid #1e293b', marginTop: 40, paddingTop: 20, display: 'flex', justifyContent: 'space-between' }}>
          <a href="/refund" style={{ color: '#4ade80', fontSize: 14, textDecoration: 'none' }}>← Refund Policy</a>
          <a href="/terms" style={{ color: '#4ade80', fontSize: 14, textDecoration: 'none' }}>Terms of Service →</a>
        </div>
      </div>
    </div>
  )
}