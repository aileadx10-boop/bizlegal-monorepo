import { UploadForm } from './UploadForm'

export default function HomePage() {
  return (
    <div className="container">
      <div style={{ marginBottom: '2rem' }}>
        <span className="tag">Contract Risk Report</span>
        <h1 style={{ marginTop: '1rem' }}>
          Upload a contract. Get a free 2-issue preview in 60 seconds.
        </h1>
        <p>
          Anomalies, missing protections, and ambiguities surfaced by Claude Haiku 4.5. Free preview is free. Full report (every issue + severity ranking + remediation guidance) is <strong style={{ color: 'var(--text)' }}>$97 one-time via PayPal</strong>. Decision-support, not legal advice.
        </p>
      </div>

      <UploadForm />

      <div className="card" style={{ marginTop: '2rem' }}>
        <h2 style={{ marginTop: 0 }}>How it works</h2>
        <ol style={{ paddingLeft: '1.25rem', color: 'var(--text-muted)', display: 'grid', gap: '0.5rem' }}>
          <li>Upload a PDF or DOCX contract (≤4MB)</li>
          <li>Free preview: overall risk grade + top 2 issues (no card)</li>
          <li>Pay $97 via PayPal to unlock the full report (PDF download)</li>
          <li>Receipt + report link emailed to you</li>
        </ol>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>Privacy</h2>
        <p style={{ marginBottom: 0 }}>
          Your document is stored in our private Supabase bucket and accessible only to you (via the unguessable job UUID). We retain documents 30 days then delete them automatically. We never train models on your contracts. <a href="https://bizlegal-ai.com/privacy">Full privacy policy</a>.
        </p>
      </div>
    </div>
  )
}
