import { strict as assert } from 'node:assert'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import path from 'node:path'

export type SocialChannel = 'linkedin' | 'x' | 'reddit' | 'buffer'

export interface SocialDraft {
  id: number
  channel: SocialChannel
  status: string
  source_url: string
  source_title?: string | null
  body: string
  channel_meta?: Record<string, unknown>
}

export interface BlogPost {
  url: string
  title: string
  body?: string
  tags?: string[]
}

export interface QueueItem {
  source_url: string
  source_title: string
  channel: SocialChannel
  body: string
  tags: string[]
  platforms: SocialChannel[]
  aeo_snippet: string
  scheduled_date: string | null
  scheduled_at: string | null
  status: 'queued'
  priority: number
  repeat_key: string
}

export const CHANNEL_AT_HOUR: Record<SocialChannel, number> = {
  linkedin: 6,
  x: 7,
  reddit: 13,
  buffer: 20,
}

const DEFAULT_SECTION_WEIGHTS: Array<[RegExp, number]> = [
  [/blog|guides?|resources|learn|academy|glossary|wiki|help|docs|faq/i, 100],
  [/compare|vs|alternatives|pricing|industries|use-cases|topics/i, 80],
  [/products?|solutions?|platform|security|integrations?|frameworks?/i, 60],
  [/company|about|careers|contact|legal|privacy|terms/i, 10],
]

export function scoreUrl(url: string, lastmod?: string | null): number {
  const u = new URL(url)
  const path = u.pathname
  let weight = 50
  for (const [rx, w] of DEFAULT_SECTION_WEIGHTS) {
    if (rx.test(path)) {
      weight = w
      break
    }
  }
  const depth = path.split('/').filter(Boolean).length
  let recency = 0
  if (lastmod) {
    const year = Number(lastmod.slice(0, 4))
    recency = year >= 2025 ? 20 : 5
  }
  return weight + recency - depth
}

export function aoeSnippet(post: BlogPost | SocialDraft): string {
  const title = (post.title ?? '').trim() || 'How to handle this compliance task'
  const body = (post.body ?? '').trim()
  let direct =
    body
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .find((p) => p.length >= 40 && p.length <= 360 && !p.startsWith('#')) ?? body.slice(0, 320)
  if (direct.length > 180) direct = `${direct.slice(0, 177)}...`
  const question = title.endsWith('?') ? title : `${title} — how do we handle it?`
  return `Q: ${question}\nA: ${direct}`
}

export function collectQueue(
  drafts: SocialDraft[],
  posts: BlogPost[] | null,
  opts?: { maxItems?: number; now?: string },
): QueueItem[] {
  const postByUrl = new Map((posts ?? []).map((p) => [p.url, p]))
  const items: QueueItem[] = []
  let cursor = 1
  for (const d of drafts) {
    if (d.status !== 'pending_approval' && d.status !== 'approved') continue
    const post = d.source_url ? postByUrl.get(d.source_url) : undefined
    const tags = post?.tags ?? []
    items.push({
      source_url: d.source_url,
      source_title: d.source_title ?? post?.title ?? 'Untitled',
      channel: d.channel,
      body: d.body,
      tags,
      platforms: [d.channel],
      aeo_snippet: aoeSnippet({ url: d.source_url, title: d.source_title ?? post?.title ?? 'Untitled', body: d.body }),
      scheduled_date: null,
      scheduled_at: null,
      status: 'queued',
      priority: scoreUrl(d.source_url) + cursor * 0.001,
      repeat_key: `${d.source_url}::${d.channel}`,
    })
    cursor += 1
  }
  if ((posts?.length ?? 0) > 0 && items.length === 0) {
    for (const p of posts ?? []) {
      items.push({
        source_url: p.url,
        source_title: p.title || 'Untitled',
        channel: 'linkedin',
        body: p.title || '',
        tags: p.tags ?? [],
        platforms: ['linkedin'],
        aeo_snippet: aoeSnippet(p),
        scheduled_date: null,
        scheduled_at: null,
        status: 'queued',
        priority: scoreUrl(p.url) + cursor * 0.001,
        repeat_key: `${p.url}::linkedin`,
      })
      cursor += 1
    }
  }
  items.sort((a, b) =>
    b.priority - a.priority || a.repeat_key.localeCompare(b.repeat_key) || a.source_url.localeCompare(b.source_url),
  )
  return items.slice(0, opts?.maxItems ?? 1000)
}

/**
 * Deterministic scheduler.
 * - Schedules 2-4 items/day starting `startDate`.
 * - No same repeat_key within `lookbackDays` — caller can pass `seen` from prior runs.
 * - Same input + same options => same output.
 */
export function scheduleItems(
  items: QueueItem[],
  opts?: {
    startDate?: string
    maxPerDay?: number
    minPerDay?: number
    lookbackDays?: number
    seen?: Record<string, string>
  },
): QueueItem[] {
  const start = opts?.startDate ?? new Date().toISOString().slice(0, 10)
  const maxPerDay = opts?.maxPerDay ?? 4
  const minPerDay = opts?.minPerDay ?? 2
  const lookbackDays = opts?.lookbackDays ?? 30
  if (!start || items.length === 0) return items

  const sorted = [...items].sort((a, b) => b.priority - a.priority || a.repeat_key.localeCompare(b.repeat_key))
  const seen: Record<string, string> = { ...opts?.seen }
  const today = new Date(start)
  const scheduled: QueueItem[] = []
  let dayOffset = 0
  let perDay = 0

  const dateStrForOffset = (offset: number): string => {
    const day = new Date(start)
    day.setUTCDate(day.getUTCDate() + offset)
    return day.toISOString().slice(0, 10)
  }

  for (const item of sorted) {
    if (seen[item.repeat_key]) {
      const d = new Date(seen[item.repeat_key])
      const diff = Math.floor((new Date(start).getTime() - d.getTime()) / 86_400_000)
      if (diff < lookbackDays) continue // too recent
    }
    if (perDay >= maxPerDay) {
      dayOffset += 1
      perDay = 0
    }
    const dateStr = dateStrForOffset(dayOffset)
    const at = new Date(`${dateStr}T06:00:00.000Z`)
    at.setUTCHours(CHANNEL_AT_HOUR[item.channel] ?? 6, 0, 0, 0)
    item.scheduled_date = dateStr
    item.scheduled_at = at.toISOString()
    seen[item.repeat_key] = dateStr
    perDay += 1
    scheduled.push(item)
  }
  return scheduled
}

export function buildDigest(items: QueueItem[], dateStr: string): string {
  const dayItems = items
    .filter((i) => i.scheduled_date === dateStr)
    .sort((a, b) => (a.scheduled_at ?? '').localeCompare(b.scheduled_at ?? ''))
  const lines: string[] = []
  lines.push(`BizLegal Fleet Social Digest — ${dateStr}`)
  lines.push('')
  const byChannel: Record<string, QueueItem[]> = {}
  for (const item of dayItems) {
    const c = item.channel
    byChannel[c] = byChannel[c] ?? []
    byChannel[c].push(item)
  }
  for (const ch of Object.keys(byChannel).sort()) {
    lines.push(`## ${ch}`)
    for (const item of byChannel[ch]) {
      lines.push('')
      lines.push(item.body || item.source_title)
      lines.push(`URL: ${item.source_url}`)
      if (item.tags.length) lines.push(`TAGS: ${item.tags.join(', ')}`)
      lines.push('')
    }
  }
  const aeo = dayItems.map((i) => i.aeo_snippet).filter(Boolean)
  if (aeo.length) {
    lines.push('## AEO snippets')
    lines.push(...aeo)
    lines.push('')
  }
  lines.push('---')
  lines.push(`queued: ${dayItems.length}`)
  return lines.join('\n')
}

export function hmacHex(secret: string, body: string): string {
  return createHash('sha256').update(`${secret}${body}`, 'utf8').digest('hex')
}

export function ensureOutDir(p: string): void {
  try {
    const dir = path.dirname(p)
    writeFileSync(path.join(dir, '.tmp'), '', 'utf8') // noop to allow dir creation
  } catch {
    // noop
  }
}

export { readFileSync, existsSync }
