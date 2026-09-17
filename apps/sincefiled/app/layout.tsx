import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  metadataBase: new URL('https://sincefiled.bizlegal-ai.com'),
  title: {
    default: 'SinceFiled — Compliance Rhythm Tracker',
    template: '%s | SinceFiled',
  },
  description: 'Track days since recurring law-firm obligations and review estimated next dates.',
  alternates: { canonical: '/' },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, color: '#172033', background: '#f7f8fb' }}>
        <header style={{ padding: '1rem', borderBottom: '1px solid #d9deea', background: '#fff' }}>
          <nav aria-label="Primary" style={{ display: 'flex', gap: '1rem', maxWidth: 960, margin: '0 auto' }}>
            <a href="/">SinceFiled</a>
            <a href="/dashboard">Dashboard</a>
            <a href="/pricing">Pricing</a>
            <a href="/login">Sign in</a>
          </nav>
        </header>
        {children}
      </body>
    </html>
  )
}
