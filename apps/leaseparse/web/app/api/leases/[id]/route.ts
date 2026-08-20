/**
 * GET /api/leases/[id]
 *
 * Return a single dd_leases row with the full extracted abstract
 * and recomputed upcoming alerts.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/db/client'
import { deriveCriticalDates } from '@/lib/extract/date-engine'
import type { LeaseAbstract } from '@/lib/extract/types'

export const dynamic = 'force-dynamic'
export const maxDuration = 15

interface RouteContext {
  params: { id: string }
}

export async function GET(
  _req: NextRequest,
  { params }: RouteContext
): Promise<NextResponse> {
  const { id } = params
  if (!id) return NextResponse.json({ error: 'id_required' }, { status: 400 })

  const db = getServiceClient()
  const { data, error } = await db
    .from('leaseparse_leases')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }

  // Derive live alerts if the lease has been parsed
  let upcoming_alerts: ReturnType<typeof deriveCriticalDates> = []
  if (data.extracted_json) {
    try {
      upcoming_alerts = deriveCriticalDates(data.extracted_json as LeaseAbstract)
    } catch {
      // Non-fatal — return empty alerts if abstract is malformed
    }
  }

  return NextResponse.json({ ok: true, lease: { ...data, upcoming_alerts } })
}
