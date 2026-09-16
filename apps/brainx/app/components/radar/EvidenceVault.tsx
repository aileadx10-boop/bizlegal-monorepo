import type { EvidenceItem } from '@/lib/radar/types'
import SourceBadge from './SourceBadge'

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return '—'
  }
}

export default function EvidenceVault({ evidence }: { evidence: readonly EvidenceItem[] }): JSX.Element {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <h3 className="bx-h3" style={{ fontSize: 18 }}>Evidence vault</h3>
        <span className="bx-eyebrow">{evidence.length} verified source{evidence.length === 1 ? '' : 's'}</span>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="bx-table">
          <thead>
            <tr>
              <th>Source</th>
              <th>Type</th>
              <th>Date</th>
              <th>Why it matters</th>
            </tr>
          </thead>
          <tbody>
            {evidence.map((e) => (
              <tr key={e.id}>
                <td>
                  <a href={e.url} target="_blank" rel="noopener nofollow">{e.title}</a>
                  <div className="bx-muted" style={{ fontSize: 12, marginTop: 2 }}>{e.publisher}</div>
                  {e.excerpt && (
                    <div className="bx-muted" style={{ fontSize: 12, marginTop: 6, fontStyle: 'italic' }}>&ldquo;{e.excerpt}&rdquo;</div>
                  )}
                </td>
                <td><SourceBadge kind={e.kind} /></td>
                <td className="bx-mono" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{formatDate(e.published_at)}</td>
                <td style={{ fontSize: 13 }}>{e.note ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="bx-muted" style={{ fontSize: 11, marginTop: 10, fontFamily: 'var(--bl-font-mono)' }}>
        Verified {formatDate(evidence[0]?.verified_at ?? null)}. Every source above was independently opened and confirmed to resolve before this opportunity was published.
      </p>
    </div>
  )
}
