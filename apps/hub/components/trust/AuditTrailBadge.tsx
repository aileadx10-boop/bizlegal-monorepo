interface Props {
  certId?: string
  generatedAt?: string
  modelVersion?: string
  expertReviewed?: boolean
}

export default function AuditTrailBadge({ certId, generatedAt, modelVersion = 'claude-sonnet-4-6', expertReviewed }: Props) {
  const date = generatedAt ? new Date(generatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'
  return (
    <div style={{ border: '0.5px solid var(--outline-var)', background: 'var(--bg-mid)', padding: '12px 16px', fontSize: 11, display: 'flex', flexWrap: 'wrap', gap: 16 }}>
      <div>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 2 }}>Cert ID</div>
        <div style={{ color: 'var(--on-surface)', fontWeight: 700, fontFamily: 'monospace' }}>{certId ?? 'Pending'}</div>
      </div>
      <div>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 2 }}>Generated</div>
        <div style={{ color: 'var(--on-surface)', fontWeight: 700 }}>{date}</div>
      </div>
      <div>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 2 }}>Model</div>
        <div style={{ color: 'var(--on-surface)', fontWeight: 700, fontFamily: 'monospace' }}>{modelVersion}</div>
      </div>
      {expertReviewed && (
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 2 }}>Review</div>
          <div style={{ color: 'var(--accent)', fontWeight: 700 }}>Expert Reviewed</div>
        </div>
      )}
    </div>
  )
}
