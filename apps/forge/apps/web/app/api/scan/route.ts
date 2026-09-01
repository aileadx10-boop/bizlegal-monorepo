import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { runModule, type VerticalType } from '@/lib/claude/index'
import { getRateLimiter, getIpFromRequest } from '@/lib/rate-limit'

const ScanSchema = z.object({
  url: z.string().url().optional(),
  email: z.string().email(),
  vertical: z.enum(['cipa', 'gpc', 'mhmda', 'gdpr', 'sms', 'tdpsa', 'boi', 'iso27001', 'gipa', 'edtech', 'surplus']),
  company_name: z.string().optional(),
  formation_date: z.string().optional(),
  state: z.string().optional(),
  entity_type: z.string().optional(),
  ein: z.string().optional(),
  boi_filed: z.string().optional(),
  boi_filing_date: z.string().optional(),
  ownership_changed: z.string().optional(),
  owner_count: z.string().optional(),
  sensitive_data: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const limiter = getRateLimiter('scan-api', 3, '1 m')
  if (limiter) {
    const ip = getIpFromRequest(req)
    const { success, limit, remaining, reset } = await limiter.limit(ip)
    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
          },
        }
      )
    }
  }

  try {
    const body = await req.json()
    const parsed = ScanSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { url, email, vertical, company_name } = parsed.data
    const supabase = createServerClient()

    // Create scan record
    const { data: scan, error: dbError } = await supabase
      .from('scans')
      .insert({
        url,
        email,
        vertical,
        company_name,
        status: 'scanning',
        payment_status: 'pending',
      })
      .select('id')
      .single()

    if (dbError || !scan) {
      console.error('DB error:', dbError)
      return NextResponse.json({ error: 'Failed to create scan record' }, { status: 500 })
    }

    // If Apify actor is configured, use it; otherwise run mock scan
    const apifyToken = process.env.APIFY_TOKEN
    const actorId = process.env[`APIFY_ACTOR_${vertical.toUpperCase()}`]

    let scanPayload: Record<string, unknown>

    if (apifyToken && actorId && url) {
      // Real Apify scan — trigger actor and poll
      scanPayload = await runApifyScan(url, vertical, apifyToken, actorId)
    } else {
      // Mock scan for development/demo
      scanPayload = buildMockPayload(url ?? 'https://example.com', vertical)
    }

    // Run Claude analysis
    const result = await runModule(vertical as VerticalType, scanPayload)

    if (!result.success) {
      await supabase.from('scans').update({ status: 'failed' }).eq('id', scan.id)
      return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
    }

    const d = result.data as Record<string, unknown>

    // Update scan with preview results (not the full report — that's behind paywall)
    await supabase
      .from('scans')
      .update({
        status: 'complete',
        violation: d.violation as boolean,
        confidence: d.confidence as number,
        risk_level: (d.risk_level as string) || 'low',
        findings: d.findings ?? [],
        exposure_min: d.exposure_min as number,
        exposure_max: d.exposure_max as number,
      })
      .eq('id', scan.id)

    // Return preview (truncated findings — full report behind paywall)
    const findings = (d.findings as string[]) ?? []
    return NextResponse.json({
      scan_id: scan.id,
      violation: d.violation,
      risk_level: d.risk_level,
      exposure_min: d.exposure_min,
      exposure_max: d.exposure_max,
      findings: findings.slice(0, 2), // preview only
      total_findings: findings.length,
    })
  } catch (err) {
    console.error('Scan API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function runApifyScan(
  url: string,
  vertical: string,
  token: string,
  actorId: string
): Promise<Record<string, unknown>> {
  const runRes = await fetch(
    `https://api.apify.com/v2/acts/${actorId}/runs?token=${token}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, vertical }),
    }
  )
  const run = await runRes.json()
  const runId = run.data?.id

  if (!runId) throw new Error('Failed to start Apify actor')

  // Poll for completion (max 60s)
  for (let i = 0; i < 12; i++) {
    await new Promise((r) => setTimeout(r, 5000))
    const statusRes = await fetch(
      `https://api.apify.com/v2/actor-runs/${runId}?token=${token}`
    )
    const status = await statusRes.json()

    if (status.data?.status === 'SUCCEEDED') {
      const datasetRes = await fetch(
        `https://api.apify.com/v2/actor-runs/${runId}/dataset/items?token=${token}`
      )
      const items = await datasetRes.json()
      return items[0] ?? {}
    }

    if (status.data?.status === 'FAILED') {
      throw new Error('Apify actor failed')
    }
  }

  throw new Error('Apify actor timed out')
}

function buildMockPayload(url: string, vertical: string): Record<string, unknown> {
  const base = { url }
  if (vertical === 'boi') {
    return {
      ...base,
      filing_overdue: true,
      risk_level: 'high',
      violation: true,
      exposure_min: 15000,
      exposure_max: 180000,
      findings: [
        'State transparency duty identified: an enacted state act (e.g. NY LLC Transparency Act) appears to apply to this entity.',
        'Ownership structure indicates 3 beneficial owners — all would be disclosable under the state model.',
        'No state transparency disclosure on record. Duty mapping recommended before the phase-in deadline.',
      ],
    }
  }
  if (vertical === 'cipa') {
    return {
      ...base,
      trackers_before_consent: ['googletagmanager.com', 'hotjar.com', 'facebook.com/tr'],
      has_consent_banner: true,
      consent_before_trackers: false,
      tracking_domains: ['googletagmanager.com', 'doubleclick.net', 'hotjar.com'],
    }
  }
  if (vertical === 'gpc') {
    return {
      ...base,
      trackers_after_gpc: ['googletagmanager.com', 'adsystem.amazon.com'],
      has_optout_confirmation: false,
    }
  }
  if (vertical === 'mhmda') {
    return {
      ...base,
      health_keywords: ['medication', 'therapy', 'diagnosis'],
      has_health_privacy_link: false,
      trackers: ['googletagmanager.com', 'facebook.com/tr'],
      targets_wa_residents: true,
    }
  }
  if (vertical === 'gdpr') {
    return {
      ...base,
      cookies_before_consent: ['_ga', '_fbp', '__gads'],
      has_banner: true,
      has_preticked: true,
      has_granular: false,
    }
  }
  if (vertical === 'sms') {
    return {
      ...base,
      sms_platform: 'Klaviyo',
      tcr_registered: 'No',
      carrier_use_case: 'marketing',
      tcpa_consent_present: false,
      optout_implemented: true,
      registered_phone: 'unknown',
      monthly_volume: '10,000',
    }
  }
  if (vertical === 'tdpsa') {
    return {
      ...base,
      has_privacy_policy: true,
      policy_updated: false,
      has_optout: false,
      sensitive_data: ['email', 'purchase_history'],
      vendor_dpas: false,
      breach_procedure: false,
      targets_texas: true,
      revenue: '$5M',
    }
  }
  return base
}
