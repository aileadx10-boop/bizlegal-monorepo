import type { Metadata } from 'next'
import { DocsClient } from './DocsClient'

export const metadata: Metadata = {
  title: 'API Docs | BizLegal AI',
  description:
    'BizLegal AI Hub API reference — all available endpoints, authentication methods, and request formats.',
  robots: { index: false, follow: false, nocache: true },
}

export default function DocsPage() {
  return <DocsClient />
}
