import { getSession } from '../../../../lib/auth'

export default async function DashboardDpaPage() {
  const session = await getSession()
  return (
    <div>
      <h1 style={{
        fontFamily: 'var(--bl-font-display, Fraunces, serif)',
        fontSize: '1.5rem',
        fontWeight: 700,
        marginBottom: '0.5rem',
      }}>
        DPA Negotiator
      </h1>
      <p style={{ color: 'var(--bl-text-muted, #888)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
        Compare your DPA against GDPR, CCPA, and HIPAA regulatory baselines.
      </p>
      <iframe
        src={`/dpa?embed=true&email=${encodeURIComponent(session?.user.email ?? '')}`}
        style={{ width: '100%', minHeight: '70vh', border: 'none', borderRadius: 10 }}
        title="DPA Negotiator"
      />
    </div>
  )
}
