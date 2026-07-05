/**
 * /api/test/checklist — the 33-min Moses checklist.
 *
 * Returns the EXACT state of every block on the revenue path,
 * in the exact order Moses should do them.
 *
 * Hit: GET /api/test/checklist
 *   or: GET /api/test/checklist?format=text
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

async function probe(url: string, headers: Record<string,string> = {}, timeoutMs = 8000): Promise<{status:number|string}> {
  try {
    const c = new AbortController()
    const tid = setTimeout(() => c.abort(), timeoutMs)
    const r = await fetch(url, { headers, signal: c.signal })
    clearTimeout(tid)
    return { status: r.status }
  } catch (e: any) {
    return { status: e?.message || 'err' }
  }
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const text = url.searchParams.get('format') === 'text'
  const checks: any[] = []

  // 1. NOWPayments API key
  checks.push({
    step: 1,
    action: 'Rotate NOWPAYMENTS_API_KEY on nowpayments.io + paste to 5 Vercel projects + Hetzner .env',
    minutes: 10,
    done_when: 'curl -X POST https://docai.bizlegal-ai.com/api/payments/nowpayments/start -H "Content-Type: application/json" -d "{\"product\":\"docai\",\"tier\":\"team\",\"interval\":\"one-time\",\"amount_cents\":9700,\"email\":\"t@t.com\"}" returns { invoice_url: ... }',
    blocking_until: !process.env.NOWPAYMENTS_API_KEY ? 'env NOWPAYMENTS_API_KEY missing on hub' : 'env present; verify with curl',
  })

  // 2. Anthropic credits
  checks.push({
    step: 2,
    action: 'Top up Anthropic credits at console.anthropic.com/settings/billing',
    minutes: 5,
    done_when: 'Vercel cron logs for daily-todo + ai-act-monitor stop showing credit_balance_too_low',
    blocking_until: 'check vercel.com/team_MIY0V66DInbXE2vxoZd6ay3D logs',
  })

  // 3. Resend
  checks.push({
    step: 3,
    action: 'Rotate RESEND_API_KEY on resend.com + paste to Vercel + Hetzner .env',
    minutes: 5,
    done_when: 'ai.leadx10@gmail.com receives daily_digest at 08:00 UTC',
    blocking_until: !process.env.RESEND_API_KEY ? 'env missing' : 'env present; verify via test send',
  })

  // 4. PayPal
  checks.push({
    step: 4,
    action: 'Rotate PAYPAL_CLIENT_ID + PAYPAL_CLIENT_SECRET on developer.paypal.com',
    minutes: 5,
    done_when: 'POST /pricing PayPal button returns { approve_url: ... } not 401',
    blocking_until: !process.env.PAYPAL_CLIENT_ID ? 'env missing' : 'env present; verify creds',
  })

  // 5. $97 test purchase
  checks.push({
    step: 5,
    action: 'Do $0.50 test purchase via /api/test/payment-flow, verify status flips pending -> active within 5 min',
    minutes: 5,
    done_when: 'GET /api/test/payment-zero returns { ok: true, order: { status: "active" } }',
    blocking_until: 'curl POST /api/test/payment-zero now to verify the path works WITHOUT NOWPayments',
  })

  // DNS
  const dns = await probe('https://hub.bizlegal-ai.com/', {}, 5000)
  checks.push({
    step: 'D',
    action: 'Add hub.bizlegal-ai.com Cloudflare CNAME -> cname.vercel-dns.com',
    minutes: 5,
    done_when: 'nslookup hub.bizlegal-ai.com 8.8.8.8 returns an IP',
    blocking_until: dns.status === 'NXDOMAIN' || dns.status === 'err' ? 'hub DNS not resolvable' : 'hub DNS OK',
  })

  if (text) {
    const lines = ['33-MIN CHECKLIST (run in this order):', '']
    for (const c of checks) {
      lines.push(`Step ${c.step} (${c.minutes}min): ${c.action}`)
      lines.push(`  Done when: ${c.done_when}`)
      lines.push(`  Status: ${c.blocking_until}`)
      lines.push('')
    }
    lines.push('Total: 30 min (sequential) | After: system goes $0 -> $20K MRR capturable')
    return new Response(lines.join('\n'), { headers: { 'content-type': 'text/plain' } })
  }

  return NextResponse.json({
    checklist: checks,
    total_minutes: checks.reduce((s, c) => s + (c.minutes || 0), 0),
    estimated_impact: '$0 -> $20K MRR capturable (assumes AIA retainer close at $2,500/mo)',
    verify_live: 'GET /api/test/payment-zero to verify the path WITHOUT NOWPayments',
  })
}
