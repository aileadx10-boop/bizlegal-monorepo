/**
 * Social syndication orchestrator.
 *
 * Given a curator-published article (title + URL + summary), generates
 * 4 channel-tailored drafts using Haiku 4.5 and persists them as
 * pending_approval rows in social_drafts. The Telegram bot then serves
 * Moses a daily digest; he approves → social-queue cron posts them.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { runEaTask } from '@/lib/agents/ea-runner'

export type SocialChannel = 'linkedin' | 'x' | 'reddit' | 'buffer'

interface DraftArgs {
  readonly source_url: string
  readonly source_title: string
  readonly source_summary: string
}

let _client: SupabaseClient | null = null

function getClient(): SupabaseClient | null {
  if (_client) return _client
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  _client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  return _client
}

const CHANNEL_PROMPTS: Record<SocialChannel, string> = {
  linkedin: `Write a LinkedIn post (300-600 chars) about the article. Voice: professional but pointed. Lead with the regulatory insight, not the article title. End with the article URL. No emojis. No hashtag salad — 1-2 hashtags max.`,
  x: `Write a 5-tweet thread about the article. Tweet 1 hooks (≤240 chars). Tweets 2-4 give 3 specific takeaways with numbers/dates. Tweet 5 has the article URL + call to action. Separate tweets with "\\n\\n---\\n\\n". Punchy voice, no fluff.`,
  reddit: `Write a Reddit self-post body (400-800 chars). Lead with the buyer's pain (e.g. "Anyone else trying to figure out the new BOI rules?"). Share a concrete observation from the article — no link drop until the end. Mention the URL once at the bottom labeled "More context:". Voice: peer-to-peer, no marketing tone.`,
  buffer: `Write a short multi-platform caption (200-280 chars) suitable for Pinterest/Instagram. Includes the article topic in plain language and one CTA. End with the article URL.`,
}

const CHANNEL_DEFAULT_META: Record<SocialChannel, Record<string, unknown>> = {
  linkedin: {},
  x: {},
  reddit: { subreddit: 'r/compliance', title: '' }, // Moses overrides via approve UI
  buffer: { profile_ids: process.env.BUFFER_DEFAULT_PROFILE_IDS ?? '' },
}

async function generateDraft(channel: SocialChannel, args: DraftArgs): Promise<string | null> {
  const system = `You are a B2B compliance brand voice for BizLegal AI. ${CHANNEL_PROMPTS[channel]} Never claim BizLegal provides legal advice — frame as decision-support tooling.`
  const userMessage = `Article title: ${args.source_title}\nURL: ${args.source_url}\nSummary: ${args.source_summary}\n\nWrite the ${channel} draft now.`
  const result = await runEaTask({
    task: `social-draft-${channel}`,
    model: 'haiku',
    systemPrompt: system,
    userMessage,
    maxTokens: 600,
  })
  if (!result.ok) return null
  return result.text.trim()
}

/** Random 32-char approval token for Telegram one-click approve. */
function genToken(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  let hex = ''
  for (let i = 0; i < bytes.length; i++) hex += (bytes[i] ?? 0).toString(16).padStart(2, '0')
  return hex
}

export interface DraftCreationSummary {
  readonly channel: SocialChannel
  readonly id: number | null
  readonly ok: boolean
  readonly error?: string
}

export async function syndicateArticle(args: DraftArgs): Promise<ReadonlyArray<DraftCreationSummary>> {
  const supabase = getClient()
  if (!supabase) return []
  const channels: ReadonlyArray<SocialChannel> = ['linkedin', 'x', 'reddit', 'buffer']
  const results: DraftCreationSummary[] = []
  for (const channel of channels) {
    const body = await generateDraft(channel, args)
    if (!body) {
      results.push({ channel, id: null, ok: false, error: 'draft generation failed' })
      continue
    }
    const meta = { ...CHANNEL_DEFAULT_META[channel], title: args.source_title }
    const { data, error } = await supabase
      .from('social_drafts')
      .insert({
        channel,
        status: 'pending_approval',
        source_url: args.source_url,
        source_title: args.source_title,
        body,
        channel_meta: meta,
        approval_token: genToken(),
      })
      .select('id')
      .single()
    results.push({
      channel,
      id: data?.id ?? null,
      ok: !error,
      error: error?.message,
    })
  }
  return results
}
