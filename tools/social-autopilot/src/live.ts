/**
 * O-027 live mode: read social_drafts rows from Supabase when env is set.
 * Falls back to local fixture when env missing so tests/local proof still run.
 */
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import type { SocialDraft, BlogPost } from './worker.ts'

// Read lazily: ES imports are hoisted, so module-level constants would be
// evaluated before cli.mjs has loaded the gitignored .env file — which is how
// a fully configured run still reported `source: fixture`.
const supabaseUrl = (): string | undefined => process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = (): string | undefined => process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY

export function hasLiveEnv(): boolean {
  return Boolean(supabaseUrl() && supabaseKey())
}

export async function readLiveDrafts(): Promise<SocialDraft[]> {
  if (!hasLiveEnv()) return []
  const res = await fetch(`${supabaseUrl()}/rest/v1/social_drafts?status=in.(pending_approval,approved)&select=id,channel,status,source_url,source_title,body,channel_meta&limit=500`, {
    headers: {
      apikey: supabaseKey()!,
      Authorization: `Bearer ${supabaseKey()!}`,
      'content-type': 'application/json',
    },
    cache: 'no-store',
  })
  if (!res.ok) return []
  const rows = (await res.json()) as Array<Record<string, unknown>>
  return rows.map((r) => ({
    id: Number(r.id),
    channel: (r.channel as SocialDraft['channel']) ?? 'linkedin',
    status: String(r.status ?? 'pending_approval'),
    source_url: String(r.source_url ?? ''),
    source_title: r.source_title ? String(r.source_title) : null,
    body: String(r.body ?? ''),
    channel_meta: (r.channel_meta as Record<string, unknown>) ?? {},
  }))
}

export function readFixtureDrafts(fixturePath: string): { drafts: SocialDraft[]; posts: BlogPost[] | null } {
  const abs = path.resolve(fixturePath)
  if (!existsSync(abs)) throw new Error(`fixture not found: ${abs}`)
  const data = JSON.parse(readFileSync(abs, 'utf8')) as { drafts?: SocialDraft[]; posts?: BlogPost[] }
  return { drafts: data.drafts ?? [], posts: data.posts ?? null }
}
