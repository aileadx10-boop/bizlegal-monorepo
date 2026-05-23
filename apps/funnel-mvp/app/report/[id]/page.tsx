import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { ReportView } from './ReportView'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Your Contract Risk Report',
  robots: { index: false, follow: false, nocache: true },
}

interface PageProps {
  params: { id: string }
  searchParams: { paid?: string; cancelled?: string }
}

interface JobResponse {
  id: string
  user_email: string
  status: string
  doc_filename: string | null
  preview_text: string | null
  amount_cents: number
  currency: string
  paypal_order_id: string | null
  error_message: string | null
  full_report_key: string | null
  report_download_url: string | null
  created_at: string
  paid_at: string | null
}

async function fetchJob(id: string): Promise<JobResponse | null> {
  const hdrs = await headers()
  const host = hdrs.get('host') ?? 'funnel.bizlegal-ai.com'
  const proto = hdrs.get('x-forwarded-proto') ?? 'https'
  try {
    const res = await fetch(`${proto}://${host}/api/jobs/${id}`, { cache: 'no-store' })
    if (!res.ok) return null
    return (await res.json()) as JobResponse
  } catch {
    return null
  }
}

export default async function ReportPage({ params, searchParams }: PageProps) {
  if (!/^[0-9a-f-]{36}$/.test(params.id)) notFound()
  const job = await fetchJob(params.id)
  if (!job) notFound()

  return (
    <div className="container">
      <ReportView job={job} cameFromPayPal={searchParams.paid === '1'} wasCancelled={searchParams.cancelled === '1'} />
    </div>
  )
}
