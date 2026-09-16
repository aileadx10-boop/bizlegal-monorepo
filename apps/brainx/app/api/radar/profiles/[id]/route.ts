import { NextResponse } from 'next/server'
import { getSubscriber } from '@/lib/access'
import { sql } from '@/lib/neon'

export const dynamic = 'force-dynamic'

export async function DELETE(_req: Request, { params }: { params: { id: string } }): Promise<NextResponse> {
  const subscriber = await getSubscriber()
  if (!subscriber) return NextResponse.json({ ok: false, error: 'not_authenticated' }, { status: 401 })
  if (!/^[0-9a-f-]{36}$/i.test(params.id)) return NextResponse.json({ ok: false, error: 'invalid_id' }, { status: 400 })

  await sql()`delete from radar_profiles where id = ${params.id}::uuid and subscriber_id = ${subscriber.id}::uuid`
  return NextResponse.json({ ok: true })
}
