'use client'

/**
 * Print trigger for the report page. Exists as its own client component so
 * app/report/[id]/page.tsx can remain a server component — an RSC cannot pass
 * an onClick handler across the server/client boundary.
 */
export default function PrintButton({ label }: { label: string }) {
  return (
    <button
      onClick={() => window.print()}
      className="btn-ghost"
      style={{ width: '100%', justifyContent: 'center', fontSize: 13 }}
    >
      {label}
    </button>
  )
}
