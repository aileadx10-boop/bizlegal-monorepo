import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'LeaseParse — Commercial Lease Abstracting & Critical-Date Monitoring',
  description:
    'Upload a commercial lease PDF. Get a structured abstract — critical dates, financial terms, risk-flag clauses — plus automated deadline alerts.',
}

const DISCLAIMER =
  'LeaseParse is an AI-powered document analysis tool. It does not render legal advice, recommend action, or form an attorney-client relationship. Consult qualified counsel before exercising lease rights.'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
          background: '#0d1117',
          color: '#e6edf3',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <main style={{ flex: 1 }}>{children}</main>
        <footer
          style={{
            borderTop: '1px solid #21262d',
            padding: '24px 20px',
            fontSize: 13,
            lineHeight: 1.6,
            color: '#8b949e',
            maxWidth: 960,
            margin: '0 auto',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          {DISCLAIMER}
        </footer>
      </body>
    </html>
  )
}
