import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'CloseFlow — Real Estate Closing Checklists & Deadline Tracking',
  description:
    'Jurisdiction-aware closing checklists, automated deadline reminders, and document tracking for real-estate transactions. Project-management software for closings — 100% async.',
}

const DISCLAIMER =
  'CloseFlow is project-management software. It does not prepare legal documents, render title opinions, provide escrow services, or form an attorney-client relationship.'

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
        <div style={{ flex: 1 }}>{children}</div>
        <footer
          style={{
            borderTop: '1px solid #21262d',
            padding: '24px 16px',
            fontSize: 13,
            lineHeight: 1.6,
            color: '#8b949e',
            maxWidth: 880,
            margin: '0 auto',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          <p style={{ margin: 0 }}>{DISCLAIMER}</p>
          <p style={{ margin: '8px 0 0' }}>
            © {new Date().getFullYear()} BizLegal AI · DOR INNOVATIONS ·{' '}
            <a href="https://bizlegal-ai.com" style={{ color: '#58a6ff' }}>
              bizlegal-ai.com
            </a>
          </p>
        </footer>
      </body>
    </html>
  )
}
