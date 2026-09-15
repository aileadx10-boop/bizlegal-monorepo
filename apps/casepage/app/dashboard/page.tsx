import { readPages } from '@/lib/store'
import PagesClient from '@/components/pages-client'

export default async function DashboardPage() {
  const pages = await readPages()
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 720, margin: '3rem auto', padding: '0 1rem' }}>
      <h1>CasePage — Dashboard</h1>
      <p>Status pages for law firms. Decision support — not legal advice. No outcome guarantees.</p>
      <PagesClient pages={pages} />
    </main>
  )
}
