interface ReportPageProps {
  params: { id: string }
}

export default function ReportPage({ params }: ReportPageProps) {
  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '64px 20px' }}>
      <h1 style={{ fontSize: 28, margin: '0 0 16px' }}>Report {params.id}</h1>
      <p style={{ fontSize: 16, lineHeight: 1.6, color: '#b9c6dd' }}>
        The report generation pipeline ships in build phase 3 of the trio plan. This
        page will render the delivered risk score, grade, top risk drivers, and a link
        to the narrative PDF.
      </p>
      <p style={{ fontSize: 13.5, lineHeight: 1.7, color: '#8fa1c0', marginTop: 32 }}>
        PropSignal reports aggregate public data for informational purposes only and
        are not a substitute for physical inspection, appraisal, title opinion, or
        legal counsel.
      </p>
    </main>
  )
}
