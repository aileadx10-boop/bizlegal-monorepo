/**
 * LexAudit — Firecrawl scrape helper for the Compliance Monitor diff cron.
 *
 * Replaces the brittle "hash raw HTML" approach. Firecrawl returns
 * cleaned markdown of the rendered page so the hash captures
 * SEMANTIC content (titles, paragraphs, lists) rather than markup
 * noise (whitespace shuffles, ad slots, build hashes in script tags).
 *
 * If FIRECRAWL_API_KEY is unset, callers fall back to the original
 * raw-HTML hash so the cron keeps working on day one.
 */

const FIRECRAWL_BASE_URL = (process.env.FIRECRAWL_BASE_URL ?? 'https://api.firecrawl.dev').replace(/\/$/, '')
const FIRECRAWL_TIMEOUT_MS = 30_000

export interface FirecrawlScrapeResult {
  ok: true
  /** Cleaned markdown body (what we hash for diff). */
  markdown: string
  /** Optional raw HTML for fallback. */
  html?: string
  /** Page title from <h1> or <title>. */
  title?: string
}

export interface FirecrawlScrapeFailure {
  ok: false
  status?: number
  error: string
}

export type FirecrawlScrape = FirecrawlScrapeResult | FirecrawlScrapeFailure

export function isConfigured(): boolean {
  return Boolean(process.env.FIRECRAWL_API_KEY)
}

export async function scrapeMarkdown(url: string): Promise<FirecrawlScrape> {
  const apiKey = process.env.FIRECRAWL_API_KEY
  if (!apiKey) return { ok: false, error: 'firecrawl_unconfigured' }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FIRECRAWL_TIMEOUT_MS)
  try {
    const res = await fetch(`${FIRECRAWL_BASE_URL}/v1/scrape`, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        formats: ['markdown'],
        onlyMainContent: true,
      }),
    })
    clearTimeout(timer)
    if (!res.ok) {
      return { ok: false, status: res.status, error: `http_${res.status}` }
    }
    const body = (await res.json()) as {
      success?: boolean
      data?: { markdown?: string; html?: string; metadata?: { title?: string } }
    }
    const data = body.data
    if (!data || typeof data.markdown !== 'string' || data.markdown.length === 0) {
      return { ok: false, error: 'empty_markdown' }
    }
    return {
      ok: true,
      markdown: data.markdown,
      html: data.html,
      title: data.metadata?.title,
    }
  } catch (err) {
    clearTimeout(timer)
    return { ok: false, error: err instanceof Error ? err.name : String(err) }
  }
}

/**
 * Anthropic Sonnet semantic-diff enrichment. Given the previous and
 * new extracted markdown of a regulator source, returns a 1-3
 * sentence summary of what the regulator changed (e.g. "Article
 * 32(2)(c) added language on pseudonymisation"). Returns null when
 * ANTHROPIC_API_KEY is unset OR the call fails — caller falls back
 * to the generic "source content changed" alert.
 */
export async function summariseChange(args: {
  previous: string
  next: string
  framework_id: string
  source_name: string
}): Promise<string | null> {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return null

  const prompt = [
    'You are a senior compliance editor. Two markdown extracts of the same',
    'regulator source page were captured at different times. Identify the',
    'specific substantive change in 1-3 sentences. Cite exact section /',
    'article numbers when present. If the change is purely cosmetic',
    '(navigation, footer, whitespace), reply only "no substantive change".',
    'Never invent dates, fines, or article numbers not in the diff.',
    '',
    `Source: ${args.source_name} (${args.framework_id})`,
    '',
    '=== PREVIOUS EXTRACT ===',
    args.previous.slice(0, 8000),
    '=== NEW EXTRACT ===',
    args.next.slice(0, 8000),
    '=== END ===',
  ].join('\n')

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-6',
        max_tokens: 400,
        temperature: 0,
        messages: [{ role: 'user', content: prompt }],
      }),
    })
    if (!res.ok) return null
    const body = (await res.json()) as { content?: Array<{ type: string; text?: string }> }
    const text = (body.content ?? []).find((c) => c.type === 'text')?.text?.trim()
    if (!text) return null
    if (text.toLowerCase().includes('no substantive change')) return null
    return text
  } catch {
    return null
  }
}
