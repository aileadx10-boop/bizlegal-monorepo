// /api/agents/enrich-pages — content enricher (Vercel cron).
//
// Triggered by Vercel cron weekly. Walks apps/*/app/**/page.tsx (which exist
// inside the Vercel build context), AI-enriches metadata via Anthropic,
// persists to Supabase page_enrichments table.
//
// Schedule: 0 4 * * 0  (weekly Sunday 04:00 UTC)
// Auth: process.env.CRON_SECRET in Authorization: Bearer <secret>
import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

const APPS = ['hub', 'brai', 'docai', 'lexaudit', 'leadforge', 'tracr', 'forge']
const ROOT = process.cwd()
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY ?? process.env.ANTHROPIC_KEY
const CS = 'CRON_' + 'SECRET'  // chr() workaround for env-var-name mangle

const SYSTEM = `You are a B2B SEO + AEO copywriter for BizLegal AI.
You will receive the visible text of a marketing page. Output STRICT JSON:
{
  "title": "<60 char SEO title>",
  "description": "<160 char meta description>",
  "keywords": ["kw1", "kw2", "kw3", "kw4", "kw5"],
  "og_title": "<40 char Open Graph title>",
  "og_description": "<200 char OG description>",
  "h1": "<optimal H1 for this page>",
  "cta": "<one action the visitor should take>",
  "aeo_question": "<a question a buyer would ask that this page answers>"
}
Voice: specific, no fluff, numbers where possible. No marketing-speak.
No emojis. No exclamation marks.`

interface Enrichment {
  title: string
  description: string
  keywords: string[]
  og_title: string
  og_description: string
  h1: string
  cta: string
  aeo_question: string
}

async function listPages(): Promise<Array<{ app: string; path: string }>> {
  const out: Array<{ app: string; path: string }> = []
  for (const app of APPS) {
    for (const appRoot of [`apps/${app}/app`, `apps/${app}/web/app`]) {
      const abs = path.join(ROOT, appRoot)
      try {
        const files = (await fs.readdir(abs, { recursive: true })) as unknown as string[]
        for (const f of files) {
          if (f.endsWith('page.tsx') && !f.includes('/api/')) {
            out.push({ app, path: `${appRoot}/${f}`.replace(/\\/g, '/') })
          }
        }
      } catch { /* app dir not present, skip */ }
    }
  }
  return out
}

async function extractText(filePath: string): Promise<string> {
  try {
    const c = await fs.readFile(filePath, 'utf-8')
    const strings = (c.match(/["']([^"']{20,200})["']/g) ?? []).slice(0, 80)
    const headers = (c.match(/<h[1-3][^>]*>([^<]+)<\/h[1-3]>/g) ?? []).slice(0, 20)
    return (strings.join(' ') + ' ' + headers.join(' ')).slice(0, 6000)
  } catch { return '' }
}

async function enrich(text: string): Promise<Enrichment | null> {
  if (!ANTHROPIC_KEY || text.length < 100) return null
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 800,
        system: SYSTEM,
        messages: [{ role: 'user', content: text.slice(0, 5500) }],
      }),
    })
    if (!r.ok) return null
    const d = await r.json()
    const txt = d?.content?.[0]?.text ?? ''
    const m = txt.match(/\{[\s\S]*\}/)
    return m ? JSON.parse(m[0]) : null
  } catch { return null }
}

export async function GET(req: NextRequest) {
  const CRON_SECRET = process.env[CS] ?? ''
  const auth = req.headers.get('authorization') ?? ''
  if (!CRON_SECRET || auth !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return NextResponse.json({ error: 'supabase env missing' }, { status: 500 })
  }
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
  const pages = await listPages()
  let enriched = 0
  let failed = 0
  let skipped = 0
  for (const p of pages) {
    const abs = path.join(ROOT, p.path)
    const text = await extractText(abs)
    if (text.length < 100) { skipped++; continue }
    const e = await enrich(text)
    if (!e) { failed++; continue }
    const { error } = await supabase
      .from('page_enrichments')
      .upsert(
        { app: p.app, path: p.path, enrichment: e, enriched_at: new Date().toISOString() },
        { onConflict: 'app,path' }
      )
    if (error) { failed++; continue }
    enriched++
  }
  return NextResponse.json({
    ok: true,
    pages_scanned: pages.length,
    enriched,
    failed,
    skipped,
    total: pages.length,
  })
}
