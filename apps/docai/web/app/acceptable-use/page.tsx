export default function AcceptableUsePage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@300;400;500&family=Playfair+Display:wght@400;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #0b1326; color: #dae2fd; }
        .prose h2 { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: #dae2fd; margin: 32px 0 12px; }
        .prose p, .prose li { font-size: 15px; color: rgba(218,226,253,0.7); line-height: 1.8; margin-bottom: 12px; }
        .prose ul { padding-left: 20px; }
        .prose a { color: #b3c5ff; }
      `}</style>

      <nav style={{
        position: 'fixed', top: 0, width: '100%', zIndex: 50,
        background: 'rgba(11,19,38,0.9)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(218,226,253,0.08)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '0 32px', height: 64,
      }}>
        <a href="/" style={{
          fontFamily: 'Playfair Display, serif', fontWeight: 800, fontSize: 18,
          background: 'linear-gradient(135deg, #b3c5ff, #6288ff)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>DocAI Hub</a>
        <a href="https://bizlegal-ai.com" style={{ fontSize: 13, fontWeight: 600, color: 'rgba(218,226,253,0.55)' }}>← Back to BizLegal AI</a>
      </nav>

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '96px 32px 80px' }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 36, fontWeight: 800, marginBottom: 8 }}>Acceptable Use Policy</h1>
        <p style={{ fontSize: 13, color: 'rgba(218,226,253,0.4)', marginBottom: 40 }}>Last updated: April 2026</p>

        <div className="prose">
          <h2>Permitted Uses</h2>
          <ul>
            <li>✓ Analyzing your own documents for risk identification</li>
            <li>✓ Generating contract drafts for your review with a licensed attorney</li>
            <li>✓ Using CryptoScan AI for informational crypto risk assessment</li>
            <li>✓ Sharing scan results with your legal counsel</li>
            <li>✓ Using the platform for legitimate business compliance research</li>
          </ul>

          <h2>Prohibited Uses</h2>
          <ul>
            <li>✕ Uploading documents containing third-party confidential information without authorization</li>
            <li>✕ Using the Services for any unlawful purpose</li>
            <li>✕ Attempting to reverse-engineer, scrape, or overload the platform</li>
            <li>✕ Reselling or redistributing scan results without written permission</li>
            <li>✕ Using analysis output as a formal legal opinion or securities law advice</li>
          </ul>

          <h2>Document-Specific Rules</h2>
          <ul>
            <li>✕ Do not upload classified, privileged, or attorney-work-product documents without proper authorization</li>
            <li>✕ Do not use generated contracts as-is without review by a licensed attorney</li>
            <li>✕ Do not represent AI-generated contract clauses as lawyer-drafted provisions</li>
            <li>✕ Do not use scan results to misrepresent a document&apos;s legal status or compliance posture</li>
          </ul>

          <h2>AI Output Limitations</h2>
          <ul>
            <li>! AI-generated analysis may contain errors, omissions, or inaccuracies</li>
            <li>! Risk scores are informational estimates, not guarantees</li>
            <li>! Contract drafts require human legal review before execution</li>
            <li>! Crypto risk assessments do not constitute financial advice</li>
          </ul>

          <h2>Enforcement</h2>
          <ul>
            <li>→ Violations may result in immediate account suspension</li>
            <li>→ Repeated violations result in permanent account termination</li>
            <li>→ We reserve the right to revoke access to previously purchased reports</li>
            <li>→ Legal action may be taken for fraud, misrepresentation, or IP violations</li>
          </ul>

          <h2>Contact</h2>
          <p>
            BizLegal AI<br />
            Email: <a href="mailto:team@bizlegal-ai.com">team@bizlegal-ai.com</a>
          </p>
        </div>

        <div style={{ borderTop: '1px solid rgba(218,226,253,0.08)', marginTop: 40, paddingTop: 20, display: 'flex', justifyContent: 'space-between' }}>
          <a href="/refund" style={{ color: '#b3c5ff', fontSize: 14, textDecoration: 'none' }}>← Refund Policy</a>
          <a href="/terms" style={{ color: '#b3c5ff', fontSize: 14, textDecoration: 'none' }}>Terms of Service →</a>
        </div>
      </main>

      <footer style={{
        borderTop: '1px solid rgba(68,70,80,0.3)',
        background: 'rgba(6,14,32,0.8)', padding: '24px 32px', textAlign: 'center',
      }}>
        <div style={{ fontSize: 13, color: 'rgba(218,226,253,0.4)', display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap' as const }}>
          <a href="/" style={{ color: 'inherit' }}>DocAI Hub</a>
          <a href="/terms" style={{ color: 'inherit' }}>Terms of Service</a>
          <a href="/privacy" style={{ color: 'inherit' }}>Privacy Policy</a>
          <a href="/disclaimer" style={{ color: 'inherit' }}>Disclaimer</a>
          <a href="/refund" style={{ color: 'inherit' }}>Refund Policy</a>
        </div>
      </footer>
    </>
  )
}