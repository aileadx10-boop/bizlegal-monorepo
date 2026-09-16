function formatDateTime(iso: string | null): string {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'UTC', timeZoneName: 'short' })
  } catch {
    return ''
  }
}

/**
 * The single place the site tells the truth about cadence. BrainX runs a
 * WEEKLY, operator-run radar — never "continuous" or "24/7" (those words
 * are banned from ingest prose too, see lib/radar/ingest-schema.ts).
 */
export default function RunStamp({ finishedAt }: { finishedAt: string | null }): JSX.Element {
  if (!finishedAt) {
    return (
      <span className="bx-eyebrow">
        <span className="bx-mono">No run yet</span> · runs weekly
      </span>
    )
  }
  return (
    <span className="bx-eyebrow">
      Last radar run <span className="bx-mono" style={{ color: 'var(--bl-text-muted)' }}>{formatDateTime(finishedAt)}</span> · runs weekly
    </span>
  )
}
