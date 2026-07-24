/**
 * Guide → social draft agent. Scans GUIDES for guides that don't yet
 * have a social_drafts row and syndicates a small batch each run via
 * the existing syndicateArticle() pipeline (same one Hetzner's
 * publisher calls through /api/content/syndicate) — reuses the
 * draft-generation + approval-token logic rather than duplicating it.
 *
 * Batched to avoid flooding Moses's Telegram approval queue: a handful
 * of guides per run, catching up on the backlog over several days
 * rather than dumping 66 guides × 4 channels at once.
 */
import { createClient } from '@supabase/supabase-js'
import { logEventAsync } from '@/lib/ops/log'
import { GUIDES } from '@/lib/guides'
import { syndicateArticle } from '@/lib/social/syndicate'

const BATCH_SIZE = 3
const SITE = 'https://bizlegal-ai.com'

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

export interface SocialPosterResult {
  readonly processed: number
  readonly draftsCreated: number
  readonly skipped: 'no_new_guides' | 'supabase_unavailable' | null
}

export async function runGuideSocialPoster(): Promise<SocialPosterResult> {
  const sb = getClient()
  if (!sb) return { processed: 0, draftsCreated: 0, skipped: 'supabase_unavailable' }

  const { data: existing } = await sb
    .from('social_drafts')
    .select('source_url')
    .not('source_url', 'is', null)

  const syndicated = new Set((existing ?? []).map((r: { source_url: string }) => r.source_url))
  const pending = GUIDES.filter((g) => !syndicated.has(`${SITE}${g.href}`)).slice(0, BATCH_SIZE)

  if (pending.length === 0) {
    return { processed: 0, draftsCreated: 0, skipped: 'no_new_guides' }
  }

  let draftsCreated = 0
  for (const guide of pending) {
    const results = await syndicateArticle({
      source_url: `${SITE}${guide.href}`,
      source_title: guide.title,
      source_summary: guide.description,
    })
    draftsCreated += results.filter((r) => r.ok).length
  }

  logEventAsync({
    type: 'social.draft',
    source: 'hub',
    ref_id: 'guide-social-poster',
    status: draftsCreated > 0 ? 'ok' : 'failed',
    metadata: { processed: pending.length, draftsCreated, guides: pending.map((g) => g.href) },
  })

  return { processed: pending.length, draftsCreated, skipped: null }
}
