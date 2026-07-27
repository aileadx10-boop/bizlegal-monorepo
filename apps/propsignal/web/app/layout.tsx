import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'PropSignal — Property Risk Intelligence from Public Data',
  description:
    'Automated property risk reports for US real-estate investors. Flood zones, environmental screening, and municipal open data organized into one deterministic risk score.',
}

const DISCLAIMER =
  'PropSignal aggregates public data for informational purposes only. Reports are not a substitute for physical inspection, appraisal, title opinion, or legal counsel, and do not form an attorney-client relationship.'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily:
            "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          background: '#0b1220',
          color: '#e7edf7',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ flex: 1 }}>{children}</div>
        <footer
          style={{
            borderTop: '1px solid #1e2a44',
            padding: '24px 20px',
            fontSize: 13,
            lineHeight: 1.6,
            color: '#8fa1c0',
            maxWidth: 960,
            margin: '0 auto',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          <p style={{ margin: 0 }}>{DISCLAIMER}</p>
          <p style={{ margin: '8px 0 0' }}>
            © {new Date().getFullYear()} BizLegal AI / DOR INNOVATIONS ·{' '}
            <a href="https://bizlegal-ai.com" style={{ color: '#8fa1c0' }}>
              bizlegal-ai.com
            </a>
          </p>
        </footer>
      </body>
    </html>
  )
}
