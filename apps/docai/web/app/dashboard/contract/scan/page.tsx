import { getSession } from '../../../../lib/auth'
import ScanClient from './ScanClient'

export default async function ContractScanPage() {
  const session = await getSession()
  return (
    <div>
      <h1 style={{
        fontFamily: 'var(--bl-font-display, Fraunces, serif)',
        fontSize: '1.5rem',
        fontWeight: 700,
        marginBottom: '0.5rem',
      }}>
        Contract Risk Scan
      </h1>
      <p style={{ color: 'var(--bl-text-muted, #888)', marginBottom: '2rem', fontSize: '0.95rem' }}>
        Upload a contract (PDF or DOCX) for AI-powered risk analysis with evidence-grounded citations.
      </p>
      <ScanClient email={session?.user.email ?? ''} />
    </div>
  )
}
