export default function SampleBanner({ verifiedAt }: { verifiedAt: string }): JSX.Element {
  const date = new Date(verifiedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  return (
    <div className="bx-chip bx-chip--vertical" style={{ display: 'inline-flex' }}>
      Sample radar — illustrative selection, evidence verified {date}
    </div>
  )
}
