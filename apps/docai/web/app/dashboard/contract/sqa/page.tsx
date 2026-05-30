import { getSession } from '../../../../lib/auth'

export default async function DashboardSqaPage() {
  const session = await getSession()
  return (
    <div>
      <h1 style={{
        fontFamily: 'var(--bl-font-display, Fraunces, serif)',
        fontSize: '1.5rem',
        fontWeight: 700,
        marginBottom: '0.5rem',
      }}>
        SQA Auto-Fill
      </h1>
      <p style={{ color: 'var(--bl-text-muted, #888)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
        Paste a security questionnaire question and get a citation-grounded draft answer.
      </p>
      <iframe
        src={`/sqa?embed=true&email=${encodeURIComponent(session?.user.email ?? '')}`}
        style={{ width: '100%', minHeight: '70vh', border: 'none', borderRadius: 10 }}
        title="SQA Auto-Fill"
      />
    </div>
  )
}
