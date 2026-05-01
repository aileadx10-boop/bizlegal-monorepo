// scripts/lead-report.ts
// Daily lead intelligence report — reads Supabase leads table and reports stats
// Optionally sends summary to Slack webhook

import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

interface Lead {
  id: string
  email: string
  source: string
  page: string
  product: string | null
  created_at: string
}

async function main() {
  console.log('\n📊 BizLegal AI — Lead Intelligence Report')
  console.log(`   Date: ${new Date().toUTCString()}\n`)

  // Fetch leads from last 24h
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const { data: recentLeads, error: recentErr } = await sb
    .from('leads')
    .select('*')
    .gte('created_at', since)
    .order('created_at', { ascending: false })

  if (recentErr) {
    console.error('❌ Failed to fetch recent leads:', recentErr.message)
    process.exit(1)
  }

  // Fetch all-time total
  const { count: totalCount } = await sb
    .from('leads')
    .select('*', { count: 'exact', head: true })

  const leads: Lead[] = recentLeads ?? []

  // Group by source
  const bySource = leads.reduce<Record<string, number>>((acc, l) => {
    acc[l.source ?? 'unknown'] = (acc[l.source ?? 'unknown'] ?? 0) + 1
    return acc
  }, {})

  // Group by product
  const byProduct = leads.reduce<Record<string, number>>((acc, l) => {
    const key = l.product ?? 'unspecified'
    acc[key] = (acc[key] ?? 0) + 1
    return acc
  }, {})

  console.log(`─────────────────────────────────────────`)
  console.log(`📥 New leads (last 24h):  ${leads.length}`)
  console.log(`📦 Total leads (all-time): ${totalCount ?? 'N/A'}`)
  console.log(`─────────────────────────────────────────`)

  if (leads.length > 0) {
    console.log('\nBy source:')
    Object.entries(bySource).sort((a, b) => b[1] - a[1]).forEach(([src, cnt]) => {
      console.log(`  ${src.padEnd(25)} ${cnt}`)
    })

    console.log('\nBy product:')
    Object.entries(byProduct).sort((a, b) => b[1] - a[1]).forEach(([prod, cnt]) => {
      console.log(`  ${prod.padEnd(25)} ${cnt}`)
    })

    console.log('\nRecent emails (last 10):')
    leads.slice(0, 10).forEach(l => {
      const time = new Date(l.created_at).toLocaleTimeString('en-US', { hour12: false, timeZone: 'UTC' })
      console.log(`  ${time} UTC  ${l.source.padEnd(20)} ${l.email}`)
    })
  } else {
    console.log('\n  No new leads in the last 24 hours.')
  }

  // Send to Slack if webhook configured
  if (process.env.SLACK_WEBHOOK_URL && leads.length > 0) {
    const message = {
      text: `*BizLegal AI — Daily Lead Report* 📊\n\n` +
        `• New leads (24h): *${leads.length}*\n` +
        `• Total leads: *${totalCount ?? 'N/A'}*\n` +
        `• Top source: *${Object.entries(bySource).sort((a,b) => b[1]-a[1])[0]?.[0] ?? 'N/A'}*\n\n` +
        `_Report generated: ${new Date().toUTCString()}_`,
    }

    try {
      const resp = await fetch(process.env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
      })
      if (resp.ok) {
        console.log('\n✓ Slack notification sent')
      } else {
        console.warn('\n⚠ Slack notification failed:', resp.statusText)
      }
    } catch (err) {
      console.warn('\n⚠ Slack error:', err)
    }
  }

  console.log('\n─────────────────────────────────────────')
  console.log('✅ Report complete\n')
}

main().catch(err => {
  console.error('Fatal:', err)
  process.exit(1)
})
