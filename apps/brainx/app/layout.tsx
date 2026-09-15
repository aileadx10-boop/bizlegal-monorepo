import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'BrainX — BizLegal Intelligence OS',
  description: 'Evidence-first opportunity intelligence for legal & compliance firms.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
