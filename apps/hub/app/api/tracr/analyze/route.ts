import { NextRequest, NextResponse } from 'next/server'
import { getWalletData } from '@/app/lib/tracr-etherscan'
import { calculateRisk } from '@/app/lib/tracr-risk-engine'
import { generatePreview } from '@/app/lib/tracr-ai'
import { createClient } from '@supabase/supabase-js'
import { logEventAsync } from '@/lib/ops/log'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    const { wallet, network = 'ethereum', email } = await req.json()

    if (!wallet || !/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
      return NextResponse.json({ error: 'Valid Ethereum wallet address required' }, { status: 400 })
    }

    const summary = await getWalletData(wallet, network)
    const risk = calculateRisk(summary)
    const preview = await generatePreview(wallet, risk)

    // Save lead if email provided
    if (email) {
      await supabase.from('tracr_wallet_leads').insert({
        email,
        wallet_address: wallet,
        network,
        risk_score: risk.score,
        risk_level: risk.level,
        ip_address: req.headers.get('x-forwarded-for') || 'unknown',
      }).select()
    }

    logEventAsync({
      type: 'risk.assessment',
      source: 'tracr',
      ref_id: wallet,
      email: email || undefined,
      status: 'ok',
      metadata: {
        product: 'tracr_wallet_scan',
        network,
        risk_score: risk.score,
        risk_level: risk.level,
        flag_count: risk.flags.length,
      },
    })

    return NextResponse.json({
      riskScore: risk.score,
      riskLevel: risk.level,
      preview,
      flags: risk.flags.slice(0, 2),
      flagCount: risk.flags.length,
      metrics: {
        totalTransactions: risk.metrics.totalTransactions,
        uniqueCounterparties: risk.metrics.uniqueCounterparties,
        totalVolumeETH: risk.metrics.totalVolumeETH.toFixed(3),
        balanceETH: risk.metrics.balanceETH.toFixed(4),
        firstSeen: risk.metrics.firstSeen.split('T')[0],
        lastSeen: risk.metrics.lastSeen.split('T')[0],
      },
      fullReportAvailable: true,
    })
  } catch (err: any) {
    console.error('[TRACR analyze]', err)
    return NextResponse.json({ error: err.message || 'Analysis failed' }, { status: 500 })
  }
}
