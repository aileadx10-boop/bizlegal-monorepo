import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'

interface DealRoom {
  token: string
  lead_name: string
  lead_email: string
  company: string
  product: string
  score: number
  ai_summary: string
  status: 'active' | 'closed' | 'expired'
  created_at: string
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = (process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY)!
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

async function getDealRoom(token: string): Promise<DealRoom | null> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('deal_rooms')
    .select('*')
    .eq('token', token)
    .single()
  if (error || !data) return null
  return data as DealRoom
}

export async function generateMetadata({
  params,
}: {
  params: { token: string }
}): Promise<Metadata> {
  const room = await getDealRoom(params.token)
  if (!room) return { title: 'Deal Room | BizLegal AI' }
  return {
    title: `Deal Room — ${room.company || room.lead_name} | BizLegal AI`,
    description: `Private compliance AI proposal for ${room.company}. Score: ${room.score}/100.`,
    robots: { index: false, follow: false },
  }
}

const PRODUCT_LABELS: Record<string, string> = {
  'compliance-ai': 'Custom Compliance AI Build ($40K + $30K/yr)',
  'docai': 'DocAI Contract Scanner ($97/scan)',
  'lexaudit': 'LexAudit Compliance Monitor ($99/mo)',
  'compliance-snapshot': 'Compliance Snapshot ($9 one-time / $19/mo)',
}

export default async function DealRoomPage({
  params,
}: {
  params: { token: string }
}) {
  const room = await getDealRoom(params.token)

  if (!room || room.status === 'expired') {
    notFound()
  }

  const productLabel = PRODUCT_LABELS[room.product] ?? room.product
  const scoreColor =
    room.score >= 80 ? 'text-green-600' : room.score >= 50 ? 'text-amber-600' : 'text-red-600'

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
              Private Deal Room
            </p>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                room.status === 'active'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {room.status}
            </span>
          </div>
          <h1 className="mb-1 text-2xl font-bold text-gray-900">
            {room.company || room.lead_name}
          </h1>
          <p className="text-sm text-gray-500">
            {room.lead_name} · {room.lead_email}
          </p>
        </div>

        {/* Score + AI summary */}
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-gray-500">
            Qualification
          </h2>
          <div className="mb-4 flex items-baseline gap-2">
            <span className={`text-5xl font-bold ${scoreColor}`}>{room.score}</span>
            <span className="text-gray-400">/100 intent score</span>
          </div>
          <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-700">{room.ai_summary}</p>
        </div>

        {/* Proposed solution */}
        <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50 p-8 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-blue-600">
            Proposed Solution
          </h2>
          <p className="mb-2 font-semibold text-gray-900">{productLabel}</p>
          <p className="text-sm text-gray-600">
            Based on your message, we recommend the {productLabel.split(' (')[0]}. This is the
            fastest path to compliance evidence your enterprise buyers accept.
          </p>
        </div>

        {/* Next steps */}
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-gray-500">
            Next Steps
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                1
              </div>
              <div>
                <p className="font-medium text-gray-900">Book a 15-minute scoping call</p>
                <p className="text-sm text-gray-500">
                  We confirm scope, frameworks, and timeline. You get a fixed-price proposal within
                  24 hours.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                2
              </div>
              <div>
                <p className="font-medium text-gray-900">Review security packet</p>
                <p className="text-sm text-gray-500">
                  SIG Lite, MSA, DPA, and BCP are pre-built and ready for your CISO.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                3
              </div>
              <div>
                <p className="font-medium text-gray-900">Sign and go</p>
                <p className="text-sm text-gray-500">
                  6 weeks from build fee receipt to go-live. No hidden dependencies.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <a
              href={`mailto:intelligence@bizlegal-ai.com?subject=${encodeURIComponent(`Deal Room — ${room.company} — scoping call`)}&body=${encodeURIComponent(`Hi Moses, I'm ready to discuss the ${productLabel.split(' (')[0]} for ${room.company}.`)}`}
              className="inline-flex items-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-blue-700"
            >
              Email Moses to book the call
            </a>
            <p className="mt-3 text-xs text-gray-400">
              intelligence@bizlegal-ai.com · Typically responds within 4 hours
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
