/**
 * Channel adapters for social syndication. Each adapter implements the
 * same shape: given a body + meta, POST to the channel API and return
 * the public URL of the posted item.
 *
 * Adapters are STUBS when API tokens are absent — they return
 * { ok: false, error: '<channel>_TOKEN not configured' } so the queue
 * drain loop logs the gap without crashing. The Telegram-approval gate
 * pipeline still works: drafts land in social_drafts table and Moses
 * can copy-paste them manually until tokens arrive.
 */

export interface PostResult {
  readonly ok: boolean
  readonly posted_url?: string
  readonly error?: string
}

export type ChannelMeta = Record<string, unknown>

export async function postToLinkedIn(body: string, _meta: ChannelMeta): Promise<PostResult> {
  const token = process.env.LINKEDIN_ACCESS_TOKEN
  const author = process.env.LINKEDIN_AUTHOR_URN // e.g. "urn:li:person:abc123"
  if (!token || !author) return { ok: false, error: 'LINKEDIN_ACCESS_TOKEN / LINKEDIN_AUTHOR_URN not configured' }
  try {
    const res = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify({
        author,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: { text: body },
            shareMediaCategory: 'NONE',
          },
        },
        visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
      }),
    })
    if (!res.ok) return { ok: false, error: `linkedin ${res.status}: ${(await res.text()).slice(0, 200)}` }
    const data = (await res.json()) as { id?: string }
    const postedUrl = data.id ? `https://www.linkedin.com/feed/update/${encodeURIComponent(data.id)}/` : undefined
    return { ok: true, posted_url: postedUrl }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'linkedin: unknown' }
  }
}

export async function postToX(body: string, _meta: ChannelMeta): Promise<PostResult> {
  const token = process.env.X_BEARER_TOKEN
  if (!token) return { ok: false, error: 'X_BEARER_TOKEN not configured' }
  try {
    const res = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: body.slice(0, 280) }),
    })
    if (!res.ok) return { ok: false, error: `x ${res.status}: ${(await res.text()).slice(0, 200)}` }
    const data = (await res.json()) as { data?: { id: string } }
    const postedUrl = data.data?.id ? `https://x.com/i/web/status/${data.data.id}` : undefined
    return { ok: true, posted_url: postedUrl }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'x: unknown' }
  }
}

export async function postToReddit(body: string, meta: ChannelMeta): Promise<PostResult> {
  const token = process.env.REDDIT_ACCESS_TOKEN
  const subreddit = String(meta.subreddit ?? '').replace(/^r\//, '')
  if (!token || !subreddit) return { ok: false, error: 'REDDIT_ACCESS_TOKEN or subreddit missing' }
  try {
    const form = new URLSearchParams({
      sr: subreddit,
      kind: 'self',
      title: String(meta.title ?? '').slice(0, 300),
      text: body,
      api_type: 'json',
    })
    const res = await fetch('https://oauth.reddit.com/api/submit', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'bizlegal-ai/1.0',
      },
      body: form.toString(),
    })
    if (!res.ok) return { ok: false, error: `reddit ${res.status}: ${(await res.text()).slice(0, 200)}` }
    const data = (await res.json()) as { json?: { data?: { url?: string } } }
    return { ok: true, posted_url: data.json?.data?.url }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'reddit: unknown' }
  }
}

export async function postToBuffer(body: string, meta: ChannelMeta): Promise<PostResult> {
  const token = process.env.BUFFER_ACCESS_TOKEN
  const profileIds = String(meta.profile_ids ?? '').split(',').filter(Boolean)
  if (!token || profileIds.length === 0) return { ok: false, error: 'BUFFER_ACCESS_TOKEN / profile_ids missing' }
  try {
    const form = new URLSearchParams({ access_token: token, text: body })
    for (const id of profileIds) form.append('profile_ids[]', id)
    const res = await fetch('https://api.bufferapp.com/1/updates/create.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    })
    if (!res.ok) return { ok: false, error: `buffer ${res.status}: ${(await res.text()).slice(0, 200)}` }
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'buffer: unknown' }
  }
}

export const ADAPTERS: Record<'linkedin' | 'x' | 'reddit' | 'buffer', (body: string, meta: ChannelMeta) => Promise<PostResult>> = {
  linkedin: postToLinkedIn,
  x: postToX,
  reddit: postToReddit,
  buffer: postToBuffer,
}
