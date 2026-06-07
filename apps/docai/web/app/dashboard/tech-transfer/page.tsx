import GenerateClient from './GenerateClient'

const TEMPLATE_TYPES = [
  { code: 'delaware-certificate', label: 'Delaware Certificate of Incorporation', desc: 'Standard C-Corp formation document.' },
  { code: 'delaware-bylaws', label: 'Delaware Corporate Bylaws', desc: 'Governance rules for board and stockholders.' },
  { code: 'israeli-subsidiary-moa', label: 'Israeli Subsidiary Memorandum', desc: 'Formation document for Israeli R&D subsidiary.' },
  { code: 'ip-assignment', label: 'IP Assignment Agreement', desc: 'Transfer intellectual property between entities.' },
  { code: 'transfer-pricing-policy', label: 'Transfer Pricing Policy', desc: 'Intercompany pricing documentation (OECD-compliant).' },
  { code: 'board-resolution', label: 'Board Resolution', desc: 'Authorization for cross-border transactions.' },
]

export default function TechTransferVertical() {
  return (
    <div>
      <h1 style={{
        fontFamily: 'var(--bl-font-display, Fraunces, serif)',
        fontSize: '1.5rem',
        fontWeight: 700,
        marginBottom: '0.5rem',
      }}>
        Tech-Transfer &amp; Cross-Border Incorporation
      </h1>
      <p style={{ color: 'var(--bl-text-muted, #888)', marginBottom: '2rem', fontSize: '0.95rem' }}>
        Generate standard corporate templates for Delaware flips, Israeli subsidiaries, and IP transfers.
      </p>
      <GenerateClient templateTypes={TEMPLATE_TYPES} />
    </div>
  )
}
