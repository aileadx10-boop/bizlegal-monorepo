export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { sql, dbHealth } from '@/lib/neon'

interface Extra {
  last_run_at: string | null
  subscribers_active: number
}

async function extra(): Promise<Extra> {
  try {
    const rows = (await sql()`
      select
        (select finished_at from research_runs where status = 'completed' order by finished_at desc limit 1) as last_run_at,
        (select count(*) from subscribers where active_until > now() and status <> 'revoked') as subscribers_active
    `) as unknown as Array<{ last_run_at: string | null; subscribers_active: string }>
    const r = rows?.[0]
    return { last_run_at: r?.last_run_at ?? null, subscribers_active: Number(r?.subscribers_active) || 0 }
  } catch {
    return { last_run_at: null, subscribers_active: 0 }
  }
}

export async function GET() {
  const db = await dbHealth()
  const stats = db.ok ? await extra() : { last_run_at: null, subscribers_active: 0 }
  return NextResponse.json(
    {
      ok: db.ok,
      service: 'brainx',
      db: db.db || null,
      error: db.error || null,
      last_run_at: stats.last_run_at,
      subscribers_active: stats.subscribers_active,
    },
    { status: db.ok ? 200 : 502 },
  )
}
